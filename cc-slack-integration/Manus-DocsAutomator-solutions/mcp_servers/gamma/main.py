
import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

GAMMA_API_KEY = os.environ.get("GAMMA_API_KEY", "sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE")
BASE_URL = "https://public-api.gamma.app/v0.2"

class GenerateRequest(BaseModel):
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
        raise HTTPException(status_code=e.response.status_code, detail=str(e))

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
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
