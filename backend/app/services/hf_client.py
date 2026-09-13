"""
Thin wrapper around Hugging Face's free router API (OpenAI-compatible chat
completions). Every AI agent and the chatbot go through this single
function, so the model can be swapped in one place (see HUGGINGFACE_MODEL
in .env).

Note: Hugging Face retired the old api-inference.huggingface.co endpoint —
this uses the current router.huggingface.co endpoint instead.
"""
import httpx

from app.config import settings

HF_API_URL = "https://router.huggingface.co/v1/chat/completions"


async def generate(prompt: str, max_new_tokens: int = 512, temperature: float = 0.7) -> str:
    """Calls the HF router's chat-completions API and returns generated text.
    Raises a RuntimeError with a readable message on failure (e.g. model
    unavailable, rate limit, missing API key) so callers can surface it.
    """
    if not settings.huggingface_api_key:
        raise RuntimeError(
            "HUGGINGFACE_API_KEY is not set. Add your free HF token to backend/.env "
            "(see .env.example)."
        )

    headers = {"Authorization": f"Bearer {settings.huggingface_api_key}"}
    payload = {
        "model": settings.huggingface_model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_new_tokens,
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(HF_API_URL, headers=headers, json=payload)

    if resp.status_code != 200:
        raise RuntimeError(f"Hugging Face API error ({resp.status_code}): {resp.text[:300]}")

    data = resp.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"Unexpected Hugging Face response shape: {str(data)[:300]}")