import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function getUrl(slugLike: string): Promise<void> {
  const r = await db.execute({
    sql: "SELECT slug, pdf_url FROM manuals WHERE slug LIKE ? AND pdf_url != 'NONE' LIMIT 1",
    args: [slugLike]
  });
  if (r.rows.length > 0) {
    console.log(slugLike + ':');
    console.log('  ' + String(r.rows[0].pdf_url));
  }
}

async function main() {
  // Safe reuse PDFs
  await getUrl('%tmax-t5-400a%');  // ABB Tmax
  await getUrl('%magnum-sb-sbs6083%');  // Eaton Magnum SB
  await getUrl('%spectra-rms-sgda-200a%');  // GE Spectra (DEH-41304)
  await getUrl('%ak-100-4000a%');  // GE AKR (GEI-86150)
  await getUrl('%wavepro-1200a%');  // GE WavePro
  await getUrl('%ds-206-600a%');  // Westinghouse DS
  await getUrl('%vcp-w-15kv-1200a%');  // Westinghouse VCP-W (td013001en)
  await getUrl('%3wl2-iccb%');  // Siemens 3WL2
  await getUrl('%sb-encased%');  // Siemens SB IPIM
  await getUrl('%type-rl-1200a%');  // Siemens Type RL
  await getUrl('%sentron-3vl-en%'); await getUrl('%siemens-bq-15a%');  // Siemens 3VL MCCB
  await getUrl('%ge-power-break-ii-drawout%');  // GE Power Break II
  await getUrl('%abb-mns%');  // ABB switchgear
  await getUrl('%akd-8%');  // GE AKD switchgear
  await getUrl('%microversatrip-plus%');  // GE MicroVersaTrip
  await getUrl('%framebook%');  // Westinghouse molded case
  await getUrl('%db-50-characteristic%');  // Westinghouse DB curves
  await getUrl('%ds-206-renewal%');  // Westinghouse DS renewal
  // Also get the full URL for Siemens molded case
  const r2 = await db.execute("SELECT DISTINCT pdf_url FROM manuals WHERE slug LIKE '%siemens-bq%' AND pdf_url != 'NONE' LIMIT 1");
  if (r2.rows.length > 0) {
    console.log('Siemens MCCB (3VL):');
    console.log('  ' + String(r2.rows[0].pdf_url));
  }
}
main().catch(console.error);
