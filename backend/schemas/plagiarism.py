from pydantic import BaseModel
from typing import Literal, List, Optional
from datetime import datetime

class FlaggedPair(BaseModel):
    similarity_id: str
    team_a_name: str
    team_b_name: str
    similarity_score: float
    flag_level: Literal['critical', 'high']
    reviewed: bool
    organizer_note: Optional[str] = None
    shared_concepts: List[str]

class ExactDuplicatePair(BaseModel):
    team_a_name: str
    team_b_name: str

class SimilarityReport(BaseModel):
    flagged_pairs: List[FlaggedPair]
    total_submissions_analyzed: int
    exact_duplicates: List[ExactDuplicatePair]
    similarity_matrix: Optional[dict] = None

class PlagiarismReviewRequest(BaseModel):
    reviewed: bool
    organizer_note: Optional[str] = None
