FREDO's take on the AAE

North Star
Reduce busywork → increase creative and consulting time.
You’ll achieve this by standardising how knowledge flows into a few “source-of-truth” stores (GitHub + Notion + Drive), then orchestrating clear, repeatable automations (n8n) where Fredo acts as:
1) Retriever & synthesiser (pulls the right pieces with citations),
2) Planner & reviewer (shapes deliverables and checks quality),
3) Orchestrator brain (decides which agent does what next).
──────────
Operating Model: Who does what
Role | Primary Job | Tools | Hand-off Rules
**You (Carla)** | Define outcomes, approve outputs, record voice/notes | Notion, Slack, Google Drive | Only approve “green” (meets acceptance criteria) or request fix with reason.
**Fredo (ChatGPT)** | Retrieval, planning, drafting, critiquing, packaging | GitHub, Notion, Drive, Slack | Always cite sources; enforce checklists; produce final “Ready to Ship” bundle.
**Claude Code (CC)** | Code generation, refactors, test scaffolds, JSON/CSV transforms | GitHub, VS Code, n8n | PRs opened from feature branches; Fredo reviews diffs + writes change log.
**Penny / Manus / Gemini** | Specialist assists (e.g., vision, long PDF ingest, data tables) | n8n pipelines | Fredo routes tasks to them and collates results.
**n8n** | Orchestration & sync | Triggers, webhooks, schedulers | Moves data between API :left_right_arrow: GitHub/Notion/Drive; posts status to Slack.
──────────
Canonical Stores (keep it simple)
• GitHub → Versioned artefacts (prompts, workflows, SOPs, code, JSON schemas).
  Structure: knowledge-lake/{area}/{type}/… (e.g., mtmot/prompts/, carlorbiz/sops/).
• Notion → Living knowledge & ops (projects, clients, course outlines, decisions, daily log).
  One Master DB with properties: Area, Type, Topic, Client, Status, Owner, Last Synced, Source Link.
• Google Drive → Final assets (slides, PDFs, exports) and large media.
• Slack → Command surface + notifications. Decisions captured back to Notion.
──────────
Golden Path Workflows (end-to-end)
1) Client deliverable (deck/report) in 90 minutes
Trigger: New Notion item “ACRRM Q1 Strategy Deck” → Status = In Progress
Flow:
1. n8n: Pull scope + brief from Notion; fetch relevant prior work (Drive, GitHub).
2. Fredo: Produce an Outline v1 + Source Map (cited links).
3. You: One click approve/annotate in Notion (“Keep, Cut, Add”).
4. Fredo: Drafts speaker notes + slide content; CC formats any tables/charts as CSV/JSON; n8n builds slides (Google Slides or Canva via template IDs).
5. Fredo: Runs QC checklist (see below), adds a 6-line Executive Summary + Action Table.
6. n8n: Exports PDF to Drive; posts Slack message with links + change log; updates Notion to Ready to Review.
QC Checklist (deck/report)
• Sources cited on the final slide/page; dates normalised (DD MMM YYYY).
• 1-sentence insight per slide; no slide > 40 words; consistent AU spelling.
• Brand colours (Carlorbiz green), typography, motif present on title and section dividers.
• Executive Summary states what, so what, now what.
• Accessibility: alt text for key images; contrast ≥ 4.5:1.
──────────
2) Course asset pipeline (MTMOT)
Trigger: New Notion Course Module Status = Authoring
Flow:
1. Fredo: Generates module learning outcomes (Bloom’s verbs), lesson plan, assessment rubric.
2. CC: Converts activities into structured JSON (for Glide/WordPress block builder).
3. n8n:
   • Commits JSON + Markdown to GitHub mtmot/course/{course}/{module}.
   • Publishes drafts to WordPress as private posts for layout preview.
4. Fredo: Creates a Facilitator Guide and Participant Workbook from the same source.




00:26
5. n8n: Builds a “Release Pack” (ZIP with workbook PDF, slides, facilitator guide, JSON).
6. Notion: Status → Ready, Version +1, Last Synced stamped.
Acceptance Criteria
• Learning outcomes measurable; each lesson has activity → outcome → evidence.
• Workbook page numbers + callouts; quiz items tagged by outcome.
• All prompts and copy in AU spelling; MTMOT tone: “Grounded… now ready to soar.”
──────────
3) Knowledge Lake sync (Railway API → GitHub/Notion)
Trigger: Cron daily at 06:00 or on change webhook.
Flow:
1. n8n: Fetch JSON from Railway API (read-only).
2. CC: Normalise to schema; split large payloads; generate README.md per folder.
3. n8n:
   • Upsert to Notion Master DB (one row per artefact).
   • Commit to GitHub under knowledge-lake/… with semantic commit message.
