// Accounts + sessions in Dragonfly. scrypt password hashing; opaque session
// tokens in an httpOnly cookie. Users: achkit:user:<email> (hash).
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE = 'achkit_session'
const SESSION_TTL = 60 * 60 * 24 * 30

const U = (e: string) => `achkit:user:${e}`
const S = (t: string) => `achkit:session:${t}`

export interface User {
  email: string
  verified: boolean
  plan: string // 'free' | 'pro' | 'ultra'
  key: string
  customerId: string
  createdAt: number
}

export function normEmail(e: string): string {
  return String(e).trim().toLowerCase()
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16)
  return salt.toString('hex') + ':' + scryptSync(pw, salt, 32).toString('hex')
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [saltHex, hashHex] = (stored || '').split(':')
  if (!saltHex || !hashHex) return false
  const dk = scryptSync(pw, Buffer.from(saltHex, 'hex'), 32)
  const a = Buffer.from(hashHex, 'hex')
  return a.length === dk.length && timingSafeEqual(a, dk)
}

function toUser(h: Record<string, string> | null): User | null {
  if (!h || !h.email) return null
  return {
    email: h.email,
    verified: h.verified === '1',
    plan: h.plan || 'free',
    key: h.key || '',
    customerId: h.customerId || '',
    createdAt: Number(h.createdAt) || 0,
  }
}

export async function getUser(email: string): Promise<User | null> {
  return toUser(await store().hgetall(U(normEmail(email))).catch(() => null))
}
export async function upsertUser(email: string, fields: Record<string, string>): Promise<void> {
  await store().hset(U(normEmail(email)), fields)
}
export async function getPasswordHash(email: string): Promise<string | null> {
  return (await store().hget(U(normEmail(email)), 'passwordHash').catch(() => null)) || null
}
export async function userByCustomer(customerId: string): Promise<string | null> {
  return (await store().get(`achkit:customer:${customerId}:email`).catch(() => null)) || null
}

export async function createSession(email: string): Promise<string> {
  const t = randomBytes(24).toString('hex')
  await store().set(S(t), normEmail(email), 'EX', SESSION_TTL)
  return t
}
export async function sessionUser(event: H3Event): Promise<User | null> {
  const t = getCookie(event, COOKIE)
  if (!t) return null
  const email = await store().get(S(t)).catch(() => null)
  return email ? getUser(email) : null
}
export function setSessionCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_TTL })
}
export async function endSession(event: H3Event): Promise<void> {
  const t = getCookie(event, COOKIE)
  if (t) await store().del(S(t))
  setCookie(event, COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function requireUser(event: H3Event): Promise<User> {
  const u = await sessionUser(event)
  if (!u) throw createError({ statusCode: 401, statusMessage: 'Sign in first.' })
  return u
}
