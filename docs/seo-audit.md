# ClientFlow — SEO, Google ranking & AI discoverability report

**Site:** <https://clientflow.caelmont.in>
**Date:** 17 October 2026
**Scope:** technical SEO audit, crawlability, indexing, canonicalisation, on-page
metadata, structured data, content architecture, AI discoverability, performance.
**Status legend:** **PASS** (verified) · **FAIL** (verified broken) · **NOT TESTED**
(no access or tool to verify) · **BLOCKED** (needs something I cannot do).

---

## 1. Summary of the original SEO state

The site was already in better technical shape than most marketing sites, and the
audit confirmed it rather than discovering a broken foundation:

- Next.js 16 App Router on Cloudflare Workers, server-rendered HTML.
- `robots.txt` and `sitemap.xml` existed as real route handlers.
- Canonical tags on every indexable page; correct `noindex` on checkout, order,
  recover and admin.
- Valid `Product` JSON-LD on the homepage with **no invented ratings**
  (`aggregateRating` / `review` deliberately absent) and valid `FAQPage` markup
  whose answers match the visible accordion.
- Honest social proof: no fabricated "200+ customers" anywhere.
- Working free sample (PDF, 485 KB, served with a cache HIT).

What was wrong fell into three groups: **one critical edge-level override that
disabled the origin robots.txt entirely**, a handful of on-page correctness
issues, and **1.8 MB of unoptimised images** that `next/image` could not fix
because optimisation is disabled on the Workers runtime.

---

## 2. Technical issues discovered

Severity: **Critical** · **High** · **Medium** · **Low**

