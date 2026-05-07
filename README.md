<div align="center">

# Slax Reader CLI

**Save anything to your Slax Reader library from the command line — or let your AI Agent do it.**

[![npm version](https://img.shields.io/npm/v/@slax-lab/reader-api)](https://www.npmjs.com/package/@slax-lab/reader-api)
[![Node ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[🇺🇸 English](README.md) · [🇨🇳 中文](README.zh.md)

</div>

---

| I'm a human user | I'm an AI Agent |
|------------------|-----------------|
| [Install & Usage →](#human-users) | [Agent Setup →](#ai-agent-integration) |

---

## Features

- 📌 **Save bookmarks by URL** — with optional title, description, tags, and archive mode
- 👤 **Account management** — login, logout, and view current user info
- 🔄 **Auto update notifications** — notified of new versions after each command; upgrade in one step

---

## Human Users

### Prerequisites

- Node.js ≥ 18

### Installation

```bash
npm install -g @slax-lab/reader-api
# or
pnpm add -g @slax-lab/reader-api
```

Verify:

```bash
slax-reader --version
```

### Get Your API Key

1. Sign in at [Slax Reader](https://reader.slax.com)
2. Go to **Settings → API Keys**
3. Click **Create Key** — your key starts with `sr-`

### Quick Start

```bash
# Log in
slax-reader login

# Save a bookmark
slax-reader add https://example.com

# Save with metadata
slax-reader add https://example.com \
  --title "My Article" \
  --description "Worth reading later" \
  --tags "tech,ai" \
  --archive
```

### Command Reference

#### `slax-reader login`

Authenticate with your API Key.

| Option | Description |
|--------|-------------|
| `--api-key <key>` | API Key (starts with `sr-`). Prompted interactively if omitted. |
| `--api-base <url>` | Custom API base URL (for self-hosted instances). |

#### `slax-reader logout`

Clear stored credentials from local config.

#### `slax-reader whoami`

Display current user information.

```
Current User:
  Username : john
  Email    : john@example.com
  API Base : https://api-reader.slax.com
  API Key  : sr-xxxxxxx...
```

#### `slax-reader add <url>`

Save a URL as a bookmark.

| Option | Description |
|--------|-------------|
| `-t, --title <title>` | Custom bookmark title |
| `-d, --description <desc>` | Short description |
| `--tags <tags>` | Comma-separated tags, e.g. `"tech,news"` |
| `--archive` | Enable archive mode |

Examples:

```bash
slax-reader add https://example.com
slax-reader add https://example.com --title "Example" --tags "reading,ai"
slax-reader add https://example.com --archive
```

#### `slax-reader upgrade`

Upgrade the CLI to the latest version. Automatically detects pnpm or npm.

| Option | Description |
|--------|-------------|
| `--check` | Check for a newer version only; do not install |

#### `slax-reader --help`

Show full usage and all available commands.

---

## AI Agent Integration

Any AI Agent that can run shell commands can drive `slax-reader`. Install once globally, paste the system prompt below into your agent's configuration, and it's ready.

### Universal System Prompt

Copy this into your agent's system prompt, rules file, or `CLAUDE.md` / `GEMINI.md`:

```
You have access to the `slax-reader` CLI for saving bookmarks to Slax Reader.

Authentication: the user must have run `slax-reader login` once. API keys start with `sr-`.

Available commands:

  slax-reader add <url> [options]
    Save a URL as a bookmark.
    Options:
      -t, --title <title>       Custom title (defaults to page title)
      -d, --description <desc>  Short description
      --tags <tags>             Comma-separated tags, e.g. "tech,news"
      --archive                 Enable archive mode

  slax-reader whoami            Show current logged-in user
  slax-reader logout            Clear stored credentials
  slax-reader upgrade           Update CLI to latest version
  slax-reader upgrade --check   Check for update without installing
  slax-reader --help            Full usage

Usage notes:
- URLs without http(s):// are treated as https://
- Tags must be comma-separated with no spaces around commas
- Run `slax-reader login` if you receive an authentication error
```

---

### Claude Code

Claude Code can invoke `slax-reader` directly as a shell command — no extra configuration required.

**1. Install the CLI:**

```bash
npm install -g @slax-lab/reader-api
```

**2. Log in once:**

```bash
slax-reader login
```

**3. Add the system prompt to your project's `CLAUDE.md`:**

```markdown
## Bookmark Tool

You have access to the `slax-reader` CLI. When the user asks to save a link or bookmark something, run:

  slax-reader add <url> [--title "..."] [--tags "tag1,tag2"]

Ask the user for the URL if not provided. Confirm success after the command runs.
```

**Example interaction:**

> User: "Save this article for me: https://example.com/ai-news"
> Claude runs: `slax-reader add https://example.com/ai-news --tags "ai"`

---

### Claude Desktop

**1. Install and authenticate:**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. Edit `claude_desktop_config.json`:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add a `systemPrompt` field (Claude Desktop supports shell execution via its built-in bash tool):

```json
{
  "systemPrompt": "You have access to the `slax-reader` CLI via bash. When the user asks to save a bookmark, run: slax-reader add <url> [--title \"...\"] [--tags \"tag1,tag2\"]. Confirm with the user before saving."
}
```

**Example:**

> "Please save https://example.com to my reading list."
> Claude runs: `slax-reader add https://example.com`

---

### OpenAI Codex

**1. Install and authenticate:**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. Add to your Codex system prompt:**

```
You have access to a shell. Use the `slax-reader` CLI to save bookmarks:

  slax-reader add <url> [--title "..."] [--description "..."] [--tags "tag1,tag2"] [--archive]

Always confirm the URL with the user before saving. If not authenticated, ask the user to run `slax-reader login`.
```

**Example shell tool call:**

```json
{
  "type": "function",
  "function": {
    "name": "run_shell",
    "arguments": {
      "command": "slax-reader add https://example.com --title \"Example\" --tags \"reading\""
    }
  }
}
```

---

### Gemini CLI

**1. Install and authenticate:**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. Add to `~/.gemini/system_prompt.md`** (or your project's `GEMINI.md`):

```markdown
## Bookmark Tool

You have access to the `slax-reader` CLI. Use it to save URLs as bookmarks when the user asks.

Shell usage (prefix shell commands with `!`):
  !slax-reader add <url> [--title "..."] [--tags "tag1,tag2"]

Confirm with the user before saving.
```

**Example:**

> User: "Bookmark this for me: https://example.com"
> Gemini runs: `!slax-reader add https://example.com`

---

### OpenClaw

**1. Install and authenticate:**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. Create a skill file at `~/.openclaw/skills/slax-reader.yaml`:**

```yaml
name: slax-reader
description: Save URLs as bookmarks to Slax Reader
version: "1.0"
commands:
  - name: add_bookmark
    description: Save a URL to Slax Reader
    shell: "slax-reader add {url}{title_flag}{tags_flag}{archive_flag}"
    parameters:
      url:
        type: string
        description: The full URL to bookmark
        required: true
      title_flag:
        type: string
        description: ' --title "<title>"  or empty string'
        required: false
        default: ""
      tags_flag:
        type: string
        description: ' --tags "tag1,tag2"  or empty string'
        required: false
        default: ""
      archive_flag:
        type: string
        description: ' --archive  or empty string'
        required: false
        default: ""
```

**Example:**

> User: "Save https://example.com with tag 'ai'"
> OpenClaw runs: `slax-reader add https://example.com --tags "ai"`

---

### Cursor / Windsurf

**1. Install and authenticate:**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. Add to `.cursorrules`** (Cursor) or `.windsurfrules` (Windsurf) in your project root:

```
## Bookmark Tool

You have access to the `slax-reader` CLI via the terminal. When the user asks to save or bookmark a link:

1. Run: slax-reader add <url> [--title "..."] [--tags "tag1,tag2"]
2. Confirm success with the user.

If you get an authentication error, ask the user to run: slax-reader login
```

**Example:**

> User: "Save this link: https://example.com"
> Cursor runs in terminal: `slax-reader add https://example.com`

---

## Terms of Service

By installing or using this CLI you agree to the [Slax Reader Terms of Service](https://slax.com/terms). Key points:

1. **Personal or authorized use only** — do not use this tool on behalf of others without their explicit consent.
2. **Keep your API Key private** — do not commit it to version control or share it publicly.
3. **No bulk scraping or abuse** — automated mass-saving without genuine user intent violates our fair-use policy.
4. **Data & privacy** — bookmark data is handled per the [Slax Reader Privacy Policy](https://slax.com/privacy).
5. **Terms may change** — the official website is always authoritative; this README is a summary only.

---

## License

MIT © [slax-lab](https://github.com/slax-lab)
