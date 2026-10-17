/**
 * The support ticket taxonomy — one source of truth shared by three callers:
 *
 *   - the public form at /support (renders the categories and topics),
 *   - POST /api/support (validates that a submitted topic really exists),
 *   - the admin panel (renders labels and groups tickets by category).
 *
 * Client-safe on purpose: the form is a client component and imports this
 * directly, so no `server-only` here.
 *
 * `priority` is the triage default. Anything involving money the customer has
 * already paid is `urgent` and sorts to the top of the admin queue; a "nice to
 * have" request is `low`. The owner can override it per ticket.
 */

export type TicketPriority = "urgent" | "high" | "normal" | "low";

export type SupportTopic = {
  /** Stable slug stored in the database. Never rename — it is persisted. */
  id: string;
  label: string;
  priority: TicketPriority;
  /** What we need from the customer to answer this well. Shown under the field. */
  ask: string;
};

export type SupportCategory = {
  id: string;
  label: string;
  /** One line explaining when to pick this category. */
  blurb: string;
  /** Key into the glyph set in the form component. */
  glyph: string;
  topics: SupportTopic[];
};

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: "payment",
    label: "Payment & billing",
    blurb: "You paid, tried to pay, or were charged something unexpected.",
    glyph: "card",
    topics: [
      {
        id: "payment-failed-money-left",
        label: "Payment failed but money left my account",
        priority: "urgent",
        ask: "Send the amount, the time it happened, and the last four digits, UPI id or bank name shown on the debit.",
      },
      {
        id: "charged-twice",
        label: "I was charged twice for one purchase",
        priority: "urgent",
        ask: "Both payment references (they start with pay_) and the two amounts, if you can see them.",
      },
      {
        id: "paid-no-download",
        label: "Payment succeeded but I got no download link",
        priority: "urgent",
        ask: "The email address you paid with and the payment reference (pay_...) if you have it.",
      },
      {
        id: "wrong-amount",
        label: "I was charged the wrong amount",
        priority: "urgent",
        ask: "The amount you expected and the amount you were charged.",
      },
      {
        id: "no-order-code",
        label: "I paid but never saw an order code",
        priority: "high",
        ask: "The email address you paid with, and roughly when.",
      },
      {
        id: "payment-declined",
        label: "My UPI or card was declined at checkout",
        priority: "normal",
        ask: "What the screen said when it failed, and which method you used.",
      },
      {
        id: "payment-pending",
        label: "My payment shows as pending",
        priority: "normal",
        ask: "How long it has been pending, and the payment reference if you have one.",
      },
      {
        id: "invoice-receipt",
        label: "I need a receipt or invoice",
        priority: "low",
        ask: "The name and address (or GSTIN) the invoice should be made out to.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Download & delivery",
    blurb: "The files did not arrive, will not open, or are incomplete.",
    glyph: "download",
    topics: [
      {
        id: "link-not-working",
        label: "The download link doesn't work",
        priority: "high",
        ask: "What happens when you click it — nothing, an error, or a blank page.",
      },
      {
        id: "file-corrupted",
        label: "A file won't open or looks corrupted",
        priority: "high",
        ask: "Which file, which app you opened it with, and what the error said.",
      },
      {
        id: "file-missing",
        label: "A file is missing from the kit",
        priority: "high",
        ask: "Which file you expected and which files you received.",
      },
      {
        id: "link-expired",
        label: "My download link has expired",
        priority: "normal",
        ask: "Your order code (CF-...) so we can reissue it straight away.",
      },
      {
        id: "zip-wont-extract",
        label: "The ZIP won't extract",
        priority: "normal",
        ask: "The device and app you are using to open it.",
      },
      {
        id: "download-incomplete",
        label: "The download stopped part-way",
        priority: "normal",
        ask: "Your connection type and the file size you ended up with, if shown.",
      },
      {
        id: "resend-new-email",
        label: "Please send the kit to a different email",
        priority: "low",
        ask: "The address you bought with, and the new address.",
      },
      {
        id: "wrong-download",
        label: "I think I downloaded the wrong thing",
        priority: "normal",
        ask: "What you downloaded and what you expected.",
      },
    ],
  },
  {
    id: "refund",
    label: "Refunds",
    blurb: "You want money back, or want to know where a refund is.",
    glyph: "refund",
    topics: [
      {
        id: "refund-failed-delivery",
        label: "Refund — the files never arrived, or arrived broken",
        priority: "high",
        ask: "Your order code and what went wrong on our side.",
      },
      {
        id: "refund-duplicate",
        label: "Refund — I was charged twice",
        priority: "urgent",
        ask: "Both payment references and the amounts.",
      },
      {
        id: "refund-wrong-amount",
        label: "Refund — I was charged the wrong amount",
        priority: "high",
        ask: "What you were charged and what you expected to pay.",
      },
      {
        id: "refund-status",
        label: "Where is my refund?",
        priority: "normal",
        ask: "When it was promised and the reference you were given.",
      },
      {
        id: "refund-change-of-mind",
        label: "Refund — I changed my mind",
        priority: "low",
        ask: "Whether you have already downloaded the kit — it changes what we can do.",
      },
      {
        id: "refund-policy-question",
        label: "A question about the refund policy",
        priority: "low",
        ask: "Which part of the policy is unclear.",
      },
    ],
  },
  {
    id: "product",
    label: "Using the kit",
    blurb: "You have the files and need help putting them to work.",
    glyph: "book",
    topics: [
      {
        id: "where-to-start",
        label: "I don't know where to start",
        priority: "normal",
        ask: "Your line of work and roughly how many clients you want.",
      },
      {
        id: "template-question",
        label: "A question about one of the email templates",
        priority: "normal",
        ask: "The template number and the line you are unsure about.",
      },
      {
        id: "dm-script-question",
        label: "A question about a WhatsApp or LinkedIn script",
        priority: "normal",
        ask: "Which script and the situation you are writing for.",
      },
      {
        id: "personalise-help",
        label: "Help personalising a template for my niche",
        priority: "normal",
        ask: "Your niche and the specific business you have in mind.",
      },
      {
        id: "tracker-excel",
        label: "The lead tracker won't open in Excel",
        priority: "normal",
        ask: "Your Excel version and the exact message it shows.",
      },
      {
        id: "tracker-sheets",
        label: "Using the lead tracker in Google Sheets",
        priority: "normal",
        ask: "What happens when you import it, and which part misbehaves.",
      },
      {
        id: "proposal-question",
        label: "A question about the proposal templates",
        priority: "normal",
        ask: "Which proposal and which section.",
      },
      {
        id: "handbook-unclear",
        label: "Part of the handbook isn't clear",
        priority: "low",
        ask: "The page number or section heading.",
      },
      {
        id: "advice-doesnt-fit",
        label: "The advice doesn't fit my situation",
        priority: "normal",
        ask: "What you sell, who you sell it to, and what you have tried.",
      },
      {
        id: "request-template",
        label: "Request — please add a template or a niche",
        priority: "low",
        ask: "The niche or template you want, and why it would help.",
      },
    ],
  },
  {
    id: "licence",
    label: "Licensing",
    blurb: "What you may do with the files, and who may use them.",
    glyph: "shield",
    topics: [
      {
        id: "team-licence",
        label: "Team or multi-seat licence",
        priority: "normal",
        ask: "How many people would use the kit, and the business name.",
      },
      {
        id: "edit-reuse",
        label: "Can I edit and reuse the files?",
        priority: "low",
        ask: "What you intend to change and where it will end up.",
      },
      {
        id: "share-with-client",
        label: "Can I share a file with a client?",
        priority: "low",
        ask: "Which file, and whether it is for their internal use.",
      },
      {
        id: "commercial-use",
        label: "Commercial use on client work",
        priority: "low",
        ask: "What you plan to deliver and to whom.",
      },
      {
        id: "resell",
        label: "Can I resell or bundle the files?",
        priority: "low",
        ask: "How you would package or price it.",
      },
      {
        id: "classroom",
        label: "Using the kit in a course or workshop",
        priority: "low",
        ask: "The audience size and whether it is paid.",
      },
    ],
  },
  {
    id: "access",
    label: "Access & recovery",
    blurb: "You cannot find your order, your code, or your download page.",
    glyph: "key",
    topics: [
      {
        id: "lost-order-code",
        label: "I lost my order code",
        priority: "normal",
        ask: "The email address you paid with.",
      },
      {
        id: "cant-find-order-page",
        label: "I can't find my order confirmation page",
        priority: "normal",
        ask: "The email address you paid with and roughly when you bought.",
      },
      {
        id: "browser-wiped",
        label: "I cleared my browser and lost the link",
        priority: "normal",
        ask: "Your order code, or the email you paid with.",
      },
      {
        id: "email-changed",
        label: "My email address has changed",
        priority: "low",
        ask: "The old address and the new one.",
      },
      {
        id: "other-device",
        label: "I need the files on another device",
        priority: "low",
        ask: "Which device you are moving to.",
      },
    ],
  },
  {
    id: "other",
    label: "Something else",
    blurb: "A problem with the site, feedback, or a question before you buy.",
    glyph: "spark",
    topics: [
      {
        id: "pre-purchase",
        label: "A question before I buy",
        priority: "normal",
        ask: "What you need to know to decide.",
      },
      {
        id: "site-bug",
        label: "Something on the website is broken",
        priority: "normal",
        ask: "The page, what you expected, and what happened instead.",
      },
      {
        id: "feedback",
        label: "Feedback or a suggestion",
        priority: "low",
        ask: "What would make the kit better for you.",
      },
      {
        id: "affiliate",
        label: "Affiliate or partnership enquiry",
        priority: "low",
        ask: "Who you are and how you would reach people.",
      },
      {
        id: "press",
        label: "Press or media enquiry",
        priority: "low",
        ask: "The outlet, the angle, and your deadline.",
      },
      {
        id: "other-general",
        label: "Something else entirely",
        priority: "normal",
        ask: "As much detail as you can give — it saves a round trip.",
      },
    ],
  },
];

