# Payments & delivery — decision record and operations guide

Phase 4: purchase workflow, security controls, and what the owner must do
before taking payments live. Current status: **code complete, test-mode ready;
live checkout is NOT yet verified** (see "Owner action required").

## 1. Payment provider decision

**Selected: Razorpay Payment Gateway.**

### Why Razorpay

| Consideration | Razorpay (standard pricing, verify exact rates in your dashboard) |
|---|---|
| Indian payment methods | UPI (+ UPI intent/QR), all major Indian credit/debit cards, 58+ netbanking banks, wallets, Pay Later — all through one hosted Checkout. UPI is essential for an Indian ₹299–₹499 impulse purchase. |
| Pricing | ~2% platform fee + 18% GST on common domestic methods (UPI's statutory MDR is 0%; Razorpay's platform fee applies). No setup fee, no AMC. Small-ticket fees barely matter at this price point. |
| Model | One-time orders only. Nothing in this implementation creates subscriptions or mandates. |
| Digital products | E-books/educational/software content is a supported business category; the product is a downloadable toolkit (no shipping, no logistics mismatch). Confirm the category choice ("Software / Digital products"-family) during activation. |
| Checkout security | Hosted, PCI-scoped Checkout sheet (`checkout.js`); card data never touches our servers. Payment HMAC signature + authenticated payment-status fetch. |
| Webhooks | Signed (HMAC-SHA256 of the raw body with a dashboard secret); at-least-once delivery with retries — handled idempotently (see §3). |
| Refunds | Dashboard + API; we additionally auto-revoke access on `refund.processed`. No refund charge on standard pricing. |
| Settlement | Standard payout schedule to a registered Indian bank account after activation (funds go to the Razorpay settlement account first; check Dashboard → Transactions for your actual T+X). |
| Fees & charges | No setup/annual/platform fees beyond the per-transaction rate; GST on the fee is on Razorpay's invoice; GST compliance of your sales is the owner's side. |

### Alternatives considered

- **Stripe**: Indian capabilities have been re-opening slowly and invitingly;
  Razorpay was already the native choice for INR/UPI-centric small sellers. Not selected.
- **Instamojo / Cashfree / PayU**: all viable for the same use case; Razorpay
  was selected on UPI reliability, hosted-Checkout ergonomics, documented
  webhook semantics, and first-class test mode. Their flows would look
  structurally similar (same order-create → hosted sheet → verify/webhook).
- **PayPal / Paddle / Lemon Squeezy**: Paddle/Lemon Squeezy are MoR models —
  good for international, but weaker for UPI-first Indian buyers and heavier
  onboarding; PayPal lacks UPI and adds FX/withdrawal friction. Rejected.
- **UPI QR directly on the PSP bank app / "payment request" workarounds**:
  rejected outright — no automated verification, no signed callbacks, no
  audit trail, and manual "send a screenshot" flows invite both fraud and
  unpaid deliveries. Unofficial payment workarounds are deliberately not
  implemented.

### Merchant eligibility — including if the owner is a minor

Razorpay's Terms & Conditions (§2.1) require account holders to be **18 or
older** with legal capacity for binding contracts, and activation requires:

- a **PAN** in the account-holder's name (individual/proprietorship or business)
- a registered **Indian bank account** matching the PAN identity
- KYC verification (CKYC lookup + OTP; re-KYC can be requested later)
- policy pages live on the site — Terms, Privacy, Refund & Cancellation,
  Contact (all exist at `/terms`, `/privacy`, `/refund-policy`, `/contact`)
- no application guarantees approval: category checks and KYC final approval
  are Razorpay's call. **Do not publish live pricing-connected CTAs until
  activation is confirmed in the dashboard.**

