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
DOCSAUTOMATOR_API_KEY = os.environ.get("DOCSAUTOMATOR_API_KEY")
if not DOCSAUTOMATOR_API_KEY:
    raise ValueError("DOCSAUTOMATOR_API_KEY environment variable must be set in mcp_servers/.env")

BASE_URL = "https://api.docsautomator.co"

class CreateDocumentRequest(BaseModel ):
    docId: str
    documentName: str | None = None
    recId: str | None = None
    taskId: str | None = None
    data: dict | None = None

@app.post("/create_document")
def create_document(request: CreateDocumentRequest):
    headers = {
        "Authorization": f"Bearer {DOCSAUTOMATOR_API_KEY}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(f"{BASE_URL}/createDocument", headers=headers, json=request.dict())
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=e.response.status_code if e.response else 500, detail=str(e))

@app.get("/get_automations")
def get_automations():
    headers = {
        "Authorization": f"Bearer {DOCSAUTOMATOR_API_KEY}"
    }
    try:
        response = requests.get(f"{BASE_URL}/automations", headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=e.response.status_code if e.response else 500, detail=str(e))
