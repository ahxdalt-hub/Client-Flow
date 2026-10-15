# Marketloom — Shopify Store Research Pack storefront

A production-ready Next.js storefront for a one-time digital download
(₹199 Shopify Store Research Pack), built for the brand owned by **Caelmont**.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict)
- Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- Razorpay hosted checkout (payment provider)
- Supabase Postgres (orders/entitlements) + private Supabase Storage
  (product files) — persistent storage is required for verified paid orders
  and download entitlements; the storefront UI itself has no database
- npm for package management

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm start
npm test         # unit tests for payment crypto (signatures, tokens)
```

## Rename the brand / change configuration

Everything brand-, price-, navigation-, and product-specific lives in
**`src/config/site.ts`**:

- `SITE` — name, owner, canonical URL, nav, contact email
- `CHECKOUT` — payment provider (Razorpay is selected; see env gating below)
- `PRODUCT` — id, price, formats, and product content fields
- `PRODUCT_FILES` — object-storage paths of the paid files (server-side only)
- `CTA` — primary/secondary button labels

Unfinalised product specifications are `null` on purpose and render as
"**To be confirmed**" chips. They must only be set to real values once the
dataset has actually been sourced and checked.

Set the canonical site URL for SEO via environment variable:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

## Page map

| Route       | Purpose                                             |
| ----------- | --------------------------------------------------- |
| `/`         | Conversion landing page (hero → proof → FAQ → CTA)  |
| `/sample`   | Free sample preview + column-by-column explanation  |
| `/privacy`  | Privacy policy (marked for legal review)            |
| `/terms`    | Terms of use + digital licence (marked for review)  |
| `/refunds`  | Digital-product refund policy (marked for review)   |
| `/contact`  | Support contact (mailto-based, no stored data)      |
| `/success`  | Purchase confirmation, verification-gated downloads |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | SEO |

## Payments & delivery architecture

Provider: **Razorpay** (hosted checkout modal — card data never touches this
codebase). Database: **Supabase Postgres**. File delivery: **private
Supabase Storage bucket** with short-lived signed URLs.

```
Purchase button ──POST /api/checkout──► Razorpay order created (server)
      │                                     │
      ▼                                     ▼
Razorpay Checkout modal ──────────► payment.captured
      │                                     │
      ▼                                     ▼
/success?payment_id=…          POST /api/webhooks/razorpay
      │                          (HMAC signature verified)
      ▼                                     │
GET /api/verify  ◄── fetch payment from Razorpay API ──┘
      │  (captured? amount ₹199? currency INR?)
      ▼
markPaymentCaptured()  ← idempotent: unique payment id + one entitlement/order
      │
      ▼
HMAC download token (15 min) ──GET /api/download?token=…──►
      │  entitlement re-checked + rate-limited + audited
      ▼
Supabase signed URLs (10 min) for files in the private bucket
```

### Security invariants

- **Never simulate success.** The client never confirms a payment. The
  success page calls `/api/verify`, which fetches the payment from
  Razorpay's API with the secret key and requires `captured`, amount
  `19900` paise, and currency `INR` before anything is issued.
- **Webhook signatures**: `POST /api/webhooks/razorpay` computes
  HMAC-SHA256 over the *raw* body with `RAZORPAY_WEBHOOK_SECRET` and
  compares timing-safe against `x-razorpay-signature`. Invalid → 401.
- **Idempotent fulfillment**: fulfillment is a single code path
  (`markPaymentCaptured` in `src/lib/server/fulfillment.ts`) used by both the
  webhook and `/api/verify`. `orders.provider_payment_id` is UNIQUE and
  `entitlements.order_id` is UNIQUE, so duplicate webhook deliveries or
  repeated verify calls can never create duplicate orders or entitlements.
- **Entitlements**: created only server-side from verified payment data —
  never from a success-page visit, query parameter, or client claim.
  Refund webhooks revoke the entitlement immediately.
- **Expiring download links**: `/api/verify` issues an HMAC-signed token
  (15 minutes, bound to the payment id). `/api/download` validates the
  token, re-checks the entitlement in the database, rate-limits issuance
  (20 per hour per entitlement), writes a minimal audit row (entitlement id +
  timestamp, no PII), and returns Supabase Storage signed URLs valid for
  **10 minutes**.
- **Recovery path**: expired links are regenerated by returning to
  `/success?payment_id=…` (or pressing "Get fresh links") — this re-verifies
  against Razorpay and issues new links without any further payment. The
  Razorpay receipt email contains the same payment id for support requests.
- **Secrets**: `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
  `SUPABASE_SERVICE_ROLE_KEY`, and `DOWNLOAD_TOKEN_SECRET` are read only in
  server modules (`src/lib/server/*`, guarded by `import "server-only"`).
  Only the publishable Razorpay key id and the site URL use
  `NEXT_PUBLIC_` prefixes. Product storage paths come from server-side
  config (`PRODUCT_FILES`) — request input can never select a storage path.
