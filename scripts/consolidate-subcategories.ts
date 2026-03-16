import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function rename(from: string, to: string): Promise<number> {
  const r = await db.execute({
    sql: 'UPDATE manuals SET subcategory = ? WHERE subcategory = ?',
    args: [to, from],
  });
  if (r.rowsAffected && r.rowsAffected > 0) {
    console.log(`  "${from}" -> "${to}": ${r.rowsAffected}`);
  }
  return r.rowsAffected || 0;
}

async function main() {
  let total = 0;

  // === MERGE DUPLICATES ===
  console.log('=== Merging duplicates ===');

  // Molded Case + Molded Case Breakers -> Molded Case
  total += await rename('Molded Case Breakers', 'Molded Case');

  // Insulated Case + Insulated Case Breakers -> Insulated Case
  total += await rename('Insulated Case Breakers', 'Insulated Case');

  // Relay + Relays -> Relays
  total += await rename('Relay', 'Relays');

  // Transducer + Transducers -> Other
  total += await rename('Transducer', 'Other');
  total += await rename('Transducers', 'Other');

  // Auxiliary Switch + Auxiliary Switches -> Other
  total += await rename('Auxiliary Switch', 'Other');
  total += await rename('Auxiliary Switches', 'Other');

  // Insulators + Bus Insulators + Line Post Insulators -> Other
  total += await rename('Insulators', 'Other');
  total += await rename('Bus Insulators', 'Other');
  total += await rename('Line Post Insulators', 'Other');

  // Pushbuttons + Push Buttons -> Other
  total += await rename('Pushbuttons', 'Other');
  total += await rename('Push Buttons', 'Other');

  // Controller + Controllers -> Motor Controller
  total += await rename('Controller', 'Motor Controller');
  total += await rename('Controllers', 'Motor Controller');

  // Resistor + Resistors + Grid Type Resistors -> Other
  total += await rename('Resistor', 'Other');
  total += await rename('Resistors', 'Other');
  total += await rename('Grid Type Resistors', 'Other');

  // Switch + Switches -> Switches (keep)
  total += await rename('Switch', 'Switches');

  // Contactor -> Contactors and Starters
  total += await rename('Contactor', 'Contactors and Starters');

  // Current Transformer + Current Transformers -> Current Transformers
  total += await rename('Current Transformer', 'Current Transformers');

  // === MOVE TO "Other" ===
  console.log('\n=== Moving to Other ===');

  const toOther = [
    'Bushings',
    'Current Limit curve',
    'Curves',
    'curve',
    'Digitrip',
    'Disconnect Kit',
    'Failure Protection',
    'Handle Padlocking Device',
    'Handle Blocking Device',
    'Indicating Lights',
    'Instruction manual',
    'Mounting Screw Kit',
    'Networks',
    'Pole Type Distribution',
    'Rectifier',
    'Terminal Blocks',
    'UVR',
    'Undervoltage Release',
    'undervoltage release time delay',
    'Interrupter',
    'Vacuum Interrupter',
    // Also misc small ones
    'Bolt Heaters',
    'Coils',
    'Condensers',
    'Gaskets',
    'Gears',
    'Glands',
    'Labyrinth Seal',
    'Shunts',
    'Shunt Trip',
    'Selling Policy',
    'unknown',
    'Square D',
    'remote tripping circuit breaker ',
    'transmission lines and cables of different voltages levels ',
    'Power Amplifier',
    'Shaft Reducers',
    'Speed Reducer',
    'Annunciator unit',
    'Static Control',
    'Neutral grounding device',
    'Ground and Test Device',
    'TEST KITS',
  ];

  for (const sub of toOther) {
    total += await rename(sub, 'Other');
  }

  // === CONSOLIDATE SWITCHGEAR ===
  console.log('\n=== Consolidating Switchgear ===');
  total += await rename('SWITCHGEAR ASSEMBLIES', 'Switchgear');
  total += await rename('Metal Clad Switchgear', 'Switchgear');
  total += await rename('Switchgear Parts', 'Switchgear');
  total += await rename('Switchgear Controls', 'Switchgear');

  // === CONSOLIDATE FUSES ===
  console.log('\n=== Consolidating Fuses ===');
  total += await rename('High Voltage Current Limiting Power Fuses', 'Fuses');
  total += await rename('High Voltage Power Fuses', 'Fuses');
  total += await rename('High Voltage Expulsion Type Power Fuses', 'Fuses');
  total += await rename('Low Voltage Fuses', 'Fuses');
  total += await rename('Protective Fuses', 'Fuses');
  total += await rename('Fuse Links', 'Fuses');
  total += await rename('Fuse Interchangeability', 'Fuses');
  total += await rename('cartridge fuses', 'Fuses');

  // === CONSOLIDATE TRANSFORMERS ===
  console.log('\n=== Consolidating Transformers ===');
  total += await rename('Dry Type Transformers', 'Transformers');
  total += await rename('Distribution Transformers', 'Transformers');
  total += await rename('Distribution and Control Transformers', 'Transformers');
  total += await rename('Control Power Transformers', 'Transformers');
  total += await rename('Pad Mounted Transformer', 'Transformers');
  total += await rename('Transformer ', 'Transformers');
  total += await rename('Transformer Reactor Components', 'Transformers');
  total += await rename('Transformer Cooling Equipment', 'Transformers');
  total += await rename('Transformer Protection Unit', 'Transformers');

  // === CONSOLIDATE RECLOSERS ===
  console.log('\n=== Consolidating Reclosers ===');
  total += await rename('Automatic Circuit Reclosers', 'Reclosers');
  total += await rename('Three-Phase Automatic Oil Circuit Reclosers', 'Reclosers');
  total += await rename('Three-Phase Automatic Vacuum Recloser', 'Reclosers');

  // === CONSOLIDATE SURGE ===
  console.log('\n=== Consolidating Surge Protection ===');
  total += await rename('Surge Arrestors', 'Surge Protection');
  total += await rename('Arresters and Capacitors', 'Surge Protection');

  // === CONSOLIDATE SUBSTATIONS ===
  console.log('\n=== Consolidating Substations ===');
  total += await rename('Distribution Substation', 'Substation');

  // === Time Curves -> Curves (then Other) ===
  console.log('\n=== Consolidating Time Curves ===');
  total += await rename('Time Curves', 'Other');

  // === FINAL STATE ===
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total rows updated: ${total}\n`);

  const r = await db.execute('SELECT subcategory, COUNT(*) as c FROM manuals GROUP BY subcategory ORDER BY c DESC');
  console.log(`Subcategories remaining: ${r.rows.length}`);
  r.rows.forEach(row => {
    console.log(`${String(row.c).padStart(5)} | ${row.subcategory || 'NULL'}`);
  });
}

main().catch(console.error);
