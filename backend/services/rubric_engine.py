"""
EquiScore Rubric Engine — Track-Aware Evaluation Prompt Builder
================================================================
This is the DYNAMIC TRACK-AWARE CORE of the evaluation system.

Responsibilities:
  1. Define the complete rubric for each hackathon track (categories, weights,
     scoring criteria) as structured data.
  2. Build the full system + user prompt for the LLM, embedding the relevant
     track rubric inline so the model scores against the correct criteria.
  3. Enforce that all weights within a track sum to exactly 1.0.

The prompt instructs the LLM to:
  - Ground ALL claims in specific quotes/observations from the pitch text
  - Use second-person voice ("Your team proposed X but failed to address Y")
  - Return strictly validated JSON matching the LLMEvaluationOutput schema
  - Flag templates, placeholders, or off-track submissions
"""

from __future__ import annotations

from dataclasses import dataclass, field

from schemas.evaluation import TrackEnum


# ══════════════════════════════════════════════════════════════════════════
# Rubric Data Structures
# ══════════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class RubricCategory:
    """
    A single category within a track's evaluation rubric.

    Attributes:
        name: Display name of the category (e.g., "Clinical Feasibility").
        weight: Fractional weight (0.0–1.0). All weights per track sum to 1.0.
        description: What this category measures.
        scoring_criteria: Detailed breakdown of score ranges (0–10 scale).
    """

    name: str
    weight: float
    description: str
    scoring_criteria: str


# ══════════════════════════════════════════════════════════════════════════
# Track Rubric Definitions
# ══════════════════════════════════════════════════════════════════════════

# ── Healthcare Track ──────────────────────────────────────────────────────
HEALTHCARE_RUBRIC: list[RubricCategory] = [
    RubricCategory(
        name="Clinical Feasibility",
        weight=0.30,
        description="Is the proposed solution medically sound? Are claims evidence-based?",
        scoring_criteria=(
            "0–3 = medically implausible or dangerous claims; "
            "4–6 = feasible concept but no validation or evidence cited; "
            "7–9 = evidence-backed approach with referenced studies or clinical guidelines; "
            "10 = peer-reviewed evidence cited or expert-endorsed methodology"
        ),
    ),
    RubricCategory(
        name="Data Privacy & Compliance",
        weight=0.25,
        description=(
            "HIPAA/GDPR awareness, patient consent model, data anonymization strategy"
        ),
        scoring_criteria=(
            "0–3 = no mention of privacy or compliance whatsoever; "
            "4–6 = mentioned but superficial (e.g., 'we will comply with HIPAA'); "
            "7–9 = privacy designed into the architecture with specific measures; "
            "10 = architecture clearly demonstrates compliance with detailed controls"
        ),
    ),
    RubricCategory(
        name="Patient Impact",
        weight=0.20,
        description="Direct, measurable improvement to patient outcomes",
        scoring_criteria=(
            "0–3 = no clear patient benefit articulated; "
            "4–6 = vague claims of improvement without metrics; "
            "7–9 = specific, measurable outcomes with target metrics; "
            "10 = backed by pilot data or clinical outcome projections"
        ),
    ),
    RubricCategory(
        name="Technical Implementation",
        weight=0.15,
        description="Is the technology stack appropriate for healthcare constraints?",
        scoring_criteria=(
            "0–3 = inappropriate tech choices for healthcare (e.g., no encryption); "
            "4–6 = standard stack but missing healthcare-specific requirements; "
            "7–9 = well-chosen stack addressing uptime, security, and interoperability; "
            "10 = demonstrates HL7/FHIR integration or equivalent interoperability"
        ),
    ),
    RubricCategory(
        name="Business Viability",
        weight=0.10,
        description="Reimbursement model, hospital procurement pathway",
        scoring_criteria=(
            "0–3 = no business model discussed; "
            "4–6 = generic revenue model without healthcare-specific considerations; "
            "7–9 = clear reimbursement strategy or procurement pathway identified; "
            "10 = validated with potential customers or payers"
        ),
    ),
]