/** Flat list of every topic, tagged with its category. */
export const ALL_TOPICS: (SupportTopic & {
  categoryId: string;
  categoryLabel: string;
})[] = SUPPORT_CATEGORIES.flatMap((c) =>
  c.topics.map((t) => ({ ...t, categoryId: c.id, categoryLabel: c.label })),
);

export function getCategory(id: string): SupportCategory | undefined {
  return SUPPORT_CATEGORIES.find((c) => c.id === id);
}

export function getTopic(
  categoryId: string,
  topicId: string,
): SupportTopic | undefined {
  const category = getCategory(categoryId);
  return category?.topics.find((t) => t.id === topicId);
}

/** Label for a stored (categoryId, topicId) pair, with a safe fallback. */
export function topicLabel(categoryId: string, topicId: string): string {
  const topic = getTopic(categoryId, topicId);
  if (topic) return topic.label;
  return topicId.replace(/-/g, " ");
}

export function categoryLabel(categoryId: string): string {
  return getCategory(categoryId)?.label ?? categoryId;
}

/** Stored priority for a topic, defaulting to `normal` for unknown slugs. */
export function priorityFor(categoryId: string, topicId: string): TicketPriority {
  return getTopic(categoryId, topicId)?.priority ?? "normal";
}

export const PRIORITY_ORDER: TicketPriority[] = ["urgent", "high", "normal", "low"];

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

/** The lifecycle an owner works a ticket through. */
export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting: "Waiting on customer",
  resolved: "Resolved",
  closed: "Closed",
};

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && (TICKET_STATUSES as readonly string[]).includes(value);
}
