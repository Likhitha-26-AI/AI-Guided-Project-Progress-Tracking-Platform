"""
GitHub OAuth (free) — lets a student connect their GitHub account so we can
list their repos and let them pick one as a project source, instead of
typing an idea from scratch.
"""
import httpx

from app.config import settings

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_BASE = "https://api.github.com"


def build_authorize_url(redirect_uri: str, state: str) -> str:
    return (
        f"{GITHUB_AUTHORIZE_URL}?client_id={settings.github_client_id}"
        f"&redirect_uri={redirect_uri}&scope=repo,read:user&state={state}"
    )


async def exchange_code_for_token(code: str, redirect_uri: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
        )
    data = resp.json()
    if "access_token" not in data:
        raise RuntimeError(f"GitHub token exchange failed: {data}")
    return data["access_token"]


async def get_github_user(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API_BASE}/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    resp.raise_for_status()
    return resp.json()


async def list_user_repos(access_token: str) -> list:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API_BASE}/user/repos",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"sort": "updated", "per_page": 50},
        )
    resp.raise_for_status()
    repos = resp.json()
    return [
        {
            "full_name": r["full_name"],
            "name": r["name"],
            "url": r["html_url"],
            "description": r.get("description"),
            "language": r.get("language"),
            "updated_at": r.get("updated_at"),
        }
        for r in repos
    ]
