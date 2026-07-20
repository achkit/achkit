import { sessionUser } from '../../utils/auth'
import { TIERS } from '../../utils/tiers'

export default defineEventHandler(async (event) => {
  const u = await sessionUser(event)
  if (!u) return { user: null }
  let used = 0
  if (u.key) {
    const month = new Date().toISOString().slice(0, 7).replace('-', '')
    used = Number(await store().get(`achkit:usage:${u.key}:${month}`).catch(() => 0)) || 0
  }
  const limit = u.plan === 'pro' ? TIERS.pro.limitPerMonth : u.plan === 'ultra' ? TIERS.ultra.limitPerMonth : 0
  return { user: { email: u.email, plan: u.plan, key: u.key, verified: u.verified }, usage: { used, limit } }
})