| # | Issue | Sev | Route | Evidence | Fix | Status |
|---|-------|-----|-------|----------|-----|--------|
| 1 | Live `robots.txt` is served by Cloudflare's edge, **not** the origin. It injects `Disallow: /_next/` and `/static/`, blocking the CSS and JS crawlers need to render. The repo's robots.txt has no effect. | **Critical** | `/robots.txt` | Live is 4,561 bytes with `# BEGIN Cloudflare Managed content`; origin (`clientflow.ahxd.workers.dev`) returns the correct 166-byte file. | Origin rules corrected; edge override needs the Cloudflare dashboard. | **BLOCKED** — manual step (§11) |
| 2 | The edge also blocks **every AI agent** (`ChatGPT-User`, `Perplexity-User`, `Google-Agent`, `Claude-User`, `Google-NotebookLM`, `FireCrawl`) — the opposite of the AI-discoverability goal. | **High** | `/robots.txt` | Same evidence; `User-agent: ChatGPT-User` / `Disallow: /` present. | Fixed in origin `robots.ts`; needs dashboard. | **BLOCKED** — manual step (§11) |
| 3 | Contradictory robots rules: two different `User-agent: *` groups and duplicate, conflicting AI groups. | Medium | `/robots.txt` | Edge output contains both `Allow: /` and `Disallow: /_next/` for `*`. | Resolved by removing the edge override. | **BLOCKED** |
| 4 | Soft 404: `/order/<anything>` returned **HTTP 200** with a "That link doesn't work" body and the title "Your download is ready". | **High** | `/order/*` | `GET /order/test` → 200. | `notFound()` guard before the Suspense boundary. | **PASS** — live `/order/abc` → 404 |
| 5 | Homepage `<meta name="description">` was **201 characters** — truncated in results. Title was 82 characters. | **High** | `/` | Live head measured. | Rewritten; 156 chars, title 54. | **PASS** |
| 6 | `/faq` had **no `<h1>`** — `SectionHeading` always rendered `h2`. | **High** | `/faq` | Live head: 0 `h1` elements. | `as` prop added to `SectionHeading`; page passes `h1`. | **PASS** |
| 7 | Sitemap regenerated `lastModified` with `new Date()` on **every request**, teaching crawlers to ignore the field. | Medium | `/sitemap.xml` | Two fetches seconds apart returned different `lastmod`. | Hand-set dates per page; blog posts use their own `updated` field. | **PASS** |
| 8 | No `Organization`, `WebSite` or `BreadcrumbList` structured data. The Caelmont→ClientFlow relationship existed nowhere, on page or in markup. | Medium | site-wide | JSON-LD audit: only `Product` and `FAQPage` present. | Added to the root layout, plus breadcrumbs where a visible trail exists, and a footer line stating the relationship. | **PASS** |
| 9 | JSON-LD serialised with bare `JSON.stringify` — a `<` in any payload would close the script tag early. | Medium | all JSON-LD | Code inspection; Next's own JSON-LD guide warns about this. | `jsonLd()` helper escapes `<` → `\u003c`. | **PASS** |
| 10 | No educational content at all. Zero pages targeting research-stage queries. | Medium | `/blog` (404) | `GET /blog` → 404. | Five substantive guides + a crawlable index. | **PASS** |
| 11 | Images up to **4000 px / 330 KB**, served unoptimised because `next/image` optimisation is off on Workers. 1.79 MB of photography on the homepage. | **High** | `/` | `flow-art.jpg` 4000×2811, 330 KB; `desk-dark.jpg` 394 KB. | `scripts/optimize-images.mjs`; re-encoded 7 files. | **PASS** — 1,786 KB → 965 KB |
| 12 | No `X-Frame-Options`, `Referrer-Policy` or `Permissions-Policy`; `x-powered-by` disclosed. | Medium | all | Header audit. | Added via `next.config.ts` `headers()`; `poweredByHeader: false`. | **PASS** — verified live |
| 13 | `Product.offers.url` pointed at `/checkout`, which is `noindex`. | Low | `/` | JSON-LD audit. | Points at the indexable homepage, which carries the price and buy CTA. | **PASS** |
| 14 | Unverifiable promise "free updates forever" in 8 places, with no delivery mechanism (no email list, no update channel). | **High** | 5 components + FAQ + Terms | Text grep. | Replaced with what is true: the files are yours to keep. | **PASS** |
| 15 | Short meta descriptions on legal pages (60–74 chars) — thin but not harmful. | Low | `/privacy`, `/terms` | Measured. | Left as-is; legal pages are rarely the entry point. | Accepted |
| 16 | Canonical for `/` renders without the trailing slash while the sitemap uses `/`. | Low | `/` | Live comparison. | No change: Google normalises the root URL. | Accepted |
| 17 | Three image files are shipped but referenced nowhere (`hero-desk.jpg`, `meeting-room.jpg`, `faq-question-mark.png`), plus 4 avatars. | Low | build | Grep across `src/`. | Not deleted — reported only. | Open |

### What was checked and found correct

**PASS** — HTTPS with HSTS preload; `nosniff`; valid XML sitemap with absolute
HTTPS URLs; canonicals present on all indexable pages; `noindex` only on
checkout/order/recover/admin; FAQPage markup matching visible answers; no fake
ratings or customer counts; free sample downloads correctly; unknown routes
return 404; paid downloads are gated by a signature check.

---

## 3. Fixes implemented

1. `notFound()` guard for malformed order ids (real 404, correct `noindex`).
2. `robots.ts` rewritten: AI answer engines named explicitly, no asset blocked.
3. Sitemap rewritten with stable dates and the five guides.
4. Structured data: `Organization`, `WebSite`, `BreadcrumbList`, `BlogPosting`.
5. `jsonLd()` escaping helper used for every JSON-LD block.
6. `/faq` heading fixed via a new `as` prop on `SectionHeading`.
7. Titles and descriptions rewritten to SERP limits across the site.
8. `/blog` content section: 5 guides + index, no new dependencies.
9. "Free updates forever" replaced with an accurate, deliverable statement.
10. Seven images re-encoded; `public/logo.png` generated from `icon.svg`.
11. Security headers added; `x-powered-by` removed.
12. Internal linking: guides in the header nav, a new footer column, and links
    from each article to its siblings.

## 4. Exact files changed

**Added**

