# -*- coding: utf-8 -*-
"""Package final/ deliverables into the two shipping zips."""
import os, zipfile, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FINAL = os.path.join(ROOT, "assets", "product-assets", "final")
PAID = os.path.join(ROOT, "assets", "deliverables", "clientflow-outreach-kit.zip")
SAMPLE = os.path.join(ROOT, "public", "downloads", "clientflow-sample.zip")

PAID_FILES = ["ClientFlow-Handbook.pdf", "Email-Templates.docx", "Proposal-Templates.docx",
              "Lead-Tracker.xlsx", "Quick-Start-Guide.pdf", "README.md"]
SAMPLE_FILES = ["ClientFlow-Sample.pdf"]


def zipit(dest, files, folder):
    if os.path.exists(dest):
        os.remove(dest)
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
        for name in files:
            src = os.path.join(folder, name)
            if not os.path.isfile(src):
                raise SystemExit(f"MISSING FILE: {src}")
            z.write(src, arcname=name)
    print(f"zip -> {dest} ({os.path.getsize(dest):,} bytes)")


if __name__ == "__main__":
    zipit(PAID, PAID_FILES, FINAL)
    zipit(SAMPLE, SAMPLE_FILES, FINAL)
    # verify zips
    for z in (PAID, SAMPLE):
        with zipfile.ZipFile(z) as zf:
            bad = zf.testzip()
            assert bad is None, f"corrupt zip: {z} ({bad})"
            print("  contents:", ", ".join(zf.namelist()))
