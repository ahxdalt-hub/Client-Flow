/**
 * print-pdf.js — print a local HTML file to PDF using puppeteer-core + system Edge.
 * Usage: node print-pdf.js <input.html> <output.pdf> [--landscape]
 */
import path from "node:path";
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const EDGE = "C:\\Users\\abdul\\AppData\\Local\\ms-playwright\\chromium-1200\\chrome-win\\chrome.exe";

function findEdge() {
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const c of candidates) try { if (fs.statSync(c).isFile()) return c; } catch {}
  return EDGE;
}

const [, , input, output, flag] = process.argv;
if (!input || !output) {
  console.error("Usage: node print-pdf.js <input.html> <output.pdf> [--landscape]");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: findEdge(),
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files", "--font-render-hinting=none"],
});

try {
  const page = await browser.newPage();
  const fileUrl = "file:///" + path.resolve(input).replace(/\\/g, "/");
  await page.goto(fileUrl, { waitUntil: ["load", "networkidle0", "domcontentloaded"], timeout: 120000 });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 700));

  await page.pdf({
    path: output,
    format: "A4",
    landscape: flag === "--landscape",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:7.5px;color:#8A8F98;font-family:'Segoe UI',sans-serif;-webkit-print-color-adjust:exact;padding:0 48px;display:flex;justify-content:space-between;align-items:center;">
      <span style="letter-spacing:0.08em;text-transform:uppercase;">CLIENTFLOW OUTREACH KIT</span>
      <span class="pageNumber" style="color:#1B2430;"></span>
    </div>`,
    margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
    preferCSSPageSize: false,
    timeout: 120000,
  });
  console.log(`PDF written -> ${output}`);
} finally {
  await browser.close();
}
