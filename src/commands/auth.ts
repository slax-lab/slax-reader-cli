import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { getApiKey, setApiKey, clearApiKey, getApiBase, setApiBase, getConfigPath } from '../lib/config.js'
import { request, handleApiError } from '../lib/api.js'
import type { UserInfo } from '../types.js'

export function registerAuthCommands(program: Command): void {
  program
    .command('login')
    .description('Log in with your API Key')
    .option('--api-key <key>', 'API Key (starts with sr-)')
    .option('--api-base <url>', 'Custom API base URL')
    .action(async (opts) => {
      let apiKey: string = opts.apiKey ?? ''

      if (!apiKey) {
        const rl = createInterface({ input: stdin, output: stdout })
        try {
          apiKey = await rl.question(chalk.cyan('Enter your API Key (starts with sr-): '))
        } finally {
          rl.close()
        }
      }

      apiKey = apiKey.trim()
      if (!apiKey) {
        console.error(chalk.red('API Key cannot be empty.'))
        process.exit(1)
      }

      if (!apiKey.startsWith('sr-')) {
        console.error(chalk.red('Invalid API Key format. It should start with "sr-".'))
        process.exit(1)
      }

      if (opts.apiBase) {
        setApiBase(opts.apiBase)
      }

      setApiKey(apiKey)

      // Verify the key by calling /v1/user/me
      const spinner = ora('Verifying API Key...').start()
      try {
        const user = await request<UserInfo>('GET', '/v1/user/me')
        spinner.succeed(chalk.green(`Logged in as ${chalk.bold(user.username || user.email || 'User')}`))
        console.log(chalk.dim(`Config saved to ${getConfigPath()}`))
      } catch (err) {
        spinner.fail('Login failed')
        clearApiKey()
        handleApiError(err)
      }
    })

  program
    .command('logout')
    .description('Log out and clear stored API Key')
    .action(() => {
      clearApiKey()
      console.log(chalk.green('Logged out successfully.'))
    })

  program
    .command('whoami')
    .description('Show current user information')
    .action(async () => {
      const key = getApiKey()
      if (!key) {
        console.log(chalk.yellow('Not logged in. Run `reader-cli login` first.'))
        process.exit(1)
      }

      const spinner = ora('Fetching user info...').start()
      try {
        const user = await request<UserInfo>('GET', '/v1/user/me')
        spinner.stop()
        console.log(chalk.bold('Current User:'))
        console.log(`  Username : ${chalk.cyan(user.username || '-')}`)
        console.log(`  Email    : ${chalk.cyan(user.email || '-')}`)
        console.log(`  API Base : ${chalk.dim(getApiBase())}`)
        console.log(`  API Key  : ${chalk.dim(key.slice(0, 9) + '...')}`)
      } catch (err) {
        spinner.fail('Failed to fetch user info')
        handleApiError(err)
      }
    })
}
