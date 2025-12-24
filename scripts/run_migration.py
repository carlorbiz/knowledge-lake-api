#!/usr/bin/env python3
"""
Run database migration against Railway PostgreSQL
"""

import os
import sys
import psycopg2
from pathlib import Path

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    print("Run: railway variables or set DATABASE_URL manually")
    sys.exit(1)

def run_migration(migration_file: str):
    """Execute SQL migration file against PostgreSQL database"""

    migration_path = Path(__file__).parent / "migrations" / migration_file

    if not migration_path.exists():
        print(f"ERROR: Migration file not found: {migration_path}")
        sys.exit(1)

    # Read migration SQL
    with open(migration_path, 'r') as f:
        sql = f.read()

    print(f"Running migration: {migration_file}")
    print(f"Against database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Railway PostgreSQL'}")

    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Execute migration
        cursor.execute(sql)

        # Commit changes
        conn.commit()

        print(f"✓ Migration {migration_file} executed successfully")

        # Close connection
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"✗ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migration_file = sys.argv[1] if len(sys.argv) > 1 else "001_add_classification_columns.sql"
    run_migration(migration_file)
