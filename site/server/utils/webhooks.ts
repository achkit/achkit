// Ultra webhooks: register URLs, deliver signed events. Stored in Dragonfly.
import { randomBytes, createHmac } from 'node:crypto'

export interface Webhook { id: string; url: string; secret: string; createdAt: number }

const K = (cust: string) => `achkit:webhooks:${cust}`

export async function addWebhook(cust: string, url: string): Promise<Webhook> {
  const wh: Webhook = { id: 'wh_' + randomBytes(8).toString('hex'), url, secret: 'whsec_' + randomBytes(16).toString('hex'), createdAt: Date.now() }
  await store().hset(K(cust), wh.id, JSON.stringify(wh))
  return wh
}
export async function listWebhooks(cust: string): Promise<Webhook[]> {
  const h = await store().hgetall(K(cust)).catch(() => ({} as Record<string, string>))
  return Object.values(h).map((v) => JSON.parse(v) as Webhook)
}
export async function deleteWebhook(cust: string, id: string): Promise<void> {
  await store().hdel(K(cust), id)
}

// Deliver an event to every registered webhook, HMAC-signed. Fire-and-forget.
export async function fireWebhooks(cust: string, type: string, data: unknown): Promise<void> {
  const hooks = await listWebhooks(cust)
  await Promise.all(hooks.map(async (wh) => {
    const body = JSON.stringify({ type, data, createdAt: Date.now() })
    const sig = createHmac('sha256', wh.secret).update(body).digest('hex')
    await fetch(wh.url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-achkit-signature': sig }, body })
      .catch((e) => console.error('[webhook] delivery failed', wh.url, e?.message))
  }))
}