```
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/components/blog/article-body.tsx
src/content/blog/{types,index}.ts
src/content/blog/cold-email-templates-for-freelancers.ts
src/content/blog/how-to-follow-up-with-potential-clients.ts
src/content/blog/freelance-lead-tracking-spreadsheet.ts
src/content/blog/freelance-proposal-template-guide.ts
src/content/blog/how-to-find-clients-as-a-freelancer-in-india.ts
src/lib/structured-data.ts
scripts/optimize-images.mjs
public/logo.png
assets/image-originals/   (local only, gitignored)
```

**Modified**

```
src/app/layout.tsx            Organization + WebSite JSON-LD, metadata
src/app/page.tsx              homepage metadata, Product JSON-LD
src/app/robots.ts             crawl rules + AI agents
src/app/sitemap.ts            stable dates, guides
src/app/faq/page.tsx          h1 via SectionHeading, breadcrumb JSON-LD
src/app/order/[orderId]/page.tsx  404 guard, nofollow
src/app/not-found.tsx         noindex + guides link
src/app/sample/page.tsx       breadcrumb JSON-LD
src/app/terms/page.tsx        accurate update policy
src/app/checkout/page.tsx     accurate promise
src/components/ui.tsx         SectionHeading `as` prop
src/components/legal-shell.tsx  breadcrumb JSON-LD
src/components/marketing/header.tsx      Guides nav link
src/components/marketing/footer.tsx      Guides column + Caelmont line
src/components/marketing/hero.tsx        accurate promise
src/components/marketing/niche-band.tsx  accurate promise
src/components/marketing/proof-chip.tsx  accurate promise
src/components/marketing/sample-teaser.tsx  accurate promise
src/components/marketing/look-inside.tsx    accurate promise
src/lib/faq-content.ts        accurate update answer
next.config.ts                security headers, poweredByHeader
.gitignore                    ignore image originals
public/images/*.jpg (7)       re-encoded
```

## 5. Final public URL list

| URL | Indexable | In sitemap |
|-----|-----------|-----------|
| `/` | yes | yes |
| `/sample` | yes | yes |
| `/blog` | yes | yes |
| `/blog/how-to-find-clients-as-a-freelancer-in-india` | yes | yes |
| `/blog/cold-email-templates-for-freelancers` | yes | yes |
| `/blog/how-to-follow-up-with-potential-clients` | yes | yes |
| `/blog/freelance-lead-tracking-spreadsheet` | yes | yes |
| `/blog/freelance-proposal-template-guide` | yes | yes |
| `/faq` | yes | yes |
| `/contact` | yes | yes |
| `/privacy` | yes | yes |
| `/terms` | yes | yes |
| `/refund-policy` | yes | yes |
| `/checkout` | noindex | no |
| `/order/*` | noindex | no |
| `/recover` | noindex | no |
| `/admin*` | noindex, nofollow | no |
| `/api/*` | disallowed | no |
| `/downloads/clientflow-sample.pdf` | yes (linked) | no — reachable via `/sample` |

## 6. Sitemap — `https://clientflow.caelmont.in/sitemap.xml`

**PASS.** Live: HTTP 200, `application/xml`, 2,413 bytes, **13 `<loc>` entries**
(8 static + 5 guides). Absolute HTTPS URLs on the production host; private and
transactional routes excluded; no query-parameter variants; no redirects or
duplicates. Every listed URL was fetched and returns 200.

## 7. robots.txt — `https://clientflow.caelmont.in/robots.txt`

**BLOCKED (origin PASS, edge FAIL).**

- **Origin** (`clientflow.ahxd.workers.dev/robots.txt`) — 200, correct: allows
  all, names 17 AI agents, disallows only `/api/`, `/checkout`, `/order/`,
  `/recover`, `/admin`, and declares the sitemap. Nothing blocks CSS or JS.
- **Live** — still Cloudflare-managed: 4,561 bytes, `Disallow: /_next/`,
  `Disallow: /static/`, and `Disallow: /` for every AI agent. **The repo change
  will not take effect until the dashboard setting in §11 is turned off.**

