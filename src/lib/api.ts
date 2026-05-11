import chalk from 'chalk'
import { getApiKey, getApiBase } from './config.js'
import type { ApiResponse } from '../types.js'

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly apiCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function ensureApiKey(): string {
  const key = getApiKey()
  if (!key) {
    console.error(chalk.red('Not logged in. Run `slax-reader-cli login` first.'))
    process.exit(1)
  }
  return key
}

export async function request<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const apiKey = ensureApiKey()
  const base = getApiBase()
  const url = `${base}${path}`

  const headers: Record<string, string> = {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = (await res.json()) as ApiResponse<T>

  if (!res.ok || (json.code && json.code >= 400)) {
    const code = json.code ?? res.status
    const msg = json.message || json.data || res.statusText
    throw new ApiError(res.status, code, String(msg))
  }

  return json.data
}

export function handleApiError(err: unknown): never {
  if (err instanceof ApiError) {
    switch (err.statusCode) {
      case 401:
        console.error(chalk.red('Invalid API Key. Run `slax-reader-cli login` to update.'))
        break
      case 403:
        console.error(chalk.red('Permission denied. Your subscription may be expired.'))
        break
      default:
        console.error(chalk.red(`API error (${err.apiCode}): ${err.message}`))
    }
  } else if (err instanceof Error) {
    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      console.error(chalk.red('Network error. Please check your connection.'))
    } else {
      console.error(chalk.red(`Error: ${err.message}`))
    }
  } else {
    console.error(chalk.red('An unknown error occurred.'))
  }
  process.exit(1)
}
