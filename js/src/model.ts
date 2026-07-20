// The typed model. One model powers generate, parse and validate so the three
// stay in lockstep. All money is integer cents; all dates are 'YYYY-MM-DD'.

export type SecCode = 'PPD' | 'CCD' | 'WEB' | 'TEL' | 'CTX'
export type AccountType = 'checking' | 'savings'
export type Direction = 'credit' | 'debit'

// NACHA transaction codes for live (2x) and prenotification (2x+1) entries.
export const TXN: Record<string, number> = {
  'checking:credit': 22,
  'checking:debit': 27,
  'savings:credit': 32,
  'savings:debit': 37,
  'checking:credit:prenote': 23,
  'checking:debit:prenote': 28,
  'savings:credit:prenote': 33,
  'savings:debit:prenote': 38,
}

export interface FileOptions {
  originDfi: string // 9-digit routing of the originating bank
  companyId: string // 10-char company id (usually 1 + EIN)
  destinationRouting?: string // immediate destination routing (defaults to originDfi)
  destinationName?: string
  originName?: string
  fileIdModifier?: string // 'A'..'Z'/'0'..'9', one per file per day
  creationDate?: Date
}

export interface EntryInput {
  name: string
  routing: string // receiving DFI 9-digit routing number
  account: string
  amountCents: number
  accountType?: AccountType // default 'checking'
  idNumber?: string // individual/receiver id
  prenote?: boolean
  addenda?: string // single 05 addenda payment-related info
}

export interface BatchOptions {
  sec: SecCode
  description: string // company entry description, e.g. 'PAYROLL'
  effectiveDate: string // 'YYYY-MM-DD'
  descriptiveDate?: string
  discretionaryData?: string
}

export interface AddendaModel {
  info: string
  sequence: number
}

export interface EntryModel {
  txnCode: number
  routing: string
  checkDigit: string
  account: string
  amountCents: number
  idNumber: string
  name: string
  addendaFlag: boolean
  traceNumber: string
  direction: Direction
  addenda: AddendaModel[]
}

export interface BatchModel {
  serviceClass: number // 200 mixed / 220 credits only / 225 debits only
  companyName: string
  discretionaryData: string
  companyId: string
  sec: SecCode
  description: string
  descriptiveDate: string
  effectiveDate: string // YYMMDD
  originDfi8: string
  batchNumber: number
  entries: EntryModel[]
}

export interface FileModel {
  destinationRouting: string
  originRouting: string
  creationDate: string // YYMMDD
  creationTime: string // HHMM
  fileIdModifier: string
  destinationName: string
  originName: string
  companyId: string
  batches: BatchModel[]
}
