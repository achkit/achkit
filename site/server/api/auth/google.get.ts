import { randomBytes } from 'node:crypto'

// Kick off Google OAuth: stash a CSRF state, redirect to the consent screen.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  if (!cfg.googleClientId) throw createError({ statusCode: 503, statusMessage: 'Google sign-in is not configured.' })

  const state = randomBytes(16).toString('hex')
  await store().set(`achkit:oauth:${state}`, '1', 'EX', 600)

  const params = new URLSearchParams({
    client_id: cfg.googleClientId,
    redirect_uri: getRequestURL(event).origin + '/api/auth/google/callback',
    response_type: 'code',
    scope: 'openid email',
    state,
    prompt: 'select_account',
  })
  return sendRedirect(event, 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString())
})
