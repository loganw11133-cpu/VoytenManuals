/**
 * OCR every Siemens "machine-titled" manual cover (title === manual_number) so we
 * can humanize the titles. READ-ONLY: downloads each PDF, renders page 1, OCRs it,
 * and writes the cover text to a review JSON. No DB writes.
 *
 * Run: node scripts/ocr-siemens-machine-titles.mjs
 * Out: C:\Users\rodol\Desktop\memory\siemens-machine-titles-ocr.json
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PDFTOPPM = 'C:\\Users\\rodol\\AppData\\Local\\Microsoft\\WinGet\\Packages\\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\\poppler-25.07.0\\Library\\bin\\pdftoppm.exe';
const TESS = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
const OUT = 'C:\\Users\\rodol\\Desktop\\memory\\siemens-machine-titles-ocr.json';

let all = [];
for (let p = 1; p <= 7; p++) {
  const j = await (await fetch('https://www.voytenmanuals.com/api/manuals?manufacturer=Siemens&limit=100&page=' + p)).json();
  all = all.concat(j.manuals || []);
}
const machine = all.filter(m => m.title === m.manual_number && /^https?:\/\//.test(m.pdf_url || ''));
console.log('machine-titled Siemens with a real PDF:', machine.length);

const results = [];
let i = 0;
for (const m of machine) {
  i++;
  const base = `C:\\Users\\rodol\\AppData\\Local\\Temp\\ocrm_${m.id}`;
  const pdf = base + '.pdf';
  const png = base + '.png';
  const rec = { id: m.id, manual_number: m.manual_number, subcategory: m.subcategory, slug: m.slug, pdf: m.pdf_url.split('/').pop(), ocr: null, error: null };
  try {
    const buf = Buffer.from(await (await fetch(m.pdf_url)).arrayBuffer());
    writeFileSync(pdf, buf);
    execSync(`"${PDFTOPPM}" -png -singlefile -f 1 -l 1 -r 150 "${pdf}" "${base}"`, { stdio: 'ignore' });
    const txt = execSync(`"${TESS}" "${png}" stdout`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    rec.ocr = txt.split('\n').map(s => s.trim()).filter(s => s.length > 2).slice(0, 14);
  } catch (e) {
    rec.error = String(e.message).slice(0, 120);
  }
  results.push(rec);
  if (i % 10 === 0) console.log(`  ${i}/${machine.length}…`);
}
writeFileSync(OUT, JSON.stringify(results, null, 2));
const ok = results.filter(r => r.ocr && r.ocr.length).length;
console.log(`DONE. ${ok}/${results.length} OCR'd. Written to ${OUT}`);
