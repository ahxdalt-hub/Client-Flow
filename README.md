# ClientFlow Outreach Kit

Premium digital-product storefront: sells the **ClientFlow Outreach Kit** (client acquisition toolkit for Indian freelancers & small agencies) at ₹299 intro / ₹499 regular, with secure Razorpay checkout, server-side payment verification, expiring signed download delivery, and refund-driven access revocation.

**Payment provider decision, compliance notes (incl. merchant eligibility when the owner is a minor), and the owner's go-live checklist: [`docs/PAYMENTS.md`](docs/PAYMENTS.md).**

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript
- Tailwind CSS v4 (tokenised via `@theme` in `src/app/globals.css`)
- Razorpay Checkout (UPI/cards/netbanking/wallets) — no SDK, REST + HMAC verification (test-mode ready; live activation pending owner KYC)
- Supabase (orders, first-party analytics, download audit) — optional, degrades gracefully
- In-process fixed-window rate limiter on checkout/verify/track endpoints

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # node --test (crypto/token/logging unit tests)
npm run build
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Marketing home (hero, modules, pricing, FAQ, sample, CTA) |
| `/sample` | Free sample download (no email gate) |
| `/checkout` | Buyer details → Razorpay order → Checkout sheet |
| `/order/[orderId]?t=token` | Success page — verifies HMAC token + order state; a paid order also reissues a fresh token so `/order/<id>` is bookmarkable (refunded orders show invalid) |
| `/recover` | Self-serve download recovery — paste the Razorpay order/payment id from your receipt to get a fresh signed link |
| `/api/checkout` | POST: validates details, rate-limited, idempotency-keyed Razorpay order creation (server-set price), stores intent |
| `/api/payments/verify` | POST: HMAC signature verify → authenticated payment fetch (captured, right order, right amount, not refunded) → created→paid transition → download token → one-time email |
| `/api/payments/webhook` | POST: signature-gated events — `payment.captured` (idempotent fulfilment fallback), `payment.failed` (logged), `refund.processed`/`refund.created` → revoke access |
| `/api/download/[orderId]?t=token` | GET: signed + expiring + audited zip delivery; refuses unpaid/refunded orders |
| `/api/recover` | POST: reissues a signed download link for a paid order from its Razorpay order/payment id (rate-limited) |
| `/api/track` | POST: first-party event ingestion (rate-limited) |
| `/admin` | Owner overview — KPIs, 14-day revenue, funnel, recent orders |
| `/admin/orders` · `/admin/orders/[orderId]` | Searchable / filterable orders, per-order detail + link reissue |
| `/admin/downloads` · `/admin/analytics` · `/admin/status` | Download log · event + revenue charts · live dependency checks |
| `/admin/customers` | Buyers grouped by email (orders, revenue, last seen) |
| `/api/admin/session` | POST: log in with `ADMIN_SECRET` (sets an httpOnly cookie) · DELETE: log out |
| `/api/admin/reissue` | POST: mint a fresh signed download link for a paid order (cookie-gated) |
| `/privacy` `/terms` `/refund-policy` `/faq` `/contact` | Legal & support |

## Asset pipeline

- Content sources: `assets/product-assets/sources/` (6 Python data files — emails, DMs, follow-up system, proposals, guide)
- Build scripts: `scripts/product/` (`build_all.py` renders HTML → PDF via headless Edge/puppeteer-core, DOCX via python-docx, XLSX via openpyxl, then packages)
- Final deliverables: `assets/product-assets/final/` — `ClientFlow-Handbook.pdf` (66 pages), `Email-Templates.docx`, `Proposal-Templates.docx`, `Lead-Tracker.xlsx`, `Quick-Start-Guide.pdf`, `ClientFlow-Sample.pdf`
- Paid deliverable: `assets/deliverables/clientflow-outreach-kit.zip` — **outside `/public`**, served only through the verified download route. It is also intentionally kept out of the public git repo, so Git-based (Vercel) builds have no local copy: the route then streams the same file from the private Supabase Storage bucket `clientflow-deliverables` (`DELIVERABLE_BUCKET`). Local/CI builds still bundle it via `outputFileTracingIncludes`
- Free sample: `assets/product-assets/final/ClientFlow-Sample.pdf` → `public/downloads/clientflow-sample.pdf` (ungated by design; served as a PDF, matching the copy that says "PDF")

Rebuild everything (PowerShell):

```powershell
python scripts/product/build_all.py
```

## Setup checklist for production

