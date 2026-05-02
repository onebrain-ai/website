# Waitlist Setup (Cloudflare D1)

The waitlist form on the Cloud section POSTs to `/api/waitlist` and stores
emails in a Cloudflare D1 database. This file documents the one-time setup.

## 1. Authenticate

```bash
wrangler login
```

## 2. Create the D1 database

```bash
wrangler d1 create onebrain-waitlist
```

Wrangler will print a `database_id`. Copy it and paste it into
[`wrangler.jsonc`](../wrangler.jsonc) replacing `PASTE_DATABASE_ID_HERE`.

## 3. Apply the schema

```bash
# Local (creates a SQLite file under .wrangler/ for `wrangler dev`)
bunx wrangler d1 migrations apply onebrain-waitlist --local

# Remote (applies to the real Cloudflare D1)
bunx wrangler d1 migrations apply onebrain-waitlist --remote
```

## 4. Test locally

```bash
bun run preview          # builds + runs `wrangler dev`
# then in another shell:
curl -X POST http://localhost:8787/api/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"email":"hello@onebrain.run"}'
# → { "ok": true }
```

Check the local DB:

```bash
bunx wrangler d1 execute onebrain-waitlist --local \
  --command 'SELECT * FROM waitlist'
```

## 5. Deploy

```bash
bun run deploy
```

The endpoint is automatically picked up by the Cloudflare adapter because
`src/pages/api/waitlist.ts` exports `prerender = false`.

## 6. View signups in production

```bash
bunx wrangler d1 execute onebrain-waitlist --remote \
  --command 'SELECT email, created_at FROM waitlist ORDER BY created_at DESC LIMIT 50'
```

## Notes

- The endpoint validates email format and stores a privacy-preserving SHA-256
  hash of the client IP (first 12 bytes), never the raw IP.
- Duplicate emails are silently ignored (`ON CONFLICT DO NOTHING`), so the form
  is idempotent.
- If the `WAITLIST_DB` binding is missing at runtime (e.g. local dev without
  setup), the endpoint logs the email to the worker console and returns
  `{ok:true, note:"received_no_persistence"}` so the UI still shows success.
- To export all signups to CSV:
  ```bash
  bunx wrangler d1 execute onebrain-waitlist --remote --json \
    --command 'SELECT email, created_at FROM waitlist' \
    | jq -r '.[0].results[] | [.email, .created_at] | @csv' > waitlist.csv
  ```
