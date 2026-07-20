import { validate, parse, isValidRouting } from 'achkit'
import { lookupKey, bumpUsage } from '../utils/keys'
import { lookupRouting } from '../utils/routing'
import { checkRules } from '../utils/rules'
import { TIERS, FREE_PER_MINUTE } from '../utils/tiers'

const MAX_BYTES = 5 * 1024 * 1024
// ponytail: best-effort in-memory free-tier limiter, per pm2 process. Keyed tiers
// use Dragonfly counters (monthly) and log to ClickHouse for analytics.
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

  // Paid tiers: live routing verification against the FedACH directory.
  const routing: Array<{ routing: string; checksumValid: boolean; found: boolean; active: boolean; bank: string | null }> = []
  let entries = 0
  if (rec) {
    try {
      const parsed = parse(body)
      const uniq = new Set<string>()
      for (const b of parsed.batches) for (const e of b.entries) { entries++; uniq.add(e.routing) }
      for (const r of uniq) {
        const info = await lookupRouting(r)
        routing.push({ routing: r, checksumValid: isValidRouting(r), found: !!info, active: info?.active ?? false, bank: info ? info.name : null })
      }
    } catch { /* malformed file - errors already captured by validate */ }
  }

  chInsert('achkit.usage_events', [{
    api_key: apiKey, customer_id: rec?.customerId || '', tier: rec ? rec.tier : 'demo',
    endpoint: 'validate', ok: ok ? 1 : 0, entries, routing_checked: routing.length,
    ip: getRequestIP(event, { xForwardedFor: true }) || '',
  }]).catch(() => {})

  const res: Record<string, unknown> = { ok, errors: errors.slice(0, 500), tier: rec ? rec.tier : 'demo' }
  if (rec) {
    res.routing = routing
    const rules = checkRules(body)
    res.rulesVersion = rules.rulesVersion
    res.ruleWarnings = rules.warnings
  }
  return res
})
