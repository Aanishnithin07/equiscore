import uuid
from pydantic import BaseModel, ConfigDict, Field
from typing import Literal, List, Optional, Dict

class TranscriptSegment(BaseModel):
    segment_id: int
    start_time: float
    end_time: float
    text: str
    detected_section: Literal['problem', 'solution', 'demo', 'team', 'ask', 'unclassified'] = 'unclassified'

class FillerWordOccurrence(BaseModel):
    word: str
    count: int
    timestamps: List[float]

class BehaviorAnalysisRequest(BaseModel):
    evaluation_id: Optional[uuid.UUID] = None

class BehaviorAnalysisResult(BaseModel):
    job_id: uuid.UUID
    evaluation_id: Optional[uuid.UUID] = None
    transcript_text: str
    total_duration_seconds: float
    word_count: int
    words_per_minute: float
    
    # Pacing
    section_time_breakdown: Dict[str, float]
    section_percentage_breakdown: Dict[str, float]
    pacing_balance_score: int
    pacing_imbalance_flags: List[str]
    
    # Confidence
    filler_word_counts: List[FillerWordOccurrence]
    filler_words_per_minute: float
    confidence_score: int
    
    # Language
    persuasive_language_score: int
    persuasive_phrases_detected: List[str]
    weak_language_detected: List[str]
    call_to_action_present: bool
    specificity_score: int
    specificity_evidence: List[str] = Field(default_factory=list)
    language_quality_summary: str = ""
    
    # Composite
    overall_behavioral_score: int
    behavioral_summary: str = ""
    top_behavioral_recommendations: List[str] = Field(default_factory=list)
    
    model_config = ConfigDict(from_attributes=True)
