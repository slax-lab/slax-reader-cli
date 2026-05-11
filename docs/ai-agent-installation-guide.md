# Slax Reader CLI — AI Agent Installation Guide

> This document is intended for AI Agents. If you are a human, please refer to the [README](../../README.md) for manual installation instructions.

## Overview

`reader-cli` is a CLI tool for saving bookmarks to [Slax Reader](https://reader.slax.com). Package name: `@slax-lab/reader-cli`.

## Step 1: Check Environment

Verify Node.js ≥ 18 is installed:

```bash
node --version
```

If Node.js is not installed or the version is below 18, inform the user and stop.

## Step 2: Install the CLI

```bash
npm install -g @slax-lab/reader-cli
```

Or if pnpm is available:

```bash
pnpm add -g @slax-lab/reader-cli
```

## Step 3: Verify Installation

```bash
reader-cli --version
```

Expected output: a version number like `0.1.0`. If the command is not found, the installation failed.

## Step 4: Authenticate

Ask the user for their API Key. They can obtain one from [Slax Reader → Settings → API Keys](https://reader.slax.com).

API Keys start with `sr-`. Run:

```bash
reader-cli login --api-key <the-key-provided-by-user>
```

Verify login:

```bash
reader-cli whoami
```

This should display the user's username and email. If it fails, the API Key is invalid — ask the user to double-check.

## Step 5: Configure Your Agent

Add the following to your agent's system prompt, rules file, `CLAUDE.md`, or `GEMINI.md` so you can use the tool in future sessions:

```
You have access to the `reader-cli` CLI for saving bookmarks to Slax Reader.

Available commands:

  reader-cli add <url> [options]    Save a URL as a bookmark
    -t, --title <title>              Custom title
    -d, --description <desc>         Short description
    --tags <tags>                    Comma-separated tags, e.g. "tech,news"
    --archive                        Enable archive mode

  reader-cli whoami                 Show current user
  reader-cli logout                 Clear credentials
  reader-cli upgrade                Update to latest version
  reader-cli upgrade --check        Check for updates only
  reader-cli --help                 Full usage

Notes:
- URLs without http(s):// are auto-prefixed with https://
- If you get an auth error, ask the user to run: reader-cli login
```

### Per-Tool Configuration Reference

<details>
<summary><strong>Claude Code</strong></summary>

Add to your project's `CLAUDE.md`:

```markdown
## Bookmark Tool

You have access to the `reader-cli` CLI. When the user asks to save a link or bookmark something, run:

  reader-cli add <url> [--title "..."] [--tags "tag1,tag2"]
```

No other setup needed — Claude Code can run shell commands directly.

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Edit `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "systemPrompt": "You have access to the `reader-cli` CLI via bash. When the user asks to save a bookmark, run: reader-cli add <url> [--title \"...\"] [--tags \"tag1,tag2\"]. Confirm with the user before saving."
}
```

</details>

<details>
<summary><strong>OpenAI Codex</strong></summary>

Add to your Codex system prompt:

```
You have access to a shell. Use the `reader-cli` CLI to save bookmarks:

  reader-cli add <url> [--title "..."] [--description "..."] [--tags "tag1,tag2"] [--archive]

Confirm the URL with the user before saving. If not authenticated, ask the user to run `reader-cli login`.
```

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

Add to `~/.gemini/system_prompt.md` or your project's `GEMINI.md`:

```markdown
## Bookmark Tool

You have access to the `reader-cli` CLI. Use it to save URLs as bookmarks.

Shell usage:
  !reader-cli add <url> [--title "..."] [--tags "tag1,tag2"]
```

</details>

<details>
<summary><strong>OpenClaw</strong></summary>

Create `~/.openclaw/skills/reader-cli.yaml`:

```yaml
name: reader-cli
description: Save URLs as bookmarks to Slax Reader
version: "1.0"
commands:
  - name: add_bookmark
    description: Save a URL to Slax Reader
    shell: "reader-cli add {url}{title_flag}{tags_flag}"
    parameters:
      url:
        type: string
        description: The full URL to bookmark
        required: true
      title_flag:
        type: string
        description: ' --title "<title>" or empty'
        default: ""
      tags_flag:
        type: string
        description: ' --tags "tag1,tag2" or empty'
        default: ""
```

</details>

<details>
<summary><strong>Cursor / Windsurf</strong></summary>

Add to `.cursorrules` (Cursor) or `.windsurfrules` (Windsurf):

```
## Bookmark Tool

You have access to the `reader-cli` CLI via the terminal. When the user asks to save a link:

1. Run: reader-cli add <url> [--title "..."] [--tags "tag1,tag2"]
2. Confirm success with the user.

If you get an auth error, ask the user to run: reader-cli login
```

</details>

## Step 6: Test

Run a quick test to confirm everything works:

```bash
reader-cli add https://github.com/slax-lab/slax-reader-cli --title "Slax Reader CLI" --tags "tool,cli"
```

If the bookmark is added successfully, the setup is complete. Tell the user they're all set.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `command not found: reader-cli` | Reinstall: `npm install -g @slax-lab/reader-cli` |
| `Invalid API Key` | Verify the key starts with `sr-` and re-login |
| `Network error` | Check internet connectivity; try `reader-cli whoami` |
| Permission denied on global install | Use `sudo npm install -g @slax-lab/reader-cli` or fix npm permissions |

---

For more commands, use cases, and a full capability guide, see [Slax Reader CLI: Let Your AI Agent Save What Matters](slax-reader-cli-agent-capability-guide.md).
