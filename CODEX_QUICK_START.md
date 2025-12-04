# Codex Quick Start: Fix Railway mem0 Import

## The Problem
```
ERROR - Mem0 import failed: Error importing numpy: you should not
try to import numpy from its source directory
```

Railway deployment healthy but mem0 won't initialize. API responding at:
https://knowledge-lake-api-production.up.railway.app/health

Shows: `"mem0_enabled": false, "openai_key_configured": true`

## What We've Tried (All Failed)
1. ✗ Cleanup commands (rm -rf numpy)
2. ✗ .dockerignore exclusions
3. ✗ Run from clean /opt/run directory
4. ✗ Python isolated mode (-I flag)
5. ✗ Explicit PYTHONPATH

## Current Files

**requirements.txt:**
```
flask==2.3.3
flask-cors==4.0.0
mem0ai==0.1.115
openai>=1.33.0
requests>=2.31.0
python-dotenv>=1.0.0
waitress==3.0.0
gunicorn==21.2.0
```

**nixpacks.toml:**
```toml
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = [
  "python3 -m venv /opt/venv",
  "/opt/venv/bin/pip install --upgrade pip",
  "/opt/venv/bin/pip install --no-cache-dir -r requirements.txt",
  "mkdir -p /opt/run",
  "cp *.py /opt/run/"
]

[start]
cmd = "cd /opt/run && PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=/opt/run:/opt/venv/lib/python3.11/site-packages /opt/venv/bin/python3 start_knowledge_lake.py"
```

## What You Should Try

### Option 1: Switch to Dockerfile (Recommended)
Replace nixpacks.toml with Dockerfile:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY *.py .
EXPOSE 5000
CMD ["python", "start_knowledge_lake.py"]
```

### Option 2: Install numpy first
In nixpacks.toml install section:
```toml
"/opt/venv/bin/pip install --no-cache-dir numpy",
"/opt/venv/bin/pip install --no-cache-dir -r requirements.txt"
```

### Option 3: Try different mem0ai version
Change requirements.txt:
```
mem0ai==0.1.100  # or latest stable
```

### Option 4: Clear Railway cache
In Railway dashboard → Settings → Clear build cache → Redeploy

## Files Location
`C:\Users\carlo\Development\mem0-sync\mem0\`

## Test Command
```bash
curl https://knowledge-lake-api-production.up.railway.app/health | grep mem0_enabled
```

Should return: `"mem0_enabled": true`

## GitHub Repo
Railway watches: https://github.com/carlorbiz/knowledge-lake-api (main branch)

## Success Criteria
Health endpoint shows:
```json
{
  "mem0_enabled": true,
  "mem0_status": "initialized"
}
```

**Priority:** URGENT - Blocking production revenue generation
