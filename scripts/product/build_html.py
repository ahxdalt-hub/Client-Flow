# -*- coding: utf-8 -*-
"""Render the ClientFlow handbook + free sample as styled HTML for PDF printing."""
import html as H
import re
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # project root
sys.path.insert(0, os.path.join(ROOT, "assets", "product-assets", "sources"))
OUT = os.path.join(ROOT, "assets", "product-assets", "build")
from content_emails_a import EMAILS_A
from content_emails_b import EMAILS_B
from content_dms import WHATSAPP, LINKEDIN
from content_followup import FOLLOWUP
from content_proposals import PROPOSALS
from content_guide import ETHICS, QUICKSTART, WORKED_EXAMPLE

EMAILS = EMAILS_A + EMAILS_B

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root{
  --ivory:#f8f7f3; --paper:#ffffff; --ink:#191a1c; --muted:#696b70;
  --accent:#4257f5; --tint:#eef0ff; --line:#e7e5df; --line-strong:#d8d5cc;
}
@page { size: A4; margin: 0; }
*{ box-sizing:border-box; }
html,body{ margin:0; padding:0; }
body{
  font-family:'Inter','Segoe UI',sans-serif; color:var(--ink);
  font-size:10.2pt; line-height:1.62; background:var(--ivory);
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
.page{ max-width:176mm; margin:0 auto; background:var(--ivory); }
h1,h2,h3,h4{ font-family:'Fraunces',Georgia,serif; font-weight:600; letter-spacing:-0.015em; color:var(--ink); }
p{ margin:0 0 7pt; }
em{ font-style:normal; font-weight:600; }
span.ph{ font-family:'JetBrains Mono',monospace; font-size:.92em; color:var(--accent); background:var(--tint); padding:0 3px; border-radius:3px; }

/* front cover */
.cover{ height:250mm; display:flex; flex-direction:column; justify-content:space-between;
  padding:0 0 18mm; page-break-after:always; break-after:page; }
.cover-top{ background:var(--ink); color:#f8f7f3; padding:16mm 14mm 12mm; }
.cover-kicker{ font-size:8.4pt; letter-spacing:.22em; text-transform:uppercase; color:#9aa0b8; margin-bottom:7mm; }
.cover-title{ font-size:31pt; line-height:1.12; margin:0 0 5mm; }
.cover-title em{ color:var(--accent); }
.cover-sub{ color:#c9cbde; font-size:11pt; line-height:1.6; max-width:120mm; }
.cover-bottom{ padding:12mm 14mm 0; }
.cover-meta{ display:flex; gap:10mm; font-size:9pt; color:var(--muted); margin-bottom:10mm; }
.cover-meta b{ color:var(--ink); font-weight:600; display:block; }
.rule{ height:1px; background:var(--line-strong); margin:6mm 0; }
.cover-parts{ display:grid; grid-template-columns:1fr 1fr; gap:4mm 8mm; font-size:9.5pt; }
.cover-parts span.num{ color:var(--accent); font-weight:700; margin-right:5px; }

/* headings & sections */
.h-page{ page-break-before:always; break-before:page; padding-top:2mm; }
.eyebrow{ font-size:8pt; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--accent); margin:0 0 3pt; }
.part-band{ background:var(--tint); border:1px solid var(--line); border-radius:14px; padding:9mm 10mm; margin:0 0 8mm; }
.part-band .n{ font-size:9pt; letter-spacing:.2em; color:var(--accent); font-weight:700; margin-bottom:2mm; }
.part-band h1{ font-size:21pt; margin:0 0 3mm; }
.part-band p{ color:var(--muted); margin:0; max-width:150mm; }
h2.sec{ font-size:15pt; margin:9pt 0 5pt; page-break-after:avoid; }
h3.sub{ font-size:11.5pt; margin:8pt 0 4pt; page-break-after:avoid; }

/* template cards */
.tpl{ margin:0 0 4mm; }
.tpl-head{ display:flex; align-items:baseline; gap:4mm; border-bottom:2px solid var(--ink); padding-bottom:2.5mm; margin-bottom:4mm; page-break-after:avoid; }
.tpl-head .n{ font-family:'Fraunces',Georgia,serif; font-weight:600; font-size:20pt; color:var(--accent); }
.tpl-head h2{ font-size:15.5pt; margin:0; }
.meta{ display:grid; grid-template-columns:22mm 1fr; gap:1.5mm 3mm; font-size:9pt; margin:0 0 5mm; page-break-inside:avoid; }
.meta dt{ color:var(--muted); font-weight:600; }
.meta dd{ margin:0; }
.subjects{ background:var(--ink); color:#f2f2f5; border-radius:10px; padding:5mm 6mm; margin:0 0 5mm; page-break-inside:avoid; }
.subjects .lab{ font-size:7.5pt; letter-spacing:.16em; text-transform:uppercase; color:#9aa0b8; margin-bottom:2.5mm; }
.subjects p{ margin:0 0 2pt; font-size:10pt; }
.subjects p:last-child{ margin:0; }
.mailframe{ border:1px solid var(--line-strong); border-radius:10px; background:var(--paper);
  padding:6mm 7mm; margin:0 0 5mm; page-break-inside:avoid; font-size:9.8pt; }
.mailframe .pre{ white-space:pre-wrap; font-family:'Inter','Segoe UI',sans-serif; line-height:1.65; }
.chatframe{ border:1px solid var(--line-strong); border-radius:12px; background:var(--tint);
  padding:5mm 6mm 4mm; margin:0 0 5mm; page-break-inside:avoid; font-size:9.8pt; }
.chatframe .pre{ white-space:pre-wrap; }
.minih{ font-size:8pt; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--muted);
  margin:5mm 0 2.5mm; page-break-after:avoid; }
.tick{ margin:0; padding:0 0 0 5mm; list-style:none; }
.tick li{ margin:0 0 2.5pt; padding-left:4.5mm; position:relative; }
.tick li::before{ content:""; position:absolute; left:0; top:6.5px; width:2.6mm; height:2.6mm;
  border:1.4px solid var(--accent); border-radius:2px; background:var(--tint); }
.dots{ margin:0; padding-left:5mm; }
.dots li{ margin:0 0 2.5pt; }
.example{ background:var(--paper); border:1px solid var(--line); border-left:3px solid var(--accent);
  border-radius:8px; padding:5mm 6mm; margin:0 0 5mm; page-break-inside:avoid; }
.example .pre{ white-space:pre-wrap; font-size:9.6pt; }
.example .tagline{ font-size:8pt; color:var(--muted); font-style:italic; margin-top:2mm; }
.warn{ background:#fff7f2; border:1px solid #f4d9c8; border-radius:8px; padding:4mm 5mm; page-break-inside:avoid; }
.warn .minih{ color:#a34a1e; margin-top:0; }

/* tables */
table.mono{ width:100%; border-collapse:collapse; font-size:9.2pt; margin:0 0 5mm; page-break-inside:avoid; }
table.mono th{ text-align:left; font-weight:600; font-size:8.4pt; text-transform:uppercase; letter-spacing:.1em;
  color:var(--muted); border-bottom:1.5px solid var(--line-strong); padding:2mm 3mm; background:var(--paper); }
table.mono td{ border-bottom:1px solid var(--line); padding:2.4mm 3mm; vertical-align:top; }
table.mono tr{ page-break-inside:avoid; }

/* timeline steps */
.step{ display:flex; gap:5mm; margin:0 0 6mm; page-break-inside:avoid; }
.step .d{ flex:0 0 34mm; font-weight:700; font-size:9pt; color:var(--accent); border-right:2px solid var(--tint); padding-right:4mm; }
.step .b{ flex:1; }

.footer-note{ margin-top:10mm; padding-top:4mm; border-top:1px solid var(--line); font-size:8.4pt; color:var(--muted); }
.checklist-grid{ display:grid; grid-template-columns:1fr 1fr; gap:2mm 8mm; }
blockquote{ margin:0 0 6mm; padding:3mm 5mm; background:var(--tint); border-left:3px solid var(--accent);
  border-radius:6px; color:#2a2d55; font-size:9.6pt; }
"""

def ph(text: str) -> str:
    text = H.escape(text)
    return re.sub(r"\{\{.*?\}\}", lambda m: f"<span class=\"ph\">{m.group(0)}</span>", text)

TABLE = str.maketrans({chr(0x2018): "'", chr(0x2019): "'", chr(0x201C): '"', chr(0x201D): '"', chr(0x2192): "->"})

def prep(text: str) -> str:
    return ph(text.translate(TABLE))

def block_list(items, cls="tick"):
    return f"<ul class='{cls}'>" + "".join(f"<li>{prep(i)}</li>" for i in items) + "</ul>"

def tpl_head(t):
    return (
        f"<div class='tpl-head'><span class='n'>{t['num']:02d}</span><h2>{prep(t['name'])}</h2></div>"
        f"<dl class='meta'>"
        f"<dt>Category</dt><dd>{prep(t['category'])}</dd>"
        f"<dt>Audience</dt><dd>{prep(t['audience'])}</dd>"
        f"<dt>Use when</dt><dd>{prep(t['use_case'])}</dd>"
        f"</dl>"
        f"<div class='subjects'><div class='lab'>Subject line options</div>"
        + "".join(f"<p>{prep(s)}</p>" for s in t["subject"])
        + "</div>"
        f"<div class='mailframe'><div class='pre'>{prep(t['body'])}</div></div>"
        f"<div class='minih'>Fill these in</div>"
        + block_list(t["personalization"])
    )

def email_section(t):
    html = []
    html.append(f"<div class='h-page tpl'>")
    html.append(tpl_head(t))
    html.append("<div class='minih'>Before sending - checklist</div>")
    html.append(block_list(t["checklist"]))
    html.append("<div class='minih'>Why this works</div>")
    html.append(f"<p>{prep(t['why_works'])}</p>")
    not_for = t.get("not_for")
    html.append("<div class='example'><div class='minih' style='margin-top:0'>Example - filled in (fictional)</div>"
                f"<div class='pre'>{prep(t['example'])}</div>"
                f"<div class='tagline'>{prep(t['example_note']) if 'example_note' in t else 'All people, businesses and figures in examples are fictional; they show the level of specificity expected, not a claim of results.'}</div></div>")
    html.append("<div class='warn'><div class='minih'>Don't use this template when</div>")
    html.append(block_list(t["not_for"]))
    html.append("</div></div>")
    return "".join(html)

def dm_section(t):
    key = "WhatsApp" if t in WHATSAPP else "LinkedIn"
    extra_checks = t["checklist"]
    return (
        f"<div class='tpl'>"
        f"<div class='tpl-head'><span class='n'>{t['num']:02d}</span><h2>{prep(t['name'])}</h2></div>"
        f"<dl class='meta'>"
        f"<dt>Platform</dt><dd>{key}</dd>"
        f"<dt>Purpose</dt><dd>{prep(t['intent'])}</dd>"
        f"</dl>"
        f"<div class='chatframe'><div class='pre'>{prep(t['body'])}</div></div>"
        f"<div class='minih'>Fill these in</div>{block_list(t['personalization'])}"
        f"<div class='minih'>Before sending</div>{block_list(extra_checks)}"
        f"<div class='warn'><div class='minih'>Avoid</div>{block_list(t['when_not'])}</div>"
        f"</div>"
    )

def proposal_section(p):
    rows = "".join(
        f"<tr><td style='width:52mm'><b style='font-weight:600'>{prep(title)}</b></td><td>{prep(body)}</td></tr>"
        for title, body in p["content"]
    )
    return (
        f"<div class='h-page'>"
        f"<p class='eyebrow'>Proposal template {p['num']} of 4</p>"
        f"<h2 class='sec' style='font-size:16.5pt'>{prep(p['name'])}</h2>"
        f"<p style='color:var(--muted)'><b style='font-weight:600;color:var(--ink)'>For:</b> {prep(p['for_business'])}</p>"
        f"<table class='mono'>{rows}</table>"
        f"<blockquote>{prep(p['example_states'])}</blockquote>"
        f"<p class='footer-note'>Editable version: Proposal-Templates.docx in this kit. Replace bracketed and flagged values; the structure (and the ten sections above) stay fixed.</p>"
        f"</div>"
    )

def build_handbook():
    c = [f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div class='page'>"]

    # cover
    c.append("""
<div class="cover">
  <div class="cover-top">
    <div class="cover-kicker">ClientFlow Outreach Kit &middot; The Handbook</div>
    <div class="cover-title">Build a <em>steady</em> client pipeline,<br/>message by message.</div>
    <p class="cover-sub">Twenty cold-email templates, ten DM scripts, a four-step follow-up
    system, four proposal templates and a lead tracker - for independent freelancers and
    small agencies in India selling web design, development, SEO, social media and Shopify services.</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-meta">
      <div><b>20</b>email templates</div>
      <div><b>10</b>DM scripts</div>
      <div><b>4</b>follow-up steps</div>
      <div><b>4</b>proposals</div>
      <div><b>1</b>lead tracker</div>
    </div>
    <div class="rule"></div>
    <div class="cover-parts">
      <div><span class="num">Part 1</span> Cold email templates (how and why each one works)</div>
      <div><span class="num">Part 2</span> WhatsApp &amp; LinkedIn scripts</div>
      <div><span class="num">Part 3</span> The four-step follow-up system</div>
      <div><span class="num">Part 4</span> Proposal templates</div>
      <div><span class="num">Part 5</span> The lead tracker</div>
      <div><span class="num">Part 6</span> Quick-start guide &amp; worked example</div>
    </div>
    <p class="footer-note" style="border:0">Every business name, person and price in examples is clearly marked fictional. This kit makes no promises about replies, clients, or income - it makes the work possible and organised.</p>
  </div>
</div>""")

    # how to use
    c.append("<div class='h-page'>")
    c.append("<p class='eyebrow'>Start here</p><h2 class='sec' style='font-size:17pt'>How to use this handbook</h2>")
    c.append(
        "<p>Read this page and the rules page, then go straight to your lane: "
        "the templates cover most first-touch situations you'll meet, and the guide "
        "at the back turns them into a weekly routine.</p>"
        "<table class='mono'>"
        "<tr><th style='width:30mm'>If you are a</th><th style='width:55mm'>Start with</th><th>Then</th></tr>"
        "<tr><td>Web designer / developer</td><td>Templates 1, 6 and 5</td><td>Follow-up system; proposal template 1</td></tr>"
        "<tr><td>SEO freelancer</td><td>Templates 2 and 5</td><td>Mini-audit (7) once your note format is ready; proposal template 2</td></tr>"
        "<tr><td>Social media manager</td><td>Templates 3 and 5</td><td>DM scripts on Instagram-linked WhatsApp; proposal template 3</td></tr>"
        "<tr><td>Shopify developer</td><td>Template 4</td><td>Proposal template 4 and the cart-email's two-three-fixes list</td></tr>"
        "<tr><td>Any freelancer, business-owner outreach</td><td>Template 5</td><td>The observation is the whole message; everything else is scaffolding</td></tr>"
        "</table>"
    )
    c.append("<div class='minih'>What's in the kit</div>")
    c.append(block_list([
        "This handbook (PDF) - the same pages as every part below, designed to be read, not adapted.",
        "Email-Templates.docx - all 20 templates plus the 10 DM scripts as an editable document.",
        "Proposal-Templates.docx - the four proposals with every number editable.",
        "Lead-Tracker.xlsx - the tracker, formatted for Google Sheets import or Excel.",
        "Quick-Start-Guide.pdf - a short route through the first week.",
    ]))
    c.append("<div class='minih'>Two habits that decide results</div>")
    c.append(block_list([
        "Log every send in the tracker the moment you send it - outreach without records is guessing.",
        "After every 10 messages, read your two best replies and sharpen the observation line in your next ten.",
    ]))
    c.append("</div>")

    # rules (ethics)
    c.append("<div class='h-page'>")
    c.append(f"<p class='eyebrow'>Read second</p><h2 class='sec' style='font-size:17pt'>{prep(ETHICS['title'])}</h2>")
    c.append(f"<p style='max-width:150mm'>{prep(ETHICS['intro'])}</p>")
    c.append("<table class='mono'>")
    for title, text in ETHICS["rules"]:
        c.append(f"<tr><td style='width:52mm'><b style='font-weight:600'>{prep(title)}</b></td><td>{prep(text)}</td></tr>")
    c.append("</table></div>")

    # Part 1
    c.append("<div class='h-page'><div class='part-band'>"
             "<div class='n'>Part 1</div><h1>Cold email templates</h1>"
             "<p>Each template states its audience, its exact personalisation fields, a "
             "pre-send checklist, why its shape works, a filled example, and the honest list of "
             "when not to use it. The rule that governs all twenty: one specific true observation, "
             "one small ask.</p></div>"
             "<table class='mono'><tr><th style='width:10mm'>No.</th><th>Template</th><th style='width:44mm'>Category</th></tr>")
    for t in EMAILS:
        c.append(f"<tr><td>{t['num']}</td><td>{prep(t['name'])}</td><td>{prep(t['category'])}</td></tr>")
    c.append("</table></div>")
    for t in EMAILS:
        c.append(email_section(t))

    # Part 2
    c.append("<div class='h-page'><div class='part-band'>"
             "<div class='n'>Part 2</div><h1>WhatsApp &amp; LinkedIn scripts</h1>"
             "<p>Ten scripts: five for WhatsApp, five for LinkedIn. WhatsApp messages are "
             "short by nature - brevity is the format. LinkedIn messages can carry slightly more, "
             "but the reader is also more used to being sold to. Both sets follow the same "
             "principle: state your context in the first line, never invent familiarity.</p></div></div>")
    c.append("<div class='h-page'><h2 class='sec'>WhatsApp scripts</h2>")
    for t in WHATSAPP:
        t["_platform"] = "WhatsApp"
        c.append(dm_section(t))
    c.append("<div class='h-page'><h2 class='sec'>LinkedIn scripts</h2>")
    for t in LINKEDIN:
        c.append(dm_section(t))
    c.append("</div>")

    # Part 3 - follow-up
    c.append("<div class='h-page'><div class='part-band'>"
             "<div class='n'>Part 3</div><h1>The four-step follow-up system</h1>"
             f"<p>{prep(FOLLOWUP['intro'])}</p></div>")
    c.append("<div class='minih'>Ground rules</div>")
    c.append(block_list(FOLLOWUP["ground_rules"]))
    for s in FOLLOWUP["steps"]:
        c.append(
            f"<div class='step'><div class='d'>{prep(s['step'])}<br/><span style='color:var(--muted);font-weight:500'>{prep(s['timing'])}</span></div>"
            f"<div class='b'><p>{prep(s['shape'])}</p><p style='margin:0'><b style='font-weight:600'>&rarr; The point:</b> {prep(s['goal'])}</p></div></div>"
        )
    c.append("<h3 class='sub'>Handling the standard objections</h3>")
    c.append("<table class='mono'><tr><th style='width:52mm'>They say</th><th>You write</th><th style='width:44mm'>Tracker action</th></tr>")
    for o in FOLLOWUP["objections"]:
        c.append(f"<tr><td><b style='font-weight:600'>{prep(o['objection'])}</b></td><td>{prep(o['response'])}</td><td style='color:var(--muted)'>{prep(o['tracker_action'])}</td></tr>")
    c.append("</table>")
    c.append("<h3 class='sub'>Opt-outs</h3>")
    c.append(f"<div class='mailframe'><div class='pre'>{prep(FOLLOWUP['optouts'])}</div></div>")
    c.append("<h3 class='sub'>On timing, honestly</h3>")
    c.append(f"<blockquote>{prep(FOLLOWUP['timing_caveat'])}</blockquote>")
    c.append(f"<div class='warn'><div class='minih'>When to stop</div><p style='margin:0'>{prep(FOLLOWUP['when_to_stop'])}</p></div>")
    c.append("</div>")

    # Part 4 - proposals
    c.append("<div class='h-page'><div class='part-band'>"
             "<div class='n'>Part 4</div><h1>Proposal templates</h1>"
             "<p>Four editable proposals share one structure so that scope, "
             "revisions, assumptions and payment milestones are never the arguable part of the deal. "
             "Numbers shown are illustrative INR examples - replace them with your own before sending.</p></div></div>")
    for p in PROPOSALS:
        c.append(proposal_section(p))

    # Part 5 - tracker
    c.append("<div class='h-page'><div class='part-band'>"
             "<div class='n'>Part 5</div><h1>The lead tracker</h1>"
             "<p>A spreadsheet (Lead-Tracker.xlsx) that works in Excel and, imported into Google "
             "Sheets, keeps all its dropdowns and formatting. It contains the columns below, "
             "status dropdowns, frozen headers, filters, conditional formatting, overdue formulas "
             "and a small dashboard.</p></div>")
    c.append("<table class='mono'><tr><th style='width:44mm'>Column</th><th>What goes in it</th></tr>")
    for col, desc in [
        ("Business name", "The business, exactly as its customers would recognise it."),
        ("Contact name", "The person you reached - owner, marketing lead, whoever the public source names."),
        ("Website", "URL you checked before writing."),
        ("Public source of contact information", "'Contact page', 'Google Business Profile', 'Instagram bio' - keep it honest and auditable; no scraped personal data."),
        ("Service category", "Dropdown: your service areas (Web design / SEO / Social media / Shopify / Other)."),
        ("Reason for outreach", "The specific observation - the single highest-value field in the sheet."),
        ("Contact channel", "Dropdown: Email / WhatsApp / LinkedIn / Phone."),
        ("First contact date", "Set the moment you send."),
        ("Last contact date", "Updates at every touch."),
        ("Next follow-up date", "+3 business days for step 1, +5 calendar days for step 2. The tracker flags overdue rows in red."),
        ("Lead status", "Dropdown: To contact / Contacted - awaiting / Replied / Call booked / Info sent / Proposal sent / Negotiating / Closed - won / Closed - declined / Opted out - stop all."),
        ("Reply summary", "One to two lines on what they actually said. This is what makes month three useful."),
        ("Estimated project value", "Your honest guess in INR. Feeds the dashboard's pipeline sum."),
        ("Notes", "Anything else: timing clues, extra dates, personal context.",
         ),
    ]:
        c.append(f"<tr><td><b style='font-weight:600'>{prep(col)}</b></td><td>{prep(desc)}</td></tr>")
    c.append("</table>")
    c.append("<h3 class='sub'>Setup in five minutes</h3>")
    c.append(block_list([
        "Excel: open the file and use it directly. Google Sheets: File &gt; Import &gt; Upload; the dropdowns and conditional formats come across.",
        "Adjust the category, channel and status dropdown lists to your own service menu (instructions are on the Read Me sheet).",
        "The Dashboard updates automatically - no setup. It counts your leads by status, sums estimated pipeline value, and flags overdue follow-ups.",
        "DataPlus: the 'Next follow-up' formula column is written for you; overwrite on the rows where you want custom spacing.",
    ]))
    c.append("</div>")

    # Part 6 - quick-start
    c.append("<div class='h-page'><div class='part-band'>"
             "<div class='n'>Part 6</div><h1>Quick-start guide</h1>"
             f"<p>{prep(QUICKSTART['intro'])}</p></div>")
    for s in QUICKSTART["steps"]:
        c.append(f"<h3 class='sub'>{prep(s['name'])}</h3><p>{prep(s['text'])}</p>")

    c.append("<div class='h-page'>")
    c.append(f"<p class='eyebrow'>Worked example</p><h2 class='sec'>{prep(WORKED_EXAMPLE['title'])}</h2>")
    c.append(f"<blockquote>{prep(WORKED_EXAMPLE['note'])}</blockquote>")
    for s in WORKED_EXAMPLE["stages"]:
        c.append(f"<div class='step'><div class='d'>{prep(s['stage'])}</div><div class='b'><p>{prep(s['text'])}</p></div></div>")
    c.append("</div>")

    # closing
    c.append("""
<div class="h-page">
  <p class="eyebrow">Close</p>
  <h2 class="sec" style="font-size:17pt">The honest page</h2>
  <p>What this kit contains: templates, scripts, a system, a tracker, and a large number of
  carefully described example messages. Every business, person and price in those examples is
  fictional and is written to show a standard of work, not a promise of a result.</p>
  <p>What this kit is not: proof of reply rates, a tested growth system, or a guarantee of income
  from any template in it. Whether the templates work depends on your observation quality, your
  niche, and whether the businesses you write to genuinely need what you sell - none of which any
  template can decide for you.</p>
  <p>This kit is built on free outreach, only to publicly-published contacts, one message at a
  time: If you ever feel this says 'I want more'? Keep that instinct - it's the whole system.</p>
  <div class="rule"></div>
  <p style="color:var(--muted)">ClientFlow Outreach Kit - built for independent freelancers
  and small agencies in India. Printed digitally, first edition.</p>
</div>""")

    c.append("</div></body></html>")
    return "".join(c)

def build_sample():
    t = EMAILS[0]
    c = [f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div class='page'>"]
    c.append("""
<div class="cover">
  <div class="cover-top">
    <div class="cover-kicker">Free sample &middot; ClientFlow Outreach Kit</div>
    <div class="cover-title">A first look at the<br/><em>ClientFlow</em> Outreach Kit.</div>
    <p class="cover-sub">This sample gives you one complete cold-email template exactly as it appears in
    the full kit, one WhatsApp script, the systems overview for follow-up, and the quick-start
    route for week one.</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-meta">
      <div><b>1 of 20</b>email templates</div>
      <div><b>1 of 10</b>DM scripts</div>
      <div><b>4</b>follow-up steps</div>
      <div><b>Week 1</b>quick-start route</div>
    </div>
    <div class="rule"></div>
    <p class="footer-note" style="border:0">These are not teasers - the template itself is complete. If it fits
    the way you work, the full kit has 19 more like it, four proposals and the lead tracker.</p>
  </div>
</div>""")

    c.append("<div class='h-page'>")
    c.append("<p class='eyebrow'>Sample section</p><h2 class='sec' style='font-size:15pt'>Quick-start: pick a lane, list 15, send 5 a day</h2>")
    for s in QUICKSTART["steps"][:4]:
        c.append(f"<h3 class='sub'>{prep(s['name'])}</h3><p>{prep(s['text'])}</p>")
    c.append("</div>")

    c.append(email_section(t))

    c.append("<div class='h-page'><h2 class='sec'>One WhatsApp script from the systems chapter</h2>")
    c.append("<p class='eyebrow'>Sample section</p>")
    c.append(dm_section(WHATSAPP[0]))
    c.append("</div>")

    c.append("<div class='h-page'>")
    c.append("<h2 class='sec'>The follow-up system, in brief</h2>")
    c.append(f"<blockquote>{prep(FOLLOWUP['intro'])}</blockquote>")
    for s in FOLLOWUP["steps"]:
        c.append(
            f"<div class='step'><div class='d'>{prep(s['step'])}<br/><span style='color:var(--muted);font-weight:500'>{prep(s['timing'])}</span></div>"
            f"<div class='b'><p style='margin:0'>{prep(s['goal'])}</p></div></div>"
        )
    c.append("</div>")

    c.append("""
<div class="h-page">
  <p class="eyebrow">What's in the full kit</p>
  <h2 class="sec" style="font-size:15pt">The full ClientFlow Outreach Kit</h2>
  <table class="mono">
    <tr><td>ClientFlow-Handbook.pdf</td><td>Everything in this sample plus all 20 templates, 10 scripts, the full system, 4 proposals and the tracker guide - designed as a readable handbook.</td></tr>
    <tr><td>Email-Templates.docx</td><td>Every template and DM script in an editable document, ready to adapt and reuse.</td></tr>
    <tr><td>Proposal-Templates.docx</td><td>Four editable proposals (website, SEO, social, Shopify) with illustrative INR figures you replace.</td></tr>
    <tr><td>Lead-Tracker.xlsx</td><td>The outreach tracker with status dropdowns, overdue flags, and a dashboard that works in Excel and Google Sheets.</td></tr>
    <tr><td>Quick-Start-Guide.pdf</td><td>A short standalone route through the first week.</td></tr>
  </table>
  <blockquote>No scraped contact data, no invented prospects, no promises about replies, clients or income. The kit is a working system; the work is yours.</blockquote>
</div>""")
    c.append("</div></body></html>")
    return "".join(c)

def build_quickstart():
    c = [f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div class='page'>"]
    c.append("""
<div class="cover">
  <div class="cover-top">
    <div class="cover-kicker">ClientFlow Outreach Kit &middot; Quick Start</div>
    <div class="cover-title">The first week,<br/><em>without</em> stalling.</div>
    <p class="cover-sub">A short, standalone route through week one: pick your lane, list 15
    businesses, send 5 messages a day, and run the four-step follow-up on schedule.</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-meta">
      <div><b>7</b>steps</div>
      <div><b>1</b>worked example</div>
      <div><b>15</b>businesses to start</div>
    </div>
    <div class="rule"></div>
    <p class="footer-note" style="border:0">Companion to the full handbook, which carries the templates,
    scripts, follow-up system, proposals and the tracker guide.</p>
  </div>
</div>""")
    c.append(f"<p class='eyebrow'>Guide</p><h2 class='sec' style='font-size:16pt'>{prep(QUICKSTART['title'])}</h2>")
    c.append(f"<p>{prep(QUICKSTART['intro'])}</p>")
    for s in QUICKSTART["steps"]:
        c.append(f"<h3 class='sub'>{prep(s['name'])}</h3><p>{prep(s['text'])}</p>")
    c.append("<div class='h-page'>")
    c.append(f"<p class='eyebrow'>Worked example</p><h2 class='sec'>{prep(WORKED_EXAMPLE['title'])}</h2>")
    c.append(f"<blockquote>{prep(WORKED_EXAMPLE['note'])}</blockquote>")
    for s in WORKED_EXAMPLE["stages"]:
        c.append(f"<div class='step'><div class='d'>{prep(s['stage'])}</div><div class='b'><p>{prep(s['text'])}</p></div></div>")
    c.append("</div>")
    c.append("<div class='h-page'><h2 class='sec'>Where everything lives</h2>")
    c.append("<table class='mono'>"
             "<tr><td style='width:52mm'><b style='font-weight:600'>ClientFlow-Handbook.pdf</b></td><td>All 20 email templates, 10 DM scripts, the follow-up system, proposals and the tracker guide - designed to read.</td></tr>"
             "<tr><td><b style='font-weight:600'>Email-Templates.docx</b></td><td>Every template and script as an editable document.</td></tr>"
             "<tr><td><b style='font-weight:600'>Proposal-Templates.docx</b></td><td>Four editable proposals with illustrative INR figures.</td></tr>"
             "<tr><td><b style='font-weight:600'>Lead-Tracker.xlsx</b></td><td>The tracker with dropdowns, overdue flags and a dashboard (Excel / Google Sheets).</td></tr>"
             "</table>")
    c.append("<blockquote>Start with 15 businesses this week, not 1,500 someday. The handbook's Part 6 has the full quick-start; this page is the same route, printed short.</blockquote>")
    c.append("</div>")
    c.append("</div></body></html>")
    return "".join(c)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    files = {
        "handbook.html": build_handbook(),
        "sample.html": build_sample(),
        "quickstart.html": build_quickstart(),
    }
    for name, content in files.items():
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write(content)
    print("HTML written to", OUT)
