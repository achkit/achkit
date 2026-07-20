import { validate } from 'achkit'

const MAX_BYTES = 2 * 1024 * 1024
// ponytail: best-effort in-memory limiter, per-instance only. Swap for a
// KV/Durable-Object limit when the paid, key-authenticated API lands.
const hits = new Map<string, { n: number; t: number }>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'anon'
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > 60_000) hits.set(ip, { n: 1, t: now })
  else if (h.n >= 30) throw createError({ statusCode: 429, statusMessage: 'Rate limit reached. Run the library locally, or upgrade for hosted validation.' })
  else h.n++

  const body = await readRawBody(event, 'utf8')
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Send the ACH file as the request body.' })
  if (body.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'File exceeds the 2MB demo limit.' })

  const { ok, errors } = validate(body)
  return { ok, errors: errors.slice(0, 200), demo: true }
})
