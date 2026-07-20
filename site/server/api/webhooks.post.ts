import { lookupKey } from '../utils/keys'
import { addWebhook } from '../utils/webhooks'

// Ultra: register a webhook URL for return events.
export default defineEventHandler(async (event) => {
  const key = getHeader(event, 'x-api-key') || ''
  const rec = await lookupKey(key)
  if (!rec) throw createError({ statusCode: 401, statusMessage: 'A valid API key is required.' })
  if (rec.tier !== 'ultra') throw createError({ statusCode: 403, statusMessage: 'Webhooks are an Ultra feature. Upgrade to Ultra.' })

  const body = await readBody<{ url?: string }>(event)
  const url = String(body?.url || '')
  if (!/^https:\/\/.+/.test(url)) throw createError({ statusCode: 400, statusMessage: 'Provide an https webhook URL.' })

  const wh = await addWebhook(rec.customerId, url)
  return { id: wh.id, url: wh.url, secret: wh.secret }
})
