import { lookupKey, bumpUsage } from '../utils/keys'
import { parseReturns } from '../utils/returns'
import { fireWebhooks } from '../utils/webhooks'

// Ultra: decode an ACH return file into R-code events and deliver them to the
// customer's registered webhooks.
export default defineEventHandler(async (event) => {
  const key = getHeader(event, 'x-api-key') || ''
  const rec = await lookupKey(key)
  if (!rec) throw createError({ statusCode: 401, statusMessage: 'A valid API key is required.' })
  if (rec.tier !== 'ultra') throw createError({ statusCode: 403, statusMessage: 'Return monitoring is an Ultra feature. Upgrade to Ultra.' })

  const body = await readRawBody(event, 'utf8')
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Send the ACH return file as the request body.' })
  if (body.length > 5 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'File exceeds the 5MB limit.' })

  const returns = parseReturns(body)
  await bumpUsage(key)
  for (const r of returns) fireWebhooks(rec.customerId, 'ach.return', r).catch(() => {})

  chInsert('achkit.usage_events', [{
    api_key: key, customer_id: rec.customerId, tier: rec.tier, endpoint: 'returns',
    ok: 1, entries: returns.length, routing_checked: 0, ip: getRequestIP(event, { xForwardedFor: true }) || '',
  }]).catch(() => {})

  return { count: returns.length, returns }
})
