import asyncio
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException
from jose import jwt, JWTError
from datetime import datetime

from core.websocket_manager import manager, ConnectionManager
from core.config import settings
from core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User, HackathonMembership

router = APIRouter()

def get_ws_manager() -> ConnectionManager:
    return manager

async def authenticate_ws_token(token: str, db: AsyncSession) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("Token missing user identifier")
            
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User inactive or missing")
        return user
    except JWTError:
        raise ValueError("Invalid credentials")

async def verify_hackathon_membership(user: User, hackathon_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(HackathonMembership).where(
            HackathonMembership.user_id == user.id,
            HackathonMembership.hackathon_id == hackathon_id
        )
    )
    return result.scalar_one_or_none() is not None


@router.websocket("/ws/hackathon/{hackathon_id}")
async def hackathon_websocket_endpoint(
    websocket: WebSocket,
    hackathon_id: str,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
    ws_manager: ConnectionManager = Depends(get_ws_manager)
):
    # Step 1: Validations BEFORE accepting
    try:
        user = await authenticate_ws_token(token, db)
    except ValueError:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    is_member = await verify_hackathon_membership(user, hackathon_id, db)
    if not is_member:
        await websocket.close(code=4003, reason="Forbidden")
        return
        
    # Step 2: Accept connection
    await ws_manager.connect(websocket, hackathon_id, str(user.id))
    
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    # Optional: We can fetch existing top 10 dynamically. For brevity, assuming blank default for initial connection if not injected.
    await websocket.send_json({
        "type": "connection_established",
        "payload": {"status": "connected"},
        "timestamp": now_iso
    })

    # Step 3: Loop
    try:
        while True:
            # wait_for adds auto-ping timeout protections
            data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
            if data == "pong":
                continue
            if data == "ping":
                await websocket.send_text("pong")
    except asyncio.TimeoutError:
        # Client went silent, send a ping to force them to respond or disconnect
        try:
           await websocket.send_json({"type": "ping", "timestamp": datetime.utcnow().isoformat() + "Z"})
        except Exception:
           ws_manager.disconnect(websocket, hackathon_id)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, hackathon_id)
    except Exception as e:
        ws_manager.disconnect(websocket, hackathon_id)
