// Builder + renderer. Produces a spec-correct NACHA file: balanced control
// records, entry-hash, and block padding are all computed here so the caller
// only describes intent.

import { alnum, num, money, digits, RECORD_LEN, BLOCKING_FACTOR, AchError } from './fields.js'
import { TXN, FileOptions, BatchOptions, EntryInput, FileModel, BatchModel, EntryModel } from './model.js'

function ymd(d: Date): string {
  const y = String(d.getFullYear()).slice(2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + m + day
}
function hm(d: Date): string {
  return String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0')
}
function toYYMMDD(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) throw new AchError('BAD_DATE', `date must be YYYY-MM-DD, got '${iso}'`)
  return m[1].slice(2) + m[2] + m[3]
}
function serviceClass(entries: EntryModel[]): number {
  const hasC = entries.some((e) => e.direction === 'credit')
  const hasD = entries.some((e) => e.direction === 'debit')
  if (hasC && hasD) return 200
  return hasC ? 220 : 225
}

export class Batch {
  readonly model: BatchModel
  constructor(model: BatchModel) {
    this.model = model
  }
  private add(input: EntryInput, direction: 'credit' | 'debit'): this {
    const routing = digits(input.routing)
    if (routing.length !== 9) throw new AchError('BAD_ROUTING', `routing must be 9 digits, got '${input.routing}'`)
    const type = input.accountType ?? 'checking'
    const key = `${type}:${direction}${input.prenote ? ':prenote' : ''}`
    const txnCode = TXN[key]
    if (!txnCode) throw new AchError('BAD_TXN', `no transaction code for ${key}`)
    const addenda = input.addenda ? [{ info: input.addenda, sequence: 1 }] : []
    this.model.entries.push({
      txnCode,
      routing: routing.slice(0, 8),
      checkDigit: routing[8],
      account: input.account,
      amountCents: input.prenote ? 0 : input.amountCents,
      idNumber: input.idNumber ?? '',
      name: input.name,
      addendaFlag: addenda.length > 0,
      traceNumber: '', // filled at render once trace sequence is known
      direction,
      addenda,
    })
    return this
  }
  credit(input: EntryInput): this {
    return this.add(input, 'credit')
  }
  debit(input: EntryInput): this {
    return this.add(input, 'debit')
  }
}

export class AchFile {
  readonly model: FileModel
  private constructor(model: FileModel) {
    this.model = model
  }

  static create(opts: FileOptions): AchFile {
    const origin = digits(opts.originDfi)
    if (origin.length !== 9) throw new AchError('BAD_ROUTING', `originDfi must be 9 digits, got '${opts.originDfi}'`)
    const dest = digits(opts.destinationRouting ?? opts.originDfi)
    const now = opts.creationDate ?? new Date()
    return new AchFile({
      destinationRouting: dest,
      originRouting: origin,
      creationDate: ymd(now),
      creationTime: hm(now),
      fileIdModifier: (opts.fileIdModifier ?? 'A').slice(0, 1).toUpperCase(),
      destinationName: opts.destinationName ?? '',
      originName: opts.originName ?? '',
      companyId: digits(opts.companyId).padStart(10, '0').slice(0, 10) || alnum(opts.companyId, 10).trim(),
      batches: [],
    })
  }

  batch(opts: BatchOptions & { companyName?: string; companyId?: string }): Batch {
    const model: BatchModel = {
      serviceClass: 200,
      companyName: opts.companyName ?? this.model.originName,
      discretionaryData: opts.discretionaryData ?? '',
      companyId: opts.companyId ?? this.model.companyId,
      sec: opts.sec,
      description: opts.description,
      descriptiveDate: opts.descriptiveDate ?? '',
      effectiveDate: toYYMMDD(opts.effectiveDate),
      originDfi8: this.model.originRouting.slice(0, 8),
      batchNumber: this.model.batches.length + 1,
      entries: [],
    }
    this.model.batches.push(model)
    return new Batch(model)
  }

