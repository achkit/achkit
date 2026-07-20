// Current NACHA rule checks, versioned. The free library validates format +
// reconciliation; this layer flags rule/compliance issues against the current
// ruleset and returns the ruleset version so callers know they are current.
// Bump RULES_VERSION whenever NACHA rules change - that freshness is the paid value.
import { parse } from 'achkit'

export const RULES_VERSION = '2026.07'

export interface RuleWarning {
  code: string
  message: string
  batch?: number
}

const SAME_DAY_ENTRY_CAP = 1_000_000_00 // $1,000,000 per entry (Same Day ACH limit), in cents
const PRENOTE_TXN = new Set([23, 28, 33, 38])
const ALLOWED_SEC = new Set(['PPD', 'CCD', 'WEB', 'TEL', 'CTX', 'IAT', 'ARC', 'BOC', 'POP', 'RCK'])

function ymd(yymmdd: string): Date | null {
  const m = /^(\d{2})(\d{2})(\d{2})$/.exec(yymmdd || '')
  if (!m) return null
  return new Date(2000 + Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

export function checkRules(text: string, today = new Date()): { rulesVersion: string; warnings: RuleWarning[] } {
  const warnings: RuleWarning[] = []
  let parsed
  try {
    parsed = parse(text)
  } catch {
    return { rulesVersion: RULES_VERSION, warnings }
  }

  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  parsed.batches.forEach((b, bi) => {
    const n = bi + 1
    if (b.sec && !ALLOWED_SEC.has(b.sec)) {
      warnings.push({ code: 'SEC_UNKNOWN', message: `SEC code "${b.sec}" is not a currently recognized code.`, batch: n })
    }
    const eff = ymd(b.effectiveDate)
    if (eff && eff < t0) {
      warnings.push({ code: 'EFFECTIVE_DATE_PAST', message: `Effective date ${b.effectiveDate} is in the past - your ODFI may reject or re-date it.`, batch: n })
    }
    for (const e of b.entries) {
      if (PRENOTE_TXN.has(e.txnCode) && e.amountCents !== 0) {
        warnings.push({ code: 'PRENOTE_NONZERO', message: `Prenotification entry for ${e.name} must be $0, found ${e.amountCents} cents.`, batch: n })
      }
      if (e.amountCents > SAME_DAY_ENTRY_CAP) {
        warnings.push({ code: 'AMOUNT_OVER_SAMEDAY_CAP', message: `Entry ${e.name} is ${(e.amountCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} - over the $1,000,000 Same Day ACH per-entry limit.`, batch: n })
      }
      if ((b.sec === 'WEB' || b.sec === 'TEL') && (e.txnCode % 10 === 2 || e.txnCode % 10 === 3)) {
        warnings.push({ code: 'WEB_TEL_CREDIT', message: `${b.sec} entries are debit-only for consumer accounts; ${e.name} looks like a credit.`, batch: n })
      }
    }
  })
  return { rulesVersion: RULES_VERSION, warnings }
}
