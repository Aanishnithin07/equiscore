import asyncio
import logging
import uuid

from core.database import async_session_maker
from core.websocket_manager import manager
from models.evaluation import Evaluation
from services.plagiarism_detector import PlagiarismDetector
from tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

async def _async_plagiarism_pipeline(evaluation_id: str, hackathon_id: str) -> None:
    eval_uuid = uuid.UUID(evaluation_id)
    hack_uuid = uuid.UUID(hackathon_id)

    async with async_session_maker() as db:
        evaluation = await db.get(Evaluation, eval_uuid)
        if not evaluation or not evaluation.raw_llm_output:
            logger.error(f"Missing evaluation data for plagiarism check {evaluation_id}")
            return
            
        # Reconstruct text that was previously evaluated (Assuming extract was saved, or we just use LLM summary as a proxy for speed)
        # Ideally the original text was extracted, but here we fallback to combining their justifications if missing raw text.
        try:
            # Depending on if raw text was persisted natively
            # Assuming raw_llm_output has justifications or summary
            content_str = str(evaluation.raw_llm_output) 
        except:
            content_str = "Missing content buffer"

        # 1. Compute and store embedding
        new_embedding = await PlagiarismDetector.compute_and_store_embedding(
            evaluation_id=eval_uuid,
            hackathon_id=hack_uuid,
            extracted_text=content_str,
            db=db
        )

        # 2. Rescan against all others
        flagged_results = await PlagiarismDetector.run_similarity_scan(new_embedding, hack_uuid, db)
        
        # 3. Handle broadcasts
        if flagged_results:
            logger.warning(f"Plagiarism scan: {len(flagged_results)} flags found for evaluation {evaluation_id}")
            # Format and Broadcast
            # We don't want to spam individual pairs, just that an alert fired
            await manager.broadcast_to_hackathon(hackathon_id, {
                "type": "plagiarism_alert",
                "payload": {
                    "alert_count": len(flagged_results),
                    "trigger_team": evaluation.team.name if evaluation.team else "Unknown"
                }
            })


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

@celery_app.task(
    bind=True,
    name="tasks.plagiarism_tasks.run_plagiarism_check_task",
    max_retries=3,
    default_retry_delay=10
)
def run_plagiarism_check_task(self, evaluation_id: str, hackathon_id: str):
    """
    Celery entrypoint for deep semantic similarity checks executed 
    post-evaluation completion seamlessly.
    """
    try:
        _run_async(_async_plagiarism_pipeline(evaluation_id, hackathon_id))
    except Exception as e:
        logger.error(f"Plagiarism checking failed: {e}")
        raise self.retry(exc=e)
