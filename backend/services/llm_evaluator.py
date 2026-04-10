"""
EquiScore LLM Evaluator — Async OpenAI Evaluation Service
============================================================
Handles all communication with the OpenAI API for pitch deck evaluation.

Key design decisions:
  - Uses AsyncOpenAI client for non-blocking LLM calls
  - Forces JSON output mode (response_format={"type": "json_object"})
  - Low temperature (0.2) for scoring consistency across submissions
  - Validates the LLM response against the Pydantic LLMEvaluationOutput schema
  - Retries once on rate limit errors with a 60-second backoff
"""

from __future__ import annotations

import json
import time

import structlog
from openai import AsyncOpenAI, RateLimitError

from core.config import settings
from schemas.evaluation import LLMEvaluationOutput, TrackEnum
from services.file_extractor import ExtractedContent
from services.rubric_engine import rubric_engine

logger = structlog.get_logger(__name__)


class LLMOutputValidationError(Exception):
    """
    Raised when the LLM response does not conform to the expected schema.

    Stores the raw response for debugging so engineers can inspect what
    the model actually returned versus what was expected.

    Attributes:
        raw_response: The raw string response from the LLM.
        validation_error: The underlying Pydantic ValidationError details.
    """

    def __init__(self, message: str, raw_response: str) -> None:
        super().__init__(message)
        self.raw_response = raw_response


class LLMEvaluator:
    """
    Async service for evaluating pitch decks using OpenAI's GPT-4o.

    Constructs prompts via the RubricEngine, sends them to the LLM with
    JSON mode enforced, and validates the structured response against
    the LLMEvaluationOutput Pydantic schema.

    Usage:
        evaluator = LLMEvaluator()
        result = await evaluator.evaluate(extracted_content, TrackEnum.HEALTHCARE)
    """

    def __init__(self) -> None:
        """Initialize the async OpenAI client with the configured API key."""
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY.get_secret_value(),
        )
        self.model = settings.OPENAI_MODEL

    async def evaluate(
        self,
        extracted_content: ExtractedContent,
        track: TrackEnum,
    ) -> LLMEvaluationOutput:
        """
        Evaluate a pitch deck's extracted content against the track rubric.

        Workflow:
          1. Build the system + user prompt via RubricEngine
          2. Call OpenAI chat completions with JSON mode
          3. Parse and validate the response against LLMEvaluationOutput
          4. Return the validated result or raise on failure

        Args:
            extracted_content: Text and metadata extracted from the pitch deck.
            track: The hackathon track to evaluate against.

        Returns:
            Validated LLMEvaluationOutput with scores, justifications, and flags.

        Raises:
            LLMOutputValidationError: If the LLM response doesn't match the schema.
            RateLimitError: If rate limited and retry also fails.
            Exception: For unexpected OpenAI API errors.
        """
        start_time = time.monotonic()

        # ── Step 1: Build prompts ─────────────────────────────────────
        system_prompt, user_prompt = rubric_engine.build_evaluation_prompt(
            extracted_text=extracted_content.raw_text,
            track=track,
        )

        logger.info(
            "llm_evaluation_started",
            track=track.value,
            slide_count=extracted_content.slide_count,
            word_count=extracted_content.word_count,
            model=self.model,
        )

        # ── Step 2: Call OpenAI API ───────────────────────────────────
        raw_response_text = await self._call_openai(system_prompt, user_prompt)

        # ── Step 3: Parse and validate ────────────────────────────────
        result = self._parse_and_validate(raw_response_text)

        elapsed = time.monotonic() - start_time
        logger.info(
            "llm_evaluation_completed",
            track=track.value,
            overall_score=result.overall_score,
            elapsed_seconds=round(elapsed, 2),
        )

        return result

    async def _call_openai(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """
        Send the evaluation request to OpenAI and return the raw response text.

        Retries once with a 60-second delay on rate limit errors.

        Args:
            system_prompt: The system message with rubric and instructions.
            user_prompt: The user message with pitch deck content.

        Returns:
            Raw response text from the LLM.

        Raises:
            RateLimitError: If rate limited on the retry attempt.
            Exception: For other API errors.
        """
        try:
            return await self._make_completion_request(system_prompt, user_prompt)
        except RateLimitError:
            # ── Rate limit retry: wait 60s, try once more ─────────────
            logger.warning(
                "openai_rate_limit_hit",
                action="retrying_after_60s",
            )
            import asyncio
            await asyncio.sleep(60)

            try:
                return await self._make_completion_request(system_prompt, user_prompt)
            except RateLimitError:
                logger.error("openai_rate_limit_retry_failed")
                raise

    async def _make_completion_request(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """
        Execute a single OpenAI chat completion request.

        Args:
            system_prompt: System message content.
            user_prompt: User message content.

        Returns:
            The content string from the first completion choice.

        Raises:
            Any exception from the OpenAI SDK.
        """
        response = await self.client.chat.completions.create(
            model=self.model,
            response_format={"type": "json_object"},  # Force JSON mode
            temperature=0.2,  # Low temperature for consistent scoring
            max_tokens=2500,  # Sufficient for the full evaluation JSON
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
        )

        # Extract the response text from the first choice
        content = response.choices[0].message.content
        if not content:
            raise LLMOutputValidationError(
                "LLM returned empty response content",
                raw_response="<empty>",
            )
        return content

    def _parse_and_validate(self, raw_response: str) -> LLMEvaluationOutput:
        """
        Parse the raw LLM JSON response and validate against the schema.

        Args:
            raw_response: Raw JSON string from the LLM.

        Returns:
            Validated LLMEvaluationOutput instance.

        Raises:
            LLMOutputValidationError: If JSON parsing or Pydantic validation fails.
        """
        try:
            # ── Parse JSON ────────────────────────────────────────────
            parsed = json.loads(raw_response)
        except json.JSONDecodeError as e:
            logger.error(
                "llm_json_parse_error",
                error=str(e),
                raw_response_preview=raw_response[:500],
            )
            raise LLMOutputValidationError(
                f"LLM response is not valid JSON: {e}",
                raw_response=raw_response,
            )

        try:
            # ── Validate against Pydantic schema ──────────────────────
            result = LLMEvaluationOutput.model_validate(parsed)
        except Exception as e:
            logger.error(
                "llm_output_validation_error",
                error=str(e),
                raw_response_preview=raw_response[:500],
            )
            raise LLMOutputValidationError(
                f"LLM output failed schema validation: {e}",
                raw_response=raw_response,
            )

        return result
