// Client for the achkit hosted API (paid). The rest of this package is free and
// runs locally; this talks to the hosted service for live routing verification
// against the FedACH directory. Get an API key at https://achkit.com/dashboard.
import { AchError } from './fields.js'
import type { ValidationError } from './validate.js'

export interface ClientOptions {
  apiKey: string
  baseUrl?: string
}

export interface RoutingResult {
  routing: string
  checksumValid: boolean
  found: boolean
  active: boolean
  bank: { name: string; city: string; state: string } | null
}

export interface RemoteValidation {
  ok: boolean
  errors: ValidationError[]
  tier: string
  routing?: Array<{ routing: string; checksumValid: boolean; found: boolean; active: boolean; bank: string | null }>
}

export class AchkitClient {
  private readonly key: string
  private readonly base: string

  constructor(opts: ClientOptions) {
    if (!opts?.apiKey) throw new AchError('NO_API_KEY', 'An API key is required. Get one at https://achkit.com/dashboard')
    this.key = opts.apiKey
    this.base = (opts.baseUrl || 'https://achkit.com').replace(/\/$/, '')
  }

  /** Verify a routing number against the live FedACH participant directory. */
  async verifyRouting(routing: string): Promise<RoutingResult> {
    const r = await fetch(`${this.base}/api/routing/${encodeURIComponent(routing)}`, {
      headers: { 'x-api-key': this.key },
    })
    if (!r.ok) throw new AchError('API_ERROR', `routing verify failed (${r.status})`)
    return (await r.json()) as RoutingResult
  }

  /** Validate an ACH file on the hosted API - reconciliation plus live routing checks. */
  async validate(file: string): Promise<RemoteValidation> {
    const r = await fetch(`${this.base}/api/validate`, {
      method: 'POST',
      headers: { 'x-api-key': this.key, 'content-type': 'text/plain' },
      body: file,
    })
    if (!r.ok) throw new AchError('API_ERROR', `validate failed (${r.status})`)
    return (await r.json()) as RemoteValidation
  }
}
