"use client";

import Link from "next/link";
import { useState } from "react";

import { track } from "@/lib/analytics-client";
import {
  SUPPORT_CATEGORIES,
  type SupportCategory,
  type SupportTopic,
} from "@/lib/support-topics";

/* ── Glyphs ────────────────────────────────────────────────────── */

const GLYPHS: Record<string, React.ReactNode> = {
  card: <path d="M3 7h18v10H3zM3 11h18M7 15h3" />,
  download: <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />,
  refund: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
  book: <path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4zM20 4h-4a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z" />,
  shield: <path d="M12 3 5 6v6c0 4.4 3 8.2 7 9 4-.8 7-4.6 7-9V6z" />,
  key: <path d="M15 7a4 4 0 1 1-3.5 5.9L4 20.5 2.5 19l1-1-1-1 2-2 1 1L8 13.5A4 4 0 0 1 15 7" />,
  spark: <path d="M12 3v5m0 8v5M3 12h5m8 0h5M6.5 6.5l3 3m5 5 3 3m0-11-3 3m-5 5-3 3" />,
};

function Glyph({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {GLYPHS[name] ?? GLYPHS.spark}
    </svg>
  );
}

/* ── Steps ─────────────────────────────────────────────────────── */

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "What's this about?",
  2: "Which problem is it?",
  3: "Your details",
};

const ORDER_CODE_RE = /^CF-[0-9A-Z]{4,10}$/;

/** Resolve a `?topic=` deep-link slug to its category and topic. */
function findPreset(topicSlug: string): { category: SupportCategory; topic: SupportTopic } | null {
  if (!topicSlug) return null;
  for (const category of SUPPORT_CATEGORIES) {
    const topic = category.topics.find((t) => t.id === topicSlug);
    if (topic) return { category, topic };
  }
  return null;
}

type Submitted = { ticketCode: string; emailed: boolean };

