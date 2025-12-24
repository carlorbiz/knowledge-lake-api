# AAE Agents, Personas & Shortcuts — README

This page explains how the three core reference files work together so that any agent (Fred, Fredo, Claude, Gemini, Grok, Notion) or orchestrator (Manus, n8n, vibeSDK) can understand your instructions.

## Files

1. `AAE_Agents_and_Personas_SingleSource.md`

   - Human-readable spec.

   - Defines all **agents** (Fred, Fredo, Claude, Gemini, Manus, Grok, Notion) and all **FredCast personas** (Ivy, Maya, Felix, Nora, Fifi, Oscar, Clara, Simon, Tess, Alex, Lena, Jules, Nora-Live).

   - Describes how to address `agent:` vs `persona:` and includes a worked example for Maya updating all “blog posts” to “essays”.


2. `AAE_AgentPersona_Map.json`

   - Machine-readable mapping for Manus / n8n / vibeSDK.

   - Keys:

     - `agents[]`: list of agents with `Name`, `Alias`, `Role`.

     - `personas[]`: list of personas with `Name`, `Alias`, `Default agent`, `Purpose`, `Triggers`, `Inputs`, `Core Tasks`, `Outputs`, `Guardrails`, `Handoff`, `Example Macro`, `Voice notes`, `System intro sentence`.

   - Use this in workflows to resolve “Maya”, “Fifi”, “Oscar” etc into concrete routing instructions.


3. `AAE_Shortcut_Schema.md` / `AAE_Shortcut_Schema.json`

   - Define the canonical command `CODE`s used in Slack, voice, and automations.

   - For each `CODE`, you get `Longhand`, `Default agent`, `Default persona`, `Template ID`, and a description.

   - JSON form is ideal for router/n8n functions; Markdown is for Notion and human review.

## Core concepts

- **Agent** = which LLM endpoint runs the task (Fred / Fredo / Claude / Gemini / Grok / Notion).
- **Persona** = which *FredCast playbook* shapes the work (Ivy, Maya, Felix, Fifi, Clara, etc).
- **Shortcut Code** = what type of output you want (SUMM, BOARD, BID, PLAN, RESEARCH, COURSE, POD, MEMOIR, etc).
- **Template ID** = the canonical output structure all agents should follow for that `CODE`.

## Command grammar

Text form:

```text
cmd:<CODE> [agent:<agent-alias>] [persona:<persona-alias>] [other args]
```

Persona-first shorthand (for voice or very short commands):

```text
cmd:<persona-alias> <CODE> [other args]
```
- If the token immediately after `cmd:` matches a **persona alias**, treat it as `persona:<alias>` and interpret the next token as `<CODE>`.

## Example

Instruction to Manus:

> “Maya — update all ‘blog posts’ in this project to ‘essays’ to increase credibility.”


Router behaviour:

1. Look up `Maya` in `AAE_AgentPersona_Map.json` → persona alias `roadmap`, default agent `fred`.

2. Translate the natural-language instruction into a command such as:

```text
cmd:PLAN agent:fred persona:roadmap task:"rename content type blog → essay" scope:"project:Service Excellence" notion:on
```
3. Send this to Fred (or another chosen agent) with the Maya playbook active and trigger a Notion Agent action to update the relevant database records.

## How to use in the AAE dashboard

- Store all three references in your **Knowledge Lake** and link them from the AAE dashboard.

- In the dashboard, provide quick links and a short reminder:

  - “Start with `cmd:CODE` plus optional `agent:` and `persona:`.”

  - “If you say `Maya — …`, the router will translate that to `persona:roadmap` + `agent:fred` and an appropriate `CODE`.”

- This keeps future-you (and future agents) aligned on how to talk to the system, even as you add more workflows.