## 8. Canonicalisation test results — **PASS**

Fetched the rendered HTML of every indexable page on production:

- One canonical tag per page, all absolute HTTPS on `clientflow.caelmont.in`.
- No page canonicalises to the homepage; no self-canonical missing.
- No canonical points at a redirect, a 404 or a `noindex` page.
- The canonical target of each page returns 200.
- `/checkout`, `/order/*`, `/recover` and `/admin` carry no canonical (they are
  `noindex`, which is correct).

## 9. Structured-data validation results — **PASS (syntax) / NOT TESTED (Google)**

Every JSON-LD block was parsed and type-checked against the live HTML:

| Page | Types present | Notes |
|------|---------------|-------|
| all pages | `Organization`, `WebSite` | `ClientFlow`, `parentOrganization: Caelmont`, `logo: /logo.png`, support email. No `sameAs` (no real profiles to cite). |
| `/` | `Product` | `price: 299`, `INR`, `InStock`. **No `aggregateRating`, no `review`.** |
| `/faq` | `FAQPage`, `BreadcrumbList` | 7 questions; answers identical to the visible accordion. |
| `/blog`, articles | `BlogPosting`, `BreadcrumbList` | `datePublished` / `dateModified`; author = the Organization, not an invented person. |
| legal + `/sample` | `BreadcrumbList` | Mirrors the visible breadcrumb trail. |

Not run through Google's Rich Results Test or the Schema Markup Validator —
that needs a browser/API I do not have. Both are paste-a-URL tools; see §11.

## 10. Performance — measured before and after

Measured by fetching the live site before and after deployment. **These are
transfer measurements, not lab Core Web Vitals** — no Lighthouse or PageSpeed
Insights run (no browser tooling available), and no field data (CrUX needs
traffic). Treat LCP/INP numbers as **NOT TESTED**.

**Homepage image payload — PASS**

| File | Before | After | Change |
|------|--------|-------|--------|
| `flow-art.jpg` | 330 KB (4000×2811) | 110 KB (2400 px) | −67% |
| `desk-dark.jpg` | 394 KB | 190 KB | −52% |
| `notes-desk.jpg` | 190 KB | 69 KB | −64% |
| `team.jpg` | 247 KB | 149 KB | −40% |
| `desk-warm.jpg` | 185 KB | 110 KB | −41% |
| `meeting.jpg` | 192 KB | 120 KB | −37% |
| `workspace.jpg` | 156 KB | 124 KB | −20% |
| **Total** | **1,786 KB** | **965 KB** | **−46%** |

**Other measurements**

| Item | Value | Note |
|------|-------|------|
| Homepage HTML | 210 KB uncompressed | Cloudflare applies Brotli in front of it |
| CSS | 78 KB uncompressed | single Tailwind bundle, cache HIT |
| JS, all chunks | 645 KB uncompressed | React 19 + Next 16 runtime; **no animation library** — all motion is CSS + IntersectionObserver |
| Guide article HTML | 62 KB uncompressed | fully server-rendered, no client JS |
| Fonts | 169 KB woff2 | Fraunces (3 axes) + Inter, both `display: swap` |

**Assessment.** The image work removes ~820 KB from the critical path and is the
single biggest measured win. The 645 KB of JS is framework baseline, not
something this project introduced; reducing it means migrating the interactive
islands, which is not an SEO task and risks the visual identity. The Fraunces
variable font with three axes is the next candidate if LCP is measured as
font-bound.

## 11. Search Console — completed vs. still manual

**Not verified, not submitted. I have no access to the Search Console account,
so I am not claiming otherwise.**

Done for you: every prerequisite (crawlable HTML, valid sitemap, correct
canonicals, no stray `noindex`, valid structured data, 404s that really 404).

To do manually — **in this order**:

