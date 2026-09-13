from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth as auth_router
from app.routers import student as student_router
from app.routers import faculty as faculty_router
from app.routers import chat as chat_router
from app.routers import github as github_router
from app.routers import agents_ws as agents_ws_router
from app.routers import comments as comments_router

# Creates tables on first run (SQLite file: app.db). No migrations needed
# for a project of this scope — just delete app.db to reset during dev.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Guided Project Progress Tracking Platform",
    description="Backend API — planning & mentorship assistance powered by free Hugging Face models.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(student_router.router)
app.include_router(faculty_router.router)
app.include_router(chat_router.router)
app.include_router(github_router.router)
app.include_router(agents_ws_router.router)
app.include_router(comments_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
