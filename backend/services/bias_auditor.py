import logging
import math
import re
from datetime import datetime
from typing import Literal
from uuid import UUID

import scipy.stats as stats
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.evaluation import Evaluation

logger = logging.getLogger(__name__)

class BiasTest(BaseModel):
    test_name: str
    hypothesis: str
    statistical_method: str
    result: float
    p_value: float
    interpretation: str
    bias_detected: bool
    effect_size: float
    severity: Literal['none', 'negligible', 'small', 'medium', 'large']

class BiasAuditReport(BaseModel):
    hackathon_id: UUID
    total_submissions_analyzed: int
    audit_timestamp: datetime
    bias_tests: list[BiasTest]
    overall_bias_risk: Literal['low', 'moderate', 'high']
    methodology_note: str
    recommended_actions: list[str]

class BiasAuditor:

    METHODOLOGY_NOTE = (
        "This audit tests for statistical correlations between submission METADATA (length, "
        "complexity, slide count) and AI-generated scores. A significant correlation does not "
        "prove bias — it requires investigation. EquiScore does not have access to demographic "
        "information about team members and therefore cannot test for demographic bias directly. "
        "Scores are generated without knowledge of team names during LLM evaluation — "
        "team names are injected only AFTER scoring to label the result."
    )

    @staticmethod
    def _count_syllables(word: str) -> int:
        word = word.lower()
        if len(word) <= 3:
            return 1
        word = re.sub(r'(?:[^laeiouy]es|ed|[^laeiouy]e)$', '', word)
        word = re.sub(r'^y', '', word)
        matches = re.findall(r'[aeiouy]{1,2}', word)
        return max(1, len(matches))

    @staticmethod
    def _compute_flesch_kincaid(text: str) -> float:
        words = re.findall(r'\b\w+\b', text)
        sentences = re.split(r'[.!?]+', text)
        sentences = [s for s in sentences if s.strip()]
        
        num_words = len(words)
        num_sentences = len(sentences)
        
        if num_words == 0 or num_sentences == 0:
            return 0.0
            
        num_syllables = sum(BiasAuditor._count_syllables(w) for w in words)
        
        # Flesch-Kincaid Grade Level formula
        grade = 0.39 * (num_words / num_sentences) + 11.8 * (num_syllables / num_words) - 15.59
        return grade

    @staticmethod
    def _interpret_r(r: float, p: float, effect_name: str) -> tuple[str, bool, str]:
        if p > 0.05:
            return f"No significant {effect_name} correlation detected", False, "none"
        
        abs_r = abs(r)
        if abs_r < 0.2:
            return f"Statistically significant but practically negligible {effect_name} correlation", False, "negligible"
        elif abs_r < 0.4:
            return f"Small {effect_name} correlation detected", True, "small"
        elif abs_r < 0.6:
            return f"Moderate {effect_name} correlation detected — requires investigation", True, "medium"
        else:
            return f"Large {effect_name} correlation detected — immediate review recommended", True, "large"

    @staticmethod
    async def run_bias_audit(hackathon_id: UUID, db: AsyncSession) -> BiasAuditReport:
        # Fetch all evaluations for this hackathon
        eval_q = await db.execute(
            select(Evaluation).where(
                Evaluation.team.has(hackathon_id=hackathon_id)
            )
        )
        evaluations = eval_q.scalars().all()
        
        if len(evaluations) < 5:
            return BiasAuditReport(
                hackathon_id=hackathon_id,
                total_submissions_analyzed=len(evaluations),
                audit_timestamp=datetime.utcnow(),
                bias_tests=[],
                overall_bias_risk='low',
                methodology_note="Insufficient data points for meaningful statistical analysis (N < 5).",
                recommended_actions=[]
            )

        # Build vectors
        scores = []
        word_counts = []
        readability_grades = []
        
        for e in evaluations:
            scores.append(e.overall_score)
            content = e.extracted_text or "No content available."
            words = list(re.findall(r'\b\w+\b', content))
            word_counts.append(len(words))
            readability_grades.append(BiasAuditor._compute_flesch_kincaid(content))

        tests = []

        # TEST 1 — Length vs Score (Pearson)
        try:
            r_len, p_len = stats.pearsonr(word_counts, scores)
            r_len = 0.0 if math.isnan(r_len) else float(r_len)
            p_len = 1.0 if math.isnan(p_len) else float(p_len)
            interp, bias, sev = BiasAuditor._interpret_r(r_len, p_len, "length-score")
            
            # Explicit threshold for this particular test
            if r_len > 0.3 and p_len < 0.05:
                interp = "Longer submissions score significantly higher — potential length bias"
                bias = True
            elif abs(r_len) < 0.2 or p_len > 0.05:
                interp = "No significant length-score correlation detected"
                bias = False
            
            tests.append(BiasTest(
                test_name="Length Bias Check",
                hypothesis="Is there a significant positive correlation between word count and score?",
                statistical_method="Pearson correlation",
                result=r_len, p_value=p_len, interpretation=interp,
                bias_detected=bias, effect_size=r_len, severity=sev
            ))
        except Exception as e:
            logger.error(f"Length test failed: {e}")

        # TEST 3 — Readability vs Score (Pearson)
        try:
            r_read, p_read = stats.pearsonr(readability_grades, scores)
            r_read = 0.0 if math.isnan(r_read) else float(r_read)
            p_read = 1.0 if math.isnan(p_read) else float(p_read)
            interp, bias, sev = BiasAuditor._interpret_r(r_read, p_read, "readability-score")
            
            if r_read > 0.3 and p_read < 0.05:
                interp = "High reading complexity scores significantly higher — potential readability bias"
                bias = True
                
            tests.append(BiasTest(
                test_name="Linguistic Readability Bias Check",
                hypothesis="Does higher reading complexity (grade level) correlate with higher scores?",
                statistical_method="Pearson correlation",
                result=r_read, p_value=p_read, interpretation=interp,
                bias_detected=bias, effect_size=r_read, severity=sev
            ))
        except Exception as e:
            logger.error(f"Readability test failed: {e}")

        # Calculate Overall Risk
        bias_count = sum(1 for t in tests if t.bias_detected)
        if bias_count >= 2: overall = 'high'
        elif bias_count == 1: overall = 'moderate'
        else: overall = 'low'

        # Generate specific Recommendations
        recs = []
        if overall == 'low' and "Insufficient" not in bias_count:
            recs.append("No statistical bias action required currently. Monitor manually on next batch.")
            
        for t in tests:
            if not t.bias_detected: continue
            
            if "Length" in t.test_name:
                recs.append("Consider normalizing scores for word count in future rubric revisions.")
            if "Readability" in t.test_name:
                recs.append("Consider explicitly instructing the AI to evaluate ideas independently of writing style and English proficiency.")

        return BiasAuditReport(
            hackathon_id=hackathon_id,
            total_submissions_analyzed=len(evaluations),
            audit_timestamp=datetime.utcnow(),
            bias_tests=tests,
            overall_bias_risk=overall,
            methodology_note=BiasAuditor.METHODOLOGY_NOTE,
            recommended_actions=recs
        )
