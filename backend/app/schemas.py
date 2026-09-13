from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str  # "student" | "faculty"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    github_username: Optional[str] = None

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Projects ----------

class ProjectCreateManual(BaseModel):
    title: str
    idea_text: str = Field(min_length=10)
    domain: str
    team_size: int = Field(ge=1, le=20)
    expected_timeline_weeks: int = Field(ge=1, le=52)


class ProjectCreateFromGitHub(BaseModel):
    repo_full_name: str
    repo_url: str
    title: Optional[str] = None


class AgentRunOut(BaseModel):
    agent_key: str
    agent_label: str
    status: str
    output_text: Optional[str] = None
    order_index: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: str
    title: str
    source_type: str
    idea_text: Optional[str] = None
    domain: Optional[str] = None
    team_size: Optional[int] = None
    expected_timeline_weeks: Optional[int] = None
    github_repo_full_name: Optional[str] = None
    status: str
    current_stage: str
    last_activity_at: datetime
    created_at: datetime
    agent_runs: List[AgentRunOut] = []

    class Config:
        from_attributes = True


class ProjectSummaryOut(BaseModel):
    """Lighter-weight version for list views (faculty dashboard, student project list)."""
    id: str
    title: str
    status: str
    current_stage: str
    last_activity_at: datetime
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    weeks_behind: Optional[int] = None  # positive = behind schedule, negative = ahead
    schedule_status: Optional[str] = None  # "ahead" | "on_track" | "behind" | "completed"

    class Config:
        from_attributes = True


# ---------- Chat ----------

class ChatMessageIn(BaseModel):
    content: str = Field(min_length=1)


class ChatMessageOut(BaseModel):
    id: str
    sender: str
    content: str
    is_proactive: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Dashboard / misc ----------

class QuoteOut(BaseModel):
    quote: str
    author: Optional[str] = None


class FacultyOverviewOut(BaseModel):
    total_students: int
    total_projects: int
    active_projects: int
    stalled_projects: int  # no activity in 5+ days
    students: List[ProjectSummaryOut]


class GithubRepoOut(BaseModel):
    full_name: str
    name: str
    url: str
    description: Optional[str] = None
    language: Optional[str] = None
    updated_at: Optional[str] = None


# ---------- Comments (faculty feedback) ----------

class CommentCreate(BaseModel):
    content: str = Field(min_length=1)
    agent_key: Optional[str] = None  # e.g. "tech", "timeline" — null = general comment


class CommentOut(BaseModel):
    id: str
    project_id: str
    agent_key: Optional[str] = None
    content: str
    is_read: bool
    created_at: datetime
    author_name: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Insights (health score / radar / risk heatmap) ----------

class RiskItemOut(BaseModel):
    name: str
    severity: int
    likelihood: int


class HealthScoreOut(BaseModel):
    feasibility: float
    scope_clarity: float
    tech_readiness: float
    timeline_realism: float
    risk_safety: float
    readiness_score: float
    top_risks: List[RiskItemOut] = []


class ProjectInsightOut(BaseModel):
    project_id: str
    project_title: str
    scores: Optional[HealthScoreOut] = None


# ---------- Timeline Tasks (checklist) ----------

class TaskItemOut(BaseModel):
    id: str
    week_number: int
    task_text: str
    is_done: bool

    class Config:
        from_attributes = True


class WeekTasksOut(BaseModel):
    week_number: int
    goal: Optional[str] = None
    tasks: List[TaskItemOut] = []


class TaskStatusOut(BaseModel):
    expected_week: int
    actual_week: int
    weeks_diff: int
    status: str  # "ahead" | "on_track" | "behind" | "completed"
    all_done: bool


class ProjectTasksOut(BaseModel):
    project_id: str
    project_title: str
    expected_timeline_weeks: Optional[int] = None
    weeks: List[WeekTasksOut] = []
    task_status: Optional[TaskStatusOut] = None
    ai_message: Optional[str] = None