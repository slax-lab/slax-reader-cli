# Slax Reader CLI — AI Agent 安装指南

> 本文档面向 AI Agent。如果你是人类用户，请参阅 [README](../../README.zh.md) 获取手动安装说明。

## 概述

`slax-reader-cli` 是一个用于将书签保存到 [Slax Reader](https://reader.slax.com) 的命令行工具。npm 包名：`@slax-lab/slax-reader-cli`。

## 第 1 步：检查环境

确认已安装 Node.js ≥ 18：

```bash
node --version
```

如果未安装 Node.js 或版本低于 18，请告知用户并停止。

## 第 2 步：安装 CLI

```bash
npm install -g @slax-lab/slax-reader-cli
```

如果系统有 pnpm：

```bash
pnpm add -g @slax-lab/slax-reader-cli
```

## 第 3 步：验证安装

```bash
slax-reader-cli --version
```

预期输出：版本号如 `0.1.0`。如果命令未找到，则安装失败。

## 第 4 步：身份验证

向用户索要 API Key。可在 [Slax Reader → 设置 → API Keys](https://reader.slax.com) 获取。

API Key 以 `sr-` 开头。执行：

```bash
slax-reader-cli login --api-key <用户提供的密钥>
```

验证登录：

```bash
slax-reader-cli whoami
```

应显示用户名和邮箱。如果失败，说明 API Key 无效，请用户重新确认。

## 第 5 步：配置你的 Agent

将以下内容添加到 Agent 的 System Prompt、规则文件、`CLAUDE.md` 或 `GEMINI.md` 中，以便后续会话中使用：

```
你可以使用 `slax-reader-cli` CLI 将书签保存到 Slax Reader。

可用命令：

  slax-reader-cli add <url> [选项]        将 URL 保存为书签
    -t, --title <title>               自定义标题
    -d, --description <desc>          简短描述
    --tags <tags>                     逗号分隔的标签，例如 "技术,新闻"
    --archive                         启用归档模式

  slax-reader-cli whoami                  显示当前用户
  slax-reader-cli logout                  清除凭证
  slax-reader-cli upgrade                 升级到最新版本
  slax-reader-cli upgrade --check         仅检查更新
  slax-reader-cli --help                  完整使用说明

注意：
- 不带 http(s):// 的 URL 会自动补全为 https://
- 如果遇到身份验证错误，请提示用户执行：slax-reader-cli login
```

### 各工具配置参考

<details>
<summary><strong>Claude Code</strong></summary>

添加到项目的 `CLAUDE.md`：

```markdown
## 书签工具

你可以使用 `slax-reader-cli` CLI。当用户要求保存链接或收藏内容时，执行：

  slax-reader-cli add <url> [--title "..."] [--tags "标签1,标签2"]
```

无需其他配置 — Claude Code 可直接执行 Shell 命令。

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

编辑 `claude_desktop_config.json`：

- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "systemPrompt": "你可以通过 bash 使用 `slax-reader-cli` CLI。当用户要求收藏书签时，执行：slax-reader-cli add <url> [--title \"...\"] [--tags \"标签1,标签2\"]。执行前请与用户确认。"
}
```

</details>

<details>
<summary><strong>OpenAI Codex</strong></summary>

添加到 Codex System Prompt：

```
你可以访问 Shell。使用 `slax-reader-cli` CLI 保存书签：

  slax-reader-cli add <url> [--title "..."] [--description "..."] [--tags "标签1,标签2"] [--archive]

保存前请与用户确认 URL。如果未登录，请告知用户执行 `slax-reader-cli login`。
```

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

添加到 `~/.gemini/system_prompt.md` 或项目的 `GEMINI.md`：

```markdown
## 书签工具

你可以使用 `slax-reader-cli` CLI，在用户要求时保存书签。

Shell 用法：
  !slax-reader-cli add <url> [--title "..."] [--tags "标签1,标签2"]
```

</details>

<details>
<summary><strong>OpenClaw</strong></summary>

创建 `~/.openclaw/skills/slax-reader-cli.yaml`：

```yaml
name: slax-reader-cli
description: 将 URL 保存为书签到 Slax Reader
version: "1.0"
commands:
  - name: add_bookmark
    description: 保存一个 URL 到 Slax Reader
    shell: "slax-reader-cli add {url}{title_flag}{tags_flag}"
    parameters:
      url:
        type: string
        description: 要收藏的完整 URL
        required: true
      title_flag:
        type: string
        description: ' --title "<标题>" 或空字符串'
        default: ""
      tags_flag:
        type: string
        description: ' --tags "标签1,标签2" 或空字符串'
        default: ""
```

</details>

<details>
<summary><strong>Cursor / Windsurf</strong></summary>

添加到项目根目录的 `.cursorrules`（Cursor）或 `.windsurfrules`（Windsurf）：

```
## 书签工具

你可以通过终端使用 `slax-reader-cli` CLI。当用户要求保存或收藏链接时：

1. 执行：slax-reader-cli add <url> [--title "..."] [--tags "标签1,标签2"]
2. 向用户确认操作结果。

如果遇到身份验证错误，请提示用户执行：slax-reader-cli login
```

</details>

## 第 6 步：测试

执行一次快速测试确认一切正常：

```bash
slax-reader-cli add https://github.com/slax-lab/slax-reader-cli --title "Slax Reader CLI" --tags "tool,cli"
```

如果书签添加成功，安装配置完成。告知用户一切就绪。

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| `command not found: slax-reader-cli` | 重新安装：`npm install -g @slax-lab/slax-reader-cli` |
| `Invalid API Key` | 确认密钥以 `sr-` 开头，重新登录 |
| 网络错误 | 检查网络连接；尝试 `slax-reader-cli whoami` |
| 全局安装权限不足 | 使用 `sudo npm install -g @slax-lab/slax-reader-cli` 或修复 npm 权限 |

---

更多命令和能力指南，可参考 [Slax Reader CLI：让 AI Agent 帮你收藏一切](slax-reader-cli-agent-capability-guide.zh.md)。
