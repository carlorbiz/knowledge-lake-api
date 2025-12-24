"""
Run database schema creation for Knowledge Lake API
Execute this once to set up tables in PostgreSQL
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("[ERROR] DATABASE_URL not set in environment")
    print("Set it in .env or Railway variables")
    sys.exit(1)

print(f"[CONNECT] Connecting to database...")
print(f"[HOST] {DATABASE_URL.split('@')[1].split(':')[0] if '@' in DATABASE_URL else 'unknown'}")

try:
    # Read schema file
    with open('schema.sql', 'r') as f:
        schema_sql = f.read()

    # Connect and execute
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    print("[SCHEMA] Running schema.sql...")
    cur.execute(schema_sql)
    conn.commit()

    print("[OK] Database schema created successfully!")

    # Verify tables exist
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)

    tables = [row[0] for row in cur.fetchall()]
    print(f"\n[TABLES] Created: {', '.join(tables)}")

    cur.close()
    conn.close()

except psycopg2.Error as e:
    print(f"[ERROR] Database error: {e}")
    sys.exit(1)
except FileNotFoundError:
    print("[ERROR] schema.sql not found")
    print("Make sure you're running this from the mem0 directory")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Unexpected error: {e}")
    sys.exit(1)
