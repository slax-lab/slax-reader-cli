<div align="center">

# Slax Reader CLI

**从命令行将任意内容保存到 Slax Reader，也可以让你的 AI Agent 来做这件事。**

[![npm version](https://img.shields.io/npm/v/@slax-lab/reader-cli)](https://www.npmjs.com/package/@slax-lab/reader-cli)
[![Node ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[🇺🇸 English](README.md) · [🇨🇳 中文](README.zh.md)

</div>

---

| 我是普通用户 | 我是 AI Agent |
|------------|--------------|
| [安装与使用 →](#普通用户) | [Agent 接入 →](#ai-agent-集成) |

---

## 功能特性

- 📌 **通过 URL 收藏书签** — 支持自定义标题、描述、标签和归档模式
- 👤 **账号管理** — 登录、登出、查看当前用户信息
- 🔄 **自动检测新版本** — 每次命令执行后提示更新，一键升级
- 🤖 **AI Agent Skill** — 安装 skill 让 Agent 始终了解如何使用 CLI，CLI 升级后自动提示同步

---

## 普通用户

### 环境要求

- Node.js ≥ 18

### 安装

**一键安装**（同时安装 CLI 和 AI Agent Skill）：

```bash
npx @slax-lab/reader-cli install
```

或分两步安装：

```bash
# 1. 安装 CLI
npm install -g @slax-lab/reader-cli
# 或
pnpm add -g @slax-lab/reader-cli

# 2. 安装 AI Agent Skill
npx skills add slax-lab/slax-reader-cli -g -y
```

验证安装：

```bash
reader-cli --version
```

### 获取 API Key

1. 登录 [Slax Reader](https://reader.slax.com)
2. 进入 **设置 → API Keys**
3. 点击 **创建密钥** — 你的密钥以 `sr-` 开头

### 快速上手

```bash
# 登录
reader-cli login

# 收藏书签
reader-cli add https://example.com

# 带元数据收藏
reader-cli add https://example.com \
  --title "我的文章" \
  --description "值得稍后阅读" \
  --tags "技术,AI" \
  --archive
```

### 命令参考

#### `reader-cli login`

使用 API Key 进行身份验证。

| 参数 | 说明 |
|------|------|
| `--api-key <key>` | API Key（以 `sr-` 开头）。省略时将交互式提示输入。 |
| `--api-base <url>` | 自定义 API 地址（用于私有部署）。 |

#### `reader-cli logout`

清除本地存储的身份凭证。

#### `reader-cli whoami`

显示当前登录用户信息。

```
Current User:
  Username : john
  Email    : john@example.com
  API Base : https://api-reader.slax.com
  API Key  : sr-xxxxxxx...
```

#### `reader-cli add <url>`

将 URL 保存为书签。

| 参数 | 说明 |
|------|------|
| `-t, --title <title>` | 自定义书签标题 |
| `-d, --description <desc>` | 简短描述 |
| `--tags <tags>` | 逗号分隔的标签，例如 `"技术,新闻"` |
| `--archive` | 启用归档模式 |

示例：

```bash
reader-cli add https://example.com
reader-cli add https://example.com --title "示例" --tags "阅读,AI"
reader-cli add https://example.com --archive
```

#### `reader-cli upgrade`

升级 CLI 到最新版本，自动检测 pnpm 或 npm。

| 参数 | 说明 |
|------|------|
| `--check` | 仅检查是否有新版本，不安装 |

#### `reader-cli skill`

管理 AI Agent Skill。Skill 会告诉 Agent 如何使用 CLI，通过 `npx @slax-lab/reader-cli install` 安装时会自动安装。

| 参数 | 说明 |
|------|------|
| `--check` | 查看已安装的 skill 是否与当前 CLI 版本同步 |
| `--sync` | 安装或更新 skill，使其与当前 CLI 版本一致 |
| `--force` | 强制重新安装，即使已同步 |

升级 CLI 后，运行 `reader-cli skill --sync` 保持 skill 同步——或者让 Agent 在命令输出中看到 `_hints.skill` 字段时自动处理。

#### `reader-cli --help`

显示完整的使用说明和所有可用命令。

---

## AI Agent 集成

让你的 AI Agent 帮你完成安装和配置。将下方提示词复制发送给你的 AI Agent（Claude Code、Codex、Gemini CLI、Cursor、OpenClaw 等）：

### 通过 AI Agent 安装

```
帮我安装并配置 Slax Reader CLI：https://github.com/slax-lab/slax-reader-cli/blob/main/docs/ai-agent-installation-guide.zh.md
```

> Agent 会自动阅读安装指南、安装 CLI 和 AI Agent Skill、引导你完成身份验证。

支持：**Claude Code** · **Claude Desktop** · **OpenAI Codex** · **Gemini CLI** · **OpenClaw** · **Cursor** · **Windsurf**

### AI Agent Skill

Skill（`skills/slax-reader/SKILL.md`）会告诉 Agent 如何使用 CLI。安装后，Agent 将：

- 了解所有可用命令和选项
- 在有新版本时自动通知你（`_hints.upgrade`）
- 在 skill 与 CLI 版本不同步时自动通知你（`_hints.skill`）并提议执行 `reader-cli skill --sync`

手动安装或更新 skill：

```bash
reader-cli skill --sync
```

查看同步状态：

```bash
reader-cli skill --check
```

<details>
<summary>已安装？将此 System Prompt 添加到你的 Agent 配置中</summary>

```
你可以使用 `reader-cli` CLI 将书签保存到 Slax Reader。

可用命令：

  reader-cli add <url> [选项]       将 URL 保存为书签
    -t, --title <title>              自定义标题
    -d, --description <desc>         简短描述
    --tags <tags>                    逗号分隔的标签，例如 "技术,新闻"
    --archive                        启用归档模式

  reader-cli whoami                 显示当前用户
  reader-cli logout                 清除凭证
  reader-cli upgrade                升级到最新版本
  reader-cli --help                 完整使用说明

注意：
- 不带 http(s):// 的 URL 会自动补全为 https://
- 如果遇到身份验证错误，请提示用户执行：reader-cli login
```

</details>

---

## 服务条款

安装或使用本 CLI 即表示你同意 [Slax Reader 服务条款](https://slax.com/terms)。核心条款摘要：

1. **仅限个人或授权使用** — 未经他人明确同意，不得代为操作。
2. **妥善保管 API Key** — 请勿提交到版本控制系统或公开分享。
3. **禁止批量抓取或滥用** — 无真实用户意图的自动化大量收藏违反公平使用政策。
4. **数据与隐私** — 书签数据的处理遵循 [Slax Reader 隐私政策](https://slax.com/privacy)。
5. **条款可能变更** — 官网始终为权威版本，本文档仅作摘要参考。

---

## 开源协议

MIT © [slax-lab](https://github.com/slax-lab)
