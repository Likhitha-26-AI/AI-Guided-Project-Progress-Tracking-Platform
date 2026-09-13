# Backend — AI-Guided Project Progress Tracking Platform

FastAPI backend: auth, 5 AI agents (via free Hugging Face inference), live
WebSocket pipeline updates, interactive mentor chatbot, GitHub OAuth import,
and Word/PowerPoint report generation. SQLite database, zero paid services.

## 1. Setup (run once)

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## 2. Configure your environment

```bash
cp .env.example .env
```

Then open `.env` and fill in:

- `JWT_SECRET_KEY` — any long random string (generate with
  `python -c "import secrets; print(secrets.token_hex(32))"`)
- `HUGGINGFACE_API_KEY` — free token from https://huggingface.co/settings/tokens
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — free, from a GitHub OAuth App
  at https://github.com/settings/developers (only needed for the GitHub-import
  feature — the rest of the app works without it)

## 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs (auto-generated,
useful for testing endpoints directly) at `http://localhost:8000/docs`.

## Notes

- The database is a single SQLite file (`app.db`) created automatically on
  first run, right in the `backend/` folder. To reset all data, stop the
  server and delete `app.db`.
- Generated Word/PowerPoint files are saved to `backend/generated_docs/` and
  served for download through the API.
- The WebSocket endpoint (`/ws/projects/{project_id}?token=...`) is what
  pushes live agent-status updates to the frontend as each of the 5 agents
  works through a submitted project idea.
- If `HUGGINGFACE_API_KEY` is missing or a model is still "cold starting" on
  Hugging Face's free tier, agent calls will return a clear error message
  rather than crash silently — check the terminal output if something looks
  stuck.
