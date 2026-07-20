import { validate } from 'achkit'
import { lookupKey, bumpUsage } from '../utils/keys'
import { TIERS, FREE_PER_MINUTE } from '../utils/tiers'

const MAX_BYTES = 5 * 1024 * 1024
// ponytail: best-effort in-memory free-tier limiter, per-process. Persists in the
// pm2 node process; keyed API tiers use Dragonfly counters below.
const hits = new Map<string, { n: number; t: number }>()

export default defineEventHandler(async (event) => {
  const apiKey = getHeader(event, 'x-api-key') || ''
  const rec = apiKey ? await lookupKey(apiKey) : null

  if (rec) {
    const tier = TIERS[rec.tier]
    const used = await bumpUsage(apiKey)
    if (tier.limitPerMonth !== null && used > tier.limitPerMonth) {
      throw createError({ statusCode: 429, statusMessage: `Monthly limit reached (${tier.limitPerMonth}). Upgrade for more.` })
    }
  } else {
    // free, unauthenticated demo - best-effort per-IP/minute
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'anon'
    const now = Date.now()
    const h = hits.get(ip)
    if (!h || now - h.t > 60_000) hits.set(ip, { n: 1, t: now })
    else if (h.n >= FREE_PER_MINUTE) throw createError({ statusCode: 429, statusMessage: 'Free demo rate limit reached. Run the library locally, or add an API key.' })
    else h.n++
  }

  const body = await readRawBody(event, 'utf8')
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Send the ACH file as the request body.' })
  if (body.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'File exceeds the 5MB limit.' })

  const { ok, errors } = validate(body)
  return { ok, errors: errors.slice(0, 500), tier: rec ? rec.tier : 'demo' }
})
