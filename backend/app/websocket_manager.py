"""
Tracks active WebSocket connections per project, so the backend can push
live agent-status updates and chat tokens to exactly the right client(s) —
this is what makes the agent pipeline "appear on screen" instead of the
frontend polling blindly.
"""
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, project_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(project_id, []).append(websocket)

    def disconnect(self, project_id: str, websocket: WebSocket):
        conns = self.active.get(project_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns and project_id in self.active:
            del self.active[project_id]

    async def broadcast(self, project_id: str, message: dict):
        for ws in list(self.active.get(project_id, [])):
            try:
                await ws.send_json(message)
            except Exception:
                # Connection likely closed — drop it silently.
                self.disconnect(project_id, ws)


manager = ConnectionManager()
