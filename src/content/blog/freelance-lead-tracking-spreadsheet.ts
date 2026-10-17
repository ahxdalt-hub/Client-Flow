import type { Article } from "./types";

export const freelanceLeadTrackingSpreadsheet: Article = {
  slug: "freelance-lead-tracking-spreadsheet",
  title: "Freelance Lead Tracking Spreadsheet",
  h1: "A freelance lead tracking spreadsheet that you will actually keep updated",
  description:
    "Why a spreadsheet beats a CRM for solo freelancers, the 15 columns worth tracking, the dropdown values that keep it clean, and a 15-minute weekly review.",
  summary:
    "Most freelance trackers die in week two because they ask for too much. Here is the minimum set of columns that answers the only two questions that matter: who do I contact today, and where is my money.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingTime: "6 min read",
  audience: "Solo freelancers and small studios juggling 30–200 prospects",
  related: [
    "how-to-find-clients-as-a-freelancer-in-india",
    "how-to-follow-up-with-potential-clients",
    "freelance-proposal-template-guide",
  ],
  body: [
    {
      kind: "p",
      text: "The honest reason most freelancers do not track leads is that CRMs are built for teams. You get asked for a pipeline stage, a probability percentage, a lead source taxonomy — admin for a five-person sales floor, not for one person sending eight emails on a Tuesday.",
    },
    {
      kind: "p",
      text: "A spreadsheet works because you can keep it in the browser tab you already have open. But it only works if every field has an obvious use. The moment you start adding columns 'just in case', you stop updating it.",
    },
    { kind: "h2", text: "The 15 columns" },
    {
      kind: "table",
      head: ["Column", "Why it exists"],
      rows: [
        ["Business name", "The only identifier you need most days"],
        ["Contact name", "Emails to a person outperform emails to a company"],
        ["Channel", "Email, WhatsApp or LinkedIn — one per prospect"],
        ["Niche / category", "Lets you reuse the same template across similar businesses"],
        ["Source", "Where the prospect came from, so you can repeat what works"],
        ["Contact detail", "Email address or handle"],
        ["Status", "The single most important column — see below"],
        ["Date first contacted", "Starts the follow-up clock"],
        ["Next follow-up date", "What you actually work from each morning"],
        ["Follow-ups sent", "A count that stops you over-chasing"],
        ["Last reply", "A one-line summary of what they said"],
        ["Proposal sent?", "Yes/no, with a date"],
        ["Quoted value (INR)", "So you can add up real pipeline"],
        ["Outcome", "Won, lost, or parked — with the reason"],
        ["Notes", "Anything you will forget in ten days"],
      ],
    },
    {
      kind: "callout",
      title: "If you only keep three columns",
      text: "Business name, next follow-up date, and status. Those three answer \"who do I contact today?\" and \"where does everything stand?\" — which is 90% of the value.",
    },
    { kind: "h2", text: "Status: keep the list short" },
    {
      kind: "p",
      text: "Status drift is what kills trackers. Sixteen invented stages ('warm lead — tier 2') mean nothing and nobody updates them consistently. Seven values cover every real situation:",
    },
    {
      kind: "ul",
      items: [
        "To contact — on the list, nothing sent yet",
        "Contacted — first message sent, no reply",
        "Replied — they answered; conversation open",
        "Proposal sent — a number is on the table",
        "Won — paid or signed",
        "Lost — a clear no, or three follow-ups with no reply",
        "Parked — a real 'not now'; revisit on a set date",
      ],
    },
    {
      kind: "p",
      text: "Parked is the one people forget, and it is the most valuable. A prospect who said 'come back after Diwali' is not lost. Without a parked state they either sit in Contacted forever and get chased, or get deleted and forgotten.",
    },
    { kind: "h2", text: "Make the sheet do the remembering" },
    {
      kind: "p",
      text: "Two pieces of formatting turn a passive list into a working one:",
    },
    {
      kind: "ul",
      items: [
        "Conditional formatting on the follow-up date: anything before today turns red. You stop having to judge who is overdue — the colour tells you.",
        "Conditional formatting on status: won turns green, lost grey. At a glance you can see whether the sheet is mostly grey, which is a signal to change the email rather than send more of it.",
      ],
    },
    {
      kind: "p",
      text: "Dropdowns for Status, Channel and Source are worth the five minutes they take. Free-text status columns diverge within a week ('Contacted', 'contacted', 'Emailed', 'sent email') and then no filter or count means anything.",
    },
    { kind: "h2", text: "The dashboard: four numbers, not forty" },
    {
      kind: "p",
      text: "A useful dashboard answers questions you would actually act on. Four formulas are enough:",
    },
    {
      kind: "ol",
      items: [
        "Total leads in the sheet — are you actually adding to the list?",
        "Replies ÷ contacted — is the message working? Below roughly one in ten, rewrite the email before sending more.",
        "Proposals sent — how many real decisions are on the table?",
        "Open pipeline value — the sum of quoted values not yet won or lost. This is the number that tells you whether you can relax.",
      ],
    },
    {
      kind: "p",
      text: "The ratio matters more than the totals. Adding 200 leads a week does nothing for a reply rate of two per cent — that is a message problem, and volume makes it worse by burning your domain.",
    },
    { kind: "h2", text: "The weekly review, in 15 minutes" },
    {
      kind: "p",
      text: "Put it in the calendar as a recurring appointment, ideally Friday afternoon when sending feels pointless anyway.",
    },
    {
      kind: "ol",
      items: [
        "Filter to Status = Replied. Anyone who has waited more than two days gets a reply today.",
        "Filter to Status = Contacted and follow-up date in the past. Send step 2 or the easy exit.",
        "Filter to Status = Proposal sent and no movement in a week. Chase the decision, not the price.",
        "Move anything with a real 'not now' to Parked with a date. Move dead threads to Lost with a reason.",
        "Add new prospects until the To contact list has at least 15 names for next week.",
      ],
    },
    {
      kind: "p",
      text: "Fifteen minutes of admin is what separates a list of 300 businesses from an actual pipeline. The list is not the asset — the follow-up dates are.",
    },
    {
      kind: "callout",
      title: "No scraped data, deliberately",
      text: "The ClientFlow tracker ships with the columns, dropdowns, conditional formatting and dashboard formulas already built, and a single clearly-marked example row. It contains no prospect data, because buying a scraped list is how you get your domain blocked.",
    },
    {
      kind: "p",
      text: "The lead tracker is one of six files in the ClientFlow Outreach Kit, alongside the 66-page handbook, 20 email templates, 10 DM scripts, four editable proposals and the quick-start guide.",
    },
    {
      kind: "cta",
      text: "The free sample shows the handbook format in full, so you can judge the quality before spending anything.",
      label: "Try the free sample",
      href: "/sample",
    },
  ],
};
