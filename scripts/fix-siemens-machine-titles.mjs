/**
 * Humanize Siemens "machine-titled" manuals (title === manual_number), 2026-06-09.
 * Titles derived from OCR of each PDF cover (see siemens-machine-titles-ocr.json).
 * Also strips stray ".pdf" from two manual_numbers.
 *
 * Run: node scripts/fix-siemens-machine-titles.mjs          (dry run + writes review CSV)
 *      node scripts/fix-siemens-machine-titles.mjs --live   (backup rows, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';

for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// id -> humanized title
const TITLES = {
  10596: "Siemens Type RL — RL-PT Module Installation Instructions",
  11270: "Siemens Vacuum Contactor — Maintenance Instructions (CC 6030-03)",
  11364: "Siemens Accu/Stat MJ Series Regulator Control — Operational Performance Evaluation",
  11368: "Siemens Accu/Stat MJ-3A Regulator Control — Installation, Operation & Maintenance",
  11269: "Siemens 3TL6 Contactor — Magnet Coil & Resistor Replacement Kit",
  11294: "Siemens MICROMASTER 440 FX Drive — Maintenance Instructions",
  11295: "Siemens T400 Technology Module — Positioning & Synchronization Function Description",
  11296: "Siemens DRIVEPAC Anti-Sway Crane Control (T400) for SIMOVERT Master Drives",
  11297: "Siemens SIMOREG CM 6RA70 DC Drive Control Module — Operating Instructions",
  11349: "Siemens MICROMASTER 420 Drive (0.12–11 kW) — Operating Instructions",
  11298: "Siemens MICROMASTER 420/430/440 Drives — Getting Started Guide",
  11299: "Siemens MICROMASTER 430 Drive (7.5–250 kW) — Operating Instructions",
  11300: "Siemens MICROMASTER 430 Drive — Parameter List",
  11350: "Siemens MICROMASTER BOP Basic Operator Panel — Operating Instructions",
  11301: "Siemens MICROMASTER 440 Drive — Quick Start Guide",
  11302: "Siemens SIMOVERT Master Drives — Overcurrent Protector Operating Instructions",
  11263: "Siemens SIMOVERT Braking Resistor 6SE7016-3ES87-2DC0 — Technical Data & Mounting",
  11264: "Siemens SIMOVERT Braking Resistor 6SE7022-0ES87-2DC0 — Technical Data & Mounting",
  11303: "Siemens SIMOVERT Master Drives Water-Cooled Rectifier/Regenerating Unit (Size H) — Supplement",
  11265: "Siemens SIMOVERT Master Drives Braking Unit — Operating Instructions (Italian/English)",
  11304: "Siemens SIMOVERT Master Drives Rectifier Unit (Compact PLUS) — Operating Instructions",
  11305: "Siemens SIMOVERT Master Drives EMC Filter (Compact PLUS) — Operating Instructions (Italian/English)",
  11018: "Siemens SIMOVERT Master Drives Capacitor Module (Compact PLUS) — Operating Instructions (Italian/English)",
  11306: "Siemens SIMOVERT Master Drives DC Link Module (Compact PLUS) — Operating Instructions (Italian/English)",
  11307: "Siemens SIMOVERT Master Drives Servo Control (SC), AC-AC Types A–D — Operating Instructions",
  11308: "Siemens SIMOVERT Master Drives Common Rectifier (Size E) — Operating Instructions",
  11309: "Siemens SIMOVERT Master Drives Chassis Units AC-AC (Types E–H), Part 1 — Operating Instructions",
  11310: "Siemens SIMOVERT Master Drives Chassis Units AC-AC (Type K) — Operating Instructions",
  11311: "Siemens SIMOVERT Master Drives Common Rectifier (Sizes H & K) — Operating Instructions",
  11312: "Siemens SIMOVERT Master Drives Servo Control (SC), DC-AC Types A–D — Operating Instructions",
  11313: "Siemens SIMOVERT Master Drives Compact Units DC-AC (Types A–D), Part 1 — Operating Instructions",
  11314: "Siemens SIMOVERT Master Drives Chassis Units DC-AC (Types E–H), Part 1 — Operating Instructions",
  11315: "Siemens SIMOVERT Master Drives Active Front End (AFE) AC-DC, Chassis Types E–G — Operating Instructions",
  11316: "Siemens SIMOVERT Master Drives Sinusoidal Filter — Operating Instructions",
  11266: "Siemens SIMOVERT Master Drives Braking Unit — Operating Instructions (German/English)",
  11317: "Siemens SIMOVERT Master Drives Motion Control Frequency Converter AC-AC (Compact) — Operating Instructions",
  11283: "Siemens SIMOVERT Master Drives Motion Control Frequency Converter AC-AC (Chassis) — Operating Instructions",
  11318: "Siemens SIMOVERT Master Drives Motion Control Inverter DC-AC (Compact) — Operating Instructions",
  11319: "Siemens SIMOVERT Master Drives Motion Control Inverter DC-AC (Chassis) — Operating Instructions",
  11320: "Siemens SIMOVERT Master Drives EMC Filter (Compact PLUS) — Operating Instructions (German/English)",
  11369: "Siemens SIMOVERT Master Drives Capacitor Module (Compact PLUS) — Operating Instructions (German/English)",
  11321: "Siemens SIMOVERT Master Drives DC Link Module (Compact PLUS) — Operating Instructions (German/English)",
  11322: "Siemens SIMOVERT Master Drives — Compendium",
  11323: "Siemens SIMOVERT Master Drives Vector Control for Lifts (VCL) — Operating Instructions",
  11324: "Siemens SIMOVERT Master Drives Frequency Control (FC) — Operating Instructions",
  11325: "Siemens SIMOVERT Master Drives Vector Control (VC) — Operating Instructions",
  11267: "Siemens SIMOVERT Master Drives Braking Unit — Operating Instructions (French/English)",
  11326: "Siemens SIMOVERT Master Drives EMC Filter (Compact PLUS) — Operating Instructions (French/English)",
  11327: "Siemens SIMOVERT Master Drives Capacitor Module (Compact PLUS) — Operating Instructions (French/English)",
  11328: "Siemens SIMOVERT Master Drives Braking Unit — Operating Instructions (Spanish/English)",
  11019: "Siemens SIMOVERT Master Drives Motion Control Inverter DC-AC (Compact PLUS) — Operating Instructions (Spanish/English)",
  11329: "Siemens SIMOVERT Master Drives EMC Filter (Compact PLUS) — Operating Instructions (Spanish/English)",
  11330: "Siemens SIMOVERT Master Drives Capacitor Module (Compact PLUS) — Operating Instructions (Spanish/English)",
  11331: "Siemens SIMOVERT Master Drives DC Link Module (Compact PLUS) — Operating Instructions (Spanish/English)",
  11332: "Siemens SIMOVERT Master Drives Active Front End (AFE), Types E–L — Operating Instructions",
  11359: "Siemens SIMATIC S7-200 Microsystem — Manual",
  11995: "Siemens 7VH83 High-Impedance Differential Protection Relay",
  11027: "Siemens Handle Padlocking Device (HPLE) for EG-Frame Breakers",
  11351: "Siemens SIMATIC WinCC flexible — Engineering System Manual",
  11333: "Siemens SIMATIC WinCC flexible 2005 — Migration User's Manual",
  11365: "Siemens SIMATIC WinCC flexible — Communication with SIMATIC S7 Controllers",
  11336: "Siemens SIMATIC HMI — Overview & Safety Instructions",
  10574: "Siemens / ITE Sentron Series Circuit Breakers (Bulletin 2.0-1A)",
  10591: "Siemens SB Encased Systems Breakers — Electronic Trip Unit (Bulletin 2.20-3A)",
  10575: "Siemens SB Encased Systems Breaker (400–2000 A Frame) — Information & Instruction Guide (Bulletin 2.20-4C)",
  10297: "Siemens Sentron Busway System — Introduction (Bulletin 5.9-2A)",
  11343: "Siemens Model 90 Motor Control Centers — Selection & Application Guide (CC3311)",
  11344: "Siemens Motor Control Centers — Overview Brochure (CC3325)",
  11276: "Siemens Series 81000 Vacuum Controllers (CC3802-02)",
  11360: "Siemens 3RW2 Solid-State Reduced-Voltage Starters — User's Manual (CP3280)",
  10582: "Siemens / ITE Type CLE-A E-Frame Molded Case Circuit Breaker — Information & Instruction Guide",
  10583: "Siemens / ITE Type CLF F-Frame Molded Case Circuit Breaker — Information & Instruction Guide",
  10584: "Siemens / ITE Type CN Cordon K-Frame Molded Case Circuit Breaker — Information & Instruction Guide",
  11277: "Siemens Series 81000 MV Controllers with 93H3/94H3 Drawout Vacuum Contactors (MVC-9068)",
  11271: "Siemens Series 81000 5–7.2 kV Vacuum Contactors (93H35/94H35) — Installation (MVC-9078)",
  11361: "Siemens SAMMS Motor Protection & Control System (SG-9109)",
  10586: "Siemens Circuit Breaker Retrofit Program — Brochure (SGBR-5009B)",
  11268: "Siemens MICROMASTER 440 Braking Resistors — Instruction Sheet",
  11028: "Siemens Utility Market Products & Services Guide (Bulletin 10.5-1A)",
  10576: "Siemens SB Encased Systems Breaker (4000 A Frame) — Information & Instruction Guide (Bulletin 2.20-5A)",
  11996: "Siemens Electronic Overload Relays — Selection Guide (Bulletin 6.0.0-3A)",
  11029: "Siemens Power Monitor Display & Monitoring Unit (Bulletin SG3129-02)",
  11985: "Siemens SIPROTEC 7VH60 High-Impedance Differential Relay — Manual",
  11993: "Siemens SIPROTEC 7UM511 Numerical Machine Protection Relay — Instruction Manual",
  11337: "Siemens SIPROTEC 7SA522 Distance Protection Relay — Manual",
  11986: "Siemens SIPROTEC 7SA6 Distance Protection Relay — Manual",
  11338: "Siemens SIPROTEC Numerical Protection Relay — Manual (C53000-G1840-C101-7)",
  11339: "Siemens SIPROTEC 6MD665 Bay Processing Unit — Manual",
  11341: "Siemens SIPROTEC 7SJ602 — IEC 60870-5-103 Serial Interface Supplementary Note",
  11278: "Siemens SIMATIC S5-155H Programmable Controller (CPU 948R) — Manual",
  10589: "Siemens 8DA10 / 8DB10 SF6 Medium-Voltage Switchgear (up to 36 kV) — Catalog HA 35.11",
  11353: "Siemens Model 90 Motor Control Centers — Installation, Operation & Maintenance (CC3318)",
  11362: "Siemens SAMMS (Advanced Motor Master System) — Guide (CC3326)",
  11354: "Siemens SAMMS (Advanced Motor Master System) — Technical Reference Manual (CP3290)",
  11987: "Siemens SIPROTEC Overhead Contact-Line Protection for AC Traction Power Supply — Manual",
  11366: "Siemens SIPROTEC 4 — Getting Started & System Overview",
  11340: "Siemens Basics of AC Drives (STEP 2000 Course, EP-6)",
  10585: "Siemens / ITE Type CP Cordon K-Frame Molded Case Circuit Breaker — Information & Instruction Guide",
  11988: "Siemens SIPROTEC 7SJ602 Numerical Overcurrent & Thermal Overload Relay — Instruction Manual",
  10594: "Siemens Type FSV/MSV Vacuum Circuit Breakers — Installation Instructions (SG-3248-01)",
  11272: "Siemens Maintenance Instructions",
  11345: "Siemens SAMMS-LV (Advanced Motor Master System, Low-Voltage Motors) — User's Manual (MCC-3298-01)",
  11346: "Siemens Motor Control Center Renewal Parts — Numeric Listing (MCC3012, 1994)",
  11347: "Siemens Model 95 Motor Control Centers — Installation & Operation (MCC3318)",
  11355: "Siemens Series 81000 MV Controllers — Selection & Application Guide (MVC-9011)",
  11370: "Siemens Series 81000 MV Controllers — Pricing Guide (MVC-9012)",
  11279: "Siemens Series 81000 Controller with Drawout Vacuum Contactors — Instructions (MVC-9018)",
  11273: "Siemens Series 81000 Controller with Drawout Vacuum Contactors (MVC-9019)",
  11274: "Siemens Series 81000 5–7.2 kV Vacuum Contactors (90H35/90H37) — Maintenance (MVC-9028)",
  11356: "Siemens Solid-State Synchronizing & Protection Module — Installation & Operation (MVC-9048)",
  11348: "Siemens SAMMS-MV (Advanced Motor Master System, Medium-Voltage Motors) — User's Manual (MVC-9108-01)",
  11999: "Siemens 7SJ512 Numerical Overcurrent Protection Relay — Product Bulletin (SG8031)",
  11989: "Siemens 7VK511/512 Digital Auto-Reclose / Check-Synchronism Relay",
  12000: "Siemens 7SA513 Line Protection Relay",
  12001: "Siemens 7UM512 Generator Protection Relay",
  10578: "Siemens 7SV512 Circuit-Breaker Failure Protection Relay",
  11357: "Siemens 7VE51 Synchronising Unit",
  11990: "Siemens 7UM515 Generator Protection Relay",
  12002: "Siemens 7UM511 Generator Protection Relay",
  11991: "Siemens 7SJ511 Digital Overcurrent-Time Protection Relay",
  11031: "Siemens 7SD511/512 Current-Comparison Protection Relay (Overhead Lines & Cables)",
  11992: "Siemens 7SJ512 Digital Overcurrent-Time Protection Relay",
  11275: "Siemens / Furnas ESP100 Solid-State Overload Relays — Product Catalog (SFPC-14010)",
  11342: "Siemens Power Monitor Display & Monitoring Unit — Operation Instructions (SG-4018)",
  11358: "Siemens Series 5600 Motor Control Center Retrofit Program — Application & Pricing Guide (SG-6042)",
  11284: "Siemens Isolated Multi-Drop Converter — Operator's Manual (SG-6048)",
  10595: "Siemens Type GMI 5 kV / 15 kV Vacuum Circuit Breakers — Installation & Operation (SG-3268-01)",
  11983: "Siemens 4720 Power Meter — Operator's Manual (SG6060-01)",
  10587: "Siemens Circuit Breaker Retrofit Program — Brochure (SGBR-5009B)",
  10590: "Siemens Type R / SR Low-Voltage Metal-Enclosed Switchgear (600 V) — Installation Instructions (SGIM-3088B)",
  11280: "Siemens Series 81000 Controller with 96H3/97H3 Drawout Vacuum Contactors — Instructions (SGIM-9068B)",
  11281: "Siemens Series 81000 Controller with 96H3/97H3 Drawout Vacuum Contactors — Operation Instructions (SGIM-9068C)",
  11282: "Siemens Series 81000 720 A Vacuum Controller (Type 96H6) — Instructions (SGIM-9098B)",
  10286: "Siemens Compact Molded Case Circuit Breakers — Information & Instruction Guide (SIB2.8-1B)",
  11367: "Siemens Contactor — Magnet Coil & Resistor Replacement Kit (SW9658)",
};

// stray ".pdf" suffixes to strip from manual_number
const NUMFIX = { 11993: "C53000-G1176-C109-4", 11351: "A5E00280169-02" };

// flagged for your spot-check (noisy scan / generic / duplicate)
const FLAG = { 11272: "low", 11270: "low", 11284: "med", 11338: "med", 11322: "med", 11336: "med", 11344: "med", 11028: "med", 11996: "med", 11362: "med", 10286: "med", 10586: "dup-of-10587", 10587: "dup-of-10586" };

async function main() {
  console.log(`\n=== Siemens machine-title humanization — ${LIVE ? 'LIVE' : 'DRY RUN'} (${Object.keys(TITLES).length} records) ===\n`);
  const ids = Object.keys(TITLES);
  const rows = (await db.execute(`SELECT id, manual_number, title FROM manuals WHERE id IN (${ids.join(',')})`)).rows;
  const byId = Object.fromEntries(rows.map(r => [r.id, r]));

  const csv = ['id,manual_number,old_title,new_title,flag'];
  const backup = [];
  let applied = 0, skipped = 0;

  for (const id of ids) {
    const row = byId[id];
    if (!row) { console.log(`id=${id} NOT FOUND — skip`); skipped++; continue; }
    const newTitle = TITLES[id];
    const newNum = NUMFIX[id] || null;
    const flag = FLAG[id] || '';
    csv.push([id, JSON.stringify(row.manual_number), JSON.stringify(row.title), JSON.stringify(newTitle), flag].join(','));
    backup.push(row);
    if (LIVE) {
      if (newNum) await db.execute({ sql: 'UPDATE manuals SET title=?, manual_number=? WHERE id=?', args: [newTitle, newNum, Number(id)] });
      else await db.execute({ sql: 'UPDATE manuals SET title=? WHERE id=?', args: [newTitle, Number(id)] });
      applied++;
    }
  }

  writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\siemens-titles-proposed.csv', csv.join('\n'));
  console.log(`Review CSV written: C:\\Users\\rodol\\Desktop\\memory\\siemens-titles-proposed.csv  (${csv.length - 1} rows)`);
  console.log(`Flagged for spot-check: ${Object.keys(FLAG).length} (see 'flag' column)`);
  if (LIVE) {
    writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\backups\\siemens-titles-backup-2026-06-09.json', JSON.stringify(backup, null, 2));
    console.log(`\nAPPLIED ${applied} title updates (+${Object.keys(NUMFIX).length} manual_number .pdf strips). Backup saved.`);
  } else {
    console.log(`\nDry run — re-run with --live to apply.`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
