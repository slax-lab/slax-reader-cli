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

export class MissingApiKeyError extends Error {
  constructor() {
    super('Not logged in. Run `reader-cli login` first.')
    this.name = 'MissingApiKeyError'
  }
}

function ensureApiKey(): string {
  const key = getApiKey()
  if (!key) {
    throw new MissingApiKeyError()
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

export function apiErrorCode(err: unknown): string {
  if (err instanceof MissingApiKeyError) return 'not_logged_in'
  if (err instanceof ApiError) return `api_${err.apiCode}`
  if (err instanceof Error && (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED'))) {
    return 'network_error'
  }
  return 'unknown_error'
}

export function apiErrorMessage(err: unknown): string {
  if (err instanceof MissingApiKeyError) return err.message
  if (err instanceof ApiError) {
    switch (err.statusCode) {
      case 401:
        return 'Invalid API Key. Run `reader-cli login` to update.'
      case 403:
        return 'Permission denied. Your subscription may be expired.'
      default:
        return `API error (${err.apiCode}): ${err.message}`
    }
  }
  if (err instanceof Error) {
    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      return 'Network error. Please check your connection.'
    }
    return `Error: ${err.message}`
  }
  return 'An unknown error occurred.'
}

export function handleApiError(err: unknown): never {
  console.error(chalk.red(apiErrorMessage(err)))
  process.exit(1)
}
