import { execSync } from 'node:child_process'
import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { failure, printJson, success } from '../lib/output.js'
import { writeSkillStamp, clearPendingSkill } from '../lib/skillscheck.js'
import { execNpx } from '../lib/exec.js'
import { detectPackageManager, buildInstallCommand } from '../lib/packageManager.js'

const SKILLS_SOURCE = 'slax-lab/slax-reader-cli'

interface InstallOptions {
  json?: boolean
}

export function registerInstallCommand(program: Command, currentVersion: string): void {
  program
    .command('install')
    .description('Install reader-cli globally and set up the AI Agent skill')
    .option('--json', 'Output JSON')
    .action(async (opts: InstallOptions) => {
      await runInstall(currentVersion, opts)
    })
}

async function runInstall(currentVersion: string, opts: InstallOptions): Promise<void> {
  // Step 1: globally install the CLI
  // Try pnpm first if available, fall back to npm if pnpm global install fails
  // (pnpm may be installed but not configured for global installs)
  const preferredPm = detectPackageManager()
  let pm = preferredPm
  let installCmd = buildInstallCommand(pm)

  const cliSpinner = opts.json ? null : ora(`Installing @slax-lab/reader-cli via ${pm}...`).start()
  try {
    execSync(installCmd, { stdio: 'pipe' })
    cliSpinner?.succeed(chalk.green(`@slax-lab/reader-cli installed globally via ${pm}.`))
  } catch (firstErr) {
    if (pm === 'pnpm') {
      if (cliSpinner) cliSpinner.text = 'pnpm global install failed, retrying with npm...'
      pm = 'npm'
      installCmd = buildInstallCommand(pm)
      try {
        execSync(installCmd, { stdio: 'pipe' })
        cliSpinner?.succeed(chalk.green(`@slax-lab/reader-cli installed globally via npm.`))
      } catch (err) {
        cliSpinner?.fail('CLI install failed.')
        const msg = err instanceof Error ? err.message : 'Unknown error'
        if (opts.json) {
          printJson(failure('cli_install_failed', msg, `Try manually: ${installCmd}`))
        } else {
          console.error(chalk.red(msg))
          console.error(chalk.dim(`Try manually: ${installCmd}`))
        }
        process.exit(1)
      }
    } else {
      cliSpinner?.fail('CLI install failed.')
      const msg = firstErr instanceof Error ? firstErr.message : 'Unknown error'
      if (opts.json) {
        printJson(failure('cli_install_failed', msg, `Try manually: ${installCmd}`))
      } else {
        console.error(chalk.red(msg))
        console.error(chalk.dim(`Try manually: ${installCmd}`))
      }
      process.exit(1)
    }
  }

  // Step 2: install the AI Agent skill
  let skillInstalled = false
  const skillSpinner = opts.json ? null : ora('Installing AI Agent skill...').start()
  try {
    await execNpx(['-y', 'skills', 'add', SKILLS_SOURCE, '-g', '-y'], {
      timeout: 10 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    })
    // Write stamp using the version we just installed
    const installedVersion = resolveInstalledVersion(currentVersion)
    await writeSkillStamp(installedVersion)
    clearPendingSkill()
    skillInstalled = true
    skillSpinner?.succeed(chalk.green('AI Agent skill installed.'))
  } catch {
    skillSpinner?.warn('Skill install failed (skills tool may not be available).')
    if (!opts.json) {
      console.log(chalk.dim('To install later, run: reader-cli skill --sync'))
    }
  }

  if (opts.json) {
    const version = resolveInstalledVersion(currentVersion)
    if (skillInstalled) {
      printJson(success({ installed: true, skillInstalled: true, packageManager: pm, version }))
    } else {
      printJson(success({
        installed: true,
        skillInstalled: false,
        packageManager: pm,
        version,
        hint: 'AI Agent skill install failed. Run: reader-cli skill --sync',
      }))
    }
  } else {
    console.log()
    console.log(chalk.green('Setup complete.'))
    console.log(chalk.dim('Run `reader-cli login` to authenticate.'))
  }
}

function resolveInstalledVersion(fallback: string): string {
  try {
    // After global install, the new binary is on PATH — ask it for its version
    const out = execSync('reader-cli --version', { stdio: 'pipe' }).toString().trim()
    return out || fallback
  } catch {
    return fallback
  }
}
