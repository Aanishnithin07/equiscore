import os
import aiofiles
import tempfile
from openai import AsyncOpenAI
from pydantic import BaseModel
from typing import List, Dict, Any

class WhisperResult(BaseModel):
    text: str
    segments: List[Dict[str, Any]]
    language: str
    duration: float

class FileSizeLimitError(Exception):
    pass

class WhisperTranscriptionService:
    def __init__(self):
        # We rely on OPENAI_API_KEY being in the environment
        self.client = AsyncOpenAI()
        self.max_bytes = 25 * 1024 * 1024 # 25MB

    async def transcribe(self, file_bytes: bytes, filename: str) -> WhisperResult:
        if len(file_bytes) > self.max_bytes:
            raise FileSizeLimitError("Audio/video files must be under 25MB. Consider compressing or trimming the file.")
            
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            ext = ".mp3" # default fallback if missing
            
        # Write to a temporary file since dictating to Whisper requires a file-like object with an extension
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
            
        try:
            with open(tmp_path, "rb") as audio_file:
                response = await self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                    timestamp_granularities=["segment"]
                )
            
            # The verbose_json format returns a dict-like or BaseModel object from OpenAI SDK
            # Safely extract values assuming standardized response structure.
            text = response.text
            segments = getattr(response, 'segments', []) or response.model_dump().get('segments', [])
            language = getattr(response, 'language', 'en')
            duration = getattr(response, 'duration', 0.0)
            
            # If duration is missing entirely, try to calculate from last segment
            if not duration and segments:
                duration = segments[-1].get('end', 0.0)
                
            return WhisperResult(
                text=text,
                segments=segments,
                language=language,
                duration=duration
            )
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
