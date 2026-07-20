import { upsertUser, createSession, setSessionCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || '')
  const email = token ? await store().get(`achkit:verify:${token}`).catch(() => null) : null
  if (!email) return sendRedirect(event, '/login?verify=expired')
  await upsertUser(email, { verified: '1' })
  await store().del(`achkit:verify:${token}`)
  setSessionCookie(event, await createSession(email))
  return sendRedirect(event, '/dashboard?welcome=1')
})
