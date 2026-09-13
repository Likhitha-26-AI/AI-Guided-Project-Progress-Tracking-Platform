from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError

from app.config import settings
from app.websocket_manager import manager

router = APIRouter()


def _validate_token(token: str) -> bool:
    try:
        jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return True
    except JWTError:
        return False


@router.websocket("/ws/projects/{project_id}")
async def project_pipeline_ws(websocket: WebSocket, project_id: str, token: str = Query(...)):
    if not _validate_token(token):
        await websocket.close(code=4401)
        return

    await manager.connect(project_id, websocket)
    try:
        while True:
            # We don't expect incoming messages here — this socket is
            # server -> client push only (agent status, pipeline_complete).
            # We still need to await something to detect disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(project_id, websocket)
