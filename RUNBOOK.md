# achkit - operations runbook

Everything needed to manage achkit end to end. Keep this current on every change.

## What it is

Developer-first NACHA ACH file toolkit. Free MIT library (npm + PyPI, byte-identical)
is the distribution funnel; the hosted validation API on achkit.com is the paid,
metered value (live routing/ABA data, pushed NACHA rule updates, return monitoring).

## Repository

- GitHub: `github.com/achkit/achkit` (public, org `achkit`).
- Commits authored `TikTool <271127222+tiktooldev@users.noreply.github.com>`. NEVER
  Claude/AI co-author or collaborator.
- Layout: `js/` (npm TS package), `py/` (PyPI package), `site/` (Nuxt 4 site),
  `reference.ach` (golden file both packages reproduce byte-for-byte, pinned LF).

## Packages

- npm `achkit`, PyPI `achkit`. Version lockstep in `js/package.json` +
  `py/pyproject.toml`.
- Publish = CI only. Bump both, tag `vX.Y.Z`, `gh release create vX.Y.Z` ->
  `publish-npm` (`--provenance`, secret `NPM_TOKEN`) + `publish-pypi`
  (secret `PYPI_API_TOKEN`) fire. `ci.yml` runs build+test on push/PR.
- Verify after publish: `npm i achkit` + `pip install achkit`, run a build.

## Site hosting (Plesk, NOT Cloudflare Pages, NEVER Passenger)

- Box: `debian@148.113.228.60` (sudo), Plesk Obsidian 18, node 22.
- App dir: `/opt/achkit-site` (git clone of the repo). Build the `site/` subdir.
- Runtime: pm2 (root) process `achkit-site` = `node .output/server/index.mjs`,
  `NITRO_PRESET=node-server`, `PORT=3210 HOST=127.0.0.1`. `pm2 save` done; boots
  on reboot via the pm2-root unit.
- nginx: Plesk vhost proxies to the pm2 port via a REGEX location (avoids the
  duplicate `location /` clash) in
  `/var/www/vhosts/system/achkit.com/conf/vhost_nginx.conf`:
  `location ~ ^/ { proxy_pass http://127.0.0.1:3210; ... }`. Apply changes with
  `plesk sbin httpdmng --reconfigure-domain achkit.com` then `nginx -t`.
- Cloudflare fronts it: apex + www PROXIED (orange) -> box. `mail`/`webmail`
  A records stay DNS-only (grey). SSL: LE cert on origin (Plesk auto-renew) for
  apex+www+webmail+mail; CF SSL mode compatible. Cleaner future option: a CF
  Origin CA cert + Full(strict).

## Deploy

`site/deploy.sh` on the box: `git pull` in /opt/achkit-site ->
`cd site && npm ci && NITRO_PRESET=node-server npm run build` ->
`pm2 restart achkit-site` -> health check `curl -f localhost:3210/__health`.
Purge CF cache for static assets if needed.

## DNS (Cloudflare zone 00654753de1aad83f674f3d2151719a2)

- apex A + www A -> 148.113.228.60 (proxied)
- mail A + webmail A -> 148.113.228.60 (DNS only)
- MX 10 mail.achkit.com; SPF; DKIM `default._domainkey`; DMARC `_dmarc`.
- Operator's all-zones CF token writes DNS on any zone; box `CF_API_TOKEN` is
  read-only on new zones. DNS token lacks Zone-Settings edit (can't change SSL mode).

## Mail

- `hello@achkit.com` mailbox on Plesk, forwards to gkarmas@gmail.com (keeps copy),
  DKIM/SPF/DMARC/SRS, gmail accepts (250). Webmail https://webmail.achkit.com.
- Creds in `/root/achkit-mail-creds.txt` on the box.
- `achkit.co` (typo domain) also set up the same way - it exists only because npm
  registration used a `hello@achkit.co` typo and email-OTP locked the account;
  post-recovery the npm/PyPI primary email should move to `hello@achkit.com`.

## Paid product - what we host (the real value)

The free lib does math (checksum/padding/control totals). The hosted API adds what
a local lib CANNOT: **live routing verification against the FedACH participant
directory** (is the routing a real, active ACH bank + which bank), always-current
NACHA rules, and return monitoring. This is the metered moat.

- `server/utils/routing.ts` - real-time lookup from Dragonfly (`achkit:routing:<n>`).
- `GET /api/routing/:number` (paid) - verify one routing: real+active bank + checksum.
- `POST /api/validate` - free demo = checksum only; keyed tiers also cross-check
  every entry's routing vs the directory and return `routing[]`.
- **Directory ingester** `site/scripts/load-routing.mjs` - loads Dragonfly + CH.
  Reads the official Fed fixed-width file at `site/data/FedACHdir.txt` if present,
  else a verified seed (10 banks). BEFORE SELLING: drop the real Fed file and re-run
  (`node scripts/load-routing.mjs` on the box) - the seed is a demo, not full data.
- Analytics: every call logged to `achkit.usage_events` (ClickHouse); monthly limits
  via Dragonfly counters (`achkit:usage:<key>:<yyyymm>`). Tables: `achkit.usage_events`,
  `achkit.routing_directory`. `server/utils/clickhouse.ts` = chQuery/chInsert/ch.

## Billing (Stripe, embedded on-site, no external redirect)

- Tiers single source: `site/server/utils/tiers.ts` - **Pro** $29/mo (10k
  validations), **Ultra** $99/mo (unlimited). Two tiers only, no "contact us".
- Flow: pricing button -> `POST /api/billing/checkout` (embedded Checkout Session)
  -> Stripe.js mounts on our page -> `POST /api/stripe/webhook` (signature-verified)
  issues/rotates/revokes the API key in Dragonfly -> `/billing/success` shows it.
- Plan switch with proration: `POST /api/billing/change` (`proration_behavior:
  create_prorations`), on-site.
- Store: Dragonfly (`achkit:key:*`, `achkit:customer:*:key`, `achkit:usage:*`).
- Config = env on the box, NOT in git: `/opt/achkit-site/site/.env` (NUXT_*
  vars) loaded by `/opt/achkit-site/site/ecosystem.config.cjs` (pm2, box-only,
  gitignored). Keys: `NUXT_STRIPE_SECRET`, `NUXT_PUBLIC_STRIPE_PUBLISHABLE`,
  `NUXT_STRIPE_WEBHOOK_SECRET`, `NUXT_PRICE_PRO`, `NUXT_PRICE_ULTRA`,
  `NUXT_CLICKHOUSE_*`, `NUXT_DRAGONFLY_URL`. pm2 process started via the ecosystem
  file so env survives restarts; `deploy.sh` restart preserves it.
- Webhook endpoint: `https://achkit.com/api/stripe/webhook`. Events:
  `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`.
- TO ACTIVATE: set `sk_`, `pk_`, and the two price IDs in `.env`, `pm2 restart
  achkit-site`. Webhook secret already set.

## Design system (brutalist-editorial / dayos)

Warm-gray `#e5e5e5` canvas, flat white/black cards, mint `#d1ffca` + voltage
`#fff100` accents on small elements only. Display = wide heavy `Archivo Black`
(NOT condensed), body Inter, mono JetBrains Mono (self-hosted via @nuxt/fonts).
Hero = assembled 3D block totem. Tokens in `site/app/assets/css/main.css`.
Before any design change ASK the operator for guidelines.

## Business model

Free lib = funnel (local/public work, zero marginal cost, become the default
package). Metered = only what must call our server (live data, hosted ops).
Never paywall the public-format local library.
