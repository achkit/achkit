// Reconciliation validator. Catches the errors an ODFI rejects a batch on:
// wrong record length, ABA routing checksum, entry-hash drift, unbalanced
// control totals, wrong batch/block counts. Runs on raw text so it validates
// files produced by anyone, not just achkit.

import { parse } from './parse.js'
import { RECORD_LEN, BLOCKING_FACTOR } from './fields.js'

export interface ValidationError {
  code: string
  field: string
  message: string
  batch?: number
}
export interface ValidationResult {
  ok: boolean
  errors: ValidationError[]
}

/** ABA routing-number check-digit (mod-10 weighted 3-7-1). */
export function isValidRouting(routing: string): boolean {
  const d = routing.replace(/\D/g, '')
  if (d.length !== 9) return false
  const w = [3, 7, 1, 3, 7, 1, 3, 7, 1]
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * w[i]
  return sum % 10 === 0
}

export function validate(text: string): ValidationResult {
  const errors: ValidationError[] = []
  const push = (code: string, field: string, message: string, batch?: number) => errors.push({ code, field, message, batch })

  const rows = text.split(/\r?\n/).filter((r) => r.length > 0)
  rows.forEach((r, i) => {
    if (r.length !== RECORD_LEN) push('BAD_RECORD_LEN', `line ${i + 1}`, `record is ${r.length} chars, expected ${RECORD_LEN}`)
  })
  if (rows.length % BLOCKING_FACTOR !== 0) push('BAD_BLOCKING', 'file', `file has ${rows.length} records, not a multiple of ${BLOCKING_FACTOR}`)

  let file
  try {
    file = parse(text)
  } catch (e: any) {
    push(e.code || 'PARSE_ERROR', 'file', e.message)
    return { ok: false, errors }
  }

  let fileHash = 0n
  let fileDebit = 0
  let fileCredit = 0
  let fileEntryAddenda = 0

  file.batches.forEach((b, bi) => {
    let hash = 0n
    let debit = 0
    let credit = 0
    let count = 0
    b.entries.forEach((e) => {
      count++
      hash += BigInt(e.routing.slice(0, 8))
      if (!isValidRouting(e.routing)) push('BAD_ROUTING_CHECKSUM', `entry ${e.name}`, `routing ${e.routing} fails ABA checksum`, bi + 1)
      // credit txn codes are 2x/3x even second digit 2; debits are 7/8
      const second = e.txnCode % 10
      if (second === 2 || second === 3) credit += e.amountCents
      else if (second === 7 || second === 8) debit += e.amountCents
      count += e.addenda.length
    })
    if (b.control) {
      if (b.control.entryAddendaCount !== count) push('BAD_BATCH_COUNT', `batch ${bi + 1} control`, `entry/addenda count ${b.control.entryAddendaCount} != ${count}`, bi + 1)
      if (Number(b.control.entryHash) !== Number(hashTrim(hash))) push('BAD_ENTRY_HASH', `batch ${bi + 1} control`, `entry hash ${b.control.entryHash} != ${hashTrim(hash)}`, bi + 1)
      if (b.control.totalDebit !== debit) push('BAD_BATCH_DEBIT', `batch ${bi + 1} control`, `total debit ${b.control.totalDebit} != ${debit}`, bi + 1)
      if (b.control.totalCredit !== credit) push('BAD_BATCH_CREDIT', `batch ${bi + 1} control`, `total credit ${b.control.totalCredit} != ${credit}`, bi + 1)
    }
    fileHash += hash
    fileDebit += debit
    fileCredit += credit
    fileEntryAddenda += count
  })

  if (file.control) {
    if (file.control.batchCount !== file.batches.length) push('BAD_FILE_BATCH_COUNT', 'file control', `batch count ${file.control.batchCount} != ${file.batches.length}`)
    if (file.control.entryAddendaCount !== fileEntryAddenda) push('BAD_FILE_COUNT', 'file control', `entry/addenda count ${file.control.entryAddendaCount} != ${fileEntryAddenda}`)
    if (Number(file.control.entryHash) !== Number(hashTrim(fileHash))) push('BAD_FILE_HASH', 'file control', `entry hash ${file.control.entryHash} != ${hashTrim(fileHash)}`)
    if (file.control.totalDebit !== fileDebit) push('BAD_FILE_DEBIT', 'file control', `total debit ${file.control.totalDebit} != ${fileDebit}`)
    if (file.control.totalCredit !== fileCredit) push('BAD_FILE_CREDIT', 'file control', `total credit ${file.control.totalCredit} != ${fileCredit}`)
    const expectedBlocks = Math.ceil(rows.length / BLOCKING_FACTOR)
    if (file.control.blockCount !== expectedBlocks) push('BAD_BLOCK_COUNT', 'file control', `block count ${file.control.blockCount} != ${expectedBlocks}`)
  }

  return { ok: errors.length === 0, errors }
}

function hashTrim(hash: bigint): string {
  const s = hash.toString()
  return s.length > 10 ? s.slice(-10) : s
}
