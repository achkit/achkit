# achkit

**The ACH file toolkit for developers.** Generate, parse and validate NACHA ACH
files in a few lines. Fully typed. Zero dependencies. Returns and NOC included.
Available for both JavaScript/TypeScript and Python, with **byte-identical
output** across the two.

```
npm i achkit          pip install achkit
```

The NACHA format is 94-character fixed-width records, positional fields,
blocking factors of ten, and hash totals that must reconcile to the byte. One
off-by-one and your ODFI rejects the whole batch. achkit does the counting so
you describe intent instead.

## JavaScript / TypeScript

```ts
import { AchFile, parse, validate } from 'achkit'

const file = AchFile.create({ originDfi: '091000019', companyId: '1234567890' })

file.batch({ sec: 'PPD', description: 'PAYROLL', effectiveDate: '2026-07-22' })
    .credit({ name: 'Jane Doe', routing: '011401533', account: '0072', amountCents: 124050 })
    .debit({ name: 'ACME LLC', routing: '091000019', account: '1899', amountCents: 124050 })

const bytes = file.render()          // balanced batch, hash totals + block padding done
const { ok, errors } = validate(bytes)
const parsed = parse(bytes)          // every field typed, no positional slicing
```

## Python

```python
from achkit import AchFile, parse, validate

f = AchFile.create(origin_dfi="091000019", company_id="1234567890")
b = f.batch(sec="PPD", description="PAYROLL", effective_date="2026-07-22")
b.credit(name="Jane Doe", routing="011401533", account="0072", amount_cents=124050)
b.debit(name="ACME LLC", routing="091000019", account="1899", amount_cents=124050)

data = f.render()
result = validate(data)
parsed = parse(data)
```

## What's inside

- **Generate & parse** any NACHA file, round-trip safe.
- **Reconciliation validator** - ABA routing checksum, entry hash, batch and
  file control totals, blocking factor. Catches what an ODFI rejects on, before
  the file leaves your machine. Runs on any file, not just ones achkit made.
- **Returns & NOC** - R-code and C-code lookup for return processing.
- **SEC codes** - PPD, CCD, WEB, TEL, CTX and single 05 addenda.
- **Money is always integer cents. Dates are always `YYYY-MM-DD`.** No floats,
  no locale surprises.

## Hosted API client (paid)

The library is free and local. The hosted API adds what a local library can't -
**live routing verification against the FedACH participant directory**. Get an
API key at [achkit.com/dashboard](https://achkit.com/dashboard).

```ts
import { AchkitClient } from 'achkit'

const client = new AchkitClient({ apiKey: 'ak_...' })
const bank = await client.verifyRouting('021000021')
// { routing, checksumValid, found, active, bank: { name, city, state } }

const result = await client.validate(bytes) // reconciliation + live routing checks
```

```python
from achkit import AchkitClient

client = AchkitClient("ak_...")
bank = client.verify_routing("021000021")
result = client.validate(data)
```

Pro adds live routing verification + 10,000 validations/month; Ultra is unlimited
with return-file monitoring. See [achkit.com](https://achkit.com).

## License

MIT
