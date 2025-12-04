# Deployment Guide - Manus MCP Server

This guide covers deploying the Manus MCP Server for remote access via HTTP/SSE transport.

## Deployment Options

### Option 1: Local Network Access (Development)

Run the server on your local machine for access within your network.

```bash
cd manus-mcp-server
source venv/bin/activate
python manus_server.py --transport sse --port 8123
```

The server will be available at `http://localhost:8123` or `http://YOUR_LOCAL_IP:8123`.

**Use Case:** Testing remote connections, local team access

### Option 2: Cloud Deployment (Production)

Deploy to a cloud platform for internet-wide access.

#### Railway Deployment

1. **Prepare the project:**

Create `Procfile`:
```
web: python manus_server.py --transport sse --port $PORT
```

Create `runtime.txt`:
```
python-3.11.0
```

2. **Deploy to Railway:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

3. **Configure environment:**

In Railway dashboard:
- Set Python version to 3.11+
- Add any required environment variables
- Enable public networking

#### Heroku Deployment

1. **Prepare the project:**

Create `Procfile`:
```
web: python manus_server.py --transport sse --port $PORT
```

2. **Deploy:**

```bash
# Install Heroku CLI
# Then:
heroku login
heroku create manus-mcp-server
git push heroku main
```

#### AWS EC2 Deployment

1. **Launch EC2 instance:**
   - Ubuntu 22.04 LTS
   - t2.micro or larger
   - Open port 8123 in security group

2. **Setup on EC2:**

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install python3.11 python3.11-venv

# Clone/upload your server code
cd /home/ubuntu
# ... transfer files ...

# Setup
cd manus-mcp-server
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with systemd (see below)
```

3. **Create systemd service:**

Create `/etc/systemd/system/manus-mcp.service`:

```ini
[Unit]
Description=Manus MCP Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/manus-mcp-server
Environment="PATH=/home/ubuntu/manus-mcp-server/venv/bin"
ExecStart=/home/ubuntu/manus-mcp-server/venv/bin/python manus_server.py --transport sse --port 8123
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable manus-mcp
sudo systemctl start manus-mcp
sudo systemctl status manus-mcp
```

#### Docker Deployment

1. **Create Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY manus_server.py .

EXPOSE 8123

CMD ["python", "manus_server.py", "--transport", "sse", "--port", "8123"]
```

2. **Build and run:**

```bash
# Build
docker build -t manus-mcp-server .

# Run
docker run -d -p 8123:8123 --name manus-mcp manus-mcp-server

# With persistent storage
docker run -d -p 8123:8123 \
  -v ~/.manus_tasks.json:/root/.manus_tasks.json \
  --name manus-mcp manus-mcp-server
```

3. **Docker Compose:**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  manus-mcp:
    build: .
    ports:
      - "8123:8123"
    volumes:
      - ./data:/root
    restart: unless-stopped
    environment:
      - LOG_LEVEL=INFO
```

Run with:
```bash
docker-compose up -d
```

## Security Considerations

### Authentication

The current implementation does not include authentication. For production use, add authentication:

1. **API Key Authentication:**

```python
# Add to manus_server.py
import os
from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        api_key = request.headers.get("X-API-Key")
        expected_key = os.getenv("MANUS_API_KEY")
        
        if api_key != expected_key:
            return Response("Unauthorized", status_code=401)
        
        return await call_next(request)

