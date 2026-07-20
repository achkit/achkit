import { sendMail } from '../utils/mail'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const email = String(body.email || '').trim().slice(0, 200)
  const message = String(body.message || '').trim().slice(0, 5000)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid email and a message.' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'anon'
  const rl = `achkit:contact:rl:${ip}`
  const n = await store().incr(rl)
  if (n === 1) await store().expire(rl, 3600)
  if (n > 5) throw createError({ statusCode: 429, statusMessage: 'Too many messages. Try again later.' })

  const esc = (s: string) => s.replace(/</g, '&lt;')
  await sendMail('hello@achkit.com', `Contact form: ${esc(email)}`,
    `<p><b>From:</b> ${esc(email)}</p><p>${esc(message).replace(/\n/g, '<br>')}</p>`)
  return { ok: true }
})
