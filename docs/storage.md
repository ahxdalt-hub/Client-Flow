# Storage & download delivery

Private Supabase Storage holds the paid CSV/XLSX; Postgres tracks versions,
orders, entitlements, and the link-issuance audit. Nothing about the product
files is ever public.

## Bucket layout

Bucket: **`product-downloads`**, visibility **private**, no public policies.
Only the service-role key (server-side) touches it — access happens
exclusively through short-lived signed URLs issued by `/api/download`.

```
product-downloads/
  marketloom/v1/
    marketloom-shopify-research-v1.csv
    marketloom-shopify-research-v1.xlsx
  marketloom/v2/            # later dataset revisions, same pattern
    …
```

Versioned prefixes are required: a new dataset revision is uploaded at a
**new path**, never by overwriting the old one, so customers who bought v1
keep exactly what they paid for. `PRODUCT_FILES` in `src/config/site.ts`
mirrors the current release paths (server-side only; request input can never
choose a storage path).

> Never upload fixture/sample files to a real `marketloom/v…` path. Fixtures
> belong in `scripts/dataset/fixtures/` and are only for tests.

## Product versions table

Migration: `supabase/migrations/20261015000001_product_versions.sql`
(apply after `20261014000001_orders_entitlements.sql`).

| Column | Purpose |
| ------ | ------- |
| `product_id`, `version` | Identity, unique together (`marketloom-research-pack`, `v1`) |
| `csv_path`, `xlsx_path` | Exact storage object paths for this version |
| `record_count` | Row count recorded at release time |
| `is_current` | Newest advertised version — enforced **one per product** by the partial unique index `product_versions_one_current_idx` |
| `released_at`, `created_at` | Audit timestamps |

RLS enabled with no policies (service-role only).

Releasing v2:

```sql
update public.product_versions set is_current = false where product_id = 'marketloom-research-pack' and is_current;
insert into public.product_versions (product_id, version, csv_path, xlsx_path, record_count, is_current)
values ('marketloom-research-pack', 'v2',
        'marketloom/v2/marketloom-shopify-research-v2.csv',
        'marketloom/v2/marketloom-shopify-research-v2.xlsx',
        250, true);
```

## Entitlement pinning

At fulfillment time (`markPaymentCaptured`), a new entitlement is pinned to
the product version that was `is_current` **at payment time**
(`entitlements.product_version_id`). Later releases never rewrite that pin.
If the version table is empty (e.g. local dev), the entitlement stays unpinned
and delivery falls back to `PRODUCT_FILES` paths; a pinned version that no
longer exists also falls back, so delivery never hard-fails on a deleted row.

## Delivery flow

```
verify/webhook ──► markPaymentCaptured (idempotent, pins version)
                       │
/success ──GET /api/verify──► HMAC download token (15 min, bound to payment id)
                       │
GET /api/download?token=…
  1. token signature + expiry check
  2. entitlement re-checked in DB (refund ⇒ revoked ⇒ 403)
  3. rate limit: 20 link issuances / hour / entitlement (429 + Retry-After)
  4. resolve files: pinned product version → paths, else PRODUCT_FILES
  5. existence check → signed URLs (10 minutes) or 503 file_missing
  6. audit row: entitlement id + timestamp only, no PII
```

Response states:

| State | HTTP | Meaning |
| ----- | ---- | ------- |
| `ready` | 200 | Signed URLs issued |
| `missing_token` | 400 | No `token` query parameter |
| `invalid_token` | 401 | Bad signature / malformed token |
| `expired_token` | 401 | Token past its 15-minute expiry |
| `no_entitlement` | 403 | No active entitlement for this payment (paid=0, refunded, forged token) |
| `rate_limited` | 429 | More than 20 issuances in the last hour |
| `not_configured` | 503 | Server secrets or storage config missing |
| `file_missing` | 503 | Entitlement valid but the objects aren't in the bucket yet |
| `storage_error` | 502/500 | Supabase Storage call failed |
| `provider_error` | 502 | (verify only) Razorpay API unreachable |

Expired links are regenerated for free by returning to
`/success?payment_id=…` — it re-verifies against Razorpay and issues a fresh
token; no new payment happens.

## Audit & privacy

`download_events` records only `entitlement_id`, `kind`
(`link_issued`), and `created_at` — no file paths, no IP/user agent, no PII.
It doubles as the rate-limit counter (count of `link_issued` rows in the
last hour for the entitlement).

## Applying the migrations

```bash
# With the Supabase CLI linked to the project:
supabase db push

# Or paste each file, in order, into the dashboard SQL editor:
#   1. supabase/migrations/20261014000001_orders_entitlements.sql
#   2. supabase/migrations/20261015000001_product_versions.sql
```

Verify afterwards (read-only):

```sql
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'product_versions';
select indexname from pg_indexes where tablename = 'product_versions';
-- entitlements.product_version_id must exist as well
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'entitlements' and column_name = 'product_version_id';
```

## Tests

`src/app/api/download/route.test.ts` covers token denial cases, refund
revocation, version-pinned path resolution, `file_missing`, the rate limit,
and the unconfigured state against an in-memory Supabase fake
(`src/test-support/fake-supabase.ts`).
