// Fixed-width NACHA field primitives. Every record is exactly 94 characters;
// these helpers guarantee width and justification so callers never count bytes.

export const RECORD_LEN = 94
export const BLOCKING_FACTOR = 10

const ASCII = /[^\x20-\x7E]/g

/** Left-justified, space-padded, upper-cased alphanumeric field. Truncates to len. */
export function alnum(v: string | number | undefined, len: number): string {
  const s = String(v ?? '')
    .toUpperCase()
    .replace(ASCII, ' ')
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length)
}

/** Right-justified, zero-padded numeric field. Throws if the value overflows len. */
export function num(v: string | number | undefined, len: number): string {
  const s = String(v ?? 0).replace(/[^0-9]/g, '')
  if (s.length > len) throw new AchError('FIELD_OVERFLOW', `numeric field overflow: ${s} > ${len} digits`)
  return s.padStart(len, '0')
}

/** Money in integer cents rendered as a right-justified zero-padded field. */
export function money(cents: number, len: number): string {
  if (!Number.isInteger(cents) || cents < 0) throw new AchError('BAD_AMOUNT', `amount must be a non-negative integer of cents, got ${cents}`)
  return num(cents, len)
}

export function digits(v: string): string {
  return String(v).replace(/[^0-9]/g, '')
}

export class AchError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'AchError'
    this.code = code
  }
}
