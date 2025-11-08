# Cloudflare Cache Purge Instructions

## Option 1: Development Mode (RECOMMENDED for testing)

**Best for:** Testing changes before they go live to all users

1. Go to Cloudflare Dashboard → Caching → Configuration
2. Scroll down to "Development Mode"
3. Toggle it **ON**
4. This bypasses cache for 3 hours
5. Test your site at: https://carlorbiz-strategic-tool.carla-c8b.workers.dev/
6. Once verified, toggle Development Mode **OFF**
7. Cache will rebuild with the new version

---

## Option 2: Custom Purge (For immediate production deployment)

**Best for:** Pushing changes live to all users immediately

1. Go to Cloudflare Dashboard → Caching → Configuration
2. Click **"Custom Purge"** button
3. Select **"By URL"**
4. Enter these URLs (one per line):

```
https://carlorbiz-strategic-tool.carla-c8b.workers.dev/
https://carlorbiz-strategic-tool.carla-c8b.workers.dev/css/styles.css
https://carlorbiz-strategic-tool.carla-c8b.workers.dev/js/app.js
https://carlorbiz-strategic-tool.carla-c8b.workers.dev/js/strategic-data-inline.js
https://carlorbiz-strategic-tool.carla-c8b.workers.dev/js/data/rwav-strategic-data.json
https://carlorbiz-strategic-tool.carla-c8b.workers.dev/index.html
```

5. Click **"Purge"**
6. Wait 30-60 seconds
7. Hard refresh your browser (Ctrl+Shift+R)
8. Verify changes are live

---

## What Changed in This Update

### Formatting Fixes
- ✅ Fixed CSS bug: `colour` → `color` (critical for text visibility)
- ✅ White text on all navy backgrounds
- ✅ Removed pillar icon from Three Pillars header

### Content Updates
- ✅ "limited recruitment success" → "short-term workforce solutions"
- ✅ Success metrics: removed duplicate percentages
- ✅ Community Pulse Survey: removed "undefined" from quotes
- ✅ Implementation Timeline: removed "undefined" from milestones
- ✅ Pilot Communities: removed "View Full Details" button

### Board Version Features
- ✅ Hidden "Switch to Workshop Mode" button
- ✅ All content fully accessible without workshop mode

---

## Verification Checklist

After purging cache, verify these changes are live:

1. **Header:** White text on navy background (not black)
2. **Executive Overview:** Says "short-term workforce solutions"
3. **Three Pillars:** No icon above pillar names
4. **Three Pillars:** Success metrics show "Increase in retention → 15%" (not "15% increase... 15%")
5. **Community Pulse Survey:** Quotes show "— Stakeholder... | Theme:" (no "undefined")
6. **Pilot Communities:** No "View Full Details" button on cards
7. **Implementation Timeline:** Milestones have no "undefined" text
8. **Header Buttons:** "Switch to Workshop Mode" button is HIDDEN

---

## GitHub Repository

All changes are committed and pushed to:
- **Repository:** https://github.com/carlorbiz/carlorbiz-strategic-tool
- **Branch:** master
- **Latest Commit:** c8e5ab0
- **Commit Message:** "Fix formatting and content issues for Board version"
