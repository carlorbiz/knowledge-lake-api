import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

DOCSAUTOMATOR_API_KEY = os.environ.get("DOCSAUTOMATOR_API_KEY", "3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc")
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
