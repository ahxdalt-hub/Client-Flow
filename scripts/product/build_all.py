# -*- coding: utf-8 -*-
"""One-command build of the whole ClientFlow product pipeline."""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

def run(cmd):
    print("+", " ".join(cmd))
    r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode != 0:
        sys.exit(r.returncode)

env = os.environ.copy()
env["PYTHONIOENCODING"] = "utf-8"

run([sys.executable, os.path.join(HERE, "build_html.py")])
B = os.path.join(ROOT, "assets", "product-assets", "build")
F = os.path.join(ROOT, "assets", "product-assets", "final")
for src, out in [
    ("handbook.html", "ClientFlow-Handbook.pdf"),
    ("sample.html", "ClientFlow-Sample.pdf"),
    ("quickstart.html", "Quick-Start-Guide.pdf"),
]:
    run(["node", os.path.join(HERE, "pdf.js"), os.path.join(B, src), os.path.join(F, out)])
run([sys.executable, os.path.join(HERE, "build_docx.py")])
run([sys.executable, os.path.join(HERE, "build_xlsx.py")])
run([sys.executable, os.path.join(HERE, "package.py")])
print("\nDone. Final files in assets/product-assets/final/")
