/** Screenshot several pages of the handbook for visual QA. */
import path from "node:path";
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const [, , input, outDir] = process.argv;
const browser = await puppeteer.launch({
  executablePath: fs.existsSync(EDGE) ? EDGE : undefined,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 1273, deviceScaleFactor: 1 });
const url = "file:///" + path.resolve(input).replace(/\\/g, "/");
await page.goto(url, { waitUntil: ["load", "networkidle0"], timeout: 120000 });
await page.evaluateHandle("document.fonts.ready");
await new Promise((r) => setTimeout(r, 500));
// capture: cover, a template page, an example box, part band
const shots = [
  ["cover", ".cover"],
  ["template", ".tpl.h-page"],
  ["part-band", ".part-band"],
  ["proposal", ".h-page:nth-of-type(3)"],
];
fs.mkdirSync(outDir, { recursive: true });
for (const [name, sel] of shots) {
  const el = await page.$(sel);
  if (!el) { console.log("no element for", sel); continue; }
  await el.screenshot({ path: path.join(outDir, name + ".png") });
  console.log("shot", name);
}
await browser.close();
