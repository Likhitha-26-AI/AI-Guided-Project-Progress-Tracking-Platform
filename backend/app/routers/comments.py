from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api", tags=["comments"])


def _serialize(comment: models.Comment) -> schemas.CommentOut:
    return schemas.CommentOut(
        id=comment.id,
        project_id=comment.project_id,
        agent_key=comment.agent_key,
        content=comment.content,
        is_read=comment.is_read,
        created_at=comment.created_at,
        author_name=comment.author.name if comment.author else None,
    )


# ---------- Faculty: post + view comments on a specific project ----------

@router.post("/faculty/projects/{project_id}/comments", response_model=schemas.CommentOut)
def add_comment(
    project_id: str,
    payload: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_faculty),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    comment = models.Comment(
        project_id=project.id,
        author_id=current_user.id,
        agent_key=payload.agent_key,
        content=payload.content,
    )
    db.add(comment)

    db.add(models.ProgressEvent(
        project_id=project.id,
        label=f"{current_user.name} left feedback",
        detail=payload.content[:200],
    ))
    db.commit()
    db.refresh(comment)

    return _serialize(comment)


@router.get("/faculty/projects/{project_id}/comments", response_model=List[schemas.CommentOut])
def list_project_comments_faculty(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_faculty),
):
    comments = (
        db.query(models.Comment)
        .options(joinedload(models.Comment.author))
        .filter(models.Comment.project_id == project_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )
    return [_serialize(c) for c in comments]


@router.get("/faculty/feedback-given", response_model=List[schemas.CommentOut])
def feedback_given(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_faculty),
):
    """Every comment this faculty member has left, across all students."""
    comments = (
        db.query(models.Comment)
        .options(joinedload(models.Comment.author), joinedload(models.Comment.project))
        .filter(models.Comment.author_id == current_user.id)
        .order_by(models.Comment.created_at.desc())
        .all()
    )
    return [_serialize(c) for c in comments]


# ---------- Student: view comments on their own projects ----------

@router.get("/student/projects/{project_id}/comments", response_model=List[schemas.CommentOut])
def list_project_comments_student(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    comments = (
        db.query(models.Comment)
        .options(joinedload(models.Comment.author))
        .filter(models.Comment.project_id == project_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )
    return [_serialize(c) for c in comments]


@router.get("/student/feedback", response_model=List[schemas.CommentOut])
def all_feedback_for_student(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    """Every comment across all of this student's projects — marks them read
    on fetch, so the sidebar unread badge clears once they actually visit."""
    comments = (
        db.query(models.Comment)
        .join(models.Project)
        .options(joinedload(models.Comment.author))
        .filter(models.Project.owner_id == current_user.id)
        .order_by(models.Comment.created_at.desc())
        .all()
    )
    result = [_serialize(c) for c in comments]

    unread_ids = [c.id for c in comments if not c.is_read]
    if unread_ids:
        db.query(models.Comment).filter(models.Comment.id.in_(unread_ids)).update(
            {"is_read": True}, synchronize_session=False
        )
        db.commit()

    return result


@router.get("/student/feedback/unread-count")
def unread_feedback_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    count = (
        db.query(models.Comment)
        .join(models.Project)
        .filter(models.Project.owner_id == current_user.id, models.Comment.is_read == False)  # noqa: E712
        .count()
    )
    return {"unread_count": count}