- **Private files**: the CSV/XLSX live in the private `product-downloads`
  Supabase Storage bucket. They are not in the repo, not under `public/`,
  and have no permanent public URLs.

### Database schema

Migration: `supabase/migrations/20261014000001_orders_entitlements.sql`

| Table             | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `orders`          | One row per checkout/payment: internal id, provider order & payment refs, product id, status (`created`/`paid`/`failed`/`refunded`), amount (paise), currency, timestamps |
| `entitlements`    | One row per paid order: links the order to its downloadable product; `revoked_at` for refunds |
| `download_events` | Minimal audit of signed-link issuance (rate limiting)      |

RLS is enabled on all three tables with **no policies** — only the
service-role key (server-side) can touch them.

## Configuration requirements

### Environment variables

See `.env.example` for the full annotated list:

| Variable | Side | Purpose |
| -------- | ---- | ------- |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URL (SEO + webhook URL construction) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | public | Publishable Razorpay key id; gates the purchase button |
| `RAZORPAY_KEY_SECRET` | server | Orders API + payment verification |
| `RAZORPAY_WEBHOOK_SECRET` | server | Webhook HMAC validation |
| `SUPABASE_URL` | server | Postgres + Storage API |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Bypasses RLS — server-only |
| `DOWNLOAD_TOKEN_SECRET` | server | Signs 15-minute download tokens (≥ 32 chars) |

Checkout is **unconfigured** until every variable above is set. While
unconfigured the purchase button shows an honest "Checkout is not live yet"
notice, `/api/checkout`, `/api/verify`, and `/api/download` return
`503 not_configured`, and `/api/webhooks/razorpay` returns `503`. Missing
secrets are never invented or faked.

### Razorpay dashboard

1. Create an account and complete seller KYC (payouts to India).
2. Start in **Test Mode** (toggle in the dashboard header).
3. Copy the Test **Key Id** and **Key Secret** into the env vars.
4. Settings → **Webhooks** → create a webhook:
   - URL: `https://<your-domain>/api/webhooks/razorpay`
   - Secret: create a strong random string → `RAZORPAY_WEBHOOK_SECRET`
   - Active events: `payment.captured`, `payment.failed`, `refund.processed`
5. For local development, expose your machine with a tunnel (e.g.
   `ngrok http 3000`) and use the tunnel URL for the webhook, or trigger
   test webhooks from the dashboard's "Webhooks → … → Test" action.
6. Go Live only after end-to-end test-mode verification: switch the dashboard
   to Live Mode and replace the key id/secret (webhook secret can stay).

### Supabase

1. Create a project; copy **Project Settings → Data API → URL** →
   `SUPABASE_URL` and **API keys → service_role** →
   `SUPABASE_SERVICE_ROLE_KEY` (keep secret).
2. Apply the migration: paste
   `supabase/migrations/20261014000001_orders_entitlements.sql` into the SQL
   editor and run it (or `supabase db push` with the CLI linked).
