// FedACH participant directory ingester. Loads Dragonfly (real-time lookup) and
// ClickHouse (directory of record). Reads the official Fed fixed-width file at
// data/FedACHdir.txt when present; otherwise seeds a verified subset so the
// routing-verification feature works end to end.
//
// Run on the box:  node scripts/load-routing.mjs
// Full data: drop the Fed "FedACH Participants" file at data/FedACHdir.txt first.

import Redis from 'ioredis'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const FED_FILE = join(HERE, '..', 'data', 'FedACHdir.txt')

const redis = new Redis(process.env.DRAGONFLY_URL || 'redis://127.0.0.1:6379')
const CH_URL = process.env.CLICKHOUSE_URL || 'http://127.0.0.1:8123'
const CH_HEADERS = {
  'X-ClickHouse-User': process.env.CLICKHOUSE_USER || 'default',
  'X-ClickHouse-Key': process.env.CLICKHOUSE_PASSWORD || '',
}

// Fed ACH directory record (fixed width). Offsets are 0-based slices.
function parseFedFile(text) {
  const out = []
  for (const line of text.split(/\r?\n/)) {
    if (line.length < 129) continue
    const routing = line.slice(0, 9).trim()
    if (!/^\d{9}$/.test(routing)) continue
    out.push({
      routing,
      name: line.slice(35, 71).trim(),
      city: line.slice(107, 127).trim(),
      state: line.slice(127, 129).trim(),
      active: 1,
    })
  }
  return out
}

// Verified seed - real ACH-participating institutions. Replaced wholesale by the
// Fed file when present.
const SEED = [
  { routing: '021000021', name: 'JPMORGAN CHASE BANK', city: 'NEW YORK', state: 'NY', active: 1 },
  { routing: '121000248', name: 'WELLS FARGO BANK', city: 'MINNEAPOLIS', state: 'MN', active: 1 },
  { routing: '091000019', name: 'WELLS FARGO BANK', city: 'MINNEAPOLIS', state: 'MN', active: 1 },
  { routing: '026009593', name: 'BANK OF AMERICA', city: 'RICHMOND', state: 'VA', active: 1 },
  { routing: '011000015', name: 'FEDERAL RESERVE BANK', city: 'BOSTON', state: 'MA', active: 1 },
  { routing: '011401533', name: 'KEY BANK', city: 'ALBANY', state: 'NY', active: 1 },
  { routing: '322271627', name: 'JPMORGAN CHASE BANK', city: 'TAMPA', state: 'FL', active: 1 },
  { routing: '031176110', name: 'CAPITAL ONE', city: 'GLEN ALLEN', state: 'VA', active: 1 },
  { routing: '111000025', name: 'FEDERAL RESERVE BANK', city: 'DALLAS', state: 'TX', active: 1 },
  { routing: '124003116', name: 'WELLS FARGO BANK', city: 'SALT LAKE CITY', state: 'UT', active: 1 },
]

async function chExec(sql) {
  const r = await fetch(CH_URL, { method: 'POST', headers: CH_HEADERS, body: sql })
  if (!r.ok) throw new Error('CH ' + r.status + ' ' + (await r.text()))
}

async function main() {
  const source = existsSync(FED_FILE) ? 'FedACHdir.txt' : 'seed'
  const rows = source === 'FedACHdir.txt' ? parseFedFile(readFileSync(FED_FILE, 'utf8')) : SEED
  console.log(`loading ${rows.length} routing records from ${source}`)

  // Dragonfly: hash per routing for real-time lookup.
  let pipe = redis.pipeline()
  let n = 0
  for (const r of rows) {
    pipe.hset(`achkit:routing:${r.routing}`, { name: r.name, city: r.city, state: r.state, active: String(r.active) })
    if (++n % 2000 === 0) { await pipe.exec(); pipe = redis.pipeline() }
  }
  await pipe.exec()
  await redis.set('achkit:routing:count', String(rows.length))

  // ClickHouse: directory of record.
  const body = 'INSERT INTO achkit.routing_directory (routing, name, city, state, active) FORMAT JSONEachRow\n' +
    rows.map((r) => JSON.stringify({ routing: r.routing, name: r.name, city: r.city, state: r.state, active: r.active })).join('\n')
  await chExec(body)

  console.log(`loaded ${rows.length} into Dragonfly + ClickHouse (source: ${source})`)
  await redis.quit()
}

main().catch((e) => { console.error(e); process.exit(1) })
