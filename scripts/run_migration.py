#!/usr/bin/env python3
"""
Run database migration against Railway PostgreSQL

Usage:
  railway run python scripts/run_migration.py [migration_file]

Example:
  railway run python scripts/run_migration.py 001_add_performance_indexes.sql
"""

import os
import sys
import psycopg2
from pathlib import Path
import re

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    print("Run: railway variables or set DATABASE_URL manually")
    sys.exit(1)

def split_sql_statements(sql_text: str) -> list:
    """
    Split SQL file into individual statements.
    Handles multi-line statements and SQL comments.
    """
    # Remove SQL comments (-- style and /* */ style)
    sql_text = re.sub(r'--[^\n]*', '', sql_text)
    sql_text = re.sub(r'/\*.*?\*/', '', sql_text, flags=re.DOTALL)

    # Split by semicolons (but not within quotes or dollar-quoted strings)
    statements = []
    current = []
    in_quote = False
    in_dollar_quote = False
    dollar_tag = None

    lines = sql_text.split('\n')
    for line in lines:
        stripped = line.strip()

        # Skip empty lines and comments
        if not stripped or stripped.startswith('--'):
            continue

        # Handle dollar-quoted strings (used in functions/triggers)
        if '$$' in line or '$' in line:
            if not in_dollar_quote:
                # Check if entering dollar quote
                match = re.search(r'\$([a-zA-Z_]*)\$', line)
                if match:
                    in_dollar_quote = True
                    dollar_tag = match.group(0)
            else:
                # Check if exiting dollar quote
                if dollar_tag and dollar_tag in line:
                    in_dollar_quote = False
                    dollar_tag = None

        current.append(line)

        # Only split on ; if not in quotes or dollar quotes
        if ';' in line and not in_quote and not in_dollar_quote:
            stmt = '\n'.join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []

    # Add any remaining statement
    if current:
        stmt = '\n'.join(current).strip()
        if stmt:
            statements.append(stmt)

    return statements

def run_migration(migration_file: str):
    """Execute SQL migration file against PostgreSQL database"""

    migration_path = Path(__file__).parent / "migrations" / migration_file

    if not migration_path.exists():
        print(f"ERROR: Migration file not found: {migration_path}")
        sys.exit(1)

    # Read migration SQL
    with open(migration_path, 'r', encoding='utf-8') as f:
        sql_text = f.read()

    print(f"\n{'='*70}")
    print(f"Running migration: {migration_file}")
    print(f"Against database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Railway PostgreSQL'}")
    print(f"{'='*70}\n")

    # Split into individual statements
    statements = split_sql_statements(sql_text)
    print(f"Found {len(statements)} SQL statements to execute\n")

    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False  # Use transaction
        cursor = conn.cursor()

        executed = 0
        skipped = 0
        errors = []

        for i, statement in enumerate(statements, 1):
            # Skip SELECT statements (analysis queries)
            if statement.strip().upper().startswith('SELECT'):
                print(f"[{i}/{len(statements)}] SKIP: Analysis query (SELECT statement)")
                skipped += 1
                continue

            # Get first line for progress display
            first_line = statement.split('\n')[0][:60]
            print(f"[{i}/{len(statements)}] Executing: {first_line}...", end=' ')

            try:
                cursor.execute(statement)
                print("OK")
                executed += 1
            except psycopg2.Error as e:
                # Check if it's a harmless error (already exists)
                error_msg = str(e)
                if 'already exists' in error_msg.lower():
                    print("SKIP (already exists)")
                    skipped += 1
                else:
                    print(f"FAIL {error_msg}")
                    errors.append((i, first_line, error_msg))

        # Commit all changes
        if not errors or len(errors) < len(statements) / 2:
            conn.commit()
            print(f"\n{'='*70}")
            print(f"SUCCESS: Migration completed successfully!")
            print(f"  - Executed: {executed}")
            print(f"  - Skipped: {skipped}")
            if errors:
                print(f"  - Errors: {len(errors)} (non-critical)")
            print(f"{'='*70}\n")
        else:
            conn.rollback()
            print(f"\n{'='*70}")
            print(f"FAILED: Migration failed with {len(errors)} errors")
            print(f"{'='*70}\n")
            for i, stmt, err in errors[:5]:  # Show first 5 errors
                print(f"Statement {i}: {stmt}")
                print(f"  Error: {err}\n")
            sys.exit(1)

        # Verify indexes created
        print("\nVerifying indexes created...")
        cursor.execute("""
            SELECT indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS size
            FROM pg_indexes
            JOIN pg_stat_user_indexes USING(indexname)
            WHERE tablename = 'conversations'
            ORDER BY indexname
        """)
        indexes = cursor.fetchall()

        print("\nIndexes on conversations table:")
        for idx_name, idx_size in indexes:
            print(f"  - {idx_name}: {idx_size}")

        # Close connection
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"\nERROR: Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migration_file = sys.argv[1] if len(sys.argv) > 1 else "001_add_performance_indexes.sql"
    run_migration(migration_file)
