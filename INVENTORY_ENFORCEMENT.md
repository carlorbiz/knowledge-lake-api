# Deployment Inventory Enforcement System

**Purpose:** Ensure DEPLOYMENT_INVENTORY.md stays up-to-date as projects evolve

**Last Updated:** 2025-12-24

---

## 🎯 The Problem

With 19+ projects across multiple deployment platforms and several AI agents working on the codebase, keeping documentation current is challenging. The DEPLOYMENT_INVENTORY.md file serves as the single source of truth, but it's only valuable if it's kept up-to-date.

## 🛡️ The Solution: 4-Layer Enforcement

We enforce inventory updates through **four complementary layers**:

```
┌─────────────────────────────────────────────────────┐
│         Layer 1: Git Pre-commit Hook                │
│  Blocks local commits if inventory not updated      │
└─────────────────┬───────────────────────────────────┘
                  │ (can be bypassed with --no-verify)
                  ↓
┌─────────────────────────────────────────────────────┐
│         Layer 2: GitHub Actions (CI)                │
│  PR checks fail if inventory not updated            │
└─────────────────┬───────────────────────────────────┘
                  │ (enforces on pull requests)
                  ↓
┌─────────────────────────────────────────────────────┐
│         Layer 3: AI Agent Protocol                  │
│  CLAUDE.md mandates inventory updates               │
└─────────────────┬───────────────────────────────────┘
                  │ (voluntary compliance by agents)
                  ↓
┌─────────────────────────────────────────────────────┐
│         Layer 4: MCP Tool (Future)                  │
│  Automated inventory management via MCP             │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Layer 1: Git Pre-commit Hook

### What It Does

Automatically runs before each `git commit` to check if project files were modified without updating the inventory.

### Location

`.git/hooks/pre-commit` (automatically installed in this repo)

### Triggers When You Modify

- `github-projects/**` - Any GitHub project
- `mtmot-unified-mcp/**` - MTMOT Unified MCP server
- `manus-mcp/**` - Manus MCP server
- `mcp-ai-orchestration/**` - MCP orchestration
- `CareTrack/**` - CareTrack app
- `Carlorbiz_Course_Apps/**` - Course generation system
- `openmemory/ui/**` - OpenMemory UI
- `cloudflare-worker/**` - CloudFlare worker
- `cloudflare-deployments/**` - Deployment configs
- `examples/**` - Example projects
- `mem0/api_server.py` - Knowledge Lake API
- `railway.json` - Railway configuration

### What Happens

**If you modify project files WITHOUT staging DEPLOYMENT_INVENTORY.md:**
```
⚠️  PROJECT FILES MODIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The following project files have been modified:
  - github-projects/aurelia-ai-advisor/package.json
  - github-projects/aurelia-ai-advisor/README.md

❌ ERROR: DEPLOYMENT_INVENTORY.md has NOT been updated!

Please update the inventory file to reflect your changes:
  1. Edit DEPLOYMENT_INVENTORY.md
  2. Update project status, URLs, or add new entries
  3. git add DEPLOYMENT_INVENTORY.md
  4. Try committing again

To skip this check (NOT RECOMMENDED):
  git commit --no-verify

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If you HAVE staged DEPLOYMENT_INVENTORY.md:**
```
✅ DEPLOYMENT_INVENTORY.md is staged for commit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Emergency Bypass

```bash
git commit --no-verify -m "Emergency fix"
```

**⚠️ Warning:** GitHub Actions will still check this on PRs!

---

## 🔄 Layer 2: GitHub Actions

### What It Does

Runs on **every pull request** that modifies project files. Validates that DEPLOYMENT_INVENTORY.md was updated and properly formatted.

### Location

`.github/workflows/inventory-check.yml`

### Workflow Steps

1. **Check if inventory was modified**
   - Compares PR changes against base branch
   - Lists all modified project files
   - Verifies DEPLOYMENT_INVENTORY.md is in the changeset

2. **Fail if inventory not updated**
   - PR check fails with clear error message
   - Blocks merging until fixed

3. **Validate inventory format**
   - Checks for required sections (Quick Stats, Production Apps, etc.)
   - Ensures proper markdown structure

4. **Check Last Updated date**
   - Warns if date is > 7 days old
   - Suggests updating the date

### PR Check Failure Example

```
❌ Deployment Inventory Check Failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  DEPLOYMENT INVENTORY NOT UPDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This PR modifies project files but does not update the
deployment inventory. Please update DEPLOYMENT_INVENTORY.md
to reflect your changes:

  1. Edit DEPLOYMENT_INVENTORY.md
  2. Update project status, URLs, tech stack, or add new entries
  3. Update the 'Last Updated' date at the top
  4. Commit and push the changes

If you believe this check is incorrect, please add a comment
to the PR explaining why the inventory doesn't need updating.
```

### When It Runs

- Triggered on: `pull_request` events
- Only when paths match project directories
- Runs on: `ubuntu-latest`

### Bypassing

You cannot bypass GitHub Actions checks (by design). However, you can:
1. Add a comment to the PR explaining why inventory doesn't need updating
2. A repository admin can override the check and merge anyway

---

## 📖 Layer 3: AI Agent Protocol (CLAUDE.md)

### What It Does

Provides **mandatory instructions** for all AI agents (Claude Code, Manus, etc.) working on this repository.

### Location

`CLAUDE.md` - Section: "📋 MANDATORY: Deployment Inventory Update Protocol"

### When Agents Must Update

Agents are instructed to update DEPLOYMENT_INVENTORY.md when they:
1. Create or modify any project in `github-projects/`
2. Create or modify any MCP server
3. Deploy or update any CloudFlare Worker/Pages
4. Modify infrastructure services (Knowledge Lake API, Railway)
5. Create new apps or change deployment URLs
6. Change project status (Dev → Production, deprecate)
7. Add/modify course generation systems

### Agent Instructions

```bash
# 1. Edit the inventory file
vim DEPLOYMENT_INVENTORY.md

# 2. Update relevant sections
#    - Quick Stats (if project count changed)
#    - Add new project or update existing
#    - Update production URLs
#    - Update status
#    - Update "Last Updated" date

# 3. Stage the inventory
git add DEPLOYMENT_INVENTORY.md

# 4. Commit with project changes
git commit -m "feat: your changes + update inventory"
```

### Session End Protocol Integration

When Claude Code runs `python cc-context-sync.py end`, it must include inventory updates in the Knowledge Lake summary:

```
"Created new Aurelia AI deployment at aurelia.mtmot.com,
updated DEPLOYMENT_INVENTORY.md with production details"
```

### Voluntary Compliance

This layer relies on AI agents following instructions. It's the **weakest enforcement** but important for establishing best practices.

---

## 🤖 Layer 4: MCP Tool (Future)

### Status

🔄 **Planned** - Not yet implemented

### What It Will Do

Provide automated inventory management through the Model Context Protocol, allowing AI agents to:
- Check inventory status programmatically
- Update inventory sections via tool calls
- Validate inventory format
- Query project information

### Planned Tools

| Tool | Purpose |
|------|---------|
| `check_inventory_status` | Check if inventory needs updating |
| `update_deployment_inventory` | Update specific sections |
| `validate_inventory` | Verify format and completeness |
| `get_project_info` | Query project details |

### Location (When Implemented)

Could be integrated into:
- `/mtmot-unified-mcp/` as additional toolset, OR
- `/mcp-tools/inventory-manager/` as standalone MCP server

### Priority

**Medium** - Current 3-layer system is sufficient; this would be a convenience enhancement.

### Documentation

See `/mcp-tools/inventory-manager/README.md` for implementation plans.

---

## 🎯 How the Layers Work Together

### Scenario 1: Local Development (Individual Developer/Agent)

1. **Developer modifies** `github-projects/aurelia-ai-advisor/package.json`
2. **Pre-commit hook triggers** and blocks commit
3. **Developer updates** DEPLOYMENT_INVENTORY.md
4. **Developer stages** inventory: `git add DEPLOYMENT_INVENTORY.md`
5. **Commit succeeds** ✅

### Scenario 2: Pull Request (Team/Agent Collaboration)

1. **Agent creates PR** with changes to `mtmot-unified-mcp/`
2. **GitHub Actions workflow** runs
3. **Workflow checks** if DEPLOYMENT_INVENTORY.md was modified
4. **If not modified:** PR check ❌ FAILS
5. **If modified:** PR check ✅ PASSES
6. **PR can be merged** (if all other checks pass)

### Scenario 3: Emergency Bypass

1. **Developer has urgent hotfix** (typo in README)
2. **Pre-commit hook blocks** commit
3. **Developer bypasses:** `git commit --no-verify`
4. **Commit succeeds locally**
5. **Creates PR**
6. **GitHub Actions STILL CHECKS** inventory
7. **PR fails if inventory not updated**
8. **Developer either:**
   - Updates inventory and pushes, OR
   - Adds PR comment justifying bypass
   - Admin overrides check

### Scenario 4: AI Agent (Future with MCP Tool)

1. **Claude Code creates** new app in `github-projects/`
2. **MCP tool checks** inventory status
3. **MCP tool suggests** updates based on changes
4. **Agent uses MCP tool** to update inventory
5. **Validation runs** automatically
6. **Commit proceeds** with both changes ✅

---

## 📊 Effectiveness Metrics

### Layer Effectiveness

| Layer | Strength | Coverage | Bypassable? |
|-------|----------|----------|-------------|
| **Pre-commit Hook** | ⭐⭐⭐ Strong | Local commits | Yes (`--no-verify`) |
| **GitHub Actions** | ⭐⭐⭐⭐ Very Strong | All PRs | Admin override only |
| **Agent Protocol** | ⭐⭐ Moderate | AI agents only | Yes (agent choice) |
| **MCP Tool** | ⭐⭐⭐⭐ Very Strong | Future | No (automated) |

### Combined Effectiveness

With all 4 layers: **⭐⭐⭐⭐⭐ Excellent**

Even with bypass of Layer 1, Layer 2 provides strong enforcement on PRs. Layer 3 ensures AI agents proactively comply. Layer 4 (when implemented) will automate the process.

---

## 🛠️ Maintenance & Updates

### Updating Watched Directories

To add new directories to monitor:

1. **Update pre-commit hook:** `.git/hooks/pre-commit`
   - Add directory to `PROJECT_DIRS` array

2. **Update GitHub Actions:** `.github/workflows/inventory-check.yml`
   - Add path to `paths:` section

3. **Update CLAUDE.md:** `CLAUDE.md`
   - Add to "When to Update DEPLOYMENT_INVENTORY.md" list

### Testing the Enforcement

```bash
# Test pre-commit hook
touch github-projects/test-project/README.md
git add github-projects/test-project/README.md
git commit -m "test"
# Should fail ❌

# Now add inventory
git add DEPLOYMENT_INVENTORY.md
git commit -m "test"
# Should succeed ✅

# Test bypass
git commit --no-verify -m "bypass test"
# Should succeed ✅ (but PR will fail)
```

---

## 📚 Best Practices

### For Developers

1. **Update inventory BEFORE committing** project changes
2. **Review the Quick Stats** to see if counts need updating
3. **Update "Last Updated"** date at the top of the file
4. **Be specific** in your inventory updates (URLs, status, features)
5. **Only bypass** the pre-commit hook for non-project changes

### For AI Agents

1. **Read CLAUDE.md** at session start
2. **Check inventory status** when modifying projects
3. **Update inventory immediately** after project changes
4. **Include inventory updates** in session end summaries
5. **Use structured format** matching existing entries

### For Repository Maintainers

1. **Don't force-merge** PRs with failed inventory checks
2. **Review inventory changes** for accuracy
3. **Keep enforcement configs** in sync across layers
4. **Monitor bypass frequency** (too many = process issue)
5. **Update this documentation** when changing enforcement

---

## 🤔 FAQ

### Q: What if I'm just fixing a typo in a project README?

**A:** Minor documentation changes still require inventory updates if they affect project understanding. If truly trivial, use `--no-verify` but be prepared to justify on PR.

### Q: What if I forget to update the inventory?

**A:** The pre-commit hook will block your commit with clear instructions. Simply update the inventory and try again.

### Q: Can I disable the pre-commit hook?

**A:** Yes, but **not recommended**. Delete or rename `.git/hooks/pre-commit`. However, GitHub Actions will still enforce on PRs.

### Q: What if the GitHub Actions check fails but my inventory IS updated?

**A:** Check that:
1. DEPLOYMENT_INVENTORY.md is included in your PR commits
2. The file has required sections (Quick Stats, Production Apps, etc.)
3. The "Last Updated" date is recent

### Q: What counts as a "project modification" that requires inventory update?

**A:** Any change to:
- Code files in project directories
- Configuration files (package.json, wrangler.toml, etc.)
- Deployment configurations
- Infrastructure files (api_server.py, railway.json)

### Q: Do changes to examples/ directory require inventory updates?

**A:** Yes, if you add/remove examples or significantly change their purpose. Minor fixes to existing examples may not require updates.

---

## 🚀 Future Enhancements

### Planned

1. **MCP Tool Implementation** (Priority: Medium)
   - Automate inventory updates via AI agents
   - Reduce manual overhead

2. **Notion Integration** (Priority: Low)
   - Sync inventory status to Notion tracking page
   - Two-way sync for project metadata

3. **Automated Project Detection** (Priority: Low)
   - Scan repository for new projects automatically
   - Generate draft inventory entries

4. **Inventory Diff Viewer** (Priority: Low)
   - Web-based tool to visualize inventory changes over time
   - Track project evolution

### Under Consideration

- Slack notifications when inventory becomes stale
- Integration with Knowledge Lake for auto-suggestions
- Template generator for new project entries
- Dependency graph visualization

---

## 📞 Support

### For Questions

- **AI Agents:** Consult CLAUDE.md and this document
- **Developers:** Check this documentation or create a GitHub issue
- **Errors/Bugs:** Report in the repository issues

### For Contributions

Improvements to the enforcement system are welcome:
1. Test your changes thoroughly
2. Update all 4 layers if adding new watched directories
3. Update this documentation
4. Create a PR with clear description

---

**Document Version:** 1.0
**Created:** 2025-12-24
**Author:** Claude Code
**Repository:** carlorbiz/mem0
