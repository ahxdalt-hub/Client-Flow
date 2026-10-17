# -*- coding: utf-8 -*-
"""Build Lead-Tracker.xlsx - works in Excel and imports into Google Sheets."""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter

OUT_BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "assets", "product-assets", "final")

INK = "191A1C"; IVORY = "F8F7F3"; ACCENT = "4257F5"; TINT = "EEF0FF"
LINE = "E7E5DF"; MUTED = "696B70"; RED = "FDE8E4"; GREEN = "E7F5EC"; GREY = "F0EFEB"; WARM = "FFF6EC"

STATUS = ["To contact", "Contacted - awaiting", "Replied", "Call booked", "Info sent",
          "Proposal sent", "Negotiating", "Closed - won", "Closed - declined", "Opted out - stop all"]
CATEGORIES = ["Web design", "Web development", "SEO", "Social media", "Shopify", "Other"]
CHANNELS = ["Email", "WhatsApp", "LinkedIn", "Phone"]
SOURCES = ["Website contact page", "Google Business Profile", "Instagram bio", "LinkedIn profile",
           "Company directory listing", "Provided by a mutual contact", "Other public source"]

HEADERS = [
    ("Business name", 22), ("Contact name", 18), ("Website", 24),
    ("Public source of contact information", 26), ("Service category", 15),
    ("Reason for outreach", 38), ("Contact channel", 13), ("First contact date", 14),
    ("Last contact date", 14), ("Next follow-up date", 15), ("Lead status", 19),
    ("Reply summary", 32), ("Estimated project value (₹)", 17), ("Notes", 30),
    ("Overdue?", 10),
]

OPEN_STATUSES = ["To contact", "Contacted - awaiting", "Replied", "Call booked", "Info sent",
                 "Proposal sent", "Negotiating"]

REQUIRED_OPEN = "To contact, Contacted - awaiting, Replied, Call booked, Info sent, Proposal sent, Negotiating"

thin = Side(style="thin", color=LINE)
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)

import datetime

def date_col(d):  # next leads: write as date values
    return d

