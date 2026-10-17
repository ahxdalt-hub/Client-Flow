# -*- coding: utf-8 -*-
"""Build the DOCX deliverables: email/DM templates and proposal templates."""
import sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "assets", "product-assets", "sources"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from content_emails_a import EMAILS_A
from content_emails_b import EMAILS_B
from content_dms import WHATSAPP, LINKEDIN
from content_proposals import PROPOSALS

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ACCENT = RGBColor(0x42, 0x57, 0xF5)
INK = RGBColor(0x19, 0x1A, 0x1C)
MUTED = RGBColor(0x69, 0x6B, 0x70)
OUT = os.path.join(ROOT, "assets", "product-assets", "final")


def shade(cell, hex_fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), hex_fill)
    tcPr.append(shd)


def para(doc, text="", size=10.5, bold=False, color=None, italic=False, space_after=6,
         style=None, mono=False, pre=False):
    p = doc.add_paragraph(style=style)
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.font.bold = bold or None
    run.font.italic = italic
    if color is not None:
        run.font.color.rgb = color
    if mono:
        run.font.name = "Consolas"
        rpr = run._element.get_or_add_rPr()
        rf = rpr.find(qn("w:rFonts"))
        rf.set(qn("w:cs"), "Consolas")
    if pre:
        run.text = ""
        for line in text.split("\n"):
            r = p.add_run(line)
            r.font.size = Pt(size)
            if mono:
                r.font.name = "Consolas"
            p.add_run().add_break()
        return p
    p.paragraph_format.space_after = Pt(space_after)
    return p


def heading(doc, text, level, color=INK):
    sizes = {0: 26, 1: 17, 2: 13.5, 3: 11.5}
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(sizes[level])
    run.font.bold = True
    run.font.color.rgb = color
    if level == 0:
        run.font.name = "Georgia"
    p.paragraph_format.space_before = Pt({0: 0, 1: 22, 2: 14, 3: 10}[level])
    p.paragraph_format.space_after = Pt({0: 10, 1: 6, 2: 4, 3: 3}[level])
    if level <= 2:
        p.paragraph_format.keep_with_next = True
    return p


def bullet(doc, text, indent=0.6):
    p = doc.add_paragraph(text, style="List Bullet")
    p.paragraph_format.left_indent = Cm(indent + 0.2)
    p.paragraph_format.space_after = Pt(2)
    for r in p.runs:
        r.font.size = Pt(10)
    return p


def label(doc, text):
    p = para(doc, text.upper(), size=8, bold=True, color=MUTED, space_after=3)
    p.paragraph_format.space_before = Pt(8)
    # letter-spacing
    for r in p.runs:
        rPr = r._element.get_or_add_rPr()
        sp = OxmlElement("w:spacing")
        sp.set(qn("w:val"), "20")
        rPr.append(sp)
    return p


def boxed(doc, lines, fill="F1F3FE"):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = t.cell(0, 0)
    shade(cell, fill)
    first = True
    for line in lines:
        p = cell.paragraphs[0] if first else cell.add_paragraph()
        first = False
        for i, chunk in enumerate(line.split("\n")):
            if i > 0:
                p = cell.add_paragraph()
            r = p.add_run(chunk)
            r.font.size = Pt(9.5)
            p.paragraph_format.space_after = Pt(2)
    t.style = "Table Grid"
    return t


