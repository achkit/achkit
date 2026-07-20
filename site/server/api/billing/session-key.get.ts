// The success page calls this with the Checkout session id to read the API key
// the webhook issued. Short-lived, one lookup.
export default defineEventHandler(async (event) => {
  const { session_id } = getQuery(event)
  if (!session_id || typeof session_id !== 'string') throw createError({ statusCode: 400, statusMessage: 'Missing session id.' })
  const key = await store().get(`achkit:session:${session_id}:key`).catch(() => null)
  return { key: key || null, status: key ? 'ready' : 'pending' }
})
