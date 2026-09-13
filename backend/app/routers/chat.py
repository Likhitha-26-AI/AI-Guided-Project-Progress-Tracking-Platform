from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db
from app.services.hf_client import generate

router = APIRouter(prefix="/api/chat", tags=["chat"])

MENTOR_PERSONA = (
    "You are a warm, encouraging, and knowledgeable academic project mentor AI. "
    "You give specific, actionable advice — never generic filler. Keep responses "
    "concise (3-6 sentences) unless the student asks for detail. "
    "You are mentoring the student on their project."
)


def _get_owned_project(db: Session, project_id: str, user: models.User) -> models.Project:
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@router.get("/{project_id}/messages", response_model=List[schemas.ChatMessageOut])
def get_messages(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = _get_owned_project(db, project_id, current_user)
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.project_id == project.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )


@router.post("/{project_id}/messages", response_model=schemas.ChatMessageOut)
async def send_message(
    project_id: str,
    payload: schemas.ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = _get_owned_project(db, project_id, current_user)

    user_msg = models.ChatMessage(project_id=project.id, sender="user", content=payload.content)
    db.add(user_msg)
    db.commit()

    # Build context from the project's real state — no hardcoded canned replies.
    context_bits = [f"Project title: {project.title}", f"Current stage: {project.current_stage}"]
    if project.idea_text:
        context_bits.append(f"Project idea: {project.idea_text}")

    recent = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.project_id == project.id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(6)
        .all()
    )
    history_text = "\n".join(
        f"{'Student' if m.sender == 'user' else 'Mentor'}: {m.content}" for m in reversed(recent)
    )

    prompt = (
        f"{MENTOR_PERSONA}\n\n"
        f"Project context:\n{chr(10).join(context_bits)}\n\n"
        f"Conversation so far:\n{history_text}\n\n"
        f"Mentor:"
    )

    try:
        reply_text = await generate(prompt, max_new_tokens=300)
    except RuntimeError as exc:
        reply_text = (
            "I'm having trouble reaching the AI model right now "
            f"({exc}). Please check the Hugging Face API key/config and try again."
        )

    ai_msg = models.ChatMessage(project_id=project.id, sender="ai", content=reply_text)
    db.add(ai_msg)

    project.last_activity_at = datetime.utcnow()
    db.commit()
    db.refresh(ai_msg)

    return ai_msg


@router.get("/{project_id}/proactive-check")
async def proactive_check(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    """Called when the student opens the chat panel — checks real inactivity
    on their real project and, if warranted, has the AI proactively nudge them.
    No canned message: the nudge is generated from the actual stalled stage.
    """
    project = _get_owned_project(db, project_id, current_user)

    stall_cutoff = datetime.utcnow() - timedelta(days=2)
    if project.last_activity_at > stall_cutoff or project.status == "blueprint_ready":
        return {"nudge": None}

    already_nudged_recently = (
        db.query(models.ChatMessage)
        .filter(
            models.ChatMessage.project_id == project.id,
            models.ChatMessage.is_proactive == True,  # noqa: E712
            models.ChatMessage.created_at > stall_cutoff,
        )
        .first()
    )
    if already_nudged_recently:
        return {"nudge": None}

    prompt = (
        f"{MENTOR_PERSONA}\n\n"
        f"The student hasn't made progress on the '{project.current_stage}' stage of "
        f"their project '{project.title}' in a couple of days. Write one short, warm, "
        f"proactive check-in message offering specific help — do not be generic."
    )

    try:
        nudge_text = await generate(prompt, max_new_tokens=120)
    except RuntimeError:
        return {"nudge": None}

    nudge_msg = models.ChatMessage(
        project_id=project.id, sender="ai", content=nudge_text, is_proactive=True
    )
    db.add(nudge_msg)
    db.commit()
    db.refresh(nudge_msg)

    return {"nudge": schemas.ChatMessageOut.model_validate(nudge_msg)}


# ---------- Idea brainstorming chat (New Project page) ----------
# Stateless — no project exists yet, so nothing is persisted here. The
# frontend keeps the conversation in memory for the duration of the page visit.

class BrainstormMessage(schemas.BaseModel):
    content: str
    history: list = []  # [{sender: "user"|"ai", content: "..."}]


BRAINSTORM_PERSONA = (
    "You are a warm, encouraging academic project mentor AI helping a student "
    "think through a project idea BEFORE they've submitted it. Ask good clarifying "
    "questions, suggest angles they might not have considered, and help them sharpen "
    "a vague idea into something concrete. Keep responses concise (2-5 sentences)."
)


@router.post("/brainstorm")
async def brainstorm_chat(
    payload: BrainstormMessage,
    current_user: models.User = Depends(auth.require_student),
):
    from app.services.hf_client import generate

    history_text = "\n".join(
        f"{'Student' if m.get('sender') == 'user' else 'Mentor'}: {m.get('content', '')}"
        for m in payload.history[-6:]
    )

    prompt = (
        f"{BRAINSTORM_PERSONA}\n\n"
        f"Conversation so far:\n{history_text}\n\n"
        f"Student: {payload.content}\n\n"
        f"Mentor:"
    )

    try:
        reply = await generate(prompt, max_new_tokens=250)
    except RuntimeError as exc:
        reply = f"I'm having trouble reaching the AI model right now ({exc})."

    return {"content": reply}