/**
 * TypeScript Interfaces mirroring the backend Python Pydantic schemas.
 * Ensures type safety from the DB edge all the way to the UI components.
 */

export type TrackEnum = 'healthcare' | 'ai_ml' | 'open_innovation';

export type EvaluationStatusEnum = 'pending' | 'processing' | 'completed' | 'failed';

export interface RubricScoreDetail {
  category: string;
  weight: number;
  raw_score: number;
  weighted_score: number;
  one_line_justification: string;
}

export interface LLMEvaluationOutput {
  overall_score: number;
  track_alignment: string;
  strengths: string[];
  weaknesses: string[];
  rubric_scores: RubricScoreDetail[];
  rubric_justification: string;
  suggested_judge_questions: string[];
  disqualification_flags: string[];
}

export interface EvaluationStatusResponse {
  job_id: string;
  status: EvaluationStatusEnum;
  team_name: string;
  track: TrackEnum;
  result: LLMEvaluationOutput | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  track: TrackEnum;
  overall_score: number;
  top_strength: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_count: number;
  track_filter: TrackEnum | null;
}
