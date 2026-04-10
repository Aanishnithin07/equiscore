"""
Note on extending for WebSockets:
Phase A (Deterministic Analysis) can easily be adapted for real-time WebSocket streaming.
To do this:
1. Accept raw audio chunks over WS and stream them to an ongoing Whisper connection (e.g. via deepgram or custom whisper API).
2. As transcribed segments arrive, immediately run Phase A `classify_section` and filler word detection on the rolling buffer.
3. Emit updated `FillerWordOccurrence` and `words_per_minute` live to the frontend.
4. Phase B (LLM) should only run once at the very end when the WS connection closes to evaluate the full transcript for specificity and persuasiveness, as it requires holistic context.
"""

import uuid
import json
from typing import List, Dict, Any, Tuple
from openai import AsyncOpenAI

from schemas.behavior import (
    BehaviorAnalysisResult,
    TranscriptSegment,
    FillerWordOccurrence
)
from services.transcription import WhisperResult

class BehaviorAnalyzer:
    def __init__(self):
        self.client = AsyncOpenAI()
        self.filler_words = {
            "um", "uh", "like", "you know", "basically", "sort of", 
            "kind of", "right?", "okay so", "literally"
        }
        
    async def analyze(self, whisper_result: WhisperResult, job_id: uuid.UUID, evaluation_id: uuid.UUID = None) -> BehaviorAnalysisResult:
        # Phase A: Deterministic Python Analysis
        duration = whisper_result.duration or 1.0 # fallback to avoid division by zero
        word_count = len(whisper_result.text.split())
        words_per_minute = word_count / (duration / 60)
        
        # 1. Section Classification & Pacing
        section_times = {
            "problem": 0.0, "solution": 0.0, "demo": 0.0, 
            "team": 0.0, "ask": 0.0, "unclassified": 0.0
        }
        
        for segment in whisper_result.segments:
            seg_start = segment.get('start', 0.0)
            seg_end = segment.get('end', 0.0)
            seg_text = segment.get('text', '').lower()
            seg_duration = seg_end - seg_start
            
            section = self._classify_section(seg_text)
            section_times[section] += seg_duration
            
        # Pacing Calculations
        total_tracked_time = sum(section_times.values()) or 1.0
        section_percentages = {k: (v / total_tracked_time) * 100 for k, v in section_times.items()}
        pacing_score, pacing_flags = self._compute_pacing_balance(section_percentages)
        
        # 2. Filler Word Detection
        filler_counts, filler_wpm, confidence_score = self._compute_filler_and_confidence(whisper_result.text.lower(), duration)
        
        # Phase B: LLM Analysis for Persuasiveness and Specificity
        llm_data = await self._run_llm_phase(whisper_result.text, duration)
        
        # 3. Final Composite Score Generation
        persuasive_score = llm_data.get('persuasive_language_score', 0)
        specificity_score = llm_data.get('specificity_score', 0)
        
        overall_score = round(
            (pacing_score * 0.35) + 
            (confidence_score * 0.30) + 
            (persuasive_score * 0.25) + 
            (specificity_score * 0.10)
        )
        
        # Draft summary and recommendations based on scores
        summary, recommendations = self._generate_summary_recs(
            pacing_score, confidence_score, persuasive_score, specificity_score,
            filler_wpm, pacing_flags
        )
        
        # Merge LLM summary if available
        if llm_data.get("language_quality_summary"):
            summary += f" {llm_data.get('language_quality_summary')}"
        
        return BehaviorAnalysisResult(
            job_id=job_id,
            evaluation_id=evaluation_id,
            transcript_text=whisper_result.text,
            total_duration_seconds=duration,
            word_count=word_count,
            words_per_minute=words_per_minute,
            # Pacing
            section_time_breakdown=section_times,
            section_percentage_breakdown=section_percentages,
            pacing_balance_score=pacing_score,
            pacing_imbalance_flags=pacing_flags,
            # Confidence
            filler_word_counts=filler_counts,
            filler_words_per_minute=filler_wpm,
            confidence_score=confidence_score,
            # Language
            persuasive_language_score=persuasive_score,
            persuasive_phrases_detected=llm_data.get('persuasive_phrases_detected', []),
            weak_language_detected=llm_data.get('weak_language_detected', []),
            call_to_action_present=llm_data.get('call_to_action_present', False),
            specificity_score=specificity_score,
            specificity_evidence=llm_data.get('specificity_evidence', []),
            language_quality_summary=summary,
            # Composite
            overall_behavioral_score=overall_score,
            behavioral_summary=summary,
            top_behavioral_recommendations=recommendations
        )

    def _classify_section(self, text: str) -> str:
        indicators = {
            "problem": ["problem", "challenge", "pain point", "struggle", "currently", "right now", "users face"],
            "solution": ["solution", "we built", "our platform", "our app", "using ai", "algorithm"],
            "demo": ["let me show", "as you can see", "demo", "in the interface", "here you can"],
            "team": ["our team", "i am", "background in", "years of experience", "studied at"],
            "ask": ["we're looking for", "investment", "mentorship", "next steps", "ask", "seeking"]
        }
        
        counts = {section: 0 for section in indicators}
        for section, keywords in indicators.items():
            for kw in keywords:
                if kw in text:
                    counts[section] += 1
                    
        # Find the category with the most hits, if tie or zero -> unclassified
        max_hits = max(counts.values())
        if max_hits == 0:
            return "unclassified"
            
        for section, hits in counts.items():
            if hits == max_hits:
                return section
        return "unclassified"
        
    def _compute_pacing_balance(self, percentages: Dict[str, float]) -> Tuple[int, List[str]]:
        ideal = {
            "problem": 20, "solution": 35, "demo": 20, "team": 10, "ask": 15
        }
        
        penalties = 0.0
        flags = []
        for section, target in ideal.items():
            actual = percentages.get(section, 0.0)
            diff = abs(actual - target)
            penalties += diff * 2 # Formula per spec
            
            # Flag extreme imbalances
            if actual > target * 1.8:
                flags.append(f"Spent {actual:.0f}% of time on {section} (ideal is ~{target}%). This is overly heavy.")
            elif actual < target * 0.3:
                flags.append(f"No meaningful time allocated to {section} (only {actual:.0f}% spent here).")
                
        score = max(0, int(100 - penalties))
        return score, flags
        
    def _compute_filler_and_confidence(self, lower_text: str, duration: float) -> Tuple[List[FillerWordOccurrence], float, int]:
        counts = {}
        for fw in self.filler_words:
            fw_count = lower_text.count(fw)
            if fw_count > 0:
                # We interpolate fake timestamps for simplification since full token alignment is complex
                # In a real heavy app we'd map via Whisper's word-level timestamps.
                counts[fw] = FillerWordOccurrence(word=fw, count=fw_count, timestamps=[])
                
        total_fillers = sum(f.count for f in counts.values())
        duration_minutes = duration / 60
        fwpm = total_fillers / duration_minutes if duration_minutes > 0 else 0
        
        # Confidence formula: start at 100, subtract 3 per FWPM above 2.0
        penalty_wpm = max(0, fwpm - 2.0)
        confidence = max(0, int(100 - (penalty_wpm * 3)))
        
        return list(counts.values()), fwpm, confidence

    async def _run_llm_phase(self, transcript_text: str, duration: float) -> Dict[str, Any]:
        system_prompt = '''You are an expert communication coach and pitch evaluator specializing in startup and hackathon pitches. Your task is to analyze the PERSUASIVENESS and SPECIFICITY of the following pitch transcript.

Evaluate ONLY based on the text provided. Do not invent information.

Return ONLY a valid JSON object with exactly these fields:
{
  "persuasive_language_score": <integer 0-100>,
  "persuasive_phrases_detected": ["exact phrases from the transcript that demonstrate strong, confident, persuasive language"],
  "weak_language_detected": ["exact hedging, uncertain, or passive phrases from the transcript"],
  "call_to_action_present": <boolean>,
  "specificity_score": <integer 0-100>,
  "specificity_evidence": ["specific numbers, metrics, data points cited"],
  "language_quality_summary": "2-3 sentences evaluating the overall quality of their language and storytelling"
}

SCORING GUIDE:
persuasive_language_score:
  0-30: Passive, uncertain, filled with hedging language
  31-60: Mix of confident and weak language
  61-80: Mostly confident, some weakness
  81-100: Commanding, clear, confident throughout with strong conviction

specificity_score:
  0-30: Purely abstract claims with no data ("many users", "huge market")
  31-60: Some specifics but mostly vague
  61-80: Good use of numbers and concrete examples
  81-100: Every claim backed by specific data, research, or concrete user evidence'''

        user_prompt = f"[PITCH TRANSCRIPT — {int(duration)} seconds]\n\n{transcript_text}"
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            raw_json = response.choices[0].message.content
            return json.loads(raw_json)
        except Exception:
            # Fallback defensively if LLM fails
            return {}

    def _generate_summary_recs(self, pacing: int, conf: int, pers: int, spec: int, fwpm: float, flags: List[str]) -> Tuple[str, List[str]]:
        recs = []
        summary = "Your team demonstrated a baseline pitch execution."
        
        if fwpm > 4.0:
            recs.append(f"Reduce filler words: you used them {fwpm:.1f} times per minute. Aim for under 2/min to sound significantly more confident.")
            summary = "Your delivery was hindered by frequent use of filler words, which reduced perceived confidence."
        elif conf > 85:
            summary = "Your delivery was notably crisp and confident with minimal filler words."
        
        if spec < 50:
            recs.append("Increase specificity: your claims were somewhat abstract. Ground your statements with concrete metrics, user numbers, or validated research.")
        
        if flags:
            recs.append(flags[0]) # Add top pacing flag
            
        if len(recs) < 3:
            recs.append("Ensure every core section of the pitch serves as a hook to the next to keep juding panels engaged.")
            
        return summary, recs
