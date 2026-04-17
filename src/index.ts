import { Command } from 'commander'
import chalk from 'chalk'
import { registerAuthCommands } from './commands/auth.js'
import { registerBookmarkCommands } from './commands/bookmark.js'
import { registerUpgradeCommands } from './commands/upgrade.js'
import { checkForUpdate } from './lib/version.js'

const VERSION = '0.1.0'

const program = new Command()

program
  .name('slax-reader')
  .description('Slax Reader CLI - manage bookmarks from the command line')
  .version(VERSION, '-v, --version')

// Register commands
registerAuthCommands(program)
registerBookmarkCommands(program)
registerUpgradeCommands(program)

// After execution, check for updates (non-blocking)
program.hook('postAction', async () => {
  try {
    const newer = await checkForUpdate(VERSION)
    if (newer) {
      console.log()
      console.log(chalk.yellow(`  Update available: v${VERSION} → v${newer}`))
      console.log(chalk.dim(`  Run \`slax-reader upgrade\` to update`))
      console.log()
    }
  } catch {
    // Silently ignore update check failures
  }
})

program.parse()
