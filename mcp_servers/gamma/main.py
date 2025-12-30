import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file in parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI()

# Get API key from environment (no fallback - must be set)
GAMMA_API_KEY = os.environ.get("GAMMA_API_KEY")
if not GAMMA_API_KEY:
    raise ValueError("GAMMA_API_KEY environment variable must be set in mcp_servers/.env")

BASE_URL = "https://public-api.gamma.app/v0.2"

class GenerateRequest(BaseModel ):
    inputText: str
    textMode: str | None = "generate"
    format: str | None = "presentation"
    themeName: str | None = None
    numCards: int | None = 10
    cardSplit: str | None = "auto"
    additionalInstructions: str | None = None
    exportAs: str | None = None
    textOptions: dict | None = None
    imageOptions: dict | None = None
    cardOptions: dict | None = None
    sharingOptions: dict | None = None

@app.post("/generate")
def generate_gamma(request: GenerateRequest):
    headers = {
        "X-API-KEY": GAMMA_API_KEY,
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(f"{BASE_URL}/generations", headers=headers, json=request.dict())
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=e.response.status_code if e.response else 500, detail=str(e))

@app.get("/generations/{generation_id}")
def get_generation(generation_id: str):
    headers = {
        "X-API-KEY": GAMMA_API_KEY
    }
    try:
        response = requests.get(f"{BASE_URL}/generations/{generation_id}", headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=e.response.status_code if e.response else 500, detail=str(e))
