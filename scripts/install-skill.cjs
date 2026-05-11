#!/usr/bin/env node

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const SKILLS_SOURCE = 'slax-lab/reader-cli'
const VERSION = require('../package.json').version

function main() {
  try {
    if (process.env.npm_config_global !== 'true') return
    if (process.env.CI || process.env.BUILD_NUMBER || process.env.RUN_ID) return

    if (!skillsToolAvailable()) {
      console.log('Slax Reader AI Agent skill not installed. To install later, run: reader-cli skill --sync')
      return
    }

    try {
      execNpxSync(['-y', 'skills', 'add', SKILLS_SOURCE, '-g', '-y'], {
        stdio: 'pipe',
        timeout: 120000,
      })
      writeStamp(VERSION)
      console.log('Slax Reader AI Agent skill installed.')
    } catch {
      console.log('Slax Reader AI Agent skill install failed. Run manually: reader-cli skill --sync')
    }
  } catch {
    // Postinstall must never break npm install.
  }
}

function skillsToolAvailable() {
  try {
    execNpxSync(['-y', 'skills', 'ls', '-g'], {
      stdio: 'pipe',
      timeout: 10000,
    })
    return true
  } catch {
    return false
  }
}

function execNpxSync(args, options) {
  if (process.platform === 'win32') {
    return execFileSync('cmd.exe', ['/d', '/s', '/c', 'npx.cmd', ...args], options)
  }
  return execFileSync('npx', args, options)
}

function writeStamp(version) {
  const dir = configDir()
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  const target = path.join(dir, 'skills.stamp')
  const tmp = `${target}.${process.pid}.tmp`
  fs.writeFileSync(tmp, version, { mode: 0o600 })
  fs.renameSync(tmp, target)
}

function configDir() {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Preferences', 'reader-cli-nodejs')
  }
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'reader-cli-nodejs', 'Config')
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'reader-cli-nodejs')
}

main()
process.exit(0)
