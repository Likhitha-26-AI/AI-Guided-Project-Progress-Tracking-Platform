import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, DateTime, Enum, ForeignKey, Text, Integer, Boolean
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class RoleEnum(str, enum.Enum):
    student = "student"
    faculty = "faculty"


class AgentStatusEnum(str, enum.Enum):
    pending = "pending"
    working = "working"
    completed = "completed"
    failed = "failed"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    github_username = Column(String, nullable=True)
    github_access_token = Column(String, nullable=True)  # encrypted at rest in production

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=gen_id)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    source_type = Column(String, default="manual")  # "manual" | "github"
    idea_text = Column(Text, nullable=True)          # student's 2-3 line idea
    domain = Column(String, nullable=True)           # e.g. "Web Development", "AI/ML", "IoT"
    team_size = Column(Integer, nullable=True)
    expected_timeline_weeks = Column(Integer, nullable=True)
    github_repo_full_name = Column(String, nullable=True)
    github_repo_url = Column(String, nullable=True)

    status = Column(String, default="in_progress")   # in_progress | blueprint_ready | completed
    current_stage = Column(String, default="idea_evaluation")
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    agent_runs = relationship("AgentRun", back_populates="project", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="project", cascade="all, delete-orphan")
    progress_events = relationship("ProgressEvent", back_populates="project", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
    timeline_tasks = relationship("TimelineTask", back_populates="project", cascade="all, delete-orphan")


class AgentRun(Base):
    """One row per agent, per project — tracks each of the 5 agents' live status + output."""
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=gen_id)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    agent_key = Column(String, nullable=False)   # idea_evaluation | scope | tech | timeline | risk
    agent_label = Column(String, nullable=False)
    status = Column(Enum(AgentStatusEnum), default=AgentStatusEnum.pending)
    output_text = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="agent_runs")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=gen_id)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    sender = Column(String, nullable=False)  # "user" | "ai"
    content = Column(Text, nullable=False)
    is_proactive = Column(Boolean, default=False)  # AI-initiated nudge vs reply
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="chat_messages")


class ProgressEvent(Base):
    """Timeline of real events for a project — powers faculty dashboard, no hardcoded stats."""
    __tablename__ = "progress_events"

    id = Column(String, primary_key=True, default=gen_id)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    label = Column(String, nullable=False)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="progress_events")


class Comment(Base):
    """Faculty feedback on a project — optionally scoped to a specific agent's
    output (e.g. a comment on the Tech Recommendation), so it reads like real
    inline mentorship rather than a generic note."""
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=gen_id)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)

    agent_key = Column(String, nullable=True)  # null = general project comment
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)   # for the student's unread badge
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="comments")
    author = relationship("User")


class TimelineTask(Base):
    """One checkable task within one week of a project's timeline — generated
    once from the Timeline agent's plan, then checked off by the student as
    they go. Powers the sidebar Tasks view and the ahead/behind schedule logic."""
    __tablename__ = "timeline_tasks"

    id = Column(String, primary_key=True, default=gen_id)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    week_number = Column(Integer, nullable=False)
    week_goal = Column(String, nullable=True)
    task_text = Column(Text, nullable=False)
    order_index = Column(Integer, default=0)
    is_done = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="timeline_tasks")