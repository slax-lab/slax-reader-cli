import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'node:child_process'
import { checkForUpdate, getLatestVersion } from '../lib/version.js'

const PACKAGE_NAME = '@slax-lab/slax-reader-cli'

export function registerUpgradeCommands(program: Command): void {
  program
    .command('upgrade')
    .description('Upgrade CLI to the latest version')
    .option('--check', 'Only check for updates, do not install')
    .action(async (opts) => {
      const currentVersion = program.version() ?? '0.0.0'

      const spinner = ora('Checking for updates...').start()
      const latestVersion = await getLatestVersion()

      if (!latestVersion) {
        spinner.fail('Failed to check for updates. Please check your network.')
        process.exit(1)
      }

      const newer = await checkForUpdate(currentVersion)

      if (!newer) {
        spinner.succeed(chalk.green(`Already up to date (v${currentVersion})`))
        return
      }

      spinner.info(`New version available: ${chalk.yellow(`v${currentVersion}`)} → ${chalk.green(`v${latestVersion}`)}`)

      if (opts.check) {
        console.log(chalk.dim(`Run \`slax-reader-cli upgrade\` to install.`))
        return
      }

      // Detect package manager
      const pm = detectPackageManager()
      const installCmd = getInstallCommand(pm, PACKAGE_NAME)

      const installSpinner = ora(`Upgrading via ${pm}...`).start()
      try {
        execSync(installCmd, { stdio: 'pipe' })
        installSpinner.succeed(chalk.green(`Successfully upgraded to v${latestVersion}`))
      } catch (err) {
        installSpinner.fail('Upgrade failed')
        console.error(chalk.dim(`Try manually: ${installCmd}`))
        process.exit(1)
      }
    })
}

function detectPackageManager(): 'pnpm' | 'npm' {
  try {
    execSync('pnpm --version', { stdio: 'pipe' })
    return 'pnpm'
  } catch {
    return 'npm'
  }
}

function getInstallCommand(pm: 'pnpm' | 'npm', pkg: string): string {
  switch (pm) {
    case 'pnpm':
      return `pnpm add -g ${pkg}@latest`
    case 'npm':
      return `npm install -g ${pkg}@latest`
  }
}
