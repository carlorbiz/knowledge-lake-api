# Knowledge Lake API - Database Setup Guide

## Current Status
✅ Database schema created ([schema.sql](schema.sql))
✅ Database module created ([database.py](database.py))
✅ psycopg2 added to requirements.txt
⏳ API server integration (in progress)

## Quick Setup Options

### Option A: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project (free tier)
   - Wait 2 minutes for provisioning

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Example: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

3. **Run Schema**
   ```bash
   # Install psql if needed (Windows: download from PostgreSQL.org)
   psql "your-connection-string" -f schema.sql
   ```

4. **Set Environment Variable**
   ```bash
   # Local (.env file)
   DATABASE_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres

   # Railway (via dashboard)
   - Go to your Railway project
   - Variables tab → Add DATABASE_URL
   ```

### Option B: Railway PostgreSQL (Fastest)

1. **Add PostgreSQL to Railway**
   - Open your Railway project
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-provisions and connects it

2. **Get Connection String**
   - Click the PostgreSQL service
   - Variables tab → Copy `DATABASE_URL`
   - Example: `postgresql://postgres:...@containers-us-west-xxx.railway.app:1234/railway`

3. **Run Schema**
   ```bash
   psql "$DATABASE_URL" -f schema.sql
   ```

4. **Add to API Service**
   - Go to your Knowledge Lake API service
   - Variables tab → Reference the PostgreSQL DATABASE_URL
   - It auto-links: `${{Postgres.DATABASE_URL}}`

## API Server Integration

### Step 1: Update Startup (Lines 76-80)

**Before:**
```python
# In-memory storage for structured entity/relationship data
# TODO: Migrate to PostgreSQL/Supabase for production persistence
conversations_db = []
entities_db = []
relationships_db = []
```

**After:**
```python
# Import database module
from database import init_database, get_db

# Initialize database connection
try:
    init_database()
    logger.info("✅ Database initialized - persistent storage enabled")
except Exception as e:
    logger.error(f"❌ Database initialization failed: {e}")
    logger.error("Set DATABASE_URL environment variable to enable persistence")
    sys.exit(1)
```

### Step 2: Update Ingest Endpoint (Lines 141-280)

**Replace lines 179-191 (conversation creation)**

**Before:**
```python
conversation = {
    'id': len(conversations_db) + 1,
    'userId': data['userId'],
    'agent': data['agent'],
    # ...
}
conversations_db.append(conversation)
```

**After:**
```python
db = get_db()
conversation_id = db.create_conversation(
    user_id=data['userId'],
    agent=data['agent'],
    date=data['date'],
    topic=data.get('topic', 'General Discussion'),
    content=data['content'],
    metadata=data.get('metadata', {})
)
```

**Replace lines 210-239 (entity creation)**

**Before:**
```python
entity = {
    'id': len(entities_db) + 1,
    # ...
}
entities_db.append(entity)
```

**After:**
```python
entity_id = db.create_entity(
    conversation_id=conversation_id,
    name=entity_data['name'],
    entity_type=entity_data['entityType'],
    confidence=entity_data.get('confidence', 0.5),
    description=entity_data.get('description', ''),
    metadata={
        'sourceContext': entity_data.get('sourceContext', '')
    }
)
entities_created += 1
```

**Replace relationship creation similarly**

```python
relationship_id = db.create_relationship(
    conversation_id=conversation_id,
    from_entity=rel['from'],
    to_entity=rel['to'],
    relationship_type=rel['relationshipType'],
    confidence=rel.get('confidence', 0.5)
)
relationships_created += 1
```

### Step 3: Update Query Endpoint (Lines 280-363)

**Before:**
```python
results = [c for c in conversations_db if c['userId'] == user_id]
# ... filtering logic
```

**After:**
```python
db = get_db()
results = db.get_conversations(
    user_id=user_id,
    query=query,
    agent_filter=agent_filter,
    entity_type_filter=entity_type_filter,
    limit=limit
)
```

### Step 4: Update Stats Endpoint (Lines 251-278)

**Before:**
```python
total_conversations = len([c for c in conversations_db if c['userId'] == user_id])
# ... manual counting
```

**After:**
```python
db = get_db()
stats = db.get_stats(user_id=user_id)
return jsonify(stats)
```

### Step 5: Update Unprocessed Endpoint (Lines 365-443)

**Before:**
```python
results = [c for c in conversations_db if c['userId'] == user_id]
results = [c for c in results if not c.get('metadata', {}).get('processed_for_learning', False)]
```

**After:**
```python
db = get_db()
conversations = db.get_unprocessed_conversations(
    user_id=user_id,
    agent_filter=agent_filter,
    date_from=date_from,
    date_to=date_to,
    limit=limit
)
```

### Step 6: Update Archive Endpoint (Lines 445-522)

**Before:**
```python
for conv in conversations_db:
    if conv['id'] in conversation_ids and conv['userId'] == user_id:
        conv['metadata'] = conv.get('metadata', {})
        conv['metadata']['archived'] = True
```

**After:**
```python
db = get_db()
archived_count = db.archive_conversations(
    user_id=user_id,
    conversation_ids=conversation_ids,
    archive_type=archive_type,
    retention_days=retention_days
)
```

## Testing After Integration

1. **Test locally first:**
   ```bash
   # Set DATABASE_URL in .env
   python api_server.py

   # Test ingestion
   curl -X POST http://localhost:5002/api/conversations/ingest \
     -H "Content-Type: application/json" \
     -d '{"userId": 1, "agent": "TestAgent", "date": "2025-12-11", "topic": "Database Test", "content": "Testing persistence"}'

   # Check stats
   curl "http://localhost:5002/api/stats?userId=1"
   ```

2. **Restart server, verify data persists:**
   ```bash
   # Kill and restart python api_server.py
   curl "http://localhost:5002/api/stats?userId=1"
   # Should show same conversation count
   ```

3. **Deploy to Railway:**
   ```bash
   git add database.py schema.sql requirements.txt
   git commit -m "feat: Add PostgreSQL persistence to Knowledge Lake API"
   git push
   ```

## Rollback Plan

If database integration causes issues:

1. **Keep both versions:**
   - Rename current api_server.py to api_server_inmemory.py
   - Create new api_server.py with database integration
   - Switch via git if needed

2. **Gradual migration:**
   - Start with just /api/conversations/ingest using database
   - Keep other endpoints in-memory initially
   - Migrate endpoint-by-endpoint

## Next Steps

Choose your database option and let Claude know. Once DATABASE_URL is set, Claude will complete the api_server.py integration.
