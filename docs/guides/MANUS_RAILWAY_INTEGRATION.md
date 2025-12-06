# Manus MCP → Railway Knowledge Lake Integration

**Quick Reference for Manus**

---

## 🔗 Production URLs

Once Carla deploys to Railway, Manus will use:

```python
# Replace localhost with Railway URL
KNOWLEDGE_LAKE_URL = "https://[your-app-name].up.railway.app"
```

**Example**:
```python
KNOWLEDGE_LAKE_URL = "https://mem0-knowledge-lake-production.up.railway.app"
```

---

## 📡 API Endpoints

### 1. Health Check
```bash
GET https://[your-app-name].up.railway.app/health
```

### 2. Ingest Conversation (Primary Endpoint)
```bash
POST https://[your-app-name].up.railway.app/api/conversations/ingest
Content-Type: application/json

{
  "userId": 1,
  "agent": "Manus",
  "date": "2024-11-30",
  "topic": "Email: Subject Line",
  "content": "Full email content...",
  "entities": [],
  "relationships": [],
  "metadata": {
    "sourceEmail": "sender@example.com",
    "emailSubject": "Subject",
    "processingAgent": "Manus"
  }
}
```

### 3. Get Statistics
```bash
GET https://[your-app-name].up.railway.app/api/stats?userId=1
```

### 4. Query Entities
```bash
GET https://[your-app-name].up.railway.app/api/entities?userId=1&entityType=Technology&limit=10
```

### 5. Aurelia Query (Semantic Search)
```bash
POST https://[your-app-name].up.railway.app/api/aurelia/query
Content-Type: application/json

{
  "userId": 1,
  "query": "What database schema was recommended?"
}
```

---

## 🧪 Testing the Integration

### Test 1: Health Check
```bash
curl https://[your-app-name].up.railway.app/health
```

### Test 2: Ingest Test Email
```python
import requests

response = requests.post(
    "https://[your-app-name].up.railway.app/api/conversations/ingest",
    json={
        "userId": 1,
        "agent": "Manus",
        "date": "2024-11-30",
        "topic": "Email: Test Integration",
        "content": "This is a test email from Manus MCP to verify Railway integration works correctly.",
        "entities": [],
        "relationships": [],
        "metadata": {
            "sourceEmail": "test@example.com",
            "emailSubject": "Test Integration",
            "processingAgent": "Manus"
        }
    }
)

print(response.json())
```

Expected response:
```json
{
  "success": true,
  "conversation": {
    "id": 1,
    "agent": "Manus",
    "topic": "Email: Test Integration"
  },
  "entitiesCreated": 0,
  "relationshipsCreated": 0,
  "timestamp": "2024-11-30T12:00:00.000000"
}
```

---

## 🔧 Manus Configuration Update

### Update `knowledge_lake_client.py`

```python
class KnowledgeLakeClient:
    def __init__(self, base_url: str = None):
        # Auto-detect Railway URL or fallback to localhost
        self.base_url = base_url or os.environ.get(
            "KNOWLEDGE_LAKE_URL",
            "http://localhost:5002"  # Fallback for local testing
        )
        self.ingest_endpoint = f"{self.base_url}/api/conversations/ingest"
        self.stats_endpoint = f"{self.base_url}/api/stats"
        self.entities_endpoint = f"{self.base_url}/api/entities"

    def ingest_email(self, email_content: str, subject: str, sender: str):
        """Ingest email into Knowledge Lake"""
        payload = {
            "userId": 1,
            "agent": "Manus",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "topic": f"Email: {subject}",
            "content": email_content,
            "entities": [],  # Knowledge Lake will extract these
            "relationships": [],
            "metadata": {
                "sourceEmail": sender,
                "emailSubject": subject,
                "processingAgent": "Manus"
            }
        }

        try:
            response = requests.post(self.ingest_endpoint, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": str(e)}

    def get_stats(self, user_id: int = 1):
        """Get Knowledge Lake statistics"""
        try:
            response = requests.get(f"{self.stats_endpoint}?userId={user_id}", timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
```

### Set Environment Variable

```bash
# In Manus's environment
export KNOWLEDGE_LAKE_URL="https://[your-app-name].up.railway.app"
```

Or in Python code:
```python
import os
os.environ["KNOWLEDGE_LAKE_URL"] = "https://[your-app-name].up.railway.app"
```

---

## 📊 Expected Response Format

### Successful Ingestion
```json
{
  "success": true,
  "conversation": {
    "id": 42,
    "agent": "Manus",
    "topic": "Email: Project Update"
  },
  "entitiesCreated": 0,
  "relationshipsCreated": 0,
  "timestamp": "2024-11-30T12:34:56.789012"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Missing fields: content"
}
```

---

## 🔄 Complete Workflow

1. **Manus receives email** → Extracts content, subject, sender
2. **Manus calls Knowledge Lake** → POST to `/api/conversations/ingest`
3. **Knowledge Lake processes** → Stores conversation + extracts entities via mem0
4. **Knowledge Lake responds** → Returns success + stats
5. **Manus confirms** → Logs successful ingestion or retries on failure

---

## 🚨 Error Handling

```python
def ingest_with_retry(client, email_content, subject, sender, max_retries=3):
    """Ingest with exponential backoff retry"""
    import time

    for attempt in range(max_retries):
        result = client.ingest_email(email_content, subject, sender)

        if result.get("success"):
            return result

        # Exponential backoff: 1s, 2s, 4s
        wait_time = 2 ** attempt
        print(f"Attempt {attempt + 1} failed, retrying in {wait_time}s...")
        time.sleep(wait_time)

    return {"success": False, "error": "Max retries exceeded"}
```

---

## 🎯 Next Steps for Manus

1. **Wait for Railway URL** from Carla
2. **Update `KNOWLEDGE_LAKE_URL`** environment variable
3. **Test health endpoint** to verify connectivity
4. **Test ingest endpoint** with sample email
5. **Verify stats endpoint** shows the ingested conversation
6. **Integrate into email workflow** with error handling

---

## 📞 Contact

Once Carla deploys to Railway, she'll provide the exact URL to use.

Expected format: `https://mem0-knowledge-lake-production.up.railway.app`

---

**🌊 Ready to connect Manus MCP to the Knowledge Lake! 🧠✨**