def main():
    wb = Workbook()

    # ------------------------------------------------------------ Read Me
    ws = wb.active
    ws.title = "Read Me"
    ws.sheet_properties.tabColor = ACCENT
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 3
    ws.column_dimensions["B"].width = 30
    ws.column_dimensions["C"].width = 95
    ws["B2"] = "ClientFlow Outreach Kit - Lead Tracker"
    ws["B2"].font = Font(name="Georgia", size=18, bold=True, color=INK)
    ws["B3"] = "Works in Microsoft Excel, and keeps its dropdowns and colour rules when imported into Google Sheets (File > Import > Upload)."
    ws["B3"].font = Font(size=10, color=MUTED)

    rows = [
        ("What this sheet is", "One row per prospect. Log every outreach touch the moment it happens - the tracker is only useful if it is honest."),
        ("The 15 columns", "Business, contact, website, public source, service category, reason for outreach, channel, first/last contact dates, next follow-up date, status, reply summary, estimated value, notes, and an automatic overdue flag."),
        ("Dropdowns", "Service category, channel, source and status columns have dropdown lists. Edit the lists in (hidden) Lists sheet if your services differ."),
        ("Overdue flag", "The 'Overdue?' column turns red automatically when the next follow-up date is in the past and the status is still open. Sort or filter by it each morning."),
        ("Dashboard", "The Dashboard sheet counts leads by status, shows pipeline value for open deals, and lists how many follow-ups are overdue. It recalculates automatically."),
        ("Fictional rows", "Row 2-4 in the tracker are fictional examples marked EXAMPLE - delete them before starting, and never load scraped or purchased contact lists into this sheet; public sources only."),
        ("Weekly habit", "Once a week: review Dashboard, close finished rows honestly (declined/Opted out), and set follow-up dates for the new week."),
        ("Status list", "Use exactly one of the ten statuses; 'Opted out - stop all' is permanent - never re-contact."),
    ]
    r = 5
    for k, v in rows:
        ws.cell(row=r, column=2, value=k).font = Font(bold=True, size=10.5, color=INK)
        c = ws.cell(row=r, column=3, value=v)
        c.font = Font(size=10, color=MUTED)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        r += 1

    # ------------------------------------------------------------ Tracker
    tr = wb.create_sheet("Lead Tracker")
    tr.sheet_properties.tabColor = INK
    headers_fill = PatternFill("solid", fgColor=INK)
    for i, (h, w) in enumerate(HEADERS, start=1):
        cell = tr.cell(row=1, column=i, value=h)
        cell.font = Font(bold=True, size=10, color="FFFFFF")
        cell.fill = headers_fill
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = BORDER
        tr.column_dimensions[get_column_letter(i)].width = w
    tr.row_dimensions[1].height = 30

    today = datetime.date.today()
    demo = [
        ("EXAMPLE - Chai Vih Café", "Rhea Fernandes", "chaivih.in", "Website contact page",
         "Web design", "Ordering button opens a dead link on phones", "Email",
         today - datetime.timedelta(days=6), today - datetime.timedelta(days=3),
         today - datetime.timedelta(days=0), "Contacted - awaiting",
         "Sent mini-audit offer, no reply yet", 28000,
         "Waits till the follow-up step. Fictional example row - delete before use."),
        ("EXAMPLE - Kodanda Silks", "Rita Menon", "", "Instagram bio",
         "Social media", "Doesn't post pricing reels; engagement high, bookings unclear", "WhatsApp",
         today - datetime.timedelta(days=2), today - datetime.timedelta(days=0),
         today + datetime.timedelta(days=3), "Replied",
         "Asked for a price band; needs a deck", 18000,
         "Wants a WhatsApp-first arrangement. Fictional example row - delete before use."),
        ("EXAMPLE - Vinayak Window Systems", "Shyam Kumar", "vinayakwindows.example", "Google Business Profile",
         "SEO", "No dedicated service page for 'window installation Coimbatore'", "Email",
         today - datetime.timedelta(days=15), today - datetime.timedelta(days=8),
         today - datetime.timedelta(days=3), "Proposal sent",
         "Awaiting worksheet and timeline from owner", 52000,
         "Waited politely through owner's audit. Fictional example row - delete before use."),
    ]
    for ri, row in enumerate(demo, start=2):
        for ci, val in enumerate(row, start=1):
            c = tr.cell(row=ri, column=ci, value=val)
            c.border = BORDER
            c.font = Font(size=10)
            if ci in (8, 9, 10):
                c.number_format = "dd-mmm-yyyy"
            if ci == 13:
                c.number_format = '₹#,##0'
            c.alignment = Alignment(vertical="top", wrap_text=(ci in (6, 12, 14)))

    # data validations (applied wide so imports keep working)
    def dv(formula, col, prompt):
        d = DataValidation(type="list", formula1=formula, allow_blank=True, showDropDown=False)
        d.error = "Pick a value from the list (you can edit the lists in the Lists sheet)."
        d.errorTitle = "Choose from dropdown"
        d.prompt = prompt; d.promptTitle = "Dropdown"
        tr.add_data_validation(d)
        d.add(f"{col}2:{col}400")
    dv('"' + ",".join(CATEGORIES) + '"', "E", "Service category")
    dv('"' + ",".join(CHANNELS) + '"', "G", "Channel used")
    dv('"' + ",".join(STATUS) + '"', "K", "Lead status")
    dv('"' + ",".join(SOURCES) + '"', "D", "Where you found this contact (keep it public)")
    # dropdown for 'Overdue?' column is formula-driven; add dropdown for category in Lists

    # overdue formula for O column
    overdue_f = (
        "=IF(AND($A2<>\"\",$J2<>\"\",$J2<TODAY(),"
        "OR($K2=\"To contact\",$K2=\"Contacted - awaiting\",$K2=\"Replied\",$K2=\"Info sent\","
        "$K2=\"Proposal sent\",$K2=\"Negotiating\",$K2=\"Call booked\")),\"OVERDUE\",\"\")"
    )
    for ri in range(2, 401):
        tr.cell(row=ri, column=15, value=overdue_f)

    # auto filter + freeze
    tr.auto_filter.ref = "A1:O400"
    tr.freeze_panes = "A2"

    # conditional formatting
    open_red = FormulaRule(formula=["=$O2=\"OVERDUE\""], fill=PatternFill("solid", fgColor=RED), stopIfTrue=False)
    won_green = FormulaRule(formula=["=$K2=\"Closed - won\""], fill=PatternFill("solid", fgColor=GREEN), stopIfTrue=False)
    opt_out_grey = FormulaRule(formula=["=OR($K2=\"Opted out - stop all\",$K2=\"Closed - declined\")"],
                               fill=PatternFill("solid", fgColor=GREY), font=Font(color="A0A0A0"), stopIfTrue=False)
    rng = "A2:O400"
    tr.conditional_formatting.add(rng, open_red)
    tr.conditional_formatting.add(rng, won_green)
    tr.conditional_formatting.add(rng, opt_out_grey)
    # overdue column text emphasised
    tr.conditional_formatting.add("O2:O400", FormulaRule(formula=["$O2=\"OVERDUE\""],
        font=Font(bold=True, color="B3400F"), fill=PatternFill("solid", fgColor=RED)))

    # ------------------------------------------------------------ Lists
    ls = wb.create_sheet("Lists")
    ls.sheet_properties.tabColor = MUTED
    ls["A1"] = "Editable dropdown lists - change your service categories here and the tracker's dropdown follows (Google Sheets import keeps these references)."
    ls["A1"].font = Font(size=10, color=MUTED)
    for ci, (title, items) in enumerate([("Service category", CATEGORIES), ("Channel", CHANNELS), ("Lead status", STATUS), ("Public source", SOURCES)], start=1):
        c = ls.cell(row=3, column=ci, value=title)
        c.font = Font(bold=True, color=INK)
        for ri, item in enumerate(items, start=4):
            ls.cell(row=ri, column=ci, value=item).font = Font(size=10)

    # ------------------------------------------------------------ Dashboard
    db = wb.create_sheet("Dashboard")
    db.sheet_properties.tabColor = "D4B106"
    db.sheet_view.showGridLines = False
    db.column_dimensions["A"].width = 3
    for col, w in zip("BCDEFG", (26, 14, 14, 24, 24, 24)):
        db.column_dimensions[col].width = w
    db["B2"] = "Outreach Dashboard"
    db["B2"].font = Font(name="Georgia", size=16, bold=True, color=INK)
    db["B3"] = "Counts update automatically from the Lead Tracker sheet."
    db["B3"].font = Font(size=10, color=MUTED)

    cards = [
        ("Total leads", "=COUNTA('Lead Tracker'!A2:A400)", TINT, ACCENT),
        ("Replies", "=COUNTIF('Lead Tracker'!K2:K400,\"Replied\")", GREEN, "1C7B42"),
        ("Printed proposals", "=COUNTIF('Lead Tracker'!K2:K400,\"Proposal sent\")+COUNTIF('Lead Tracker'!K2:K400,\"Negotiating\")", WARM, "B26A1B"),
        ("Deals won", "=COUNTIF('Lead Tracker'!K2:K400,\"Closed - won\")", GREEN, "1C7B42"),
        ("Opt-outs / declined", "=COUNTIF('Lead Tracker'!K2:K400,\"Opted out - stop all\")+COUNTIF('Lead Tracker'!K2:K400,\"Closed - declined\")", RED, "B3400F"),
        ("Open pipeline value", "=SUMIF('Lead Tracker'!K2:K400,\"To contact\",'Lead Tracker'!M2:M400)+"
                                "SUMIF('Lead Tracker'!K2:K400,\"Contacted - awaiting\",'Lead Tracker'!M2:M400)+"
                                "SUMIF('Lead Tracker'!K2:K400,\"Replied\",'Lead Tracker'!M2:M400)+"
                                "SUMIF('Lead Tracker'!K2:K400,\"Call booked\",'Lead Tracker'!M2:M400)+"
                                "SUMIF('Lead Tracker'!K2:K400,\"Info sent\",'Lead Tracker'!M2:M400)+"
                                "SUMIF('Lead Tracker'!K2:K400,\"Proposal sent\",'Lead Tracker'!M2:M400)+"
                                "SUMIF('Lead Tracker'!K2:K400,\"Negotiating\",'Lead Tracker'!M2:M400)", TINT, ACCENT),
    ]
    for i, (lab, formula, fill, fg) in enumerate(cards):
        r = 5 + (i // 3) * 3
        c0 = 2 + (i % 3) * 2  # cols B, D, F
        lab_c = db.cell(row=r, column=c0, value=lab)
        val_c = db.cell(row=r + 1, column=c0, value=formula)
        for c in (lab_c, val_c):
            c.fill = PatternFill("solid", fgColor=fill)
            c.font = Font(bold=True, color=fg, size=(10 if c is lab_c else 16))
            c.alignment = Alignment(horizontal="center", vertical="center")
            c.border = BORDER
        db.merge_cells(start_row=r, start_column=c0, end_row=r, end_column=c0 + 1)
        db.merge_cells(start_row=r + 1, start_column=c0, end_row=r + 1, end_column=c0 + 1)
        db.cell(row=r, column=c0 + 1).fill = PatternFill("solid", fgColor=fill)
        db.cell(row=r + 1, column=c0 + 1).fill = PatternFill("solid", fgColor=fill)
        db.cell(row=r, column=c0 + 1).border = BORDER
        db.cell(row=r + 1, column=c0 + 1).border = BORDER
        if "value" in lab.lower() or lab == "Open pipeline value":
            val_c.number_format = '₹#,##0'
    db.row_dimensions[6].height = 30
    db.row_dimensions[9].height = 30

    # per-service-category mini table
    db["B12"] = "Leads by service category"
    db["B12"].font = Font(bold=True, size=11, color=INK)
    db["B13"] = "Category"; db["C13"] = "Leads"; db["D13"] = "Open pipeline"
    for c in ("B13", "C13", "D13"):
        db[c].font = Font(bold=True, size=10, color="FFFFFF"); db[c].fill = PatternFill("solid", fgColor=INK); db[c].border = BORDER
    for i, cat in enumerate(CATEGORIES):
        r = 14 + i
        db.cell(row=r, column=2, value=cat).font = Font(size=10)
        db.cell(row=r, column=3, value=f"=COUNTIF('Lead Tracker'!E2:E400,\"{cat}\")").font = Font(size=10)
        f = (f"=SUMIF('Lead Tracker'!E2:E400,\"{cat}\",'Lead Tracker'!M2:M400)"
             f"-SUMIFS('Lead Tracker'!M2:M400,'Lead Tracker'!E2:E400,\"{cat}\",'Lead Tracker'!K2:K400,\"Closed - won\")"
             f"-SUMIFS('Lead Tracker'!M2:M400,'Lead Tracker'!E2:E400,\"{cat}\",'Lead Tracker'!K2:K400,\"Opted out - stop all\")"
             f"-SUMIFS('Lead Tracker'!M2:M400,'Lead Tracker'!E2:E400,\"{cat}\",'Lead Tracker'!K2:K400,\"Closed - declined\")")
        cell = db.cell(row=r, column=4, value=f)
        cell.font = Font(size=10); cell.number_format = '₹#,##0'
        for c in range(2, 5):
            db.cell(row=r, column=c).border = BORDER

    db["F13"] = "Follow-ups due today"
    db["F13"].font = Font(bold=True, size=10, color="FFFFFF"); db["F13"].fill = PatternFill("solid", fgColor=INK); db["F13"].border = BORDER
    f14 = db.cell(row=14, column=6, value=(
        "=COUNTIF('Lead Tracker'!O2:O400,\"OVERDUE\")"))
    f14.font = Font(size=10)
    db["F14"].border = BORDER

    os.makedirs(OUT_BASE, exist_ok=True)
    path = os.path.join(OUT_BASE, "Lead-Tracker.xlsx")
    wb.save(path)
    print("XLSX written:", path)


if __name__ == "__main__":
    main()
