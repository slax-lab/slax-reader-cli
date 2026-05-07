<div align="center">

# Slax Reader CLI

**从命令行将任意内容保存到 Slax Reader，也可以让你的 AI Agent 来做这件事。**

[![npm version](https://img.shields.io/npm/v/@slax-lab/reader-api)](https://www.npmjs.com/package/@slax-lab/reader-api)
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

---

## 普通用户

### 环境要求

- Node.js ≥ 18

### 安装

```bash
npm install -g @slax-lab/reader-api
# 或
pnpm add -g @slax-lab/reader-api
```

验证安装：

```bash
slax-reader --version
```

### 获取 API Key

1. 登录 [Slax Reader](https://reader.slax.com)
2. 进入 **设置 → API Keys**
3. 点击 **创建密钥** — 你的密钥以 `sr-` 开头

### 快速上手

```bash
# 登录
slax-reader login

# 收藏书签
slax-reader add https://example.com

# 带元数据收藏
slax-reader add https://example.com \
  --title "我的文章" \
  --description "值得稍后阅读" \
  --tags "技术,AI" \
  --archive
```

### 命令参考

#### `slax-reader login`

使用 API Key 进行身份验证。

| 参数 | 说明 |
|------|------|
| `--api-key <key>` | API Key（以 `sr-` 开头）。省略时将交互式提示输入。 |
| `--api-base <url>` | 自定义 API 地址（用于私有部署）。 |

#### `slax-reader logout`

清除本地存储的身份凭证。

#### `slax-reader whoami`

显示当前登录用户信息。

```
Current User:
  Username : john
  Email    : john@example.com
  API Base : https://api-reader.slax.com
  API Key  : sr-xxxxxxx...
```

#### `slax-reader add <url>`

将 URL 保存为书签。

| 参数 | 说明 |
|------|------|
| `-t, --title <title>` | 自定义书签标题 |
| `-d, --description <desc>` | 简短描述 |
| `--tags <tags>` | 逗号分隔的标签，例如 `"技术,新闻"` |
| `--archive` | 启用归档模式 |

示例：

```bash
slax-reader add https://example.com
slax-reader add https://example.com --title "示例" --tags "阅读,AI"
slax-reader add https://example.com --archive
```

#### `slax-reader upgrade`

升级 CLI 到最新版本，自动检测 pnpm 或 npm。

| 参数 | 说明 |
|------|------|
| `--check` | 仅检查是否有新版本，不安装 |

#### `slax-reader --help`

显示完整的使用说明和所有可用命令。

---

## AI Agent 集成

任何能够执行 Shell 命令的 AI Agent 都可以驱动 `slax-reader`。全局安装一次，将下方的 System Prompt 粘贴到你的 Agent 配置中即可使用。

### 通用 System Prompt

将以下内容复制到你的 Agent 的 System Prompt、规则文件或 `CLAUDE.md` / `GEMINI.md` 中：

```
你可以使用 `slax-reader` CLI 将书签保存到 Slax Reader。

身份验证：用户需要事先执行过 `slax-reader login`，API Key 以 `sr-` 开头。

可用命令：

  slax-reader add <url> [选项]
    将 URL 保存为书签。
    选项：
      -t, --title <title>       自定义标题（默认使用页面标题）
      -d, --description <desc>  简短描述
      --tags <tags>             逗号分隔的标签，例如 "技术,新闻"
      --archive                 启用归档模式

  slax-reader whoami            显示当前登录用户
  slax-reader logout            清除本地凭证
  slax-reader upgrade           升级到最新版本
  slax-reader upgrade --check   检查更新但不安装
  slax-reader --help            完整使用说明

注意：
- 不带 http(s):// 的 URL 将自动补全为 https://
- 标签必须用英文逗号分隔，逗号前后无空格
- 如果收到身份验证错误，请运行 `slax-reader login`
```

---

### Claude Code

Claude Code 可以直接将 `slax-reader` 作为 Shell 命令调用，无需额外配置。

**1. 安装 CLI：**

```bash
npm install -g @slax-lab/reader-api
```

**2. 登录一次：**

```bash
slax-reader login
```

**3. 将 System Prompt 添加到项目的 `CLAUDE.md`：**

```markdown
## 书签工具

你可以使用 `slax-reader` CLI。当用户要求保存链接或收藏内容时，执行：

  slax-reader add <url> [--title "..."] [--tags "标签1,标签2"]

如果用户未提供 URL，请先询问。命令执行后确认结果。
```

**示例：**

> 用户："帮我保存这篇文章：https://example.com/ai-news"
> Claude 执行：`slax-reader add https://example.com/ai-news --tags "AI"`

---

### Claude Desktop

**1. 安装并登录：**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. 编辑 `claude_desktop_config.json`：**

- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

添加 `systemPrompt` 字段：

```json
{
  "systemPrompt": "你可以通过 bash 使用 `slax-reader` CLI。当用户要求收藏书签时，执行：slax-reader add <url> [--title \"...\"] [--tags \"标签1,标签2\"]。执行前请与用户确认。"
}
```

**示例：**

> "请把 https://example.com 存到我的阅读列表。"
> Claude 执行：`slax-reader add https://example.com`

---

### OpenAI Codex

**1. 安装并登录：**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. 添加到 Codex System Prompt：**

```
你可以访问 Shell。使用 `slax-reader` CLI 保存书签：

  slax-reader add <url> [--title "..."] [--description "..."] [--tags "标签1,标签2"] [--archive]

保存前请与用户确认 URL。如果未登录，请告知用户执行 `slax-reader login`。
```

**示例工具调用：**

```json
{
  "type": "function",
  "function": {
    "name": "run_shell",
    "arguments": {
      "command": "slax-reader add https://example.com --title \"示例\" --tags \"阅读\""
    }
  }
}
```

---

### Gemini CLI

**1. 安装并登录：**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. 添加到 `~/.gemini/system_prompt.md`**（或项目的 `GEMINI.md`）：

```markdown
## 书签工具

你可以使用 `slax-reader` CLI，在用户要求时保存书签。

Shell 用法（Shell 命令前加 `!`）：
  !slax-reader add <url> [--title "..."] [--tags "标签1,标签2"]

保存前请与用户确认。
```

**示例：**

> 用户："帮我收藏这个：https://example.com"
> Gemini 执行：`!slax-reader add https://example.com`

---

### OpenClaw

**1. 安装并登录：**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. 在 `~/.openclaw/skills/slax-reader.yaml` 创建技能文件：**

```yaml
name: slax-reader
description: 将 URL 保存为书签到 Slax Reader
version: "1.0"
commands:
  - name: add_bookmark
    description: 保存一个 URL 到 Slax Reader
    shell: "slax-reader add {url}{title_flag}{tags_flag}{archive_flag}"
    parameters:
      url:
        type: string
        description: 要收藏的完整 URL
        required: true
      title_flag:
        type: string
        description: ' --title "<标题>"  或空字符串'
        required: false
        default: ""
      tags_flag:
        type: string
        description: ' --tags "标签1,标签2"  或空字符串'
        required: false
        default: ""
      archive_flag:
        type: string
        description: ' --archive  或空字符串'
        required: false
        default: ""
```

**示例：**

> 用户："把 https://example.com 用标签 'AI' 保存"
> OpenClaw 执行：`slax-reader add https://example.com --tags "AI"`

---

### Cursor / Windsurf

**1. 安装并登录：**

```bash
npm install -g @slax-lab/reader-api && slax-reader login
```

**2. 在项目根目录添加到 `.cursorrules`**（Cursor）或 `.windsurfrules`（Windsurf）：

```
## 书签工具

你可以通过终端使用 `slax-reader` CLI。当用户要求保存或收藏链接时：

1. 执行：slax-reader add <url> [--title "..."] [--tags "标签1,标签2"]
2. 向用户确认操作结果。

如果遇到身份验证错误，请提示用户执行：slax-reader login
```

**示例：**

> 用户："保存这个链接：https://example.com"
> Cursor 在终端执行：`slax-reader add https://example.com`

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