# Add middleware before running
app.add_middleware(AuthMiddleware)
```

2. **OAuth Integration:**

Consider using OAuth for production deployments with multiple users.

### HTTPS/TLS

**Always use HTTPS in production!**

#### Option A: Reverse Proxy (Recommended)

Use Nginx or Caddy as a reverse proxy:

**Nginx configuration:**

```nginx
server {
    listen 443 ssl;
    server_name manus-mcp.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8123;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Caddy configuration:**

```
manus-mcp.yourdomain.com {
    reverse_proxy localhost:8123
}
```

#### Option B: Let's Encrypt

Use Certbot to get free SSL certificates:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d manus-mcp.yourdomain.com
```

### Firewall Configuration

```bash
# Allow only specific IPs (recommended)
sudo ufw allow from YOUR_IP to any port 8123

# Or allow all (not recommended for production)
sudo ufw allow 8123
```

### Environment Variables

Store sensitive configuration in environment variables:

```bash
export MANUS_API_KEY="your-secret-key"
export ALLOWED_ORIGINS="https://yourdomain.com"
```

## Monitoring and Logging

### Logging Configuration

Enhance logging for production:

```python
# In manus_server.py
import logging
from logging.handlers import RotatingFileHandler

# Add file handler
handler = RotatingFileHandler(
    'manus_mcp.log',
    maxBytes=10485760,  # 10MB
    backupCount=5
)
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
logger.addHandler(handler)
```

### Health Check Endpoint

Add a health check endpoint:

```python
@mcp.tool()
async def health_check() -> str:
    """Health check endpoint for monitoring"""
    return json.dumps({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "total_tasks": len(TASKS)
    })
```

### Monitoring Tools

- **Uptime monitoring:** UptimeRobot, Pingdom
- **Application monitoring:** New Relic, DataDog
- **Log aggregation:** Papertrail, Loggly

## Database Backend (Advanced)

For production with many tasks, consider using a database:

### SQLite Implementation

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db():
    conn = sqlite3.connect('manus_tasks.db')
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                task_id TEXT PRIMARY KEY,
                description TEXT,
                context TEXT,
                priority TEXT,
                status TEXT,
                result TEXT,
                error TEXT,
                created_at TEXT,
                updated_at TEXT,
                completed_at TEXT
            )
        ''')
        conn.commit()
```

### PostgreSQL Implementation

For high-scale deployments:

```python
import psycopg2
from psycopg2.pool import SimpleConnectionPool

# Connection pool
pool = SimpleConnectionPool(
    1, 20,
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
```

## Performance Optimization

### Caching

Add Redis for caching:

```python
import redis

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)

# Cache task status
def get_cached_task_status(task_id):
    cached = redis_client.get(f"task:{task_id}")
    if cached:
        return json.loads(cached)
    return None
```

### Rate Limiting

Implement rate limiting:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Apply to endpoints
@limiter.limit("10/minute")
async def assign_task(...):
    ...
```

## Backup and Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup tasks file
cp ~/.manus_tasks.json "$BACKUP_DIR/manus_tasks_$DATE.json"

# Keep only last 30 days
find "$BACKUP_DIR" -name "manus_tasks_*.json" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Scaling Considerations

### Load Balancing

For multiple instances:

```nginx
upstream manus_mcp {
    least_conn;
    server 10.0.1.10:8123;
    server 10.0.1.11:8123;
    server 10.0.1.12:8123;
}

server {
    location / {
        proxy_pass http://manus_mcp;
    }
}
```

### Horizontal Scaling

- Use a shared database (PostgreSQL, MySQL)
- Implement distributed task storage
- Use message queue for task distribution (RabbitMQ, Redis)

## Client Configuration for Remote Access

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "manus-task-manager": {
      "url": "https://manus-mcp.yourdomain.com",
      "headers": {
        "X-API-Key": "your-api-key"
      }
    }
  }
}
```

### VSCode Configuration

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "url": "https://manus-mcp.yourdomain.com",
        "transport": "sse",
        "headers": {
          "X-API-Key": "your-api-key"
        }
      }
    }
  }
}
```

## Troubleshooting Deployment

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port
   lsof -i :8123
   # Kill process
   kill -9 <PID>
   ```

2. **Permission denied:**
   ```bash
   # Check file permissions
   ls -la manus_server.py
   # Fix if needed
   chmod +x manus_server.py
   ```

3. **Module not found:**
   ```bash
   # Verify virtual environment
   which python
   # Should show venv path
   ```

4. **Connection refused:**
   - Check firewall rules
   - Verify server is running: `ps aux | grep manus_server`
   - Check logs: `journalctl -u manus-mcp -f`

## Maintenance

### Updates

```bash
# Pull latest code
git pull

# Restart service
sudo systemctl restart manus-mcp

# Or with Docker
docker-compose down
docker-compose up -d --build
```

### Monitoring Logs

```bash
# Systemd
journalctl -u manus-mcp -f

# Docker
docker logs -f manus-mcp

# File
tail -f manus_mcp.log
```

## Best Practices

1. **Always use HTTPS in production**
2. **Implement authentication and authorization**
3. **Set up monitoring and alerting**
4. **Regular backups of task data**
5. **Keep dependencies updated**
6. **Use environment variables for configuration**
7. **Implement rate limiting**
8. **Use a reverse proxy (Nginx/Caddy)**
9. **Enable CORS only for trusted origins**
10. **Regular security audits**

## Support

For deployment issues:
- Check server logs
- Verify network connectivity
- Test with curl: `curl http://your-server:8123/health`
- Review firewall and security group settings

---

**Ready for production?** Make sure you've implemented authentication, HTTPS, and monitoring before going live!
