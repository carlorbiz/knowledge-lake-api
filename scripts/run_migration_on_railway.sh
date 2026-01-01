#!/bin/bash
# Run migration inside Railway's environment

cd /app
python3 scripts/run_migration.py 001_add_performance_indexes.sql