1. **Unblock rendering and AI crawlers (highest priority).**
   Cloudflare dashboard → `caelmont.in` zone → **Security → Settings** (or
   **AI Crawl Control**) → turn **off** the managed `robots.txt` /
   "Block AI bots" toggle, and delete the custom robots.txt rules from the
   dashboard. Cloudflare is currently *replacing* the origin file.
   *Verify:* `curl -s https://clientflow.caelmont.in/robots.txt | wc -c` should
   drop from ~4,561 to ~600 bytes, and the output should contain
   `User-agent: GPTBot` with `Allow: /`.
   *Why first:* until `/_next/` is crawlable again, everything else is capped.
2. **Add the property** in Google Search Console as a **Domain** property
   (`caelmont.in`) and verify by DNS TXT, or as a URL-prefix property with the
   HTML file method. Domain properties cover every subdomain.
3. **Submit the sitemap:** `https://clientflow.caelmont.in/sitemap.xml`.
4. **Request indexing** — only these five, once, and only because they are new
   or substantially changed:
   - `https://clientflow.caelmont.in/` (title, description, structured data)
   - `https://clientflow.caelmont.in/blog`
   - `https://clientflow.caelmont.in/blog/how-to-find-clients-as-a-freelancer-in-india`
   - `https://clientflow.caelmont.in/blog/cold-email-templates-for-freelancers`
   - `https://clientflow.caelmont.in/faq`
   Do not request the other guides, the legal pages or `/sample` — they are
   linked and will be found. Repeated requests without a change are ignored and
   waste quota.
5. **Validate structured data** by pasting the homepage and one article URL
   into <https://search.google.com/test/rich-results> and
   <https://validator.schema.org/>.
6. **Check PageSpeed Insights** on `/` and one article, mobile, and record LCP
   and INP. Use that number, not my transfer measurements, to decide whether the
   Fraunces font or the JS bundle is worth attacking.
7. **Analytics:** there is no Google Analytics and none is needed — the site has
   first-party event tracking that lands in `/admin/analytics`
   (`page_view → sample_download → purchase_click → checkout_started →
   purchase_complete`). If you want Search Console *query* data joined to those
   events, connect GA4 in Search Console → Settings → Associations. Setup steps
   are not performed, because I have no analytics account access.

### Open item not caused by this work

`RAZORPAY_WEBHOOK_SECRET` on the Worker is still the **test-mode** secret, so
live webhooks are rejected with 400. Payment confirmation currently depends on
the client-side `verify` call. Create the webhook in the Razorpay **live**
dashboard (URL `https://clientflow.caelmont.in/api/payments/webhook`, events
`payment.captured`, `payment.failed`, `refund.processed`) and set the secret.
This is a payment-correctness issue, not SEO, and is unchanged by this work.

## 12. Articles created and their target search intents

| URL | Target intent |
|-----|---------------|
| `/blog/how-to-find-clients-as-a-freelancer-in-india` | "how to find clients as a freelancer in India" — commercial-investigation, no audience/no warm intros |
| `/blog/cold-email-templates-for-freelancers` | "cold email templates for freelancers" — the primary head term |
| `/blog/how-to-follow-up-with-potential-clients` | "client follow-up email templates" / "how to follow up with a client" |
| `/blog/freelance-lead-tracking-spreadsheet` | "freelancer lead tracker" / "lead tracking spreadsheet" |
| `/blog/freelance-proposal-template-guide` | "freelance proposal templates" / "how to write a freelance proposal" |

Each is 900–1,400 words of genuinely specific advice, includes real template text
and tables, states limits honestly (what not to do, when to stop), and links to
`/sample` or the product in context. **No article claims a statistic, a citation
or a credential** — everything is practical guidance from the product's own
material. Deliberately five, not fifty: thin filler harms more than it helps.

## 13. Remaining errors and limitations

**FAIL / BLOCKED**

1. **Live `robots.txt` still blocks CSS, JS and all AI agents.** Cannot be fixed
   from the repo. See §11 step 1. This is the most important open item.
