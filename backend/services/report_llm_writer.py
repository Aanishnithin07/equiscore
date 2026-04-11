"""
EquiScore Report LLM Writer Service
===================================
Generates empathetic and personalized growth plans for teams that did not advance.
"""

from __future__ import annotations

import json
import time

import structlog
from pydantic import BaseModel
from openai import AsyncOpenAI

from core.config import settings
from schemas.evaluation import LLMEvaluationOutput, TrackEnum

logger = structlog.get_logger(__name__)

class ActionItem(BaseModel):
    title: str
    target_category: str
    explanation: str
    resources: list[str]

class ActionPlan(BaseModel):
    action_items: list[ActionItem]
    closing_paragraph: str

class ReportLLMWriter:
    """Service to generate empathetic action plans from evaluation data."""

    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY.get_secret_value(),
        )
        self.model = settings.OPENAI_MODEL

        self.system_prompt = \"\"\"
You are a compassionate but honest hackathon mentor writing a personalized growth report for a team whose project was not selected to advance. Your goal is to help them significantly improve for their next hackathon.

Your tone is:
- EMPATHETIC but not condescending. Treat them as capable adults.
- SPECIFIC and evidence-based. Reference actual patterns from their evaluation, not generic advice.
- CONSTRUCTIVE and forward-looking. Every weakness becomes a concrete action.
- HONEST without being harsh. Bad feedback is kind when it's accurate and actionable.

DO NOT use phrases like: "Don't be discouraged", "Great effort though!", "Keep trying!", "Almost there!"
These are hollow. Instead, give them real information that will make them better.

Return ONLY a valid JSON object with exactly these fields:
{
  "action_items": [
    {
      "title": "<specific action title>",
      "target_category": "<rubric category name this addresses>",
      "explanation": "<2-3 sentence specific, actionable advice directly related to their weakness>",
      "resources": ["<specific resource 1 — include author/title/URL format>", "<resource 2>", "<resource 3>"]
    }
  ],
  "closing_paragraph": "<3-4 sentences. Acknowledge the difficulty of what they attempted. Note the most impressive thing about their submission. End with a specific, credible prediction about their future if they apply the feedback — not empty motivation.>"
}

Generate exactly as many action items as there are distinct weaknesses (minimum 3, maximum 5). Order by impact: highest-leverage improvements first.
\"\"\"

    async def generate_action_plan(
        self,
        evaluation: LLMEvaluationOutput,
        track: TrackEnum,
        team_name: str
    ) -> ActionPlan:
        """
        Generate a personalized growth action plan.
        """
        start_time = time.monotonic()
        
        weaknesses_str = chr(10).join(f"- {w}" for w in evaluation.weaknesses)
        rubrics_sorted = sorted(evaluation.rubric_scores, key=lambda x: x.raw_score)[:3]
        rubrics_str = chr(10).join(f"- {r.category}: {r.raw_score}/10 (weight: {r.weight*100:.0f}%) — {r.one_line_justification}" for r in rubrics_sorted)
        
        user_prompt = f\"\"\"
Team: {team_name}
Track: {track.value}
Overall Score: {evaluation.overall_score}/100

Weaknesses identified:
{weaknesses_str}

Lowest-scoring rubric categories:
{rubrics_str}

Full rubric justification:
{evaluation.rubric_justification}

Generate the personalized growth action plan for this team.
\"\"\"
        
        logger.info(
            "report_llm_writer_started",
            team=team_name,
            track=track.value,
        )

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=2000,
                messages=[
                    {
                        "role": "system",
                        "content": self.system_prompt.strip(),
                    },
                    {
                        "role": "user",
                        "content": user_prompt.strip(),
                    },
                ],
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("LLM returned empty content")
                
            parsed = json.loads(content)
            result = ActionPlan.model_validate(parsed)
            
            elapsed = time.monotonic() - start_time
            logger.info("report_llm_writer_completed", elapsed_seconds=round(elapsed, 2))
            
            return result
        except Exception as e:
            logger.error("report_llm_writer_failed", error=str(e))
            raise
