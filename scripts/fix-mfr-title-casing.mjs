/**
 * Per-manufacturer title-casing fixer (curated-set, safe). Generalizes the ITE
 * pass (scripts/fix-ite-title-casing.mjs) so each manufacturer's verified frame/
 * type code vocabulary can be uppercased without false positives. Diagnose first
 * with scripts/audit-title-casing.mjs, eyeball the tokens, add a CONFIG entry.
 *
 * Codes are uppercased CASE-SENSITIVELY at word boundaries → idempotent, and a
 * real word ("Small", "Group") is never touched because it's not in the set.
 * Title-only (slugs/URLs unchanged → no redirects/FK work).
 *
 * Run: node scripts/fix-mfr-title-casing.mjs Eaton          (dry run)
 *      node scripts/fix-mfr-title-casing.mjs Eaton --live    (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
dotenv.config({ path: 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local' });

// Per-mfr verified code vocabulary (Title-case form → uppercased). `pre` holds
// optional spaced-form/initialism fixes applied before code uppercasing.
const CONFIG = {
  Eaton: {
    // Series-G molded-case frames (FD/FDB/GDB/GHB) + power-breaker / retrofit
    // codes verified by inspecting every title-cased Eaton row. Dslii/Dst/Wr/Oem
    // added so adjacent codes (e.g. "DSII and DSLII") end up fully consistent.
    codes: ['Fd','Fdb','Gdb','Ghb','Dhp','Dsii','Dslii','Dsui','Dst','Vcp','Vr','Wr',
      'Am','Sodh','Soaxu','Soxu','Fp','Mol','Oem'],
    pre: [],
  },
  Westinghouse: {
    // WH relay/equipment/breaker/fuse type codes (350), curated from every
    // title-cased Type/Frame token minus real-word false positives (Transformers,
    // Distribution, Current, Voltage, Non, All, Unit, Drawout, Adjustable, ...).
    // `anchored` = only uppercase in a CODE context (after Type/Types, before
    // Frame, or before a model number) — so 2-letter codes that are also English
    // words (It→IT, Re→RE) can never corrupt prose.
    anchored: true,
    pre: [],
    codes: [
      'Tcf','Cls','Ba','Jy','Ca','Cle','Hkb','Ta','Dba','Co','Tc','Tt',
      'Rba','Sk','Su','Mm','Vcp','Sv','Cj','Hz','Kd','Rc','Sg','Td',
      'Wl','Crn','Skbu','Tso','Asl','Sl','Dhp','Os','Kr','Cn','Dt','Rb',
      'Rr','Stu','Lcb','Dbu','Urs','Ur','Jz','Dr','Drc','Hi','Hrz','Ks',
      'Rs','Sgr','Tr','Mmd','Bal','Cs','Apt','Clt','Wsb','Mg','Cvr','Pr',
      'Gca','Tro','Ar','Bl','Cod','Cve','Cwp','Ha','Hcb','Fd','Hl','Hzm',
      'Ka','Kc','Tm','Rf','Sdg','Si','Skdu','Dn','Gp','Nf','Act','Cltb',
      'Rsl','Lbf','Ra','Pba','Ab','Ft','Da','Svs','Cl','Kf','Kp','Idn',
      'Cbu','Cf','Cm','Cov','Cvq','Cw','Cwk','Hqs','Hr','Irv','Kh','Klf',
      'Ko','Mn','Pm','Poq','Sbf','Sco','Siu','Skd','Tf','Tg','Th','Ti',
      'Tsp','Sx','Md','Gcd','Lf','Gc','Gs','Lbu','Cas','Gw','Sf','Cltx',
      'Cx','Rdb','Saf','Gfr','Ir','Im','Px','Pa','Ak','Esv','Dv','Ivs',
      'Crw','Ivl','Vlb','Dbl','Rmx','Url','Amd','Awp','Smx','Dp','Svc','Svr',
      'Sc','Nl','Rk','Hin','Amb','Am','Ars','Av','Az','Bn','Cam','Cgr',
      'Ch','Cko','Coj','Com','Crq','Cv','Cvd','Cvm','Cvn','Cwo','Dgf','Ffa',
      'Hcrd','Hcz','Hd','Hlf','Hrd','Hrk','Hvs','Hzhz','Irq','Jd','Jl','Jm',
      'Kab','Kdtg','Kdxg','Ki','Kn','Kqs','Krd','Krq','Krt','Krv','Kst','Lc',
      'Mp','Mpr','Ms','Nd','Pg','Ps','Psa','Pvr','Rcd','Re','Rkm','Rx',
      'Sar','Scc','Sd','Sdb','Sdbu','Sdf','Sdgu','Sgru','Shu','Ska','Sksu','Skvu',
      'Slb','Sr','Src','Srcu','Srgu','Sru','Tj','Tk','Trc','Tsi','Tw','Sjs',
      'Coq','Ith','Sjo','Nr','Nrd','Gpd','Dsl','Ldx','Lox','Ncx','Avr','Hle',
      'Lpt','Mf','Msv','Ptom','Pvt','Rob','Urt','Sw','Ut','Wfs','Ow','Lco',
      'Srd','Vrt','Trb','Arm','Cb','Mtp','Oa','Rh','Ro','Tct','It','Wli',
      'Sfp','Smp','Gr','Caf','Utr','Dfs','Mvb','Wsl','Wss','Dvp','Prc','Urf',
      'Ot','El','Dx','Rj','Cwc','Sci','Hnc','Cpl','Hmx','Dsf','Wlm','Ss',
      'Es','Lb','Ai','Bj','Oj','Cgrs','Clss','Clv','Cso','Csr','Dk','Dkn',
      'Dwe','Fop','Fs','Grs','Hsx','Hwp','Hxs','Ict','Icx','Imx','Iw','Kca',
      'Kor','Krc','Kx','Lbor','Lg','Lr','Mfb','Mtr','Nrl','Rd','Rm','Skb',
      'Skl','Sta','Tp','Chm','Cp','Pca','Rfw','Ezc','Aibia','Ci','Gfm','Sbr',
      'Xt','Vp',
      // sibling codes that only ever appear in "<code> and <code>" lists
      'Rsn','Hrp','Rv','Hrc','Wvb','Tmr','St','Sti','Coh','Coa','Clto','Cxn',
      'Esm','Rbo','Prcb','Hcls','Efd','Pt','Cip',
    ],
  },
  // ── Batched remaining manufacturers (2026-06-15). All anchored (safe default).
  //    Curated from _rest-inspect token inventory minus real words + OCR garble.
  'General Electric': {
    anchored: true, pre: [],
    // GE relay/switchgear codes (the 2026-06-09 GE pass only did breaker frames).
    // Dropped OCR garble (Hmalll/Tmclla/Akakr) + words (Distance/Model/Overcurrent/Rackout).
    codes: ['Am','Iac','Akr','Pjc','Cey','Hga','Iav','Hfa','Jas','Kso','Fk','Ak','Ab','Akd',
      'Al','Ag','Et','Ms','Ej','Sb','Hea','Sam','Gcy','Naa','Hka','Icr','Pjg','Ip','Tg','Ch',
      'Sbm','Amf','Gmv','Ml','Ek','Fkd','Hpc','Szl'],
  },
  ABB: {
    anchored: true, pre: [],
    codes: ['Ft','Hk','Kf','Klf','Rel','Lk','Lkd','Mps','Vhk','Cod','Ar','Ca','Co','Com','Cp',
      'Crn','Cw','Dgf','Gpu','Hcb','Hi','Kc','Krd','Mg','Mrc','Rc','Sbf','Soq','Srw','Ssc','Ssv',
      'Svsv','Svv','Grd','Hpl','Blg','Esv','Grc','Jm','Lcb','Vkd','Sg','Vhkx'],
  },
  'Square D': {
    anchored: true, pre: [],
    codes: ['Vad','Dse','Vr','Vav','Fvb','Nlc','Te','Tf','Tfb','Gp','Fvr','Gtgp','Av','Zha'],
  },
  Siemens: {
    anchored: true, pre: [],
    codes: ['Gmi','Sdv','Qr','Fsv','Fm','Cle','Clf','Cn','Cp','Sr','Cpv','Hvr','Amr','Sp','Vv'],
  },
  'Allis-Chalmers': {
    anchored: true, pre: [],
    codes: ['Mb','Ph','Tm','Hd','Am','Ic','Tj','Mct'],
  },
  'Other Manufacturers': {
    anchored: true, pre: [],
    codes: ['Sm','Gr','Lk','Smd','Smu','Vcp'],
  },
  'Federal Pacific': {
    anchored: true, pre: [],
    codes: ['Dst','Hl','Sd','Is'],
  },
  'Brown Boveri': {
    anchored: true, pre: [],
    codes: ['Lss','Hk','Ksp','Lk','Lkd'],
  },
  'Siemens-Allis': {
    anchored: true, pre: [],
    codes: ['Pts','Me','Ome','Tls'],
  },
  'Basler Electric': {
    anchored: true, pre: [],
    codes: ['Ess','Sse'],
  },
  'Cooper Power Systems': {
    anchored: true, pre: [],
    codes: ['Met','Vcs'],
  },
};

const mfr = process.argv[2];
const LIVE = process.argv.includes('--live');
if (!mfr || !CONFIG[mfr]) {
  console.error(`Usage: node scripts/fix-mfr-title-casing.mjs <${Object.keys(CONFIG).join('|')}> [--live]`);
  process.exit(1);
}
const { codes, pre, anchored } = CONFIG[mfr];
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Precompile once. In anchored mode a code is uppercased ONLY in a code context:
// after Type/Types, before Frame, before a model number, or directly after an
// already-known code (the list case "Cls 1 and Cls 2 Cle ..."). The last rule
// uses a lookbehind over the KNOWN code alternation, so it never fires on prose.
const UP = codes.map(c => c.toUpperCase());
const KNOWN = `(?:${UP.join('|')})`;
const RULES = codes.map((c, i) => {
  const U = UP[i];
  if (!anchored) return [[new RegExp(`\\b${c}\\b`, 'g'), U]];
  return [
    [new RegExp(`\\b(Types?)\\s+${c}\\b`, 'g'), `$1 ${U}`],
    [new RegExp(`\\b${c}(\\s+Frame\\b)`, 'g'), `${U}$1`],
    [new RegExp(`\\b${c}(\\s+\\d)`, 'g'), `${U}$1`],
    [new RegExp(`(?<=\\b${KNOWN}\\s(?:\\d+\\s)?(?:(?:and|or)\\s)?)${c}\\b`, 'g'), U],
  ];
});

function fix(title) {
  let t = String(title);
  for (const [re, rep] of pre) t = t.replace(re, rep);
  let prev;
  do {                                  // fixpoint so list-runs propagate left→right
    prev = t;
    for (const rules of RULES) for (const [re, rep] of rules) t = t.replace(re, rep);
  } while (anchored && t !== prev);
  return t;
}

const rows = (await db.execute({ sql: 'SELECT id, title FROM manuals WHERE manufacturer=? ORDER BY title', args: [mfr] })).rows;
const changes = rows.map(r => ({ id: r.id, old: String(r.title), neu: fix(r.title) })).filter(c => c.neu !== c.old);

console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ${mfr} title casing — ${changes.length} rows change (of ${rows.length}) ===\n`);
const uniq = new Map();
for (const c of changes) {
  const k = c.old + '||' + c.neu;
  (uniq.get(k) || uniq.set(k, { old: c.old, neu: c.neu, ids: [] }).get(k)).ids.push(c.id);
}
for (const u of [...uniq.values()].sort((a, b) => a.neu.localeCompare(b.neu))) {
  console.log(`  ${u.old}\n    -> ${u.neu}   [ids: ${u.ids.join(', ')}]\n`);
}
console.log(`${uniq.size} distinct transforms across ${changes.length} rows.`);

if (LIVE) {
  const stamp = '2026-06-15';
  writeFileSync(
    `C:\\Users\\rodol\\Desktop\\memory\\backups\\${mfr.toLowerCase()}-title-casing-backup-${stamp}.json`,
    JSON.stringify(rows.filter(r => changes.some(c => c.id === r.id)), null, 2)
  );
  for (const c of changes) await db.execute({ sql: 'UPDATE manuals SET title=? WHERE id=?', args: [c.neu, c.id] });
  console.log(`\nAPPLIED ${changes.length} title updates for ${mfr}. Backup saved.`);
} else {
  console.log(`\nRe-run with --live to apply.`);
}
