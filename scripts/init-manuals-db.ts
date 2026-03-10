import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('Creating manuals table...');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS manuals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      manual_number TEXT,
      category TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      subcategory TEXT,
      description TEXT,
      pdf_url TEXT NOT NULL,
      page_count INTEGER,
      file_size_bytes INTEGER,
      keywords TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Indexes for common queries
  await db.execute('CREATE INDEX IF NOT EXISTS idx_manuals_category ON manuals(category)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_manuals_manufacturer ON manuals(manufacturer)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_manuals_subcategory ON manuals(subcategory)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_manuals_slug ON manuals(slug)');

  console.log('Creating lead_submissions table...');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS lead_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      message TEXT,
      manual_id INTEGER,
      manual_title TEXT,
      source_page TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manual_id) REFERENCES manuals(id)
    )
  `);

  await db.execute('CREATE INDEX IF NOT EXISTS idx_leads_type ON lead_submissions(type)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_leads_created ON lead_submissions(created_at)');

  console.log('Creating download_events table...');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS download_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manual_id INTEGER NOT NULL,
      ip_hash TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manual_id) REFERENCES manuals(id)
    )
  `);

  await db.execute('CREATE INDEX IF NOT EXISTS idx_downloads_manual ON download_events(manual_id)');

  console.log('Database initialized successfully!');

  // Insert sample manuals for development
  const sampleManuals = [
    { title: 'Masterpact NW Circuit Breaker Installation Guide', manual_number: 'NW-INST-001', category: 'Circuit Breakers', manufacturer: 'Square D', subcategory: 'Insulated Case Breakers', description: 'Complete installation guide for Masterpact NW series insulated case circuit breakers including mounting, wiring, and commissioning procedures.' },
    { title: 'DS-206 Low Voltage Power Circuit Breaker Manual', manual_number: 'DS206-MAN-001', category: 'Circuit Breakers', manufacturer: 'Westinghouse', subcategory: 'Air Breakers', description: 'Technical manual for the Westinghouse DS-206 low voltage power circuit breaker covering maintenance, testing, and renewal parts.' },
    { title: 'Type SPB Breaker Renewal Parts Catalog', manual_number: 'SPB-RPC-001', category: 'Circuit Breakers', manufacturer: 'Westinghouse', subcategory: 'Renewal Parts', description: 'Complete renewal parts catalog for Westinghouse Type SPB circuit breakers.' },
    { title: 'AKR-30 Circuit Breaker Instruction Manual', manual_number: 'AKR30-INST-001', category: 'Circuit Breakers', manufacturer: 'General Electric', subcategory: 'Air Breakers', description: 'Instruction manual covering installation, operation, and maintenance of GE AKR-30 circuit breakers.' },
    { title: 'Magnum DS Circuit Breaker Technical Guide', manual_number: 'MDS-TECH-001', category: 'Circuit Breakers', manufacturer: 'Cutler-Hammer', subcategory: 'Insulated Case Breakers', description: 'Technical guide for Cutler-Hammer Magnum DS insulated case circuit breakers.' },
    { title: 'WL Breaker Operating Instructions', manual_number: 'WL-OPS-001', category: 'Circuit Breakers', manufacturer: 'Siemens', subcategory: 'Air Breakers', description: 'Operating instructions for Siemens WL series low voltage power circuit breakers.' },
    { title: 'Digitrip RMS Trip Unit Manual', manual_number: 'DTRIP-001', category: 'Circuit Breakers', manufacturer: 'Cutler-Hammer', subcategory: 'Trip Units', description: 'Manual for Cutler-Hammer Digitrip RMS electronic trip units including settings and calibration.' },
    { title: 'Plug-In Bus Duct Installation Manual', manual_number: 'PIBD-INST-001', category: 'Bus Products', manufacturer: 'Square D', subcategory: 'Bus Duct', description: 'Installation manual for Square D plug-in bus duct systems.' },
    { title: 'MCC Bucket Replacement Guide', manual_number: 'MCC-RPL-001', category: 'Motor Controls', manufacturer: 'General Electric', subcategory: 'Motor Control Centers', description: 'Guide for replacing motor control center buckets in GE MCC lineups.' },
    { title: 'BE-1-50/51 Overcurrent Relay Manual', manual_number: 'BE150-MAN-001', category: 'Relays and Meters', manufacturer: 'Beckwith Electric', subcategory: 'Overcurrent Relays', description: 'Technical manual for Beckwith Electric BE-1-50/51 overcurrent relay.' },
    { title: 'Micrologic Trip Unit Configuration Guide', manual_number: 'MICRO-CFG-001', category: 'Circuit Breakers', manufacturer: 'Square D', subcategory: 'Trip Units', description: 'Configuration and settings guide for Square D Micrologic electronic trip units used in Masterpact and PowerPact breakers.' },
    { title: 'Type W Fuse Link Catalog', manual_number: 'WFUSE-CAT-001', category: 'Fuses', manufacturer: 'Westinghouse', subcategory: 'Fuse Links', description: 'Catalog of Westinghouse Type W fuse links with ratings and dimensions.' },
    { title: 'QA/QMR Switch Operating Manual', manual_number: 'QAQMR-OPS-001', category: 'Switches', manufacturer: 'ITE', subcategory: 'Disconnect Switches', description: 'Operating and maintenance manual for ITE QA and QMR disconnect switches.' },
    { title: 'Dry-Type Transformer Installation Guide', manual_number: 'DTTF-INST-001', category: 'Transformers', manufacturer: 'Square D', subcategory: 'Dry-Type', description: 'Installation and maintenance guide for Square D dry-type distribution transformers.' },
    { title: 'NW08-NW63 Retrofit Kit Instructions', manual_number: 'NWRETRO-001', category: 'Circuit Breakers', manufacturer: 'Square D', subcategory: 'Retrofit Kits', description: 'Step-by-step instructions for installing Masterpact NW retrofit kits in existing switchgear.' },
    { title: 'SELBUS Communications Module Manual', manual_number: 'SELBUS-MAN-001', category: 'Miscellaneous', manufacturer: 'General Electric', subcategory: 'Communications', description: 'Manual for GE SELBUS serial communications module used with protective relays.' },
  ];

  console.log('Inserting sample manuals...');

  for (const manual of sampleManuals) {
    const slug = manual.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, page_count, file_size_bytes, keywords)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          slug, manual.title, manual.manual_number, manual.category,
          manual.manufacturer, manual.subcategory, manual.description,
          `/manuals/pdf/${slug}.pdf`, Math.floor(Math.random() * 80) + 5,
          Math.floor(Math.random() * 5000000) + 500000,
          `${manual.category}, ${manual.manufacturer}, ${manual.subcategory || ''}`,
        ],
      });
    } catch (e) {
      console.log(`Skipped duplicate: ${manual.title}`);
    }
  }

  console.log('Done! Sample manuals inserted.');
}

main().catch(console.error);
