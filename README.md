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

Let your AI Agent install and configure everything for you. Copy the prompt below and send it to your AI Agent (Claude Code, Codex, Gemini CLI, Cursor, OpenClaw, etc.):

### Install via AI Agent

```
Help me install and set up Slax Reader CLI: https://github.com/slax-lab/slax-reader-cli/blob/main/docs/ai-agent-installation-guide.md
```

> Your agent will read the guide, install the CLI, walk you through authentication, and configure itself to use the bookmark tool — all automatically.

Supports: **Claude Code** · **Claude Desktop** · **OpenAI Codex** · **Gemini CLI** · **OpenClaw** · **Cursor** · **Windsurf**

<details>
<summary>Already installed? Add this to your agent's system prompt</summary>

```
You have access to the `slax-reader` CLI for saving bookmarks to Slax Reader.

Available commands:

  slax-reader add <url> [options]    Save a URL as a bookmark
    -t, --title <title>              Custom title
    -d, --description <desc>         Short description
    --tags <tags>                    Comma-separated tags, e.g. "tech,news"
    --archive                        Enable archive mode

  slax-reader whoami                 Show current user
  slax-reader logout                 Clear credentials
  slax-reader upgrade                Update to latest version
  slax-reader --help                 Full usage

Notes:
- URLs without http(s):// are auto-prefixed with https://
- If you get an auth error, ask the user to run: slax-reader login
```

</details>

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
