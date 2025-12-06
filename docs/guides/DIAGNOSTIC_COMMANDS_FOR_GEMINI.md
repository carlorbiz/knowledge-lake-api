# Diagnostic Commands for Gemini CLI Analysis

Run these commands to gather information about the mem0/numpy issue:

## 1. Check Current Railway Deployment Health
```bash
curl -s "https://knowledge-lake-api-production.up.railway.app/health" | python -m json.tool
```

## 2. Test if mem0 imports work locally
```bash
cd "C:\Users\carlo\Development\mem0-sync\mem0"
python -c "from mem0 import Memory; print('✅ mem0 imports successfully')"
```

## 3. Check numpy installation locally
```bash
python -c "import numpy; print(f'numpy version: {numpy.__version__}'); print(f'numpy location: {numpy.__file__}')"
```

## 4. Check mem0ai package dependencies
```bash
pip show mem0ai
```

## 5. Test Railway deployment with Python version check
```bash
curl -s "https://knowledge-lake-api-production.up.railway.app/health"
```

## 6. Check if Railway is using correct Python/pip
```bash
# Look for this in Railway logs:
# - Python version being used
# - pip install output showing numpy version
# - Any warnings during pip install
```

## Railway Build Log Keywords to Search For
- "numpy" - Any numpy-related messages
- "ERROR" - Error messages during build
- "WARNING" - Warning messages
- "Collecting mem0ai" - pip install of mem0
- "Successfully installed" - Final package list
- "ERROR - Mem0 import failed" - Runtime import error

## Potential Root Causes to Investigate

### Hypothesis 1: Nixpacks Python Environment Issue
- Railway's Nixpacks might be setting up Python environment differently than expected
- Virtual environment might not be isolated correctly
- PYTHONPATH might be including unexpected directories

### Hypothesis 2: mem0ai Package Dependency Conflict
- mem0ai 0.1.115 might have specific numpy version requirements
- Could be conflict with other packages (qdrant, embedchain, etc.)
- Try: `pip install mem0ai==0.1.115 --no-deps` to see base requirements

### Hypothesis 3: Railway Build Cache Corruption
- Similar to npm/pnpm issue we had before
- Railway might be caching broken build artifacts
- Solution: Clear Railway build cache and redeploy

### Hypothesis 4: Python Version Mismatch
- Local development might be using different Python version
- Railway using Python 3.11 via Nixpacks
- mem0ai might have Python version-specific numpy requirements

### Hypothesis 5: Source Directory Pollution
- Despite .dockerignore, source files might still be present
- Railway build process might be creating numpy source directories
- Need to verify what's actually in the container at runtime

## Quick Tests for Gemini to Run

### Test 1: Check if problem is Railway-specific
```bash
# Create a minimal Docker container locally
docker run -it python:3.11-slim bash
pip install mem0ai==0.1.115
python -c "from mem0 import Memory; print('Works!')"
```

### Test 2: Check mem0ai's actual numpy requirement
```bash
pip download mem0ai==0.1.115 --no-deps
tar -xzf mem0ai-*.tar.gz
cat mem0ai-*/setup.py  # or pyproject.toml
```

### Test 3: Alternative deployment without venv
Try deploying without virtual environment - use system Python directly:
```toml
[phases.install]
cmds = [
  "pip install --upgrade pip",
  "pip install --no-cache-dir -r requirements.txt"
]

[start]
cmd = "python3 start_knowledge_lake.py"
```

### Test 4: Try installing numpy separately first
```toml
[phases.install]
cmds = [
  "python3 -m venv /opt/venv",
  "/opt/venv/bin/pip install --upgrade pip",
  "/opt/venv/bin/pip install --no-cache-dir numpy",
  "/opt/venv/bin/pip install --no-cache-dir -r requirements.txt"
]
```

## Expected Successful Output

When mem0 initializes successfully, Railway logs should show:
```
2025-12-03 XX:XX:XX - api_server - INFO - ================================================================================
2025-12-03 XX:XX:XX - api_server - INFO - 🚀 API_SERVER.PY LOADED - VERSION 2.0.1_enhanced
2025-12-03 XX:XX:XX - api_server - INFO - 🔑 OPENAI_API_KEY configured: True
2025-12-03 XX:XX:XX - api_server - INFO - 💾 Mem0 enabled: True
2025-12-03 XX:XX:XX - api_server - INFO - ================================================================================
2025-12-03 XX:XX:XX - api_server - INFO - ✅ Mem0 initialized successfully with OPENAI_API_KEY
```

## Questions for Gemini Analysis

1. **What is mem0ai's actual numpy dependency?** Check if it's using numpy directly or through another package
2. **Is there a Railway-specific pattern for handling numpy?** Check Railway docs/forums
3. **Could we use a different base image?** Instead of Nixpacks, use Docker with python:3.11-slim
4. **Should we switch to Poetry/PDM** for dependency management instead of pip?
5. **Is there a mem0ai alternative** that doesn't have these conflicts?

## Alternative Approaches to Consider

### Approach A: Use Docker Instead of Nixpacks
Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY *.py .
CMD ["python", "start_knowledge_lake.py"]
```

### Approach B: Use Railway's Python Buildpack
Instead of Nixpacks, switch to Buildpack and see if it handles numpy better

### Approach C: Switch to Render/Fly.io
If Railway has fundamental numpy issues, try different platform

### Approach D: Containerize Locally and Push Image
Build container locally where mem0 works, push to Docker Hub, deploy to Railway

## Files to Review
- `C:\Users\carlo\Development\mem0-sync\mem0\api_server.py`
- `C:\Users\carlo\Development\mem0-sync\mem0\requirements.txt`
- `C:\Users\carlo\Development\mem0-sync\mem0\nixpacks.toml`
- `C:\Users\carlo\Development\mem0-sync\mem0\mem0_config.py`
- `C:\Users\carlo\Development\mem0-sync\mem0\.dockerignore`

## Railway Project Info
- **Service:** knowledge-lake-api-production
- **GitHub Repo:** https://github.com/carlorbiz/knowledge-lake-api
- **Production URL:** https://knowledge-lake-api-production.up.railway.app
