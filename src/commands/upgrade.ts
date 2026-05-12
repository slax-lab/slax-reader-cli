import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'node:child_process'
import { checkForUpdate, getLatestVersion } from '../lib/version.js'
import { failure, printJson, success } from '../lib/output.js'
import { buildInstallCommand } from '../lib/packageManager.js'
import { syncSkillToVersion, type SkillSyncResult } from '../lib/skillSync.js'

interface UpgradeOptions {
  check?: boolean
  json?: boolean
}

export function registerUpgradeCommands(program: Command): void {
  program
    .command('upgrade')
    .description('Upgrade CLI to the latest version')
    .option('--check', 'Only check for updates, do not install')
    .option('--json', 'Output JSON')
    .action(async (opts: UpgradeOptions) => {
      const currentVersion = program.version() ?? '0.0.0'

      const spinner = opts.json ? null : ora('Checking for updates...').start()
      const latestVersion = await getLatestVersion()

      if (!latestVersion) {
        spinner?.fail('Failed to check for updates. Please check your network.')
        if (opts.json) printJson(failure('update_check_failed', 'Failed to check for updates. Please check your network.'))
        process.exit(1)
      }

      const newer = await checkForUpdate(currentVersion)

      if (!newer) {
        spinner?.succeed(chalk.green(`Already up to date (v${currentVersion})`))

        if (opts.check) {
          if (opts.json) printJson(success({ current: currentVersion, latest: latestVersion, updateAvailable: false }))
          return
        }

        const skillsResult = await syncSkill(currentVersion, opts)
        if (opts.json) {
          printJson(success({
            current: currentVersion,
            latest: latestVersion,
            updateAvailable: false,
            skillsAction: skillsResult.action,
            ...(skillsResult.action === 'failed' ? { skillsWarning: skillsResult.error, skillsHint: skillsResult.hint } : {}),
          }))
        }
        return
      }

      spinner?.info(`New version available: ${chalk.yellow(`v${currentVersion}`)} → ${chalk.green(`v${latestVersion}`)}`)

      if (opts.check) {
        if (opts.json) {
          printJson(success({ current: currentVersion, latest: latestVersion, updateAvailable: true, command: 'reader-cli upgrade' }))
        } else {
          console.log(chalk.dim('Run `reader-cli upgrade` to install.'))
        }
        return
      }

      const installCmd = buildInstallCommand()

      const installSpinner = opts.json ? null : ora('Upgrading...').start()
      try {
        execSync(installCmd, { stdio: 'pipe' })
        installSpinner?.succeed(chalk.green(`Successfully upgraded to v${latestVersion}`))
        const skillsResult = await syncSkill(latestVersion, opts)
        if (opts.json) {
          printJson(success({
            current: currentVersion,
            latest: latestVersion,
            upgraded: true,
            skillsAction: skillsResult.action,
            ...(skillsResult.action === 'failed' ? { skillsWarning: skillsResult.error, skillsHint: skillsResult.hint } : {}),
          }))
        }
      } catch {
        installSpinner?.fail('Upgrade failed')
        if (opts.json) printJson(failure('upgrade_failed', 'Upgrade failed.', `Try manually: ${installCmd}`))
        else console.error(chalk.dim(`Try manually: ${installCmd}`))
        process.exit(1)
      }
    })
}

async function syncSkill(currentVersion: string, opts: UpgradeOptions): Promise<SkillSyncResult> {
  const spinner = opts.json ? null : ora('Syncing Slax Reader AI Agent skill...').start()
  const result = await syncSkillToVersion(currentVersion)

  if (result.action === 'in_sync') {
    spinner?.succeed(chalk.green(`Skill is already in sync (v${currentVersion}).`))
  } else if (result.action === 'synced') {
    spinner?.succeed(chalk.green(`Skill synced for reader-cli v${currentVersion}.`))
  } else {
    spinner?.warn(chalk.yellow('Skill sync failed'))
    if (!opts.json) {
      console.error(chalk.red(result.error ?? 'Skill sync failed.'))
      if (result.hint) console.error(chalk.dim(result.hint))
    }
  }

  return result
}
