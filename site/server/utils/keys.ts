// API key issuance + lookup + revocation, backed by Dragonfly. A customer holds
// exactly one active key; re-issuing rotates it.
import { randomBytes } from 'node:crypto'
import type { TierId } from './tiers'

export interface KeyRecord {
  customerId: string
  tier: TierId
  createdAt: number
}

const KEY = (k: string) => `achkit:key:${k}`
const CUST = (c: string) => `achkit:customer:${c}:key`

export function newApiKey(): string {
  return 'ak_' + randomBytes(24).toString('hex')
}

export async function issueKey(customerId: string, tier: TierId): Promise<string> {
  const s = store()
  const existing = await s.get(CUST(customerId))
  if (existing) await s.del(KEY(existing))
  const key = newApiKey()
  const rec: KeyRecord = { customerId, tier, createdAt: Date.now() }
  await s.set(KEY(key), JSON.stringify(rec))
  await s.set(CUST(customerId), key)
  return key
}

export async function lookupKey(key: string): Promise<KeyRecord | null> {
  if (!key || !key.startsWith('ak_')) return null
  const raw = await store().get(KEY(key)).catch(() => null)
  return raw ? (JSON.parse(raw) as KeyRecord) : null
}

export async function revokeCustomer(customerId: string): Promise<void> {
  const s = store()
  const key = await s.get(CUST(customerId))
  if (key) await s.del(KEY(key))
  await s.del(CUST(customerId))
}

// Monthly usage counter for a key; returns the new count.
export async function bumpUsage(key: string): Promise<number> {
  const s = store()
  const month = new Date().toISOString().slice(0, 7).replace('-', '')
  const k = `achkit:usage:${key}:${month}`
  const n = await s.incr(k)
  if (n === 1) await s.expire(k, 40 * 24 * 3600)
  return n
}
