import httpx

model = "meta-llama/Llama-3.1-8B-Instruct"
resp = httpx.get(f"https://huggingface.co/api/models/{model}?expand[]=inferenceProviderMapping")
print(resp.status_code)
print(resp.json())