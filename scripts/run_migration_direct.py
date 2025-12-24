#!/usr/bin/env python3
"""
Run migration directly against Railway PostgreSQL
No railway CLI needed - just paste your DATABASE_URL
"""

import sys

try:
    import psycopg2
except ImportError:
    print("Installing psycopg2...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2

from pathlib import Path

print("=" * 80)
print("Railway PostgreSQL Migration")
print("=" * 80)
print()
print("Instructions:")
print("1. In Railway, click the purple 'Connect' button (top right)")
print("2. Copy the DATABASE_URL connection string")
print("3. Paste it below when prompted")
print()
print("=" * 80)
print()

# Get DATABASE_URL from user
database_url = input("Paste DATABASE_URL: ").strip()

if not database_url:
    print("ERROR: No DATABASE_URL provided")
    sys.exit(1)

# Read migration SQL
migration_path = Path(__file__).parent / "migrations" / "001_add_classification_columns.sql"

with open(migration_path, 'r') as f:
    sql = f.read()

print()
print("Connecting to Railway PostgreSQL...")

try:
    # Connect
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()

    print("Connected successfully!")
    print()
    print("Running migration...")
    print()

    # Execute migration
    cursor.execute(sql)
    conn.commit()

    print("✓ Migration completed successfully!")
    print()
    print("Columns added:")
    print("  - complexity_classification (VARCHAR)")
    print("  - requires_multipass (BOOLEAN)")
    print("  - multipass_status (VARCHAR)")
    print("  - multipass_assignee (VARCHAR)")
    print("  - word_count (INT)")
    print("  - topic_shift_count (INT)")
    print("  - complexity_score (INT)")
    print()
    print("Indexes created:")
    print("  - idx_conversations_complexity")
    print("  - idx_conversations_multipass_status")
    print("  - idx_conversations_requires_multipass")
    print()
    print("=" * 80)
    print("Database schema updated! Ready for Day 1 completion.")
    print("=" * 80)

    cursor.close()
    conn.close()

except Exception as e:
    print(f"ERROR: {e}")
    print()
    print("Troubleshooting:")
    print("- Check DATABASE_URL is correct (starts with postgresql://)")
    print("- Verify Railway database is online")
    print("- Ensure firewall allows connection")
    sys.exit(1)