4. Fredo: Creates digest: what changed, why it matters, suggested next actions.
5. Slack: Post digest with links and a /approve button to promote to “official”.
Naming Rules
• Branches: feat/area-type-topic e.g., feat/mtmot-prompts-journaling.
• Commits: area(type): short summary e.g., mtmot(prompts): add resilience set v2.
• Tags in Notion: Area=MTMOT | Carlorbiz | All Things Carla, Type=Prompt | SOP | Course | Client.
──────────
Where Fredo slots into n8n (concretely)
Reusable n8n “lego blocks”
• LLM:Plan → Ask Fredo: “Given {brief}, produce a step plan with artefacts, owners, and checks.”
• LLM:Draft → Ask Fredo: “Generate {artefact} following {house-style.md}.”
• LLM:Critique → Ask Fredo: “Run QC checklist {qc.md} on {artefact}; propose specific edits.”
• LLM:Summarise → Ask Fredo: “Summarise changes since {date} with links + next actions.”
Example node chain
Trigger (Notion change) → GitHub Fetch → LLM:Plan (Fredo) → Parallel: LLM:Draft (Fredo) and Transform (CC) → Google Slides/Docs Build → LLM:Critique (Fredo) → Export → Slack Notify → Notion Update.
──────────
Slack as the command surface
Use a few memorable slash-style commands (doesn’t need actual slash; a channel alias works):
• f.plan "ACRRM Q1 deck" due: 12 Dec → returns staged plan in Notion + tasks.
• f.pack "RWAV workshop 2" → pushes the release pack (slides, workbook, run sheet).
• f.digest area: MTMOT window: 7d → summary of changes + suggested next moves.
• f.find "journaling prompts v2" → returns top 3 with citations from GitHub/Notion.
Behavioural rules for Fredo replies in Slack
• Always include links + citations (GitHub path, Notion page, Drive file).
• Always end with “Next 1–2 actions” and time estimate range (not promises).
──────────
Quality Gates (baked in, not bolted on)
House Style (one-pager, store in GitHub house-style.md)
• AU spelling, concise headings, 1 idea per paragraph, ban “very” and “utilise”.
• Data claims require a citation or a “Working theory:” label.
• Brand: Carlorbiz green, MTMOT open-circle motif; clean layout.
Automated checks (n8n)
• Spelling/grammar (AU) → pass/fail with diff suggestions.
• Citations present when claims or stats appear.
• Accessibility checks for slides/docs (alt text, contrast).
• Version bump + changelog generated on every “Ready” transition.
──────────
Metrics that matter (and how to collect them)
Metric | Definition | Collection
**Time-to-Draft** | Trigger → first usable outline | n8n timestamps
**Time-to-Ready** | Trigger → QC-passed bundle | n8n timestamps
**Human Touch Minutes** | Sum of your review/approval time | Notion property Review Minutes (quick input)
**Reuse Ratio** | % of content sourced from Knowledge Lake | Fredo’s retrieval log + tag count
**Defect Rate** | QC fails per artefact | LLM:Critique outcomes
**Client Delight** | 1–5 score post-delivery | Short Notion form
Set quarterly targets (example):
• Time-to-Ready ↓ 40%
• Reuse Ratio ≥ 70%
• Defect Rate ≤ 5% on first pass
──────────
Security & governance
00:26
• Keep Railway API private; use n8n to push read-only snapshots into GitHub/Notion.
• Separate public from internal exports (public repo vs private repo).
• Sensitive client names: store as ClientCode and map in Notion.
• Always log who/what generated each artefact (GeneratedBy: Fredo/CC/Carla).
• Backups: GitHub protected branches; scheduled Drive export; Notion DB export monthly.
──────────
Starter Kit (copy-paste checklists)
A. Notion “Master DB” properties
• ☐ Title
• ☐ Area (Carlorbiz / MTMOT / All Things Carla)
• ☐ Type (Prompt, SOP, Course, Client, Deck, Report, Blog, Workbook)
• ☐ Client (optional)
• ☐ Status (Idea, In Progress, Review, Ready, Shipped)
• ☐ Owner (Carla / Fredo / CC)
• ☐ Version (semver)
• ☐ Last Synced (datetime)
• ☐ Source Link (GitHub/Drive URL)
• ☐ Acceptance Criteria (rich text)
B. GitHub repo layout
knowledge-lake/
  carlorbiz/
    sops/
    decks/
  mtmot/
    prompts/
    course/
      {course-name}/
        module-01/
          lesson.md
          activities.json
          workbook.md
  all-things-carla/
    essays/
house-style.md
qc-checklists/
  deck.md
  report.md
  course.md
C. n8n skeleton flows to create
• ☐ KL Sync: Railway API → Normalise (CC) → GitHub commit + Notion upsert → Digest (Fredo) → Slack.
• ☐ Deck Builder: Notion brief → Plan (Fredo) → Draft (Fredo) → Slides build → QC (Fredo) → Export → Slack.
• ☐ Course Pack: Notion module → JSON (CC) → MD drafts (Fredo) → WP draft → Pack → Slack.
──────────
What I can do for you right now
1. Create your House Style + QC checklists (deck/report/course) ready to drop in GitHub.
2. Draft the Notion Master DB template (properties + sample views/filters).
3. Write the n8n node prompts for Plan/Draft/Critique/Digest as copy-paste blocks.
4. Design the Slack command formats and response templates with citations.
Pick any (or all) of the above, and I’ll generate them immediately so you can paste and go.