1. **Razorpay account + KYC activation first** (approval is owner action; if the operator is a minor, the parent/guardian must be the account holder) — details and reasoning in `docs/PAYMENTS.md`.
2. Run `supabase/schema.sql` in the Supabase SQL editor (optional first-party tables). Upload `assets/deliverables/clientflow-outreach-kit.zip` to the private Supabase Storage bucket `clientflow-deliverables` (see `.env.example`) so Git-based deployments can serve the paid kit.
3. Configure Razorpay webhook (`/api/payments/webhook`; events: `payment.captured`, `payment.failed`, `refund.processed`) with the secret saved as `RAZORPAY_WEBHOOK_SECRET`.
4. Switch Razorpay keys from test to live; regenerate `DOWNLOAD_TOKEN_SECRET`.
5. Flip `PRICING.introActive` in `src/lib/pricing.ts` when the intro offer ends.
6. Update `CONTACT.email` / refund window in `src/lib/pricing.ts` if they change.

## Backend health & operations

- `npm run health` — read-only check of every external dependency: required env vars, the `orders` / `analytics_events` / `download_log` tables, the private deliverable bucket + zip object, and that the Razorpay keys authenticate. Exits non-zero on failure, so it can gate a deploy.
- `npm run upload:deliverable` — creates the private `clientflow-deliverables` bucket if missing and uploads `assets/deliverables/clientflow-outreach-kit.zip` (gitignored, so production serves it from Storage).
- `npm run db:apply` — runs `supabase/schema.sql` against your project via the Supabase Management API (needs a one-off `SUPABASE_ACCESS_TOKEN`). Creates the first-party tables + lookup indexes. Idempotent.
- **Link recovery (no email):** `/recover` (buyer pastes the Razorpay order/payment id from their receipt) and `/order/<orderId>` both reissue a fresh signed link from the paid order row. Requires Supabase — without the paid row there is nothing to look up.
- **Owner dashboard:** `/admin` — gated by a single `ADMIN_SECRET` (no accounts). Overview (KPIs, 14-day revenue chart, funnel, recent orders), Order search + detail with a one-click **reissue link**, the download log, analytics, and a live **Status** page (the same checks as `npm run health`). Generate the secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and set it in the environment; leave it unset to disable the whole panel.

## Notes

- Everything degrades gracefully when Supabase is unset: checkout still verifies payment and issues download tokens, and the download link is shown on the order page.
- No fake functionality: no testimonials, no urgency timers, no invented numbers.
  `src/lib/social-proof.ts` has **no floor and no placeholder** — the buyer count is
  the real paid-order count or nothing. `<ProofChip />` (`src/components/marketing/proof-chip.tsx`)
  shows faces + count once real sales pass `CROWD_THRESHOLD` (25), and states
  verifiable product facts instead until then. `BUYER_AVATARS` (in `social-proof.ts`)
  is empty on purpose: add real buyer photos with written permission, never stock.
- The connected Supabase project carries the previous app's schema; `src/lib/orders.ts` is adapted to it (no buyer PII stored — Razorpay retains contact data and is used for receipt email). `supabase/schema.sql` documents the mapping plus optional first-party tables.
- No marketing: purchasing never subscribes anyone to anything. The only customer email is Razorpay's own payment receipt.
- Checkout claims ("instant download", "UPI & cards") render only when `NEXT_PUBLIC_RAZORPAY_KEY_ID` is a **live** key — see `src/lib/payments-status.ts`. With test keys they are hidden, so the site never advertises a checkout that can't take real money.
- The in-process rate limiter is per-instance on serverless; swap in a shared-store (Upstash/Vercel KV) implementation behind the same `checkRateLimit` signature if abuse appears.

## Verified (2026-10-16, Phase 4 checkout hardening, all on test keys)

- `npm run lint · typecheck · build` — all pass; 28/28 unit tests pass (token crypto, payment/webhook signature forging, webhook event routing, Razorpay id guards, rate-limiter windows).
- Live-boundary checks against a local dev server (.env test keys, **test mode only, no real charges**):
  - `/api/checkout` creates real Razorpay **test** orders (server-computed ₹299/29900 paise, INR, test key id); invalid bodies → 400.
  - Same idempotency key replay returned the *same* Razorpay order id (`order_ToeXK0uSLGxLg0` ×2) — no duplicate orders.
  - Forged payment signature at `/api/payments/verify` → 400 "Payment verification failed"; malformed ids → 400.
  - Webhook with wrong/absent signature → 400, nothing processed (including raw, malformed payloads).
  - `/api/download/…` without a token / forged token / tampered `..%2F` path → 404; order page renders its invalid state for forged tokens.
  - Rate limiter engaged after the configured burst (400→…→429 with Retry-After).
  - Free sample zip serves 200 with a valid PK zip header.
- Product files: unchanged from the Phase 3 verification below (66-page handbook, emails/proposals DOCX, lead tracker XLSX, quick-start + sample PDFs, CRC-checked paid zip).

Previous verification (integration + payment boundaries) still stands: full capture (test sheet → verify → order page → download) and refund-revocation closure **require the human-hosted Razorpay test sheet / dashboard steps and cannot be triggered from here** — they are the two remaining steps in the test-mode runbook (§4 of `docs/PAYMENTS.md`) before flipping anything to live.
