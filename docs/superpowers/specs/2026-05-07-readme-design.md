---
title: README Design Spec — slax-reader-cli
date: 2026-05-07
status: approved
---

# README Design Spec

## Context

`slax-reader` is a CLI tool (`@slax-lab/reader-api` on npm) for managing Slax Reader bookmarks from the command line. Commands: `login`, `logout`, `whoami`, `add <url>`, `upgrade`.

Primary audience: **AI Agents** (Claude Code, Codex, Gemini CLI, OpenClaw, Cursor, etc.), with a secondary audience of human users who install manually.

---

## Goals

1. Let any AI Agent find, install, and invoke the CLI with zero ambiguity.
2. Give human users a complete install + usage reference in one scroll.
3. Communicate the five most important TOS points without burying them.

---

## Structure

### Top — Hero

- Project name + one-line description
- Badges: npm version, Node ≥ 18, MIT license
- Two-column quick-nav table: **Human Users** (→ Install) | **AI Agents** (→ Agent Setup)

### Section 1 — Features

Bullet list of capabilities derived from current commands:
- Save any URL as a bookmark (title, description, tags, archive mode)
- Account management: login / logout / whoami
- Auto update check + one-command upgrade

### Section 2 — Human Users: Install & Usage

- Prerequisites: Node.js ≥ 18
- Install via npm or pnpm (global)
- Get API Key: link to Slax Reader dashboard → Settings → API Keys
- Quick start: `slax-reader login` → `slax-reader add <url>`
- Full command reference table (all commands, options, examples — `--help` style)

### Section 3 — AI Agent Integration (primary section)

#### 3.1 Universal System Prompt Template
A ready-to-paste block any agent can use. Tells the agent: what the tool does, how to authenticate, available commands, parameter formats.

#### 3.2 Per-Tool Setup Guides

Each entry includes: install command, config location, verification step, natural-language → CLI example.

| Tool | Integration Method |
|------|--------------------|
| Claude Code | Global install + bash tool; or `npx` |
| Claude Desktop | Bash/shell tool config in claude_desktop_config.json |
| OpenAI Codex | `tools` array + shell execution |
| Gemini CLI | System prompt + `!` shell command |
| OpenClaw | Skill/plugin YAML definition |
| Cursor / Windsurf | `.cursorrules` / AI rules file |

### Section 4 — Terms of Service

Five-point summary:
1. Personal or authorized use only
2. Keep API Key private; do not share
3. No bulk scraping or abuse of the service
4. Data handling follows Slax Reader Privacy Policy
5. Terms may change; official site is authoritative

Link to full TOS.

### Section 5 — License

MIT

---

## Design Decisions

- **Single file**: No `docs/` split. One README is lower maintenance and better for AI context windows.
- **AI Agent section is primary**: Placed before advanced human docs; human quick-start is kept short.
- **Per-tool examples**: Abstract "shell tool" docs get ignored; concrete copy-paste configs get used.
- **TOS summary only**: Full TOS lives on the website; README has 5 bullets + link.