def meta_table(doc, rows):
    t = doc.add_table(rows=len(rows), cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, (k, v) in enumerate(rows):
        c0, c1 = t.cell(i, 0), t.cell(i, 1)
        r = c0.paragraphs[0].add_run(k)
        r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = MUTED
        r = c1.paragraphs[0].add_run(v)
        r.font.size = Pt(9.5)
        c0.width = Cm(4.0); c1.width = Cm(12.0)
    t.style = "Table Grid"
    return t


def cover(doc, title, subtitle, items):
    for _ in range(4):
        doc.add_paragraph()
    heading(doc, "ClientFlow Outreach Kit", 0)
    heading(doc, title, 1, color=ACCENT)
    p = para(doc, subtitle, size=11, color=MUTED, space_after=24)
    label(doc, "Inside this document")
    for i in items:
        bullet(doc, i)
    para(doc, "")
    para(doc, "Editable working document - replace every bracketed and "
              "highlighted value before sending. Regular sans text is template "
              "voice; everything shown as an example is fiction for reference.",
         size=9, color=MUTED, italic=True)
    doc.add_page_break()


# ---------------------------------------------------------------- emails doc
def build_email_docx(path):
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Cm(2.2); sec.bottom_margin = Cm(2.2)
    sec.left_margin = Cm(2.4); sec.right_margin = Cm(2.4)

    cover(doc, "Email & DM Templates",
          "20 cold-email templates - WhatsApp & LinkedIn scripts - each with personalisation fields, "
          "a pre-send checklist, a filled fictional example, and honest guidance on when not to send it.",
          ["20 cold-email templates (template voice + usage notes)",
           "5 WhatsApp scripts", "5 LinkedIn scripts",
           "A checklist and example for every item"])

    doc.add_heading("Cold email templates", level=1)
    for t in EMAILS_A + EMAILS_B:
        heading(doc, f"{t['num']:02d} - {t['name']}", 2, INK)
        meta_table(doc, [("Category", t["category"]), ("Audience", t["audience"]), ("Use when", t["use_case"])])
        label(doc, "Subject line options")
        for s in t["subject"]:
            bullet(doc, s)
        label(doc, "Message (copy, personalise, send)")
        boxed(doc, [t["body"]], fill="FAFAF8")
        label(doc, "Personalisation fields")
        for f in t["personalization"]:
            bullet(doc, f)
        label(doc, "Before sending - checklist")
        for f in t["checklist"]:
            bullet(doc, f)
        label(doc, "Example (fictional)")
        boxed(doc, [f"{t['example_subject']}\n\n{t['example']}"], fill="F1F3FE")
        label(doc, "Why this works")
        para(doc, t["why_works"], size=10, space_after=8)
        label(doc, "Do not use it when")
        for f in t["not_for"]:
            bullet(doc, f)
        doc.add_paragraph()

    doc.add_page_break()
    heading(doc, "WhatsApp & LinkedIn scripts", 1)
    for coll, title in [(WHATSAPP, "WhatsApp"), (LINKEDIN, "LinkedIn")]:
        for t in coll:
            heading(doc, f"({len(WHATSAPP+LINKEDIN)}: {t['num']:02d}) {t['name']}", 2, INK)
            meta_table(doc, [("Platform", title), ("Purpose", t["intent"])])
            label(doc, "Script")
            boxed(doc, [t["body"]], fill="F1F3FE")
            label(doc, "Personalisation")
            for f in t["personalization"]:
                bullet(doc, f)
            label(doc, "Before sending")
            for f in t["checklist"]:
                bullet(doc, f)
            label(doc, "Avoid")
            for f in t["when_not"]:
                bullet(doc, f)
            doc.add_paragraph()

    doc.save(path)
    print("DOCX written:", path)


# ------------------------------------------------------------- proposals
def build_proposal_docx(path):
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Cm(2.2); sec.bottom_margin = Cm(2.2)
    sec.left_margin = Cm(2.4); sec.right_margin = Cm(2.4)

    cover(doc, "Proposal Templates",
          "Four editable proposals covering website design & development, SEO, social media "
          "management, and Shopify work. Every figure shown is an illustrative INR example - "
          "replace with your own numbers before sending.",
          [p["name"] for p in PROPOSALS])

    for pr in PROPOSALS:
        heading(doc, f"{pr['num']}. {pr['name']}", 1)
        para(doc, "For: " + pr["for_business"], size=10, color=MUTED, space_after=12)
        for title, body in pr["content"]:
            heading(doc, title, 3, ACCENT)
            for i, line in enumerate(body.split("\n")):
                para(doc, line, size=10.5, mono=False,
                     space_after=3 if i == 0 else 4,
                     color=INK if i else MUTED)
        para(doc, "")
        boxed(doc, [pr["example_states"]],
              fill="FFF6EC")  # example box, warm tint
        label(doc, "How to fill this proposal in")
        for f in ["Replace every illustrative rupee figure with your own quote.",
                   "Keep the ten sections and their order - arguable points become facts.",
                   "Delete any client-example line (like the fictional names) before sending.",
                   "Save each send as a dated PDF copy for your records.",
        ]:
            bullet(doc, f)
        doc.add_page_break()

    doc.save(path)
    print("DOCX written:", path)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    build_email_docx(os.path.join(OUT, "Email-Templates.docx"))
    build_proposal_docx(os.path.join(OUT, "Proposal-Templates.docx"))
