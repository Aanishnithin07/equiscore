from celery import shared_task
from celery.utils.log import get_task_logger
import asyncio
import uuid
import base64

from core.database import async_session_maker
from models.evaluation import BehaviorJob
from services.transcription import WhisperTranscriptionService
from services.behavior_analyzer import BehaviorAnalyzer

logger = get_task_logger(__name__)

async def _process_behavior_async(job_id_str: str, file_b64: str, filename: str, evaluation_id_str: str = None):
    job_id = uuid.UUID(job_id_str)
    eval_id = uuid.UUID(evaluation_id_str) if evaluation_id_str else None
    
    file_bytes = base64.b64decode(file_b64)
    
    transcriber = WhisperTranscriptionService()
    analyzer = BehaviorAnalyzer()
    
    try:
        # Update status to processing
        async with async_session_maker() as session:
            job = await session.get(BehaviorJob, job_id)
            if job:
                job.status = "processing"
                await session.commit()
                
        # Phase 1: Transcribe via Whisper
        logger.info(f"[{job_id}] Transcribing audio/video file...")
        whisper_res = await transcriber.transcribe(file_bytes, filename)
        
        # Phase 2: Psychological Behavioral Analysis
        logger.info(f"[{job_id}] Running behavioral psychological analysis...")
        analysis_res = await analyzer.analyze(whisper_res, job_id=job_id, evaluation_id=eval_id)
        
        # Phase 3: Commiting result dump
        async with async_session_maker() as session:
            job = await session.get(BehaviorJob, job_id)
            if job:
                job.status = "completed"
                job.result = analysis_res.model_dump()
                await session.commit()
                logger.info(f"[{job_id}] Behavioral analysis completely successfully.")
                
    except Exception as e:
        logger.error(f"[{job_id}] Pipeline failed: {str(e)}", exc_info=True)
        async with async_session_maker() as session:
            job = await session.get(BehaviorJob, job_id)
            if job:
                job.status = "failed"
                job.error = str(e)
                await session.commit()

@shared_task(name="evaluate_behavior_task", bind=True, max_retries=2)
def evaluate_behavior_task(self, job_id_str: str, file_b64: str, filename: str, evaluation_id_str: str = None):
    """
    Sync entrypoint for the Celery worker to run the asyncio behavioral pipeline.
    Base64 encoding is used to safely pass binary across the Redis broker.
    """
    logger.info(f"Received behavioral analysis task for job_id={job_id_str}")
    
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(
        _process_behavior_async(job_id_str, file_b64, filename, evaluation_id_str)
    )
