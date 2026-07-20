// ClickHouse over HTTP - analytics + directory storage. Same shape as tiktools:
// chQuery for reads, chInsert for events, ch() to escape string literals.

function auth() {
  const cfg = useRuntimeConfig()
  return {
    url: cfg.clickhouseUrl,
    headers: { 'X-ClickHouse-User': cfg.clickhouseUser, 'X-ClickHouse-Key': cfg.clickhousePassword },
  }
}

/** Escape a string literal before concatenating into SQL. */
export function ch(s: string): string {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export async function chQuery<T = any>(sql: string): Promise<T[]> {
  const { url, headers } = auth()
  const res = await $fetch<string>(url, {
    method: 'POST',
    headers,
    body: sql + ' FORMAT JSONEachRow',
    responseType: 'text',
  })
  const t = (res || '').trim()
  return t ? t.split('\n').map((l) => JSON.parse(l) as T) : []
}

export async function chInsert(table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (!rows.length) return
  const { url, headers } = auth()
  const body = `INSERT INTO ${table} FORMAT JSONEachRow\n` + rows.map((r) => JSON.stringify(r)).join('\n')
  await $fetch(url, { method: 'POST', headers, body }).catch((e) => console.error('[ch] insert failed', e?.message))
}
