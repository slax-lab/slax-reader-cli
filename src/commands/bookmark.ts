import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { request, handleApiError, apiErrorCode, apiErrorMessage } from '../lib/api.js'
import { failure, printJson, success } from '../lib/output.js'
import type { AddUrlBookmarkReq, BookmarkDetail, BookmarkListItem } from '../types.js'

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

  program
    .command('list')
    .alias('ls')
    .description('List your bookmarks')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-s, --size <number>', 'Items per page', '20')
    .option('-f, --filter <type>', 'Filter type: all, inbox, archive, starred', 'all')
    .action(async (opts) => {
      const page = parseInt(opts.page, 10)
      const size = parseInt(opts.size, 10)
      if (isNaN(page) || page < 1) {
        console.error(chalk.red('Page must be a positive number.'))
        process.exit(1)
      }
      if (isNaN(size) || size < 1) {
        console.error(chalk.red('Size must be a positive number.'))
        process.exit(1)
      }
      const spinner = ora('Fetching bookmarks...').start()
      try {
        const items = await request<BookmarkListItem[]>(
          'GET',
          `/v1/bookmark/list?page=${page}&size=${size}&filter=${opts.filter}`
        )
        spinner.stop()
        if (!items || items.length === 0) {
          console.log(chalk.dim('No bookmarks found.'))
          return
        }
        console.log(chalk.bold(`Bookmarks (page ${page}, ${items.length} items):\n`))
        for (const item of items) {
          const title = item.alias_title || item.title || chalk.dim('(untitled)')
          const starred = item.starred === 'star' ? chalk.yellow(' ★') : ''
          const archived = item.archived === 'archive' ? chalk.dim(' [archived]') : ''
          console.log(`  ${chalk.bold(chalk.cyan(item.id))}  ${title}${starred}${archived}`)
          console.log(`  ${chalk.dim(item.target_url)}`)
          if (item.description) {
            const desc = item.description.length > 80
              ? item.description.slice(0, 80) + '...'
              : item.description
            console.log(`  ${chalk.dim(desc)}`)
          }
          console.log()
        }
        console.log(chalk.dim(`  Tip: use ${chalk.bold('reader-cli view <id>')} to read bookmark content`))
      } catch (err) {
        spinner.fail('Failed to fetch bookmarks')
        handleApiError(err)
      }
    })

  program
    .command('view <id>')
    .description('View bookmark detail')
    .action(async (id: string) => {
      const spinner = ora('Fetching bookmark...').start()
      try {
        const detail = await request<BookmarkDetail>(
          'GET',
          `/v1/bookmark/detail?bookmark_id=${id}`
        )
        spinner.stop()
        const title = detail.alias_title || detail.title
        console.log(chalk.bold(title))
        console.log(chalk.dim('─'.repeat(Math.min(title.length * 2, 60))))
        console.log()
        if (detail.byline) {
          console.log(chalk.dim(`Author: ${detail.byline}`))
        }
        console.log(chalk.dim(`URL: ${detail.target_url}`))
        console.log(chalk.dim(`Status: ${detail.status}`))
        const flags: string[] = []
        if (detail.starred === 'star') flags.push(chalk.yellow('★ Starred'))
        if (detail.archived === 'archive') flags.push('Archived')
        if (flags.length) {
          console.log(chalk.dim(flags.join(' · ')))
        }
        if (detail.tags && detail.tags.length) {
          console.log(chalk.dim(`Tags: ${detail.tags.map(t => t.name).join(', ')}`))
        }
        if (detail.created_at) {
          console.log(chalk.dim(`Created: ${new Date(detail.created_at).toLocaleString()}`))
        }
        if (detail.content_word_count) {
          console.log(chalk.dim(`Words: ${detail.content_word_count}`))
        }
        console.log()
        if (detail.overview) {
          console.log(chalk.bold('Overview'))
          console.log(detail.overview)
          console.log()
        }
        if (detail.description) {
          console.log(chalk.bold('Description'))
          console.log(detail.description)
          console.log()
        }
        if (detail.content) {
          console.log(chalk.bold('Content'))
          console.log(detail.content)
        }
      } catch (err) {
        spinner.fail('Failed to fetch bookmark')
        handleApiError(err)
      }
    })
}