export function TicketForm({
  initial,
}: {
  /**
   * Prefill values, resolved on the server from the query string. Reading them
   * here rather than with `useSearchParams` keeps the whole form in the
   * server-rendered HTML — no Suspense fallback, no layout shift, and the
   * categories and problem list are visible to crawlers.
   */
  initial?: { order?: string; topic?: string; email?: string };
}) {
  // Deep links from the order page, the recovery page and the refund policy:
  //   /support?order=CF-7K2M9Q&topic=link-expired&email=me@example.com
  //
  // These only seed the initial state: `useState` reads its value once, so a
  // visitor's own edits are never overwritten.
  const orderParam = (initial?.order ?? "").trim().toUpperCase();
  const emailParam = initial?.email ?? "";

  // Cheap linear scans over a handful of categories — the React Compiler
  // memoizes these itself, so hand-written useMemo only fights it.
  const preset = findPreset(initial?.topic ?? "");

  const [step, setStep] = useState<Step>(preset ? 3 : 1);
  const [categoryId, setCategoryId] = useState<string | null>(preset?.category.id ?? null);
  const [topicId, setTopicId] = useState<string | null>(preset?.topic.id ?? null);

  const [subject, setSubject] = useState(preset?.topic.label ?? "");
  const [subjectEdited, setSubjectEdited] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [orderCode, setOrderCode] = useState(
    ORDER_CODE_RE.test(orderParam) ? orderParam : "",
  );
  const [consent, setConsent] = useState(false);

  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const category: SupportCategory | undefined = SUPPORT_CATEGORIES.find(
    (c) => c.id === categoryId,
  );
  const topic: SupportTopic | undefined = category?.topics.find(
    (t) => t.id === topicId,
  );

  function chooseCategory(id: string) {
    setCategoryId(id);
    setTopicId(null);
    setError(null);
    setStep(2);
  }

  function chooseTopic(c: SupportCategory, t: SupportTopic) {
    setCategoryId(c.id);
    setTopicId(t.id);
    if (!subjectEdited) setSubject(t.label);
    setError(null);
    setStep(3);
    track("support_topic_selected", { category: c.id, topic: t.id });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!categoryId || !topicId) {
      setError("Choose what this is about first.");
      setStep(1);
      return;
    }
    if (subject.trim().length < 4) {
      setError("Add a subject with at least 4 characters.");
      return;
    }
    if (message.trim().length < 20) {
      setError("Please describe the problem in at least 20 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a valid email address so we can reply.");
      return;
    }
    if (orderCode.trim() && !ORDER_CODE_RE.test(orderCode.trim().toUpperCase())) {
      setError("Order codes look like CF-7K2M9Q. Leave it blank if you don't have one.");
      return;
    }
    if (!consent) {
      setError("Please confirm we may use your email to reply.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category: categoryId,
          topic: topicId,
          subject: subject.trim(),
          message: message.trim(),
          name: name.trim(),
          email: email.trim(),
          orderCode: orderCode.trim().toUpperCase(),
          website: honeypot,
          consent: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ticketCode?: string;
        emailed?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ticketCode) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted({ ticketCode: data.ticketCode, emailed: Boolean(data.emailed) });
      track("support_ticket_created", {
        category: categoryId,
        topic: topicId,
        emailed: Boolean(data.emailed),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return <TicketReceipt submitted={submitted} />;
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <Progress step={step} onJump={(s) => setStep(s)} canJump={(s) =>
        s === 1 ? true : s === 2 ? Boolean(categoryId) : Boolean(categoryId && topicId)
      } />

      {/* ── Step 1 — category ───────────────────────────────────── */}
      {step === 1 ? (
        <fieldset>
          <legend className="sr-only">What is this about?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SUPPORT_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => chooseCategory(c.id)}
                aria-pressed={categoryId === c.id}
                className={`card-lift group flex items-start gap-3.5 rounded-[var(--radius-card)] border bg-paper p-4 text-left transition-colors ${
                  categoryId === c.id ? "border-accent" : "border-line hover:border-line-strong"
                }`}
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-tint text-accent">
                  <Glyph name={c.glyph} className="h-[1.15rem] w-[1.15rem]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.95rem] font-semibold text-ink">
                    {c.label}
                  </span>
                  <span className="mt-1 block text-[0.82rem] leading-relaxed text-muted">
                    {c.blurb}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* ── Step 2 — topic ──────────────────────────────────────── */}
      {step === 2 && category ? (
        <fieldset>
          <legend className="sr-only">Which problem is it?</legend>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[0.95rem] font-semibold text-ink">{category.label}</p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[0.82rem] text-accent underline underline-offset-2"
            >
              Change category
            </button>
          </div>
          <p className="mt-1 text-[0.84rem] text-muted">
            Pick the closest match. If nothing fits exactly, choose{" "}
            <em>Something else entirely</em> in the last group.
          </p>
          <ul className="mt-4 space-y-2">
            {category.topics.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => chooseTopic(category, t)}
                  aria-pressed={topicId === t.id}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border bg-paper px-4 py-3 text-left text-[0.9rem] text-ink transition-colors ${
                    topicId === t.id ? "border-accent" : "border-line hover:border-line-strong"
                  }`}
                >
                  {t.label}
                  <span aria-hidden="true" className="text-accent">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      {/* ── Step 3 — details ────────────────────────────────────── */}
      {step === 3 && category && topic ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-paper px-4 py-3 text-[0.84rem]">
            <span className="font-semibold text-ink">{category.label}</span>
            <span aria-hidden="true" className="text-muted">
              /
            </span>
            <span className="text-muted">{topic.label}</span>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="ml-auto text-accent underline underline-offset-2"
            >
              Change
            </button>
          </div>

          <p className="rounded-xl bg-accent-tint px-4 py-3 text-[0.84rem] leading-relaxed text-ink/80">
            <strong className="font-semibold text-ink">Helps us answer faster:</strong>{" "}
            {topic.ask}
          </p>

          <Field
            id="ticket-subject"
            label="Subject"
            hint={`${subject.trim().length}/140`}
          >
            <input
              id="ticket-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value.slice(0, 140));
                setSubjectEdited(true);
              }}
              maxLength={140}
              required
              className={INPUT}
              placeholder="One line describing the problem"
            />
          </Field>

          <Field
            id="ticket-message"
            label="Describe the problem"
            hint={`${message.trim().length}/5000`}
          >
            <textarea
              id="ticket-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 5000))}
              rows={8}
              required
              className={`${INPUT} h-auto py-3 leading-relaxed`}
              placeholder={
                "What you expected, what happened instead, and anything you already tried.\n\nIf you saw an error message, paste it exactly."
              }
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="ticket-email" label="Email for our reply">
              <input
                id="ticket-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field id="ticket-name" label="Name" optional>
              <input
                id="ticket-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 80))}
                className={INPUT}
                placeholder="So we know who we're writing to"
                autoComplete="name"
              />
            </Field>
          </div>

          <Field
            id="ticket-order"
            label="Order code"
            optional
            hint="CF-XXXXXX — on your order confirmation page"
          >
            <input
              id="ticket-order"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value.toUpperCase().slice(0, 12))}
              className={`${INPUT} font-mono uppercase`}
              placeholder="CF-7K2M9Q"
              spellCheck={false}
            />
          </Field>

          {/* Honeypot — hidden from people, irresistible to bots. */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="ticket-website">Website</label>
            <input
              id="ticket-website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-paper p-4 text-[0.84rem] leading-relaxed text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span>
              We may use this email address to reply about this request. Nothing
              else — see the{" "}
              <Link href="/privacy" className="text-accent underline underline-offset-2">
                privacy policy
              </Link>
              .
            </span>
          </label>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.86rem] text-red-700"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary inline-flex h-[3.25rem] items-center gap-2.5 rounded-full px-8 text-[1rem] font-semibold disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send to support"}
            </button>
            <p className="text-[0.8rem] text-muted">
              You&apos;ll get a ticket code to quote in any follow-up.
            </p>
          </div>
        </div>
      ) : null}
    </form>
  );
}

/* ── Receipt ───────────────────────────────────────────────────── */

function TicketReceipt({ submitted }: { submitted: Submitted }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-paper p-7 md:p-9">
      <p className="eyebrow">Ticket created</p>
      <h2 className="display mt-3 text-[clamp(1.6rem,3.4vw,2.2rem)] text-ink">
        That&apos;s with us.
      </h2>
      <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-muted">
        {submitted.emailed
          ? "A copy has landed in our support inbox and it is queued for a human to read. "
          : "It is queued for a human to read. "}
        Quote the code below if you write again — it lets us pull up your exact
        request in seconds.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <code className="rounded-xl border border-line bg-ivory px-4 py-3 font-mono text-[1.15rem] font-semibold tracking-wider text-ink">
          {submitted.ticketCode}
        </code>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(submitted.ticketCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
          className="rounded-full border border-line px-4 py-2.5 text-[0.84rem] font-semibold text-ink transition-colors hover:border-line-strong"
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>

      <ol className="mt-8 space-y-3 border-t border-line pt-6 text-[0.9rem] leading-relaxed text-muted">
        <li>
          <strong className="font-semibold text-ink">1.</strong> We read it in the
          order it arrived — anything involving a payment you have already made
          is answered first.
        </li>
        <li>
          <strong className="font-semibold text-ink">2.</strong> If we need
          anything else, we reply to the address you gave. Usually that same
          working day (IST).
        </li>
        <li>
          <strong className="font-semibold text-ink">3.</strong> Refunds are
          cross-checked against your payment reference and order code, so have
          both to hand if it comes to that.
        </li>
      </ol>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6 text-[0.88rem]">
        <Link href="/recover" className="text-accent underline underline-offset-2">
          Recover a download link yourself
        </Link>
        <Link href="/faq" className="text-accent underline underline-offset-2">
          Read the FAQ
        </Link>
        <Link href="/" className="text-accent underline underline-offset-2">
          Back to the kit
        </Link>
      </div>
    </div>
  );
}

/* ── Bits ──────────────────────────────────────────────────────── */

const INPUT =
  "h-11 w-full rounded-xl border border-line-strong bg-paper px-4 text-[0.9rem] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20";

function Field({
  id,
  label,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.82rem] font-semibold text-ink">
          {label}
          {optional ? <span className="ml-1.5 font-normal text-muted">optional</span> : null}
        </label>
        {hint ? <span className="text-[0.72rem] text-muted">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Progress({
  step,
  onJump,
  canJump,
}: {
  step: Step;
  onJump: (s: Step) => void;
  canJump: (s: Step) => boolean;
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {([1, 2, 3] as Step[]).map((s) => {
        const active = s === step;
        const done = s < step;
        const allowed = canJump(s);
        return (
          <li key={s}>
            <button
              type="button"
              disabled={!allowed}
              aria-current={active ? "step" : undefined}
              onClick={() => allowed && onJump(s)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold transition-colors ${
                active
                  ? "border-ink bg-ink text-ivory"
                  : done
                    ? "border-line bg-paper text-ink"
                    : "border-line text-muted"
              } ${allowed ? "" : "cursor-not-allowed opacity-60"}`}
            >
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 place-items-center rounded-full text-[0.68rem] ${
                  active ? "bg-ivory/20 text-ivory" : "bg-line/50 text-muted"
                }`}
              >
                {done ? "✓" : s}
              </span>
              {STEP_LABELS[s]}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
