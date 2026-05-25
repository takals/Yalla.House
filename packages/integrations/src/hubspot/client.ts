// =============================================================================
// HubSpot REST client
// =============================================================================
//
// Thin, typed wrapper around fetch. No SDK dependency — Node 18+ has fetch
// built in, and Vercel/Edge runtimes do too.
//
// Reads `HUBSPOT_PRIVATE_APP_TOKEN` from the environment. NEVER pass tokens
// in from user input or log the headers.

import type { HubSpotApiError } from './types'

const BASE_URL = 'https://api.hubapi.com'

export class HubSpotError extends Error {
  status: number
  body: HubSpotApiError | unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'HubSpotError'
    this.status = status
    this.body = body
  }
}

export interface HubSpotClientOptions {
  /** Override the token (defaults to process.env.HUBSPOT_PRIVATE_APP_TOKEN) */
  token?: string
  /** Override base URL (for tests) */
  baseUrl?: string
}

export class HubSpotClient {
  private readonly token: string
  private readonly baseUrl: string

  constructor(opts: HubSpotClientOptions = {}) {
    const token = opts.token ?? process.env.HUBSPOT_PRIVATE_APP_TOKEN
    if (!token) {
      throw new Error(
        'HubSpot client: HUBSPOT_PRIVATE_APP_TOKEN is not set. ' +
          'Create a Private App in HubSpot (Settings → Integrations → Private Apps), ' +
          'add the required scopes, and store the token in your secret manager.',
      )
    }
    this.token = token
    this.baseUrl = opts.baseUrl ?? BASE_URL
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await res.text()
    let parsed: unknown = undefined
    if (text) {
      try { parsed = JSON.parse(text) } catch { parsed = { raw: text } }
    }

    if (!res.ok) {
      throw new HubSpotError(
        `HubSpot ${method} ${path} failed: ${res.status}`,
        res.status,
        parsed,
      )
    }
    return parsed as T
  }

  get<T>(path: string) { return this.request<T>('GET', path) }
  post<T>(path: string, body?: unknown) { return this.request<T>('POST', path, body) }
  patch<T>(path: string, body?: unknown) { return this.request<T>('PATCH', path, body) }
  put<T>(path: string, body?: unknown) { return this.request<T>('PUT', path, body) }
  delete<T>(path: string) { return this.request<T>('DELETE', path) }
}
