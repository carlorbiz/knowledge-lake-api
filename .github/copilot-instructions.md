# Copilot / AI Agent Instructions for Mem0 repository

These concise instructions help AI coding agents get productive quickly in this repository.

1) Big picture
- Purpose: root contains the Knowledge Lake API (Flask/Waitress) and supporting Mem0 memory library.
- Key services: [api_server.py](api_server.py) and [start_knowledge_lake.py](start_knowledge_lake.py) (production runner using Waitress on port 5002).
- Memory library: `mem0/` (core memory/embedding logic). Agent coordination docs live under [AAE-master](AAE-master/).

2) Where to start (commands)
- Install: `make install` (uses `requirements.txt` / `requirements-api.txt`).
- Run Knowledge Lake locally: `python start_knowledge_lake.py` (same entry used in production).
- Run API server (dev): `python api_server.py`.
- Ingest conversations for the Knowledge Lake: `python ingest_all_conversations.py`.
- Run tests/format: `make test` / `make format`.

3) Project-specific conventions
- Single source of truth for the Knowledge Lake is in the repo root (API + schema). See [schema.sql](schema.sql) and [run_schema.py](run_schema.py).
- Conversation logs and agent transcripts live in `conversations/` and `agent-conversations/` — use these for context when crafting prompts or reproducing issues.
- Docs and architecture are authoritative: [AAE-master/architecture](AAE-master/architecture/) (read before large changes to agent coordination).

4) Integration & external dependencies
- Deployments use Railway (see `README.md` Active Deployments section). The running endpoints are referenced in `README.md`.
- Runtime: Python (see `runtime.txt`) and `requirements-api.txt` for API dependencies; production runner uses Waitress via `start_knowledge_lake.py`.
- Datastore: local SQLite/Postgres depending on environment; schema and bootstrap logic are in [run_schema.py](run_schema.py) and [database.py](database.py).

5) Code patterns & checks for agents
- Before adding a new API route: update types/schemas, add DB setup in [database.py](database.py), and run `run_schema.py` if schema changes are needed.
- Search for existing utilities in `mem0/` and `AAE-master/` before implementing duplicate logic.
- Keep AI-driven changes minimal and explain intent in PR/body: reference which ingestion or API flow is affected (e.g., ingestion pipeline via `ingest_all_conversations.py`).

6) Useful files to inspect
- API entrypoints: [api_server.py](api_server.py), [start_knowledge_lake.py](start_knowledge_lake.py)
- DB/schema: [database.py](database.py), [schema.sql](schema.sql), [run_schema.py](run_schema.py)
- Ingestion: [ingest_all_conversations.py](ingest_all_conversations.py)
- Core memory: `mem0/` directory
- Architecture & agent rules: `AAE-master/` and `agent-conversations/`
- Project-level AI guide: `github-projects/mtmot-vibesdk-production/CLAUDE.md` (contains conventions and agent patterns used elsewhere)

- File manifest & update process: `C:\Users\carlo\Development\mem0-sync\mem0\FILE_MANIFEST.md` — Review this file before starting work that touches files or folders; update it after changes to reduce the chance of reversion to obsolete paths. Follow these steps:
	1. Before you start: open `C:\Users\carlo\Development\mem0-sync\mem0\FILE_MANIFEST.md` and scan entries related to your area. If you plan to move or rename files, add a short note in the manifest indicating the intended change and the associated issue/PR number.
	2. After changes: update or add a manifest entry with the new path, date (YYYY-MM-DD), and the PR number that implements the change. Commit this update in the same PR that performs the file moves.
	3. Verify there are no stale references by running a repository search for the old path(s):

		 ```bash
		 git grep "old/path" || true
		 ```

	4. Run the project's checks before merging: `make test` and `make format`.
	5. In the PR description, include a short note: "Manifest updated: FILE_MANIFEST.md updated for moved files — see PR #NN" so reviewers can confirm manifest changes are present.

	These steps keep forward progress across multiple projects in the repo and reduce accidental rollbacks to obsolete paths.

7) Safety & non-negotiables observed in repo
- Prefer explicit, auditable changes (no large automated refactors without tests).
- Preserve conversation logs and provenance when ingesting or rewriting data.

8) When in doubt — quick checklist for PRs
- Runs: `make test` passes locally
- Lint/format: `make format`
- Document: add short note to README or architecture doc if behavior changes
- Explain: include which files/scripts were used to validate (commands & files)

If any section is unclear or you'd like more examples (small PR templates, sample prompts for specific agents), tell me which area to expand. 
