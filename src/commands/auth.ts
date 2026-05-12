import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { getApiKey, setApiKey, clearApiKey, getApiBase, setApiBase, getConfigPath } from '../lib/config.js'
import { request, handleApiError, apiErrorCode, apiErrorMessage } from '../lib/api.js'
import { failure, printJson, success } from '../lib/output.js'
import type { UserInfo } from '../types.js'

interface AuthOptions {
  apiKey?: string
  apiBase?: string
  json?: boolean
}

interface JsonOptions {
  json?: boolean
}

export function registerAuthCommands(program: Command): void {
  program
    .command('login')
    .description('Log in with your API Key')
    .option('--api-key <key>', 'API Key (starts with sr-)')
    .option('--api-base <url>', 'Custom API base URL')
    .option('--json', 'Output JSON')
    .action(async (opts: AuthOptions) => {
      let apiKey: string = opts.apiKey ?? ''

      if (!apiKey) {
        if (opts.json) {
          printJson(failure('missing_api_key', 'API Key is required in JSON mode.', 'Pass --api-key <key>.'))
          process.exit(1)
        }
        const rl = createInterface({ input: stdin, output: stdout })
        try {
          apiKey = await rl.question(chalk.cyan('Enter your API Key (starts with sr-): '))
        } finally {
          rl.close()
        }
      }

      apiKey = apiKey.trim()
      if (!apiKey) {
        if (opts.json) printJson(failure('empty_api_key', 'API Key cannot be empty.'))
        else console.error(chalk.red('API Key cannot be empty.'))
        process.exit(1)
      }

      if (!apiKey.startsWith('sr-')) {
        if (opts.json) printJson(failure('invalid_api_key', 'Invalid API Key format. It should start with "sr-".'))
        else console.error(chalk.red('Invalid API Key format. It should start with "sr-".'))
        process.exit(1)
      }

      if (opts.apiBase) {
        setApiBase(opts.apiBase)
      }

      setApiKey(apiKey)

      const spinner = opts.json ? null : ora('Verifying API Key...').start()
      try {
        const user = await request<UserInfo>('GET', '/v1/user/me')
        spinner?.succeed(chalk.green(`Logged in as ${chalk.bold(user.username || user.email || 'User')}`))
        if (opts.json) {
          printJson(success({ user, apiBase: getApiBase(), configPath: getConfigPath() }))
        } else {
          console.log(chalk.dim(`Config saved to ${getConfigPath()}`))
        }
      } catch (err) {
        spinner?.fail('Login failed')
        clearApiKey()
        if (opts.json) {
          printJson(failure(apiErrorCode(err), apiErrorMessage(err)))
          process.exit(1)
        }
        handleApiError(err)
      }
    })

  program
    .command('logout')
    .description('Log out and clear stored API Key')
    .option('--json', 'Output JSON')
    .action((opts: JsonOptions) => {
      clearApiKey()
      if (opts.json) {
        printJson(success({ loggedOut: true }))
      } else {
        console.log(chalk.green('Logged out successfully.'))
      }
    })

  program
    .command('whoami')
    .description('Show current user information')
    .option('--json', 'Output JSON')
    .action(async (opts: JsonOptions) => {
      const key = getApiKey()
      if (!key) {
        if (opts.json) printJson(failure('not_logged_in', 'Not logged in. Run `reader-cli login` first.'))
        else console.log(chalk.yellow('Not logged in. Run `reader-cli login` first.'))
        process.exit(1)
      }

      const spinner = opts.json ? null : ora('Fetching user info...').start()
      try {
        const user = await request<UserInfo>('GET', '/v1/user/me')
        spinner?.stop()
        if (opts.json) {
          printJson(success({
            user,
            apiBase: getApiBase(),
            apiKeyPrefix: `${key.slice(0, 9)}...`,
          }))
        } else {
          console.log(chalk.bold('Current User:'))
          console.log(`  Username : ${chalk.cyan(user.username || '-')}`)
          console.log(`  Email    : ${chalk.cyan(user.email || '-')}`)
          console.log(`  API Base : ${chalk.dim(getApiBase())}`)
          console.log(`  API Key  : ${chalk.dim(key.slice(0, 9) + '...')}`)
        }
      } catch (err) {
        spinner?.fail('Failed to fetch user info')
        if (opts.json) {
          printJson(failure(apiErrorCode(err), apiErrorMessage(err)))
          process.exit(1)
        }
        handleApiError(err)
      }
    })
}