**If the business owner is under 18:** they cannot hold the Razorpay account
themselves. A **parent or legal guardian** must be the account holder — their
PAN, their bank account, their name on KYC, on the Razorpay ToS, and as the
settlement beneficiary (the gateway forwards income to the guardian's bank
account, which is the compliant arrangement for work by a minor; local
tax/earnings rules apply). The minor can author/maintain everything in this
codebase independently; the *money flows and the contract with Razorpay*
need the guardian. Razorpay accounts also can't be jointly owned with a minor
as a workaround — open it with the guardian as the proprietor.

## 2. What the code does (flow)

```
/checkout ──POST /api/checkout──▶ Razorpay Orders API (server keys only)
   ▲                              (amount from server config; idempotency key)
   │                      rp_order_id ◀── stored as pending order row
   │ Razorpay Checkout sheet (hosted; buyer pays via UPI/card/…)
   │
   └── handler(response) ──POST /api/payments/verify
            1. HMAC signature check (order|payment signed by key secret)
            2. authenticated GET payment: status=captured, right order, right
               amount, not refunded
            3. created→paid order transition (conditional = idempotent)
            4. HMAC download token (30-day TTL) issued to buyer
            5. receipt email via Resend (after response; non-blocking)

Razorpay ──POST /api/payments/webhook──▶ (parallel second path)
   - payment.captured  → same steps 2–5; duplicate callbacks / races with
     the verify route are no-ops (transition returns "already done")
   - refund.processed  → paid→failed (access revoked everywhere)
   - payment.failed    → logged only

GET /api/download/<orderId>?t=<token>
   1. HMAC token binding + expiry verified (timing-safe)
   2. order row must be "paid" when Supabase is reachable
   3. zip streamed from assets/deliverables (outside /public)
```

Key controls (audit-mapped):

| Requirement | Implementation |
|---|---|
| Browser never sets price/status | amount computed from `src/lib/pricing.ts` server-side; access decided only from authenticated Razorpay data + paid order row |
| Webhook signature verification | `verifyRazorpayWebhookSignature` (constant-time compare) |
| Idempotency / no duplicate charges | checkout idempotency key reuses the same Razorpay order; one payment per Razorpay order by design; `markOrderPaid` created→paid conditional transition; verify + webhook deduplicate fulfillment email |
| Forged success URL | cannot mint a token (needs `DOWNLOAD_TOKEN_SECRET`); cannot pass verify (HMAC + authenticated fetch) |
| Credentials server-side | secrets only in `process.env.*`; only the public `NEXT_PUBLIC_RAZORPAY_KEY_ID` reaches the browser |
| Input validation | regex-gated ids (order_/pay_/hex sig), name/email/phone rules, idem key charset, raw-body size cap, props size cap |
| Rate limiting | `src/lib/rate-limit.ts` fixed-window limiter on `/api/checkout`, `/api/payments/verify`, `/api/track` (per-instance caveat below) |
| Safe DB queries | Supabase query builder (parameterised), `.eq()` filters only; no string SQL |
| Unauthorized file access | bundle outside `/public`, `outputFileTracingIncludes` scoping; token + paid-row checks |
| No sensitive logging | logs contain order/payment ids and status only — never names, emails, phones, card data, or secrets |
| Data minimisation | buyer contact stays in Razorpay's payment record (used for the receipt email); our DB stores only order ids, status, amount |
| Duplicate delivery events | refunded orders flip to "failed" → download and order pages refuse non-paid rows |

## 3. Error handling matrix

| Case | Behaviour |
|---|---|
| Pending payment (authorised, not captured, sheet still open) | verify returns "Payment not completed" (400); no token; buyer sheet can retry same order |
| Declined payment | Checkout `payment.failed` → UI error, order stays "created", retry safe (no double order; same idem key reuses order) |
| Duplicate capture webhook | transition returns already-paid → HTTP 200, no re-email |
| Duplicate verify submission | second call re-verifies signature, re-issues (fresh) token, skips duplicate email |
| Webhook lands before verify | order marked paid by webhook; later verify result is a no-op transition, buyer still gets token |
| Webhook delayed/lost | verify path alone completes fulfilment; if Supabase write fails the email path still fires — buyer recovers via email link |
| Email provider failure | logged server-side (`[webhook] fulfilment email not sent`); buyer recovery: order page link (still valid) or support resend; email never blocks the HTTP response |
| File unavailable | download route 500 with support-contact message; log shows denied/served counts |
| Refund | dashboard refund → `refund.processed` webhook → order "failed" → download/order pages revoke; partial refunds are treated as full-revoke (single-SKU product) |
| Webhook signature failure | HTTP 400, nothing processed; Razorpay does not retry 400/4xx |
| Rate limit exceeded | 429 + `Retry-After` |

