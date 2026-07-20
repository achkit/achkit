// Decode an ACH return file into structured return events. A return entry carries
// a type-99 addenda whose first 3 chars are the R-code (R01, R02, ...).
import { parse, describeReturn } from 'achkit'

export interface ReturnEvent {
  returnCode: string
  reason: string
  routing: string
  account: string
  name: string
  amountCents: number
  traceNumber: string
  batch: number
}

export function parseReturns(text: string): ReturnEvent[] {
  const parsed = parse(text)
  const events: ReturnEvent[] = []
  parsed.batches.forEach((b, bi) => {
    for (const e of b.entries) {
      for (const a of e.addenda) {
        if (a.type === '99') {
          const code = (a.info || '').slice(0, 3).toUpperCase()
          if (/^R\d\d$/.test(code)) {
            events.push({
              returnCode: code,
              reason: describeReturn(code) || 'Return',
              routing: e.routing,
              account: e.account,
              name: e.name,
              amountCents: e.amountCents,
              traceNumber: e.traceNumber,
              batch: bi + 1,
            })
          }
        }
      }
    }
  })
  return events
}
