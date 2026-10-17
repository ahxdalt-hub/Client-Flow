import type { Article } from "./types";

export const coldEmailTemplatesForFreelancers: Article = {
  slug: "cold-email-templates-for-freelancers",
  title: "Cold Email Templates for Freelancers",
  h1: "Cold email templates for freelancers — and the reason they work",
  description:
    "The cold email structure freelancers actually get replies from: five parts, worked examples, subject lines, and the mistakes that send mail to spam.",
  summary:
    "Templates are not the hard part — a believable reason for writing is. Here is the five-part structure behind every template in the ClientFlow kit, with filled examples.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingTime: "8 min read",
  audience: "Freelancers who need clients but have no warm intros",
  related: [
    "how-to-follow-up-with-potential-clients",
    "how-to-find-clients-as-a-freelancer-in-india",
    "freelance-lead-tracking-spreadsheet",
  ],
  body: [
    {
      kind: "p",
      text: "Most freelancer cold emails fail for a boring reason: they are written from the sender's side of the table. The email explains what the freelancer does, links a portfolio, and asks for time. The recipient — usually a busy owner or marketing lead — has no reason to care yet.",
    },
    {
      kind: "p",
      text: "A template helps because it stops you improvising under pressure. But a template is only the container. What makes it work is the observation you put inside it.",
    },
    { kind: "h2", text: "The five-part structure" },
    {
      kind: "p",
      text: "Every template in the ClientFlow handbook follows the same skeleton. Once you can see the skeleton, you can write a new one in five minutes.",
    },
    {
      kind: "ol",
      items: [
        "Observation — one specific, checkable fact about their business. Not a compliment.",
        "Consequence — what that fact probably costs them, stated as a possibility, not a diagnosis.",
        "Credibility — one line on why you are qualified to comment. No history lesson.",
        "Ask — a small, low-effort next step. Rarely 'book a 30-minute call'.",
        "Exit — an honest way to say no, so silence is not their only option.",
      ],
    },
    {
      kind: "callout",
      title: "The observation is the whole email",
      text: "If the first line could be pasted into an email to a different company without editing, it is not an observation. It is a greeting. Rewrite it or skip the prospect.",
    },
    { kind: "h2", text: "A filled example for a web designer" },
    {
      kind: "p",
      text: "Imagine a dental clinic in Pune. Its booking page takes visitors to a generic contact form, and the site loads slowly on mobile. Here is the same five-part structure applied without inventing anything:",
    },
    {
      kind: "template",
      title: "Template — fixable website issue",
      lines: [
        "Subject: The booking page on your site",
        "",
        "Hi Dr. Kulkarni,",
        "",
        "I was looking at your site before writing. The 'Book appointment' button",
        "goes to a general contact form rather than a calendar — so a patient who",
        "wants a Tuesday evening slot has to describe it in words and wait for a",
        "reply. On a phone the page also takes a few seconds to become usable.",
        "",
        "I rebuild booking flows for clinics, mostly on WordPress. Last month I",
        "took a similar Bengaluru clinic from a contact form to a self-serve",
        "calendar, which cut their back-and-forth to one confirmation message.",
        "",
        "If a two-line reply is easier than a call, tell me which is the bigger",
        "problem — the booking step or the load time — and I'll send a short fix",
        "plan for that one thing, free.",
        "",
        "If this is not a priority right now, that's completely fine — just say",
        "'not now' and I won't write again.",
        "",
        "— Your name",
        "yourname.com",
      ],
    },
    {
      kind: "p",
      text: "Notice what is absent: no 'I hope this email finds you well', no three-paragraph company history, no attachment, no Calendly link. The ask is a two-line reply, not a meeting. That is deliberate — the goal of a first email is a reply, not a sale.",
    },
    { kind: "h2", text: "Three more openings that survive a quick read" },
    { kind: "h3", text: "The SEO gap" },
    {
      kind: "p",
      text: "Lead with a page you can name. \"Your 'interior designer in Kochi' page targets the phrase but the title tag says 'Home — Studio Name'. That is usually the difference between page one and page four.\" Naming a specific page proves you looked. It also makes the claim checkable, which is why it earns trust instead of suspicion.",
    },
    { kind: "h3", text: "The quiet channel" },
    {
      kind: "p",
      text: "Useful for social media managers: \"You post four times a week on Instagram and nothing on LinkedIn, where most of your B2B leads probably sit. Same content, different room.\" This works because it names an existing strength, not a deficiency.",
    },
    { kind: "h3", text: "The reconnect" },
    {
      kind: "p",
      text: "For anyone with an old client list: \"We worked together on the Diwali campaign in 2024. I've since moved to retainer work and wondered whether the product page still needs the seasonal rewrite we never finished.\" Past clients are the highest-reply audience you have and the most commonly forgotten.",
    },
    { kind: "h2", text: "Subject lines: shorter than you think" },
    {
      kind: "p",
      text: "Write two per template and rotate them. Good subject lines for this kind of mail are descriptions of the recipient's business, not descriptions of your offer:",
    },
    {
      kind: "ul",
      items: [
        "“The booking page on your site” — specific, neutral, no pitch.",
        "“Your Kochi page's title tag” — promises a concrete finding.",
        "“After the Diwali campaign” — a shared reference for reconnects.",
        "“Two things on the new product page” — sets a bounded scope.",
      ],
    },
    {
      kind: "p",
      text: "Avoid questions in subject lines ('Can I help with your website?'), anything with the word 'opportunity', and fake replies like 'Re: your website'. They read as marketing regardless of what the body says.",
    },
    { kind: "h2", text: "What actually sends you to spam" },
    {
      kind: "p",
      text: "Inbox placement is mostly about sending behaviour, not clever wording. The practical rules:",
    },
    {
      kind: "ul",
      items: [
        "Send from a real human address on a domain you own, with SPF, DKIM and DMARC configured. If you have never set these up, fix that before writing another template.",
        "Start at a handful of emails a day and increase slowly. A brand-new domain blasting 200 emails on day one is the classic spam signature.",
        "No attachments and no image-only emails on a first touch. Both are heavily weighted against you.",
        "Keep a plain-text look: a real signature, no tracking pixels you cannot explain, no link shorteners.",
        "Honour opt-outs the first time, everywhere. One angry 'remove me' reply costs more than the ten emails you would have sent.",
      ],
    },
    {
      kind: "callout",
      title: "Free sending limits exist for a reason",
      text: "Gmail and Outlook both cap how much mail a new account can send in a day. If your first campaign is 300 emails from a fresh address, most of it will not be delivered — and the damage is to your domain, not just that campaign.",
    },
    { kind: "h2", text: "When not to send a cold email" },
    {
      kind: "ul",
      items: [
        "You cannot name a specific, checkable fact about their business.",
        "Their site already does the thing you were going to propose fixing.",
        "You would need to invent a case study or a number to make the email work.",
        "The prospect is a direct competitor of a client you already have, and your contract says otherwise.",
      ],
    },
    {
      kind: "p",
      text: "Skipping a prospect costs you nothing. Sending a generic email to a list of 300 costs you your domain's reputation.",
    },
    {
      kind: "p",
      text: "The ClientFlow kit contains 20 templates built on this structure — each with two subject-line options, a filled example, and a list of situations where you should not use it. One of them, in full, is in the free sample.",
    },
    {
      kind: "cta",
      text: "Read one complete template before deciding anything — it is the same quality as the paid kit.",
      label: "Download the free sample — PDF",
      href: "/sample",
    },
  ],
};
