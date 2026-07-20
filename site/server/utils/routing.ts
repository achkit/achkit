// Live routing-number verification against the FedACH participant directory.
// Real-time lookups hit Dragonfly (loaded by the directory ingester); the free
// library can only checksum, so this is the hosted, paid-tier value.

export interface RoutingInfo {
  routing: string
  name: string
  city: string
  state: string
  active: boolean
}

const KEY = (r: string) => `achkit:routing:${r}`

export async function lookupRouting(routing: string): Promise<RoutingInfo | null> {
  const d = String(routing).replace(/\D/g, '')
  if (d.length !== 9) return null
  const h = await store().hgetall(KEY(d)).catch(() => null)
  if (!h || !h.name) return null
  return { routing: d, name: h.name, city: h.city || '', state: h.state || '', active: h.active !== '0' }
}

/** How many routing numbers are loaded - a cheap health/coverage signal. */
export async function routingCount(): Promise<number> {
  const n = await store().get('achkit:routing:count').catch(() => null)
  return n ? Number(n) : 0
}
