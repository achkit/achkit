import { getUser, getPasswordHash, verifyPassword, createSession, setSessionCookie, normEmail } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const e = normEmail(String(body.email || ''))
  const password = String(body.password || '')

  const user = await getUser(e)
  const hash = user ? await getPasswordHash(e) : null
  if (!user || !hash || !verifyPassword(password, hash)) {
    throw createError({ statusCode: 401, statusMessage: 'Wrong email or password.' })
  }
  if (!user.verified) throw createError({ statusCode: 403, statusMessage: 'Verify your email first - check your inbox.' })

  setSessionCookie(event, await createSession(e))
  return { ok: true, email: e, plan: user.plan }
})