## 4. Testing (Cashfree/Razorpay test mode only — no real charges)

Run: `npm test` (node --test). Coverage in-repo:

- ✅ valid/invalid/tampered checkout payment signature
- ✅ valid/invalid webhook signature; body tamper rejection
- ✅ duplicate `payment.captured` classification is stable (idempotency)
- ✅ refund → revoke mapping; `payment.failed` → grant-nothing
- ✅ malformed webhook payloads rejected (never granting access)
- ✅ signed-token forged/expired/wrong-order rejection (`tests/tokens.test.ts`)
- ✅ rate-limiter limit/window/reset boundaries

Manual, one-time (needs the human-in-the-loop Razorpay **test** sheet):

1. `/checkout` with test keys → sheet opens for ₹299 in **Test** tag → pay with
   Razorpay's UPI test VPA / test card — no real money exists in test mode.
2. Success path: verify API 200 → `/order/<id>?t=…` shows paid → download works.
3. Force-fail a test payment in test mode (`payment.failed`) → UI error, no access.
4. Forge `GET /api/download/<orderId>?t=tampered` → 404.
5. Forge `?t=valid-but-other-order` → 404 (order binding).
6. Webhook replay of same `payment.captured` twice → second is `alreadyFulfilled`.
7. Webhook with wrong secret → 400.
8. Refund the test payment in the dashboard → `refund.processed` → order page/download deny.
9. With `RESEND_API_KEY` unset → fulfillment is logged server-side, flow still completes.
10. Keep `pending.properties` where the buyer closes the tab after payment: webhook
    fulfils and emails anyway.

Live-mode checklist is in README "Setup checklist for production".

## 5. Owner action required (before any real buyer)

Nothing in this repo can do these — they are account/approval actions:

1. **Razorpay account & activation** — register (PAN, bank, KYC, business category).
   If the operator is a minor, register with the parent/guardian as account holder.
   Confirm approval in Dashboard → Settings → account status **Live**.
2. **Keys** — put `RAZORPAY_KEY_ID` (server) + `RAZORPAY_KEY_SECRET` + regenerate
   `DOWNLOAD_TOKEN_SECRET` for live. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the only
   browser-safe value (key id, not secret).
3. **Webhook** — Dashboard → Webhooks → add `https://<domain>/api/payments/webhook`,
   secret into `RAZORPAY_WEBHOOK_SECRET`, subscribe to
   `payment.captured`, `payment.failed`, `refund.processed`.
4. **Refund policy window** — the refund policy at `/refund-policy` states
   `REFUND_WINDOW_DAYS` (10). Refund all requests inside the window manually
   from the dashboard within the same window.
5. **Email** — set `RESEND_API_KEY` + `EMAIL_FROM` (verified domain) to make
   receipts automatic instead of logged.
6. **Domain** — `NEXT_PUBLIC_SITE_URL` is the live domain
   (`https://client-flow-inky.vercel.app`, set in Vercel → Environment
   Variables for Production/Preview/Development); receipt and download
   links derive from it. Because it is a `NEXT_PUBLIC_*` value it is
   inlined at build time — change it only with a redeploy.
7. **Rate limiter caveat** — the in-process limiter is per-instance on
   serverless. Broad abuse at scale wants a shared-store limiter (Upstash/Vercel
   KV); the function signature is ready for a drop-in swap.