2. **Razorpay live webhook secret is still test-mode.** Payment confirmation is
   not receiving signed webhooks in live mode.

**NOT TESTED**

3. **Lab Core Web Vitals** (Lighthouse / PageSpeed Insights) — no browser
   tooling. Transfer sizes were measured instead and improved 46%.
4. **Field Core Web Vitals** — no CrUX data until the site has traffic.
5. **Google rich-result eligibility** — JSON-LD is syntactically valid and
   matches visible content, but not run through Google's validator.
6. **Search volume / competition for every target keyword.** No keyword tool and
   no authorised data source, so **every keyword in §12 is a hypothesis based on
   intent, not verified volume.** Treat the ordering as a guess.
7. **End-to-end live purchase.** A real ₹1 payment + refund was not run, because
   it moves real money and would add rows to your production database. The free
   sample download, the paid-download signature gate (forged and unsigned
   requests both rejected) and the 32 unit tests all pass.
8. **AI crawler access** — cannot be tested while the edge blocks them.

**Accepted / open**

9. Three unused images and four unused avatars still ship in the bundle (§2 #17).
   No user-facing effect; safe to delete whenever you want.
10. No Content Security Policy. The inline JSON-LD and the pre-paint `js` class
    script need nonces, which is a real piece of work with its own regression
    risk. Recommended later, not now.
11. `/contact` and the legal pages have short meta descriptions. Correct, just
    terse.

## 14. Prioritised 30-day SEO roadmap

**Week 1 — unblock and index**
1. Turn off Cloudflare's managed robots.txt (§11 step 1). *Nothing else matters
   until this is done.*
2. Verify the property in Search Console, submit the sitemap, request indexing
   for the 5 URLs in §11 step 4.
3. Run PageSpeed Insights on mobile for `/` and one guide; record LCP/INP.
4. Create the Razorpay **live** webhook and set `RAZORPAY_WEBHOOK_SECRET`.

**Week 2 — measure honestly**
5. Baseline in `/admin/analytics`: `sample_download → purchase_click →
   purchase_complete`, and Search Console impressions/clicks/queries.
6. Run one real ₹1 purchase + refund to confirm money-in, delivery and
   revocation end to end.

**Week 3–4 — earn the first rankings**
7. If LCP is font-bound, subset Fraunces or drop the unused axes.
8. Publish **2 more guides** only where a real gap exists — candidates: a
   niche-specific cold email guide (web designers / Shopify devs) and "WhatsApp
   outreach for Indian small businesses". Do not exceed two; they take editing.
9. Earn links the honest way: answer real questions on Reddit (`r/freelanceIndia`,
   `r/IndianFreelance`) and Quora with genuine advice and a link only where it
   answers the question.
10. Fix the deliverability prerequisites for the cold-email campaign (send from
    a subdomain, SPF/DKIM/DMARC, 15–20/day ramp) — the guides are now the
    landing pages those emails should point at, which is why they were built
    before the campaign.

**Ongoing**
11. Add `lastmod` updates to `src/app/sitemap.ts` whenever a page genuinely
    changes, and add new guides to `ARTICLES` + the footer column.

## 15. Claims that could not be verified

These are stated plainly so nothing here is mistaken for evidence:

- **No ranking, traffic, impression or conversion claim is made.** ClientFlow
  does not rank anywhere as a result of this work as far as I can measure; the
  work removes technical blockers and gives the site something to rank *with*.
- **No AI system is claimed to recommend ClientFlow.** Eligibility depends on
  systems outside this project's control, and the edge currently blocks them.
- **Search volume, difficulty and competition for every keyword are unverified.**
  No keyword data source was available; the mapping in §12 is intent-based.
- **Core Web Vitals are not measured.** Only transfer sizes were.
- **Rich results are not confirmed.** Markup is valid and truthful; Google has
  not been asked.
- **The refund and support terms are described, not verified** — they are your
  policy. I ensured the site no longer promises anything it cannot deliver
  ("free updates forever") and that the FAQ, Terms and refund page agree.