# ── AI/ML Track ───────────────────────────────────────────────────────────
AI_ML_RUBRIC: list[RubricCategory] = [
    RubricCategory(
        name="Model Architecture Quality",
        weight=0.30,
        description=(
            "Algorithm selection justified, not arbitrary; aware of alternatives"
        ),
        scoring_criteria=(
            "0–3 = black-box model with no justification for choice; "
            "4–6 = standard model with some rationale provided; "
            "7–9 = well-justified selection with tradeoffs discussed against alternatives; "
            "10 = novel or state-of-the-art approach with rigorous justification"
        ),
    ),
    RubricCategory(
        name="Dataset Validity",
        weight=0.25,
        description=(
            "Dataset size, quality, bias mitigation, train/val/test split awareness"
        ),
        scoring_criteria=(
            "0–3 = no dataset information or clearly insufficient data; "
            "4–6 = dataset described but no bias analysis or split strategy; "
            "7–9 = thorough data pipeline with bias mitigation and proper splits; "
            "10 = benchmark-quality dataset with published bias audit results"
        ),
    ),
    RubricCategory(
        name="Scalability & Infrastructure",
        weight=0.20,
        description="Can this run in production? Latency, cost, serving strategy",
        scoring_criteria=(
            "0–3 = no mention of production deployment considerations; "
            "4–6 = basic deployment plan without latency or cost estimates; "
            "7–9 = detailed serving strategy with latency SLA and cost projections; "
            "10 = demonstrated production-grade infrastructure or load testing"
        ),
    ),
    RubricCategory(
        name="Innovation",
        weight=0.15,
        description="Is this genuinely novel or just GPT API + wrapper?",
        scoring_criteria=(
            "0–3 = thin wrapper around an existing API with no added value; "
            "4–6 = some customization or fine-tuning but mostly existing tools; "
            "7–9 = genuine innovation in approach, architecture, or application domain; "
            "10 = breakthrough technique or first-of-its-kind application"
        ),
    ),
    RubricCategory(
        name="Reproducibility",
        weight=0.10,
        description="Is the methodology clear enough to replicate?",
        scoring_criteria=(
            "0–3 = methodology is opaque or missing critical details; "
            "4–6 = partially reproducible but missing hyperparameters or data; "
            "7–9 = fully documented methodology with code and data references; "
            "10 = open-source with reproducibility scripts and seed values"
        ),
    ),
]

# ── Open Innovation Track ─────────────────────────────────────────────────
OPEN_INNOVATION_RUBRIC: list[RubricCategory] = [
    RubricCategory(
        name="Problem-Market Fit",
        weight=0.30,
        description=(
            "Is this a real, painful problem with a large underserved market?"
        ),
        scoring_criteria=(
            "0–3 = solution looking for a problem, no market evidence; "
            "4–6 = real problem but small or already well-served market; "
            "7–9 = validated pain point with TAM/SAM estimates and user research; "
            "10 = demonstrated demand with waitlist, LOIs, or pilot customers"
        ),
    ),
    RubricCategory(
        name="Solution Novelty",
        weight=0.25,
        description="Differentiated from existing solutions; not a clone",
        scoring_criteria=(
            "0–3 = direct clone of an existing product with no differentiation; "
            "4–6 = incremental improvement on existing solutions; "
            "7–9 = clearly differentiated approach with defensible advantages; "
            "10 = category-creating solution with no direct competitors"
        ),
    ),
    RubricCategory(
        name="Business Viability",
        weight=0.20,
        description="Revenue model, go-to-market strategy, defensibility",
        scoring_criteria=(
            "0–3 = no monetization strategy discussed; "
            "4–6 = generic revenue model without unit economics; "
            "7–9 = detailed business model with clear unit economics and CAC/LTV; "
            "10 = validated revenue with paying customers or signed contracts"
        ),
    ),
    RubricCategory(
        name="Technical Execution",
        weight=0.15,
        description="Is the prototype/demo solid?",
        scoring_criteria=(
            "0–3 = no working prototype, only slides; "
            "4–6 = basic prototype with limited functionality; "
            "7–9 = polished demo that demonstrates core value proposition; "
            "10 = production-ready MVP with real users"
        ),
    ),
    RubricCategory(
        name="Team Fit",
        weight=0.10,
        description="Does the team have relevant skills for this problem?",
        scoring_criteria=(
            "0–3 = no evidence of relevant expertise; "
            "4–6 = some relevant skills but gaps in critical areas; "
            "7–9 = strong team with complementary skills covering all key areas; "
            "10 = domain experts with prior startup or industry experience"
        ),
    ),
]


# ── Track → Rubric Mapping ────────────────────────────────────────────────
TRACK_RUBRICS: dict[TrackEnum, list[RubricCategory]] = {
    TrackEnum.HEALTHCARE: HEALTHCARE_RUBRIC,
    TrackEnum.AI_ML: AI_ML_RUBRIC,
    TrackEnum.OPEN_INNOVATION: OPEN_INNOVATION_RUBRIC,
}


# ══════════════════════════════════════════════════════════════════════════
# RubricEngine Class
# ══════════════════════════════════════════════════════════════════════════