3. Storage → create a **private** bucket named `product-downloads`.
4. Upload the product files with these exact paths (configurable in
   `PRODUCT_FILES` in `src/config/site.ts`):
   - `research-pack/marketloom-research-pack.csv`
   - `research-pack/marketloom-research-pack.xlsx`
5. Do **not** set the bucket to public and do **not** add public policies —
   the only access path is the service-role signed-URL flow.
6. For local development you may upload clearly-labelled sample files (e.g.
   a CSV with the sample columns and a placeholder row) — never fabricate
   unfinished data as the real paid product, and never include real personal
   data.

## Testing with Razorpay test mode

No part of this codebase simulates a successful payment. To test end to end:

1. Use Test Mode keys in `.env.local` and apply the Supabase migration;
   upload sample files to the private bucket.
2. Point the Razorpay webhook at your tunnel URL (or use dashboard test
   webhook triggers).
3. Click the purchase button → Razorpay test modal opens → pay with a test
   instrument (see Razorpay's "Test payments" docs for current test cards,
   UPI IDs, and netbanking credentials).
4. Expected results:
   - **Success**: modal completes → `/success?payment_id=…` → "Payment
     verified" → two 10-minute signed download links → files download from
     the private bucket. Check Supabase: one `paid` order, one entitlement,
     `link_issued` audit rows.
   - **Failure**: decline the test payment → the button shows a "Payment
     failed — you have not been charged" state with a retry; the webhook
     records a `failed` order and grants nothing.
   - **Dismissal**: close the modal → "Checkout closed" state; no charge.
   - **Duplicate webhooks**: re-send the same `payment.captured` webhook →
     still exactly one order and one entitlement.
   - **Unpaid access**: call `/api/download` without a token, with a forged
     token, or with a valid token for a non-existent payment → 400/401/403.
5. Unit tests: `npm test` covers webhook signature validation and download
   token round-trips, tampering, and expiry.

## What requires external configuration (not verifiable here)

- Real Razorpay test/live keys and webhook secret
- A Supabase project, applied migration, service-role key, private bucket,
  and the actual product files
- A public HTTPS origin for Razorpay to reach `/api/webhooks/razorpay`

Until those exist, checkout stays explicitly marked unconfigured and the
storefront shows the honest pre-launch notice.

## SEO

- Per-page `metadata` with titles, descriptions, canonical alternates
- `metadataBase` from `SITE.url`, Open Graph + generated `/opengraph-image`
- `sitemap.xml` and `robots.txt` (success page disallowed)
- Natural search language: Shopify freelancers/developers, e-commerce prospect
  research, store research pack — no ranking guarantees anywhere in copy.

## Accessibility & motion

- Semantic landmarks, skip link, visible focus rings, `aria-expanded` accordions
- All reveal/scroll animations respect `prefers-reduced-motion`
- Interface sound effects (Web Audio, generated at runtime — no audio files)
  are toggleable from the footer and default **off** for reduced-motion users.

## Deploy

```bash
npm run build
# output via next start, or deploy to Vercel/Netlify
NEXT_PUBLIC_SITE_URL="https://your-domain.com" npm run build
```

Notes:

- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is inlined at **build time** — set it in your
  hosting provider's build environment, not only at runtime.
- Server secrets must be set as runtime environment variables.
- After the first production deploy: create the webhook on the **Live**
  Razorpay dashboard pointing at the production `/api/webhooks/razorpay` URL.

Before going live:

1. Set `NEXT_PUBLIC_SITE_URL` and `SITE.contactEmail`.
2. Mark legal-review items resolved (privacy/terms/refunds pages are
   explicitly flagged).
3. Confirm final product specifications in `src/config/site.ts`.
4. Apply the Supabase migration, upload the real product files to the
   private bucket, and run the full test-mode checklist above.
5. Switch Razorpay to Live Mode keys and update env vars.
