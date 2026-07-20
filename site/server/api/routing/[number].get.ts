import { isValidRouting } from 'achkit'
import { lookupKey, bumpUsage } from '../../utils/keys'
import { lookupRouting } from '../../utils/routing'

// Paid: verify a routing number against the live FedACH participant directory.
// The free library can only checksum - it cannot tell you the bank is real/active.
export default defineEventHandler(async (event) => {
  const key = getHeader(event, 'x-api-key') || ''
  const rec = await lookupKey(key)
  if (!rec) throw createError({ statusCode: 401, statusMessage: 'A valid API key is required for routing verification.' })

  const raw = getRouterParam(event, 'number') || ''
  const d = raw.replace(/\D/g, '')
  if (d.length !== 9) throw createError({ statusCode: 400, statusMessage: 'Routing number must be 9 digits.' })

  const checksumValid = isValidRouting(d)
  const info = await lookupRouting(d)
  await bumpUsage(key)
  chInsert('achkit.usage_events', [{
    api_key: key, customer_id: rec.customerId, tier: rec.tier, endpoint: 'routing',
    ok: info ? 1 : 0, entries: 0, routing_checked: 1, ip: getRequestIP(event, { xForwardedFor: true }) || '',
  }]).catch(() => {})

  return {
    routing: d,
    checksumValid,
    found: !!info,
    active: info?.active ?? false,
    bank: info ? { name: info.name, city: info.city, state: info.state } : null,
  }
})
