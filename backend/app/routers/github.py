import secrets

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db
from app.config import settings
from app.services import github_service

router = APIRouter(prefix="/api/github", tags=["github"])

REDIRECT_URI = "http://localhost:8000/api/github/callback"

# In-memory state store for the OAuth handshake (fine for a local/dev app).
_pending_states: dict[str, str] = {}  # state -> user_id


@router.get("/connect")
def connect(current_user: models.User = Depends(auth.require_student)):
    state = secrets.token_urlsafe(16)
    _pending_states[state] = current_user.id
    url = github_service.build_authorize_url(REDIRECT_URI, state)
    return {"authorize_url": url}


@router.get("/callback")
async def callback(code: str, state: str, db: Session = Depends(get_db)):
    user_id = _pending_states.pop(state, None)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state.")

    access_token = await github_service.exchange_code_for_token(code, REDIRECT_URI)
    gh_user = await github_service.get_github_user(access_token)

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.github_username = gh_user.get("login")
    user.github_access_token = access_token
    db.commit()

    # Redirect back to the frontend project-creation page.
    return RedirectResponse(url=f"{settings.frontend_origin}/student/settings?github=connected")


@router.get("/repos", response_model=list[schemas.GithubRepoOut])
async def list_repos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub account not connected.")
    repos = await github_service.list_user_repos(current_user.github_access_token)
    return repos
