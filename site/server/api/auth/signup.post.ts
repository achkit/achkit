import { randomBytes } from 'node:crypto'
import { classifyEmail } from '../../utils/spam'
import { getUser, upsertUser, hashPassword, normEmail } from '../../utils/auth'
import { sendMail } from '../../utils/mail'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const email = String(body.email || '')
  const password = String(body.password || '')

  const c = classifyEmail(email)
  if (!c.ok) throw createError({ statusCode: 400, statusMessage: c.reason })
  if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters.' })

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'anon'
  const rl = `achkit:signup:rl:${ip}`
  const n = await store().incr(rl)
  if (n === 1) await store().expire(rl, 3600)
  if (n > 10) throw createError({ statusCode: 429, statusMessage: 'Too many signups from this network. Try again later.' })

  const e = normEmail(email)
  if (await getUser(e)) throw createError({ statusCode: 409, statusMessage: 'That email already has an account - sign in instead.' })

  await upsertUser(e, { email: e, passwordHash: hashPassword(password), verified: '0', plan: 'free', createdAt: String(Date.now()) })
  const token = randomBytes(24).toString('hex')
  await store().set(`achkit:verify:${token}`, e, 'EX', 86400)
  const url = getRequestURL(event).origin + '/api/auth/verify?token=' + token
  await sendMail(e, 'Verify your achkit account',
    `<p>Confirm your email to finish creating your achkit account.</p><p><a href="${url}">Verify my email</a></p><p style="color:#888;font-size:13px">${url}</p>`)
  return { ok: true, needsVerify: true }
})