  /** Render the complete file to its 94-char-per-line NACHA text form. */
  render(): string {
    const lines: string[] = []
    const f = this.model
    lines.push(fileHeader(f))

    let fileEntryAddenda = 0
    let fileHash = 0n
    let fileDebit = 0
    let fileCredit = 0

    f.batches.forEach((b, bi) => {
      b.serviceClass = serviceClass(b.entries)
      lines.push(batchHeader(b))
      let hash = 0n
      let debit = 0
      let credit = 0
      let count = 0
      b.entries.forEach((e, ei) => {
        const seq = String(ei + 1).padStart(7, '0')
        e.traceNumber = b.originDfi8 + seq
        lines.push(entryDetail(e))
        count++
        hash += BigInt(e.routing)
        if (e.direction === 'credit') credit += e.amountCents
        else debit += e.amountCents
        e.addenda.forEach((a) => {
          lines.push(addendaRecord(a, e.traceNumber))
          count++
        })
      })
      lines.push(batchControl(b, count, hash, debit, credit))
      fileEntryAddenda += count
      fileHash += hash
      fileDebit += debit
      fileCredit += credit
    })

    // block count includes header/control/filler: total lines rounded up /10
    const recordsBeforeFiller = lines.length + 1 // + file control
    const blockCount = Math.ceil(recordsBeforeFiller / BLOCKING_FACTOR)
    lines.push(fileControl(f, blockCount, fileEntryAddenda, fileHash, fileDebit, fileCredit))
    while (lines.length % BLOCKING_FACTOR !== 0) lines.push('9'.repeat(RECORD_LEN))
    return lines.join('\n') + '\n'
  }
}

function hash10(hash: bigint): string {
  const s = hash.toString()
  return s.length > 10 ? s.slice(-10) : s.padStart(10, '0')
}

function fileHeader(f: FileModel): string {
  return (
    '1' + // record type
    '01' + // priority
    ' ' + num(f.destinationRouting, 9) + // immediate destination
    ' ' + num(f.originRouting, 9) + // immediate origin
    f.creationDate +
    f.creationTime +
    alnum(f.fileIdModifier, 1) +
    '094' + // record size
    '10' + // blocking factor
    '1' + // format code
    alnum(f.destinationName, 23) +
    alnum(f.originName, 23) +
    alnum('', 8) // reference code
  )
}

function batchHeader(b: BatchModel): string {
  return (
    '5' +
    num(b.serviceClass, 3) +
    alnum(b.companyName, 16) +
    alnum(b.discretionaryData, 20) +
    alnum(b.companyId, 10) +
    alnum(b.sec, 3) +
    alnum(b.description, 10) +
    alnum(b.descriptiveDate, 6) +
    b.effectiveDate +
    alnum('', 3) + // settlement date (filled by ACH operator)
    '1' + // originator status code
    num(b.originDfi8, 8) +
    num(b.batchNumber, 7)
  )
}

function entryDetail(e: EntryModel): string {
  return (
    '6' +
    num(e.txnCode, 2) +
    num(e.routing, 8) +
    alnum(e.checkDigit, 1) +
    alnum(e.account, 17) +
    money(e.amountCents, 10) +
    alnum(e.idNumber, 15) +
    alnum(e.name, 22) +
    alnum('', 2) + // discretionary data
    (e.addendaFlag ? '1' : '0') +
    alnum(e.traceNumber, 15)
  )
}

function addendaRecord(a: { info: string; sequence: number }, trace: string): string {
  return (
    '7' +
    '05' + // addenda type
    alnum(a.info, 80) +
    num(a.sequence, 4) +
    num(trace.slice(-7), 7)
  )
}

function batchControl(b: BatchModel, count: number, hash: bigint, debit: number, credit: number): string {
  return (
    '8' +
    num(b.serviceClass, 3) +
    num(count, 6) +
    hash10(hash) +
    money(debit, 12) +
    money(credit, 12) +
    alnum(b.companyId, 10) +
    alnum('', 19) + // message authentication code
    alnum('', 6) + // reserved
    num(b.originDfi8, 8) +
    num(b.batchNumber, 7)
  )
}

function fileControl(f: FileModel, blockCount: number, entryAddenda: number, hash: bigint, debit: number, credit: number): string {
  return (
    '9' +
    num(f.batches.length, 6) +
    num(blockCount, 6) +
    num(entryAddenda, 8) +
    hash10(hash) +
    money(debit, 12) +
    money(credit, 12) +
    alnum('', 39) // reserved
  )
}
