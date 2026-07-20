import { getUser, upsertUser, createSession, setSessionCookie, normEmail } from '../../../utils/auth'

// Exchange the code, read the verified email from the id_token, sign the user in
// (creating the account on first login). Google users skip the work-email gate.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const q = getQuery(event)
  const code = String(q.code || '')
  const state = String(q.state || '')

  const known = state && (await store().get(`achkit:oauth:${state}`).catch(() => null))
  if (!code || !known) return sendRedirect(event, '/login?verify=expired')
  await store().del(`achkit:oauth:${state}`)

  const tok = await $fetch<{ id_token?: string }>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: cfg.googleClientId,
      client_secret: cfg.googleClientSecret,
      redirect_uri: getRequestURL(event).origin + '/api/auth/google/callback',
      grant_type: 'authorization_code',
    }),
  }).catch(() => null)
  if (!tok?.id_token) return sendRedirect(event, '/login?verify=expired')

  // id_token came directly from Google over TLS - decode its payload.
  let payload: any = null
  try {
    payload = JSON.parse(Buffer.from(tok.id_token.split('.')[1]!, 'base64url').toString('utf8'))
  } catch {}
  const email = payload?.email_verified ? normEmail(String(payload.email || '')) : ''
  if (!email) return sendRedirect(event, '/login?verify=expired')

  if (!(await getUser(email))) {
    await upsertUser(email, { email, verified: '1', plan: 'free', google: '1', createdAt: String(Date.now()) })
  } else {
    await upsertUser(email, { verified: '1', google: '1' })
  }
  setSessionCookie(event, await createSession(email))
  return sendRedirect(event, '/dashboard')
})
