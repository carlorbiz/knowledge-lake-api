#!/usr/bin/env python3
import json
from pathlib import Path

# Direct path to Fred export folder (first one found in analysis)
fred_conv_path = Path("C:/Users/carlo/Development/mem0-sync/mem0/aae-exports/JSON-Native/Fred/60358c3501167bf0d1e2c9c58b7f4368430ed0ec2db2a2a8c75f42fe5f039377-2025-12-01-07-04-36-3bef1c793eaa4d99ac5fee26f0bd423a/conversations.json")

print("Reading Fred conversations.json...")
with open(fred_conv_path, 'r', encoding='utf-8') as f:
    # Read first 50 lines
    lines = [f.readline() for _ in range(50)]
    print("".join(lines))
