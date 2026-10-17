import type { Article } from "./types";

export const howToFollowUpWithPotentialClients: Article = {
  slug: "how-to-follow-up-with-potential-clients",
  title: "How to Follow Up With a Potential Client",
  h1: "How to follow up with a potential client without sounding desperate",
  description:
    "A four-step follow-up system for freelancers: exact message templates, timing, objection handling, and a clear rule for when to stop chasing.",
  summary:
    "Most deals are lost in the gap between the first reply and the second message. A four-step sequence, with the exact wording, fixes that without turning you into a chaser.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingTime: "7 min read",
  audience: "Freelancers with silent threads and unanswered proposals",
  related: [
    "cold-email-templates-for-freelancers",
    "freelance-proposal-template-guide",
    "freelance-lead-tracking-spreadsheet",
  ],
  body: [
    {
      kind: "p",
      text: "Freelancers generally do not lose work because the first email was bad. They lose it because the conversation stopped and neither side said so. The prospect meant to reply; you did not want to nag; three weeks later the thread is dead and you assume the answer was no.",
    },
    {
      kind: "p",
      text: "A follow-up system replaces that guesswork with a schedule you decided in advance, when you were calm. Four messages, spaced out, each with a different job.",
    },
    { kind: "h2", text: "The four steps" },
    {
      kind: "table",
      head: ["Step", "When", "Job of the message"],
      rows: [
        ["1 — First touch", "Day 0", "Earn a reply with one specific observation"],
        ["2 — Useful follow-up", "+3 business days", "Add something new; never 'just checking in'"],
        ["3 — Easy exit", "+5–7 business days", "Offer a clean no, and make it easy to take"],
        ["4 — Close the loop", "+10 business days after that", "Say goodbye properly; leave the door open"],
      ],
    },
    {
      kind: "p",
      text: "Total elapsed time: roughly three weeks. After that, stop. Three weeks of quiet persistence reads as organised. Three months reads as a problem.",
    },
    { kind: "h2", text: "Step 2: the follow-up that adds something" },
    {
      kind: "p",
      text: "'Just following up' is the most common mistake in freelancing. It asks the recipient to do work — reconstruct the context, decide, reply — and gives them nothing in return. Instead, each follow-up should carry a small, useful artefact.",
    },
    {
      kind: "template",
      title: "Template — follow-up with a new detail",
      lines: [
        "Subject: Re: The booking page on your site",
        "",
        "Hi Dr. Kulkarni,",
        "",
        "One more thing I noticed while writing the last note: your mobile page",
        "loads a 2 MB header image before anything else. On a 4G connection that",
        "is most of the delay.",
        "",
        "I mocked up what the booking step would look like with a calendar in",
        "place — three screens, about a minute to read. Want me to send it?",
        "",
        "If the timing is wrong, no problem at all — just tell me and I'll stop.",
        "",
        "— Your name",
      ],
    },
    {
      kind: "p",
      text: "It gives a reason to reply that is not a decision. 'Send it' is much easier to type than 'let's have a call', and it moves the conversation forward.",
    },
    { kind: "h2", text: "Step 3: the easy exit" },
    {
      kind: "p",
      text: "Most silence is not rejection. It is an unanswered decision the recipient has been avoiding. The easy-exit message removes the cost of saying no, which is often all that was standing in the way.",
    },
    {
      kind: "template",
      title: "Template — the easy exit",
      lines: [
        "Subject: Re: The booking page on your site",
        "",
        "Hi Dr. Kulkarni,",
        "",
        "I'll assume the timing isn't right and leave it here. I won't keep",
        "writing.",
        "",
        "If it becomes a priority later, the audit notes are yours — just reply",
        "with the word 'notes' and I'll send them across, no strings.",
        "",
        "Either way, wishing you a good quarter.",
        "",
        "— Your name",
      ],
    },
    {
      kind: "p",
      text: "In practice this message produces two useful outcomes: a genuine 'not now' (which is information), and occasionally a reply from someone who was meaning to answer and finally has a low-effort way to do it.",
    },
    { kind: "h2", text: "Handling the three objections that stall deals" },
    { kind: "h3", text: "“Your price is too high”" },
    {
      kind: "p",
      text: "Do not discount immediately. Ask what the budget is and what scope it covers. Often the real issue is that you quoted a full engagement when they wanted a single deliverable. Offer the smaller version if it genuinely exists — never cut price on the same scope, because that teaches them your first number was fiction.",
    },
    { kind: "h3", text: "“We already work with someone”" },
    {
      kind: "p",
      text: "This is not a no. It is a 'not today'. Ask when their current arrangement is next reviewed, and ask permission to check in around then. Put a date in your tracker and actually honour it. Agencies lose accounts on schedule; being the person who wrote at the right time is the whole game.",
    },
    { kind: "h3", text: "“No budget right now”" },
    {
      kind: "p",
      text: "Offer something small and free that is genuinely useful — the audit notes, the mock-up, a one-page plan — and then leave. You are building a record of being useful at zero cost, which is the only thing that makes a later cold approach warm.",
    },
    { kind: "h2", text: "Two rules that keep this from becoming harassment" },
    {
      kind: "ul",
      items: [
        "One channel per prospect. If you emailed, follow up by email. Moving to WhatsApp and then LinkedIn to get around being ignored is the behaviour people remember and resent.",
        "An opt-out stops everything, immediately, everywhere. Log it in your tracker the same day.",
      ],
    },
    {
      kind: "callout",
      title: "The one-max rule",
      text: "Never send two follow-ups without a reply. If step 2 produced nothing, step 3 is your last message — the easy exit — not another nudge. Silence after three messages is an answer.",
    },
    { kind: "h2", text: "Track the follow-up, not the prospect" },
    {
      kind: "p",
      text: "The reason follow-ups feel awkward is that they arrive too late, which makes them feel intrusive. A tracker with a 'next follow-up date' column removes the judgement: the sheet tells you who is due today, and you work the list. A prospect whose next action date is in the past should be the only people you message.",
    },
    {
      kind: "p",
      text: "The ClientFlow kit ships word-for-word messages for all four steps, plus standard answers to the pricing, existing-provider and no-budget objections — and a lead tracker that flags overdue follow-ups in red before they become awkward.",
    },
    {
      kind: "cta",
      text: "See the follow-up system and one WhatsApp script in the free sample before you buy anything.",
      label: "Download the free sample",
      href: "/sample",
    },
  ],
};
