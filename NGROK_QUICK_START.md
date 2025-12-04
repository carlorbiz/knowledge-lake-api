# Quick ngrok Setup for Knowledge Lake API

**Use this as a temporary solution while Railway is being debugged**

## What is ngrok?
ngrok creates a public URL that tunnels to your localhost, making your local API accessible to Manus (or anyone) over the internet.

## Setup Steps

### 1. Download ngrok
- Visit: https://ngrok.com/download
- Download for Windows
- Extract to a folder (e.g., `C:\ngrok\`)

### 2. Start Knowledge Lake API Locally
```cmd
cd C:\Users\carlo\Development\mem0-sync\mem0
python api_server.py
```

Should see:
```
🚀 Starting Knowledge Lake API - Local Development
📍 Port: 5002
```

### 3. Start ngrok Tunnel
Open a NEW command prompt:
```cmd
cd C:\ngrok
ngrok http 5002
```

### 4. Get Your Public URL
ngrok will show something like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5002
```

**Copy that URL** (e.g., `https://abc123.ngrok-free.app`)

### 5. Share URL with Manus
Tell Manus to use:
```
https://abc123.ngrok-free.app
```

Instead of:
```
https://knowledge-lake-api-production.up.railway.app
```

## Test It Works
```bash
curl https://YOUR-NGROK-URL.ngrok-free.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "mem0_knowledge_lake",
  "version": "2.0.1_enhanced",
  "endpoints": {...}
}
```

## Test Manus Integration
Manus can now call:
```
POST https://YOUR-NGROK-URL.ngrok-free.app/api/conversations/ingest
```

## Limitations
- **Temporary**: URL changes each time you restart ngrok (free plan)
- **Requires your PC running**: Both api_server.py AND ngrok must be running
- **Rate limits**: ngrok free plan has connection limits

## Upgrade (Optional)
- Sign up for ngrok account (free)
- Get permanent subdomain: `your-name.ngrok-free.app`
- No more URL changes

## When Railway is Fixed
1. Stop ngrok (Ctrl+C)
2. Tell Manus to switch back to Railway URL
3. Turn off local api_server.py

---

**This is a quick fix to unblock Manus while we debug Railway!**
