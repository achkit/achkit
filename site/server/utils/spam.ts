// Signup gate: reject disposable domains, and require a work email (block free
// consumer providers - those users sign in with Google instead).
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org',
  'throwawaymail.com', 'yopmail.com', 'getnada.com', 'trashmail.com', 'sharklasers.com',
  'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com', 'mohmal.com',
])
const FREE = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com',
  'gmx.com', 'gmx.net', 'mail.com', 'zoho.com', 'yandex.com', 'pm.me',
])

export function classifyEmail(email: string): { ok: boolean; reason?: string } {
  const m = /^[^@\s]+@([a-z0-9.-]+\.[a-z]{2,})$/.exec(String(email).trim().toLowerCase())
  if (!m) return { ok: false, reason: 'Enter a valid email address.' }
  const domain = m[1]
  if (DISPOSABLE.has(domain)) return { ok: false, reason: 'Disposable email addresses are not allowed.' }
  if (FREE.has(domain)) return { ok: false, reason: 'Use your work email, or sign in with Google.' }
  return { ok: true }
}
