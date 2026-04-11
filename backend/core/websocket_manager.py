import asyncio
import json
import logging
from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect
import redis.asyncio as redis
from core.config import settings

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Local registry of active connections purely for this worker instance
        # Structure: {"hackathon_id": [WebSocket, WebSocket, ...]}
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        # Redis connection for Pub/Sub
        self.redis_pool = redis.ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)
        self.redis_client = redis.Redis(connection_pool=self.redis_pool)
        
        # Keep track of active Redis pubsub tasks per hackathon so we don't spawn duplicates
        self.pubsub_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, hackathon_id: str, user_id: str):
        """Accepts a connection and binds it to the hackathon room."""
        await websocket.accept()
        
        if hackathon_id not in self.active_connections:
            self.active_connections[hackathon_id] = []
        
        self.active_connections[hackathon_id].append(websocket)
        logger.info(f"WS connected: user={user_id}, hackathon={hackathon_id}, total_connections={len(self.active_connections[hackathon_id])}")
        
        # Ensure we have a listener task running for this hackathon channel
        if hackathon_id not in self.pubsub_tasks or self.pubsub_tasks[hackathon_id].done():
            self.pubsub_tasks[hackathon_id] = asyncio.create_task(self._listen_to_redis(hackathon_id))

    def disconnect(self, websocket: WebSocket, hackathon_id: str):
        """Removes a connection and cleans up."""
        if hackathon_id in self.active_connections:
            try:
                self.active_connections[hackathon_id].remove(websocket)
            except ValueError:
                pass
            
            if not self.active_connections[hackathon_id]:
                # If room is empty, we can cancel the redis listener
                del self.active_connections[hackathon_id]
                task = self.pubsub_tasks.pop(hackathon_id, None)
                if task:
                    task.cancel()

    async def broadcast_to_hackathon(self, hackathon_id: str, message: dict):
        """
        Pushes a message to the Redis channel so ALL worker nodes and their 
        connected websockets receive the message dynamically.
        """
        try:
            await self.redis_client.publish(
                f"hackathon:{hackathon_id}:events",
                json.dumps(message)
            )
            # Cannot accurately log direct recipients cross-node here, so just log emission
            logger.info(f"Broadcasted {message.get('type')} to hackathon:{hackathon_id}:events via Redis")
        except Exception as e:
            logger.error(f"Failed to publish to redis: {str(e)}")

    async def send_to_user(self, hackathon_id: str, user_id: str, message: dict):
        """
        Currently routes to the entire room as requested by architecture.
        If strict user targeting is required later, we can alter the dictionary structure.
        """
        await self.broadcast_to_hackathon(hackathon_id, message)

    async def _listen_to_redis(self, hackathon_id: str):
        """Background task spawned per hackathon room to pipe Redis pubsub into Local WS instances."""
        pubsub = self.redis_client.pubsub()
        channel_name = f"hackathon:{hackathon_id}:events"
        await pubsub.subscribe(channel_name)
        
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    payload = json.loads(message["data"])
                    await self._send_to_local_connections(hackathon_id, payload)
        except asyncio.CancelledError:
            await pubsub.unsubscribe(channel_name)
        except Exception as e:
            logger.error(f"Redis PubSub listener failed for {channel_name}: {str(e)}")
            # Retry mechanism could go here
            await pubsub.unsubscribe(channel_name)

    async def _send_to_local_connections(self, hackathon_id: str, message: dict):
        """Relays a message from Redis to locally bound WebSockets on this worker process."""
        if hackathon_id not in self.active_connections:
            return
            
        disconnected = []
        for ws in self.active_connections[hackathon_id]:
            try:
                await ws.send_json(message)
            except WebSocketDisconnect:
                disconnected.append(ws)
            except Exception as e:
                logger.error(f"Error sending ws payload: {str(e)}")
                disconnected.append(ws)
                
        for ws in disconnected:
            self.disconnect(ws, hackathon_id)

# Singleton global manager
manager = ConnectionManager()
