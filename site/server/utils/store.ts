// Lazy Dragonfly (Redis-protocol) singleton for the Nitro worker. One connection
// per process, never per request. All keys namespaced `achkit:`.
import Redis from 'ioredis'

let client: Redis | null = null

export function store(): Redis {
  if (!client) {
    const url = useRuntimeConfig().dragonflyUrl || 'redis://127.0.0.1:6379'
    client = new Redis(url, { maxRetriesPerRequest: 2, enableReadyCheck: true })
    client.on('error', (e) => console.error('[store] redis error', e.message))
  }
  return client
}
