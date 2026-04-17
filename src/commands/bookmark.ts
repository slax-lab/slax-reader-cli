import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { request, handleApiError } from '../lib/api.js'
import type { AddUrlBookmarkReq, AddBookmarkReq, AddBookmarkResp } from '../types.js'

export function registerBookmarkCommands(program: Command): void {
  program
    .command('add <url>')
    .description('Add a bookmark by URL')
    .option('-t, --title <title>', 'Bookmark title')
    .option('-d, --description <desc>', 'Bookmark description')
    .option('--tags <tags>', 'Comma-separated tags (e.g. "tech,news")')
    .option('--archive', 'Enable archive mode')
    .action(async (url: string, opts) => {
      // Normalize URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      try {
        new URL(url)
      } catch {
        console.error(chalk.red(`Invalid URL: ${url}`))
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

      const spinner = ora(`Adding bookmark: ${chalk.dim(url)}`).start()
      try {
        await request<unknown>('POST', '/v1/bookmark/add_url', body)
        spinner.succeed(chalk.green(`Bookmark added: ${chalk.bold(url)}`))
        if (tags.length) {
          console.log(chalk.dim(`  Tags: ${tags.join(', ')}`))
        }
      } catch (err) {
        spinner.fail('Failed to add bookmark')
        handleApiError(err)
      }
    })
}
