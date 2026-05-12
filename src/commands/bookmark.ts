import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { request, handleApiError, apiErrorCode, apiErrorMessage } from '../lib/api.js'
import { failure, printJson, success } from '../lib/output.js'
import type { AddUrlBookmarkReq } from '../types.js'

interface AddOptions {
  title?: string
  description?: string
  tags?: string
  archive?: boolean
  json?: boolean
}

export function registerBookmarkCommands(program: Command): void {
  program
    .command('add <url>')
    .description('Add a bookmark by URL')
    .option('-t, --title <title>', 'Bookmark title')
    .option('-d, --description <desc>', 'Bookmark description')
    .option('--tags <tags>', 'Comma-separated tags (e.g. "tech,news")')
    .option('--archive', 'Enable archive mode')
    .option('--json', 'Output JSON')
    .action(async (url: string, opts: AddOptions) => {
      const inputUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      try {
        new URL(url)
      } catch {
        if (opts.json) printJson(failure('invalid_url', `Invalid URL: ${inputUrl}`))
        else console.error(chalk.red(`Invalid URL: ${url}`))
        process.exit(1)
      }

      const tags: string[] = opts.tags
        ? opts.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : []

      const body: AddUrlBookmarkReq = {
        target_url: url,
        target_title: opts.title,
        description: opts.description,
        tags,
        is_archive: opts.archive ?? false,
      }

      const spinner = opts.json ? null : ora(`Adding bookmark: ${chalk.dim(url)}`).start()
      try {
        await request<unknown>('POST', '/v1/bookmark/add_url', body)
        spinner?.succeed(chalk.green(`Bookmark added: ${chalk.bold(url)}`))
        if (opts.json) {
          printJson(success({ url, title: opts.title ?? null, description: opts.description ?? null, tags, archive: body.is_archive }))
        } else if (tags.length) {
          console.log(chalk.dim(`  Tags: ${tags.join(', ')}`))
        }
      } catch (err) {
        spinner?.fail('Failed to add bookmark')
        if (opts.json) {
          printJson(failure(apiErrorCode(err), apiErrorMessage(err)))
          process.exit(1)
        }
        handleApiError(err)
      }
    })
}
