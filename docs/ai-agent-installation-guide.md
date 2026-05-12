# Slax Reader CLI Installation Guide

The following steps are for AI Agents. Some steps require the user to assist in the browser.

## Requirements

Node.js (npm/npx) must be installed before proceeding.

## Step 1: Install

```bash
npx @slax-lab/reader-cli install
```

This installs `reader-cli` globally and sets up the AI Agent skill automatically.

## Step 2: Authenticate

Ask the user for their API Key. They can obtain one from [Slax Reader → Settings → API Keys](https://reader.slax.com).

```bash
reader-cli login --api-key <key-provided-by-user>
```

## Step 3: Verify

```bash
reader-cli whoami --json
```

If `ok` is `true`, setup is complete. Tell the user they're all set.

---

For more commands and a full capability guide, see [Slax Reader CLI: Let Your AI Agent Save What Matters](slax-reader-cli-agent-capability-guide.md).
