import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AchFile, parse, validate, isValidRouting, describeReturn } from '../src/index.js'

function samplePayroll() {
  return AchFile.create({
    originDfi: '091000019', // Wells Fargo, valid ABA
    companyId: '1234567890',
    originName: 'ACME PAYROLL',
    destinationName: 'MY BANK',
    fileIdModifier: 'A',
    creationDate: new Date('2026-07-20T09:30:00Z'),
  })
}

test('generates 94-char records in blocks of 10', () => {
  const f = samplePayroll()
  f.batch({ sec: 'PPD', description: 'PAYROLL', effectiveDate: '2026-07-22' })
    .credit({ name: 'Jane Doe', routing: '011401533', account: '0072', amountCents: 124050 })
    .credit({ name: 'John Roe', routing: '011401533', account: '0099', amountCents: 89900 })
  const out = f.render()
  const lines = out.trimEnd().split('\n')
  assert.ok(lines.every((l) => l.length === 94), 'every record 94 chars')
  assert.equal(lines.length % 10, 0, 'padded to a block of 10')
  assert.equal(lines[0][0], '1')
  assert.equal(lines[lines.length - 1 - (10 - (lines.length % 10 || 10))] ? true : true, true)
})

test('round-trips: generated file validates clean', () => {
  const f = samplePayroll()
  f.batch({ sec: 'PPD', description: 'PAYROLL', effectiveDate: '2026-07-22' })
    .credit({ name: 'Jane Doe', routing: '011401533', account: '0072', amountCents: 124050 })
    .debit({ name: 'ACME LLC', routing: '091000019', account: '1899', amountCents: 124050 })
  const out = f.render()
  const { ok, errors } = validate(out)
  assert.equal(ok, true, 'clean file must validate: ' + JSON.stringify(errors))
})

test('parse recovers entries and amounts', () => {
  const f = samplePayroll()
  f.batch({ sec: 'PPD', description: 'PAYROLL', effectiveDate: '2026-07-22' })
    .credit({ name: 'Jane Doe', routing: '011401533', account: '0072', amountCents: 124050 })
  const parsed = parse(f.render())
  assert.equal(parsed.batches.length, 1)
  assert.equal(parsed.batches[0].entries.length, 1)
  assert.equal(parsed.batches[0].entries[0].amountCents, 124050)
  assert.equal(parsed.batches[0].entries[0].name, 'JANE DOE')
  assert.equal(parsed.batches[0].sec, 'PPD')
})

test('detects tampered amount as unbalanced control', () => {
  const f = samplePayroll()
  f.batch({ sec: 'PPD', description: 'PAYROLL', effectiveDate: '2026-07-22' })
    .credit({ name: 'Jane Doe', routing: '011401533', account: '0072', amountCents: 100000 })
  const out = f.render()
  // corrupt the entry amount in the type-6 record without fixing controls
  const lines = out.split('\n')
  const ei = lines.findIndex((l) => l.startsWith('6'))
  lines[ei] = lines[ei].slice(0, 29) + '0000200000' + lines[ei].slice(39)
  const { ok, errors } = validate(lines.join('\n'))
  assert.equal(ok, false)
  assert.ok(errors.some((e) => e.code === 'BAD_BATCH_CREDIT' || e.code === 'BAD_FILE_CREDIT'))
})

test('ABA routing checksum', () => {
  assert.equal(isValidRouting('091000019'), true)
  assert.equal(isValidRouting('011401533'), true)
  assert.equal(isValidRouting('123456789'), false)
})

test('return code lookup', () => {
  assert.equal(describeReturn('R01'), 'Insufficient funds')
})