class RubricEngine:
    """
    Builds track-aware evaluation prompts for the LLM.

    This class is stateless — it reads from the module-level rubric definitions
    and constructs a complete system + user prompt pair for each evaluation call.
    """

    def __init__(self) -> None:
        """Validate that all track rubrics have weights summing to 1.0."""
        for track, rubric in TRACK_RUBRICS.items():
            total_weight = sum(cat.weight for cat in rubric)
            if abs(total_weight - 1.0) > 0.001:
                raise ValueError(
                    f"Rubric weights for track '{track.value}' sum to "
                    f"{total_weight:.3f}, expected 1.000"
                )

    def get_rubric(self, track: TrackEnum) -> list[RubricCategory]:
        """
        Retrieve the rubric categories for a given track.

        Args:
            track: The hackathon track to get rubric for.

        Returns:
            List of RubricCategory objects for the specified track.

        Raises:
            KeyError: If the track is not found in the rubric definitions.
        """
        if track not in TRACK_RUBRICS:
            raise KeyError(f"No rubric defined for track: {track.value}")
        return TRACK_RUBRICS[track]

    def build_evaluation_prompt(
        self,
        extracted_text: str,
        track: TrackEnum,
    ) -> tuple[str, str]:
        """
        Construct the complete system + user prompt for the LLM.

        Args:
            extracted_text: Raw text extracted from the pitch deck, with
                slide markers like "[SLIDE 1]".
            track: The hackathon track to evaluate against.

        Returns:
            A (system_prompt, user_prompt) tuple ready to send to the LLM.
        """
        rubric = self.get_rubric(track)

        # ── Build the rubric section of the system prompt ─────────────
        rubric_text = self._format_rubric_for_prompt(rubric, track)

        # ── System prompt: role, rubric, output format, constraints ───
        # Each section has a clear purpose documented inline
        system_prompt = f"""You are EquiScore, an expert hackathon judge AI designed to provide fair, \
evidence-based evaluations of pitch deck submissions. You score with surgical precision and \
always ground your assessments in specific content from the submitted pitch deck.

## YOUR EVALUATION TRACK
You are evaluating a submission in the **{track.value.replace('_', ' ').title()}** track.

## RUBRIC (score each category 0–10)
{rubric_text}

## OUTPUT FORMAT
You MUST return a JSON object with EXACTLY this structure — no extra keys, no missing keys:

{{
  "overall_score": <int 0-100, computed as sum of (raw_score * weight * 10) for each category>,
  "track_alignment": "<2-4 sentences evaluating how well the project fits the {track.value.replace('_', ' ')} track>",
  "strengths": ["<strength 1: 1-3 specific sentences with evidence>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1: 1-3 specific sentences with evidence>", "<weakness 2>", ...],
  "rubric_scores": [
    {{
      "category": "<exact category name from rubric>",
      "weight": <float, the weight listed above>,
      "raw_score": <int 0-10>,
      "weighted_score": <float, raw_score * weight>,
      "one_line_justification": "<specific justification grounded in pitch content>"
    }}
  ],
  "rubric_justification": "<3-6 sentence narrative synthesizing ALL scoring decisions into a coherent, auditable explanation>",
  "suggested_judge_questions": ["<question 1>?", "<question 2>?", "<question 3>?"],
  "disqualification_flags": []
}}

## SCORING RULES
1. **Evidence-Based**: Every score and justification MUST reference specific content from the pitch deck. \
Use direct quotes or paraphrases with slide numbers when possible (e.g., "On Slide 3, you claim...").
2. **Second Person Voice**: Write all justifications in second person — "Your team proposed X but failed to address Y."
3. **Calibrated Scoring**: A score of 5/10 is AVERAGE. Most hackathon projects should score between 4-7. \
Reserve 8-10 for truly exceptional work. Reserve 0-3 for seriously deficient areas.
4. **overall_score Calculation**: Must equal the sum of (raw_score × weight × 10) for all categories, rounded to nearest integer.
5. **Strengths/Weaknesses**: Provide 2-6 items each. Each must be 1-3 sentences with SPECIFIC evidence. \
Never use generic praise like "good presentation" without citing what specifically was good.
6. **Judge Questions**: Create 3-5 sharp, probing questions that target the specific weaknesses you identified. \
These should be questions a skeptical judge would ask to stress-test the team's claims.
7. **Disqualification Flags**: Add flags ONLY if the submission is: plagiarized / clearly a template with placeholder text / \
completely off-track for the declared category / contains unreadable or corrupt content. Otherwise, leave as empty list.

## ANTI-GAMING RULES
- If the pitch is mostly buzzwords with no substance, score Innovation/Novelty below 4.
- If the pitch makes claims without evidence (e.g., "our AI is 99% accurate"), flag this in weaknesses.
- If the pitch deck appears to be a generic template (e.g., "Insert your team name here"), add a disqualification flag.
"""

        # ── User prompt: the actual pitch deck content ────────────────
        user_prompt = (
            f"[PITCH DECK CONTENT — {track.value.replace('_', ' ').title()} Track Submission]\n\n"
            f"{extracted_text}"
        )

        return system_prompt, user_prompt

    def _format_rubric_for_prompt(
        self,
        rubric: list[RubricCategory],
        track: TrackEnum,
    ) -> str:
        """
        Format rubric categories into a numbered, human-readable string
        for embedding in the LLM system prompt.

        Args:
            rubric: List of RubricCategory objects for the track.
            track: The track enum value (used for context).

        Returns:
            A formatted string with numbered categories, weights, and criteria.
        """
        lines: list[str] = []
        for i, cat in enumerate(rubric, start=1):
            lines.append(
                f"{i}. **{cat.name}** (weight: {cat.weight:.2f})\n"
                f"   Description: {cat.description}\n"
                f"   Scoring Criteria: {cat.scoring_criteria}"
            )
        return "\n\n".join(lines)


# ── Module-level singleton ────────────────────────────────────────────────
# Validates all rubric weights on import — fail fast if misconfigured
rubric_engine = RubricEngine()
