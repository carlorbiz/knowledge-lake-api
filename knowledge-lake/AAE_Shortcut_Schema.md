# AAE Command Shortcuts Schema

This file defines the command `CODE`s, their defaults, and the canonical templates.

| Code | Longhand | Default agent | Default persona | Template ID | Description |
|---|---|---|---|---|---|
| `SUMM` | Summarise a meeting now, executive-ready | `fred` | `fred` | `MTG_SUMMARY_V1` | Exec summary of recent interaction with Decisions, Actions (Who/When), Risks, Next steps. |
| `BOARD` | Create a board paper | `fredo` | `fredo` | `BOARD_PAPER_V1` | Board-ready paper with Purpose, Background, Analysis, Options, Recommendation, Impacts, Appendices. |
| `BID` | Draft a consulting bid / proposal | `claude` | `strat` | `BID_PROPOSAL_V1` | Bid/proposal with Exec Summary, Objectives, Methodology, Deliverables, Timeline, Team, Budget, Assumptions. |
| `PLAN` | Spin up a project plan | `fred` | `roadmap` | `PROJECT_PLAN_V1` | Project plan with Scope, Milestones, RACI, Dependencies, Risks, Comms cadence. |
| `RESEARCH` | Research synthesis | `gemini` | `research` | `RESEARCH_SYNTH_V1` | Research brief with Findings, Evidence table (Source/Claim/Confidence), Gaps, Implications. |
| `COURSE` | Course module from sources | `fredo` | `course` | `COURSE_MOD_V1` | Course module with Outcomes, Outline, Activities, Assessment, Resources. |
| `POD` | Blog → Podcast episode | `fred` | `creator` | `POD_EP_V1` | Podcast script with Hook, Intro, Segments with beats, CTA, Outro. |
| `POD_POST` | Podcast post-production pack | `fred` | `edit` | `POD_POST_V1` | Post-production pack with Timestamps, Show notes, Links, Keywords/SEO, Social captions. |
| `BLOG_SERIES` | Blog series plan | `fred` | `creator` | `BLOG_SERIES_V1` | Blog series arc with Post titles, Angles, CTA plan, Cadence. |
| `MEMOIR` | Memoir interview prompt set / capture | `fredo` | `int` | `MEMOIR_QSET_V1` | Memoir Q-set or capture with Theme, Warm-up, Core probes, Reflection prompts, Closing. |
| `STAKE` | Stakeholder report | `claude` | `strat` | `STAKE_REPORT_V1` | Stakeholder synthesis with Themes, Representative quotes, Concerns, Suggestions, Implications. |
| `BUDGET` | Grant/bid budget sheet | `fred` | `fred` | `BUDGET_V1` | Budget table plus notes, assumptions, cost categories. |
| `ACTION` | Action list from thread | `fred` | `fred` | `ACTION_V1` | Action extraction with Who/What/When and optional Notion task creation. |
| `ROUTE` | Route / handoff to another agent/persona | `manus` | `sys` | `ROUTE_V1` | Routing instruction for Manus to dispatch work to a specific agent/persona. |
| `LOG` | Log event to Knowledge Lake | `vibesdk/openmemory` | `` | `LOG_V1` | Simple log record with event description, tags, timestamp. |