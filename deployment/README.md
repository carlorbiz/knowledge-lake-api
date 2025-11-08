# Deployment Documentation

## Current Deployments (`/current`)

- **DEPLOY_TODAY.md** - Quick deployment guide
- **DOCSAUTOMATOR_TEMPLATE_SETUP_GUIDE.md** - DocsAutomator template setup

## Archived Deployment Guides (`/archive`)

Older deployment documentation for reference.

## Deployment Scripts (`/scripts`)

**Knowledge Lake API:**
- `START_KNOWLEDGE_LAKE.bat` - Start Knowledge Lake on port 5002

**Other Services:**
- `start_production.bat` - Start production server
- `start_server.bat` - Start API server
- `start_simple_server.bat` - Start simple API server
- `fix_port_numbers.ps1` - Fix port conflicts

## Active Production Deployments

**Mem0 Memory API:**
- URL: https://web-production-e3e44.up.railway.app
- Platform: Railway
- Source: `/mem0` directory

**Knowledge Lake API:**
- URL: https://knowledge-lake-api-production.up.railway.app
- Platform: Railway
- Source: Root directory (api_server.py, etc.)

**VibeSDK:**
- URL: https://vibe.mtmot.com
- Platform: Cloudflare/Railway
- Integrates with Mem0 + Knowledge Lake

## Running Scripts

Note: Batch files now in `/deployment/scripts/` but expect to run from root directory:
```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
deployment/scripts/START_KNOWLEDGE_LAKE.bat
```
