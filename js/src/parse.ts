// Strict parser. Turns a NACHA text file back into the typed model without any
// positional slicing leaking into caller code. Unknown record types are ignored
// only if they are filler ('9' blocks); anything else raises.

import { RECORD_LEN, AchError } from './fields.js'

export interface ParsedAddenda {
  type: string
  info: string
  sequence: number
  entryDetailSequence: string
}
export interface ParsedEntry {
  txnCode: number
  routing: string // full 9-digit (8 + check digit)
  account: string
  amountCents: number
  idNumber: string
  name: string
  addendaFlag: boolean
  traceNumber: string
  addenda: ParsedAddenda[]
}
export interface ParsedBatch {
  serviceClass: number
  companyName: string
  companyId: string
  sec: string
  description: string
  effectiveDate: string // YYMMDD
  originDfi: string
  batchNumber: number
  entries: ParsedEntry[]
  control?: { entryAddendaCount: number; entryHash: string; totalDebit: number; totalCredit: number }
}
export interface ParsedFile {
  destinationRouting: string
  originRouting: string
  creationDate: string
  creationTime: string
  fileIdModifier: string
  batches: ParsedBatch[]
  control?: { batchCount: number; blockCount: number; entryAddendaCount: number; entryHash: string; totalDebit: number; totalCredit: number }
}

const int = (s: string) => parseInt(s.replace(/\D/g, '') || '0', 10)

export function parse(text: string): ParsedFile {
  const rows = text.split(/\r?\n/).filter((r) => r.length > 0)
  let file: ParsedFile | undefined
  let batch: ParsedBatch | undefined
  let entry: ParsedEntry | undefined

  for (const row of rows) {
    if (/^9+$/.test(row)) continue // block filler ('9' * 94), never a real record
    if (row.length !== RECORD_LEN) {
      throw new AchError('BAD_RECORD_LEN', `record is ${row.length} chars, expected ${RECORD_LEN}`)
    }
    const type = row[0]
    if (type === '1') {
      file = {
        destinationRouting: row.slice(3, 13).trim(),
        originRouting: row.slice(13, 23).trim(),
        creationDate: row.slice(23, 29),
        creationTime: row.slice(29, 33),
        fileIdModifier: row.slice(33, 34),
        batches: [],
      }
    } else if (type === '5') {
      batch = {
        serviceClass: int(row.slice(1, 4)),
        companyName: row.slice(4, 20).trim(),
        companyId: row.slice(40, 50).trim(),
        sec: row.slice(50, 53).trim(),
        description: row.slice(53, 63).trim(),
        effectiveDate: row.slice(69, 75),
        originDfi: row.slice(79, 87),
        batchNumber: int(row.slice(87, 94)),
        entries: [],
      }
      file?.batches.push(batch)
    } else if (type === '6') {
      entry = {
        txnCode: int(row.slice(1, 3)),
        routing: row.slice(3, 12),
        account: row.slice(12, 29).trim(),
        amountCents: int(row.slice(29, 39)),
        idNumber: row.slice(39, 54).trim(),
        name: row.slice(54, 76).trim(),
        addendaFlag: row[78] === '1',
        traceNumber: row.slice(79, 94),
        addenda: [],
      }
      batch?.entries.push(entry)
    } else if (type === '7') {
      entry?.addenda.push({
        type: row.slice(1, 3),
        info: row.slice(3, 83).trim(),
        sequence: int(row.slice(83, 87)),
        entryDetailSequence: row.slice(87, 94),
      })
    } else if (type === '8') {
      if (batch)
        batch.control = {
          entryAddendaCount: int(row.slice(4, 10)),
          entryHash: row.slice(10, 20),
          totalDebit: int(row.slice(20, 32)),
          totalCredit: int(row.slice(32, 44)),
        }
    } else if (type === '9') {
      if (file)
        file.control = {
          batchCount: int(row.slice(1, 7)),
          blockCount: int(row.slice(7, 13)),
          entryAddendaCount: int(row.slice(13, 21)),
          entryHash: row.slice(21, 31),
          totalDebit: int(row.slice(31, 43)),
          totalCredit: int(row.slice(43, 55)),
        }
    } else {
      throw new AchError('UNKNOWN_RECORD', `unknown record type '${type}'`)
    }
  }

  if (!file) throw new AchError('NO_FILE_HEADER', 'no file header (type 1) record found')
  return file
}
