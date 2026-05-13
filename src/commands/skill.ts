import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { failure, printJson, success } from '../lib/output.js'
import { readSkillStamp } from '../lib/skillscheck.js'
import { syncSkillToVersion } from '../lib/skillSync.js'

interface SkillOptions {
  check?: boolean
  sync?: boolean
  force?: boolean
  json?: boolean
}

export function registerSkillCommands(program: Command, currentVersion: string): void {
  program
    .command('skill')
    .description('Check or sync Slax Reader AI Agent skill')
    .option('--check', 'Check skill sync status')
    .option('--sync', 'Install or update the AI Agent skill')
    .option('--force', 'Force sync even when stamp is already current')
    .option('--json', 'Output JSON')
    .action(async (opts: SkillOptions) => {
      if (opts.sync) {
        await syncSkill(currentVersion, opts)
        return
      }
      await checkSkill(currentVersion, opts)
    })
}

async function checkSkill(currentVersion: string, opts: SkillOptions): Promise<void> {
  const stamp = (await readSkillStamp()) ?? ''
  const data = {
    stamp,
    current: currentVersion,
    inSync: stamp === currentVersion,
  }

  if (opts.json) {
    printJson(success(data))
    return
  }

  if (data.inSync) {
    console.log(chalk.green(`Skill is in sync (v${currentVersion}).`))
  } else if (stamp) {
    console.log(chalk.yellow(`Skill is out of sync: v${stamp} → v${currentVersion}`))
    console.log(chalk.dim('Run `reader-cli skill --sync` to update.'))
  } else {
    console.log(chalk.yellow('Skill is not installed.'))
    console.log(chalk.dim('Run `reader-cli skill --sync` to install.'))
  }
}

async function syncSkill(currentVersion: string, opts: SkillOptions): Promise<void> {
  const spinner = opts.json ? null : ora('Installing Slax Reader AI Agent skill...').start()
  const result = await syncSkillToVersion(currentVersion, { force: opts.force })

  if (result.action === 'in_sync') {
    spinner?.stop()
    const data = { action: 'in_sync', current: currentVersion }
    if (opts.json) {
      printJson(success(data))
    } else {
      console.log(chalk.green(`Skill is already in sync (v${currentVersion}).`))
    }
    return
  }

  if (result.action === 'synced') {
    spinner?.succeed(chalk.green(`Skill synced for reader-cli v${currentVersion}.`))
    if (opts.json) {
      printJson(success({ action: 'synced', current: currentVersion }))
    }
    return
  }

  spinner?.fail('Skill sync failed')
  if (opts.json) {
    printJson(failure('skill_sync_failed', result.error ?? 'Skill sync failed.', result.hint))
  } else {
    console.error(chalk.red(result.error ?? 'Skill sync failed.'))
    if (result.hint) console.error(chalk.dim(result.hint))
  }
  process.exit(1)
}
