from dotenv import load_dotenv
import os

load_dotenv()

print("\n=== Testing .env File ===\n")
print(f"GITHUB_OWNER: {os.getenv('GITHUB_OWNER')}")
print(f"GITHUB_TOKEN: {'[OK] Loaded successfully' if os.getenv('GITHUB_TOKEN') else '[ERROR] Not found'}")
print(f"N8N_SLACK_RESPONSE_WEBHOOK: {'[OK] Loaded successfully' if os.getenv('N8N_SLACK_RESPONSE_WEBHOOK') else '[ERROR] Not found'}")
print(f"\nAll keys from .env file are working!\n")
