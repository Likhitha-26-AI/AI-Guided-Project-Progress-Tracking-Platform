import httpx
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("HUGGINGFACE_API_KEY")
model = os.getenv("HUGGINGFACE_MODEL")

print(f"Testing model: {model}")

resp = httpx.post(
    "https://router.huggingface.co/v1/chat/completions",
    headers={"Authorization": f"Bearer {api_key}"},
    json={
        "model": model,
        "messages": [{"role": "user", "content": "Say hello in one sentence."}],
        "max_tokens": 50,
    },
    timeout=60,
)

print(f"Status: {resp.status_code}")
print(resp.text[:500])