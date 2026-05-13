---
name: slax-reader
description: "Use Slax Reader CLI to save URLs/bookmarks to the user's reading library, authenticate with reader-cli, check account status, archive URLs, tag bookmarks, and handle reader-cli upgrade or skill sync hints. Trigger when the user asks to save, bookmark, archive, or organize web links with Slax Reader."
---

# Slax Reader CLI

Use `reader-cli` to save URLs into the user's Slax Reader library.

## Before using authenticated commands

Check login state before saving, archiving, tagging, or otherwise accessing the user's Slax Reader account:

```bash
reader-cli whoami --json
```

If not logged in, ask the user to run:

```bash
reader-cli login
```

Do not require a login check before `login`, `logout`, `upgrade --check`, `skill --check`, or `skill --sync`.
Prefer asking the user to run interactive `reader-cli login` when they can operate a terminal directly.
Use `reader-cli login --api-key <key> --json` only when the user cannot complete the interactive flow, such as non-technical users needing step-by-step assistance or non-interactive agents like OpenClaw.
Do not ask the user to paste an API key into the conversation unless they explicitly choose that flow.

## Commands

| Task | Command |
|------|---------|
| Log in interactively | `reader-cli login` |
| Log in non-interactively | `reader-cli login --api-key <key> --json` |
| Log out | `reader-cli logout --json` |
| Show account | `reader-cli whoami --json` |
| Save URL | `reader-cli add <url> --json` |
| Save with title | `reader-cli add <url> --title "Title" --json` |
| Save with description | `reader-cli add <url> --description "Description" --json` |
| Save with tags | `reader-cli add <url> --tags "tag1,tag2" --json` |
| Archive URL | `reader-cli add <url> --archive --json` |
| Check CLI update | `reader-cli upgrade --check --json` |
| Sync skill | `reader-cli skill --sync --json` |
| Check skill sync | `reader-cli skill --check --json` |

## Bookmark rules

- Preserve the exact URL the user asked to save.
- Add `--json` when you invoke commands so update hints are visible.
- Use comma-separated tags with `--tags "tag1,tag2"`.
- Use `--archive` only when the user asks to archive/preserve content or when they explicitly approve archive mode.
- If the user provides multiple URLs, save them one at a time so failures are isolated.

## Update and skill hints

`reader-cli --json` commands may include a top-level `_hints` object.

### `_hints.upgrade`

When `_hints.upgrade` appears, finish the user's current request first. Then tell the user there is a newer CLI version and offer to run:

```bash
reader-cli upgrade
```

`reader-cli upgrade` also syncs the AI Agent skill when needed.

### `_hints.skill`

When `_hints.skill` appears, finish the user's current request first. Then tell the user the installed AI Agent skill is out of sync with the CLI and offer the same repair command:

```bash
reader-cli upgrade
```

After the skill is synced, tell the user to restart the Agent so the updated skill is loaded. Resuming an old conversation after restart is fine.

Use `reader-cli skill --sync --json` only as a direct manual fallback when `reader-cli upgrade` cannot be used.

Do not silently ignore `_hints`.

## Security rules

- Never print the full API key in conversation or command output.
- Confirm with the user before saving URLs unless the user has already clearly asked you to save them.
- Do not invent URLs. Save only URLs provided by the user or found during an authorized research task.
