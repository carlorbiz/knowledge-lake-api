#!/bin/bash
# Git filter to redact secrets from repository history

git filter-branch --force --index-filter '
  # Remove .claude/settings.local.json from all commits
  git rm --cached --ignore-unmatch .claude/settings.local.json

  # Redact secrets in documentation files
  if git ls-files --error-unmatch documentation/FUTURE_ENHANCEMENTS.md 2>/dev/null; then
    git show :documentation/FUTURE_ENHANCEMENTS.md | sed "s/xoxb-[0-9A-Za-z-]*/[REDACTED_SLACK_TOKEN]/g" > temp_file
    git hash-object -w temp_file | xargs git update-index --add --cacheinfo 100644
    rm temp_file
  fi

  if git ls-files --error-unmatch documentation/session-notes/SLACK_AI_COMMAND_DEPLOYMENT_SUCCESS.md 2>/dev/null; then
    git show :documentation/session-notes/SLACK_AI_COMMAND_DEPLOYMENT_SUCCESS.md | sed "s/xoxb-[0-9A-Za-z-]*/[REDACTED_SLACK_TOKEN]/g" > temp_file
    git hash-object -w temp_file | xargs git update-index --add --cacheinfo 100644
    rm temp_file
  fi

  if git ls-files --error-unmatch cc-slack-integration/N8N_PODCAST_WORKFLOW_BUILD_GUIDE.md 2>/dev/null; then
    git show :cc-slack-integration/N8N_PODCAST_WORKFLOW_BUILD_GUIDE.md | sed "s/sk-proj-[A-Za-z0-9_-]*/[REDACTED_OPENAI_KEY]/g" > temp_file
    git hash-object -w temp_file | xargs git update-index --add --cacheinfo 100644
    rm temp_file
  fi

  if git ls-files --error-unmatch cc-slack-integration/Manus-DocsAutomator-solutions/Carlorbiz_Cloudflare_VibeSDK/MANUS_SETUP_INFO.md 2>/dev/null; then
    git show :cc-slack-integration/Manus-DocsAutomator-solutions/Carlorbiz_Cloudflare_VibeSDK/MANUS_SETUP_INFO.md | \
      sed "s/xoxb-[0-9A-Za-z-]*/[REDACTED_SLACK_TOKEN]/g" | \
      sed "s/sk-ant-[A-Za-z0-9_-]*/[REDACTED_ANTHROPIC_KEY]/g" > temp_file
    git hash-object -w temp_file | xargs git update-index --add --cacheinfo 100644
    rm temp_file
  fi
' --prune-empty --tag-name-filter cat -- --all
