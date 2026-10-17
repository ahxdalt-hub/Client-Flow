# -*- coding: utf-8 -*-
"""Text QA scan across the content sources."""
import re, glob

BROKEN_WORD = re.compile(r"^\s*\"?([A-Za-z]+)\"?:", re.M)  # dict keys are fine
PATTERNS = [
    (r"\b(\w{3,}) \1\b", "repeated word"),
    (r" ,", "space-comma"),
    (r" [.;]", "space-punct"),
    (r"[a-z]{3,}[A-Z]{2,}", "camelGlitch"),
    (r"\bthe the\b|\band and\b|\bof of\b", "dup triple"),
]

def strings_of(path):
    src = open(path, encoding="utf-8").read()
    # crude: extract double-quoted and single-quoted string contents
    for m in re.finditer(r"\"((?:[^\"\\\n]|\\.)*)\"|'((?:[^'\\\n]|\\.)*)'", src):
        val = m.group(1) if m.group(1) is not None else m.group(2)
        if val is None:
            continue
        yield val.replace("\\n", "\n")

total = 0
for f in sorted(glob.glob("assets/product-assets/sources/*.py")):
    seen = set()
    for s in strings_of(f):
        for norm in (s,):
            if norm in seen:
                continue
            seen.add(norm)
            for p, label in PATTERNS:
                for m in re.finditer(p, norm):
                    frag = norm[max(0, m.start()-45):m.end()+45].replace("\n", " | ")
                    print(f"{f.split(chr(92))[-1]} :: {label} :: ...{frag}...")
                    total += 1
print("issues:", total)
