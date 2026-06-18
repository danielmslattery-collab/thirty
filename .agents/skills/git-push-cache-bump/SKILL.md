---
name: git-push-cache-bump
description: Detects if any cached recipe JSON or static files have changed, and bumps the Service Worker cache version in sw.js before pushing/committing changes to git.
---
# Git Push Cache Bumper Skill

This skill ensures that whenever you modify cached assets (e.g., recipe JSON files, CSS, index.html, or JS files), the service worker cache version in `sw.js` is automatically bumped. This prevents users' browsers from loading outdated cached files.

## Guidelines for the AI Agent

When the user asks you to **push to git**, **deploy to git**, or **commit changes**, follow these steps:

1. **Check for Modified Cached Assets**: Run `git status` or `git diff` to see if any cached files have changed. Cached files are defined in `sw.js` under `ASSETS_TO_CACHE` and include:
   - `recipes_with_heat.json`
   - `recipes.json`
   - `index.html`
   - `styles.css`
   - `js/**/*.js`
   - `manifest.json`
   - `assets/*`

2. **Run the Cache Bumper Script**: If any of those files have changed, run the automatic Python utility to bump the version in `sw.js` and stage it:
   ```powershell
   python ".agents/skills/git-push-cache-bump/scripts/bump_cache.py"
   ```

3. **Verify Git Status**: Confirm that `sw.js` has been modified and staged for commit.

4. **Proceed with Commit and Push**: Continue with the git commit and push as normal.

## Script Usage

You can also run the script manually from the command line:

```powershell
python ".agents/skills/git-push-cache-bump/scripts/bump_cache.py"
```
