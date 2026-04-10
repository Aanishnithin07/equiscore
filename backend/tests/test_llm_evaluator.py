"""
EquiScore Tests — LLM Evaluator Tests
========================================
Tests for the LLMEvaluator service.
These tests mock the OpenAI API to avoid real API calls.
"""

from __future__ import annotations

import json

import pytest

from schemas.evaluation import LLMEvaluationOutput, RubricScoreDetail
from services.llm_evaluator import LLMEvaluator, LLMOutputValidationError


def test_parse_valid_llm_output() -> None:
    """Test that a well-formed LLM response is parsed correctly."""
    evaluator = LLMEvaluator()

    valid_output = {
        "overall_score": 72,
        "track_alignment": (
            "Your project demonstrates strong alignment with the healthcare track. "
            "The focus on patient data management directly addresses clinical needs."
        ),
        "strengths": [
            "Your team demonstrated a clear understanding of HIPAA compliance requirements, "
            "specifically mentioning data encryption at rest and in transit on Slide 3.",
            "The clinical workflow analysis on Slide 5 shows genuine domain expertise "
            "and understanding of hospital IT procurement cycles.",
        ],
        "weaknesses": [
            "Your claim of '99% accuracy' on Slide 7 lacks supporting evidence. "
            "No validation methodology or dataset details were provided.",
            "The business model on Slide 9 does not address reimbursement pathways, "
            "which is critical for healthcare product adoption.",
        ],
        "rubric_scores": [
            {
                "category": "Clinical Feasibility",
                "weight": 0.30,
                "raw_score": 7,
                "weighted_score": 2.1,
                "one_line_justification": (
                    "Your clinical workflow analysis is thorough but lacks peer-reviewed evidence."
                ),
            },
            {
                "category": "Data Privacy & Compliance",
                "weight": 0.25,
                "raw_score": 8,
                "weighted_score": 2.0,
                "one_line_justification": (
                    "Your architecture clearly demonstrates HIPAA compliance with encryption details."
                ),
            },
            {
                "category": "Patient Impact",
                "weight": 0.20,
                "raw_score": 6,
                "weighted_score": 1.2,
                "one_line_justification": (
                    "Your patient outcome metrics are promising but lack pilot validation data."
                ),
            },
            {
                "category": "Technical Implementation",
                "weight": 0.15,
                "raw_score": 8,
                "weighted_score": 1.2,
                "one_line_justification": (
                    "Your tech stack is well-chosen for healthcare with HL7 FHIR integration."
                ),
            },
            {
                "category": "Business Viability",
                "weight": 0.10,
                "raw_score": 5,
                "weighted_score": 0.5,
                "one_line_justification": (
                    "Your revenue model is generic and missing healthcare-specific procurement details."
                ),
            },
        ],
        "rubric_justification": (
            "Your team demonstrated strong technical competence and genuine healthcare domain knowledge. "
            "The HIPAA compliance architecture is well-designed with specific encryption measures. "
            "However, the clinical claims need stronger evidence backing, and the business model "
            "requires healthcare-specific reimbursement strategy to be viable."
        ),
        "suggested_judge_questions": [
            "Can you provide validation data for the 99% accuracy claim on Slide 7?",
            "What specific reimbursement codes or payer relationships have you explored?",
            "How will you handle patient consent withdrawal in your data pipeline?",
        ],
        "disqualification_flags": [],
    }

    result = evaluator._parse_and_validate(json.dumps(valid_output))

    assert isinstance(result, LLMEvaluationOutput)
    assert result.overall_score == 72
    assert len(result.rubric_scores) == 5
    assert len(result.strengths) == 2
    assert len(result.weaknesses) == 2
    assert len(result.suggested_judge_questions) == 3


def test_parse_invalid_json_raises_error() -> None:
    """Test that invalid JSON raises LLMOutputValidationError."""
    evaluator = LLMEvaluator()

    with pytest.raises(LLMOutputValidationError, match="not valid JSON"):
        evaluator._parse_and_validate("this is not json")


def test_parse_missing_fields_raises_error() -> None:
    """Test that missing required fields raise LLMOutputValidationError."""
    evaluator = LLMEvaluator()

    incomplete = json.dumps({"overall_score": 50})  # Missing many fields

    with pytest.raises(LLMOutputValidationError, match="schema validation"):
        evaluator._parse_and_validate(incomplete)


def test_rubric_engine_weight_validation() -> None:
    """Test that rubric weights sum to 1.0 for all tracks."""
    from services.rubric_engine import TRACK_RUBRICS

    for track, rubric in TRACK_RUBRICS.items():
        total = sum(cat.weight for cat in rubric)
        assert abs(total - 1.0) < 0.001, (
            f"Track {track.value} weights sum to {total}, expected 1.0"
        )
