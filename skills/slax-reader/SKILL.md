---
name: slax-reader
description: "Use Slax Reader CLI to save URLs/bookmarks to the user's reading library, authenticate with reader-cli, check account status, archive URLs, tag bookmarks, and handle reader-cli upgrade or skill sync hints. Trigger when the user asks to save, bookmark, archive, or organize web links with Slax Reader."
---

# Slax Reader CLI

Use `reader-cli` to save URLs into the user's Slax Reader library.

## Before using commands

Check login state with:

```bash
reader-cli whoami --json
```

If not logged in, ask the user for an API key or ask them to run:

```bash
reader-cli login
```

Do not ask the user to paste an API key into the conversation unless they explicitly choose that flow.

## Commands

| Task | Command |
|------|---------|
| Log in non-interactively | `reader-cli login --api-key <key> --json` |
| Log in interactively | `reader-cli login` |
| Log out | `reader-cli logout --json` |
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

### `_hints.skill`

When `_hints.skill` appears, finish the user's current request first. Then tell the user the installed AI Agent skill is out of sync with the CLI and offer to run:

```bash
reader-cli skill --sync
```

After syncing the skill, tell the user to start a new AI Agent session so the updated skill is loaded.

Do not silently ignore `_hints`.

## Security rules

- Never print the full API key in conversation or command output.
- Confirm with the user before saving URLs unless the user has already clearly asked you to save them.
- Do not invent URLs. Save only URLs provided by the user or found during an authorized research task.
