import { lookupKey } from '../../utils/keys'
import { deleteWebhook } from '../../utils/webhooks'

export default defineEventHandler(async (event) => {
  const key = getHeader(event, 'x-api-key') || ''
  const rec = await lookupKey(key)
  if (!rec) throw createError({ statusCode: 401, statusMessage: 'A valid API key is required.' })
  if (rec.tier !== 'ultra') throw createError({ statusCode: 403, statusMessage: 'Webhooks are an Ultra feature.' })
  const id = getRouterParam(event, 'id') || ''
  await deleteWebhook(rec.customerId, id)
  return { deleted: true }
})
