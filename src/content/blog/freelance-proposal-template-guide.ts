import type { Article } from "./types";

export const freelanceProposalTemplateGuide: Article = {
  slug: "freelance-proposal-template-guide",
  title: "Freelance Proposal Template Guide",
  h1: "A freelance proposal template built to prevent scope creep",
  description:
    "The ten sections every freelance proposal needs — scope, revision limits, payment milestones and exclusions — plus how to present price so it gets a yes.",
  summary:
    "Scope creep is rarely caused by a difficult client. It is caused by a proposal that never said what 'done' means. Ten sections fix it, and only two of them are about money.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingTime: "7 min read",
  audience: "Freelancers who keep absorbing extra work for free",
  related: [
    "how-to-follow-up-with-potential-clients",
    "cold-email-templates-for-freelancers",
    "freelance-lead-tracking-spreadsheet",
  ],
  body: [
    {
      kind: "p",
      text: "Ask a freelancer why a project went badly and the answer is usually 'the client kept adding things'. Ask for the proposal and the scope section says something like 'website design and development'. That is not a scope. It is a category.",
    },
    {
      kind: "p",
      text: "A proposal has one job beyond describing the work: to make the boundary visible before the relationship starts, while everyone is still friendly. Here are the ten sections that do it.",
    },
    { kind: "h2", text: "The ten sections" },
    {
      kind: "table",
      head: ["Section", "What it must pin down"],
      rows: [
        ["1. Objectives", "The client's goal, in their words — not yours"],
        ["2. Scope of work", "Named deliverables, counted, with a page or item limit"],
        ["3. Out of scope", "The two or three things clients always assume are included"],
        ["4. Timeline", "Dates or a dependency chain, with who owes what first"],
        ["5. Client responsibilities", "Content, access, approvals — and what happens if they slip"],
        ["6. Revisions", "How many rounds, what counts as a round, price after that"],
        ["7. Payment milestones", "Amounts and trigger points, usually an advance"],
        ["8. Assumptions & exclusions", "Platforms, licences, third-party costs, hosting"],
        ["9. Validity", "How long the quote holds, so pricing can rise"],
        ["10. Acceptance", "A simple, low-friction way to say yes"],
      ],
    },
    {
      kind: "callout",
      title: "Count things",
      text: "\"5 pages\", \"2 revision rounds\", \"1 landing page with up to 3 sections\". A number is enforceable and a number is a starting point for a paid change order. An adjective is an argument waiting to happen.",
    },
    { kind: "h2", text: "Section 3 is the one that saves your weekends" },
    {
      kind: "p",
      text: "Out of scope is where you pre-empt the requests you already know are coming. For a web project they are usually: copywriting, photography, logo design, and ongoing maintenance. Saying so up front is not defensive — it is how you avoid a tense conversation six weeks in.",
    },
    {
      kind: "template",
      title: "Example — out of scope wording",
      lines: [
        "Not included in this proposal:",
        "",
        "• Copywriting. You supply final text; I place and format it.",
        "• Photography and stock licensing. Licensed images are billed at cost.",
        "• Logo and brand identity work (quoted separately).",
        "• Ongoing maintenance after the 14-day handover window.",
        "",
        "Any of the above can be added with a written change order before the",
        "work starts. Change orders are quoted at my standard hourly rate.",
      ],
    },
    { kind: "h2", text: "Revisions: define the word" },
    {
      kind: "p",
      text: "'Unlimited revisions' is the single most expensive phrase in freelance contracts. Two rounds is generous if a round is defined: one consolidated set of feedback, delivered once, not a drip of individual email comments over a fortnight.",
    },
    {
      kind: "p",
      text: "A round that changes the direction of the work — new pages, a different audience, a different platform — is not a revision. Call that a change order in the proposal and you will never have to have that conversation live.",
    },
    { kind: "h2", text: "Payment milestones" },
    {
      kind: "p",
      text: "For anything over a few days of work, split it. A common structure that clients accept without friction:",
    },
    {
      kind: "ul",
      items: [
        "40% advance to start and reserve the slot in the calendar",
        "30% on approval of the design or first milestone",
        "30% on delivery, before final files and handover",
      ],
    },
    {
      kind: "p",
      text: "The advance is not about distrust. It is the mechanism that turns a maybe into a commitment, and it is what lets you decline other work for those weeks with confidence. A client who refuses any advance at all is telling you something worth hearing early.",
    },
    {
      kind: "callout",
      title: "Use illustrative figures, then replace them",
      text: "Templates ship with placeholder INR amounts so the structure is obvious. Delete every one of them. A leftover sample number in a live proposal is the fastest way to lose credibility.",
    },
    { kind: "h2", text: "Presenting the price" },
    {
      kind: "ol",
      items: [
        "State the number once, in the context of the milestones. Repeating a price makes it sound negotiable.",
        "Never apologise for it or add 'but I'm flexible' unprompted. That converts a price into an opening bid.",
        "Give one option, not three tiers. Three tiers turn a decision into a project.",
        "Attach the validity period so the number has an expiry and you are not held to it in three months.",
      ],
    },
    { kind: "h2", text: "The follow-up after sending" },
    {
      kind: "p",
      text: "A proposal is the highest-intent moment in your pipeline, and the most commonly mishandled: freelancers send it and wait. Chase the decision, not the price. 'Is there anything in section 4 that needs changing?' invites a reply about content, whereas 'did you get a chance to look?' invites silence.",
    },
    {
      kind: "p",
      text: "The ClientFlow kit includes four editable proposals — website, SEO, social media and Shopify — each with all ten sections already structured, marked placeholder figures, and the same revision and change-order language you can use as-is.",
    },
    {
      kind: "cta",
      text: "The free sample shows how the ClientFlow handbook is written before you buy.",
      label: "Download the free sample",
      href: "/sample",
    },
  ],
};
