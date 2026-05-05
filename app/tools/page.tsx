import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Breaker Decoder Tools',
  description: 'Free circuit breaker catalog number decoders. Decode Eaton and Siemens model numbers for Magnum DS, SPB, RD, MW IEC, MDS, SBS, and RL breakers instantly.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://voytenmanuals.com/tools',
  },
};

const tools = [
  {
    slug: 'rl',
    name: 'Siemens RL LVPCB',
    manufacturer: 'Siemens',
    description: 'Decode Siemens RL 600V Low Voltage Power Circuit Breaker catalog numbers. Identifies connection, interrupting type, frame, sensors, system wiring, trip unit, and optional devices.',
    frames: 'RL / RLE / RLI / RLF',
    ratings: '800A – 5,000A',
  },
  {
    slug: 'spb',
    name: 'SPB',
    manufacturer: 'Eaton',
    description: 'Decode both SPB catalog numbers (14 prefix variants) and 30-digit edge-stamped numbers. Frame-dependent mount codes and trip unit identification.',
    frames: 'SPB 50 / SPB 65 / SPB 100',
    ratings: '800A – 4,000A',
  },
  {
    slug: 'mds-sbs',
    name: 'MDS / SBS',
    manufacturer: 'Eaton',
    description: 'Decode Magnum DS (MDS) and SBS-series catalog numbers. Identifies frame, rating, interrupting capacity, trip unit type, and mounting.',
    frames: 'Magnum DS (MDS) · SBS',
    ratings: '800A – 6,000A',
  },
  {
    slug: 'rd',
    name: 'RD (R-Frame)',
    manufacturer: 'Eaton',
    description: 'Decode RD-series R-Frame catalog numbers including factory-installed accessories. Parses post-W accessory groups (S/U/T/A/B/Q/N).',
    frames: 'RD / R-Frame',
    ratings: '400A – 2,000A',
  },
  {
    slug: 'mw-iec',
    name: 'Magnum MW IEC',
    manufacturer: 'Eaton',
    description: 'Decode IEC 60947-2 Magnum MW catalog numbers. Supports 49 ampere ratings with fixed/draw-out mounting and motorized/manual operation.',
    frames: 'Magnum MW (IEC)',
    ratings: '800A – 6,300A',
  },
  {
    slug: 'pxr-pdsb',
    name: 'Magnum PXR / Power Defense SB',
    manufacturer: 'Eaton',
    description: 'Decode 25-character Magnum PXR and 15-character Power Defense SB catalog numbers. Identifies frame size, ampere rating, trip unit, and accessories.',
    frames: 'Magnum DS (PXR) · Power Defense SB',
    ratings: '800A – 6,000A',
  },
];

export default function ToolsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Breaker Decoders
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Enter a catalog or edge-stamped number to instantly decode frame size, ampere rating, trip unit, mounting, and accessories.
          </p>
        </div>
      </div>

      {/* Tool Cards */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-5">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-[#1a1a1a]/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[#1a1a1a]/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a1a1a] transition-colors">
                  <Cpu className="w-6 h-6 text-[#1a1a1a] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors">
                      {tool.name} Decoder
                    </h2>
                    {'manufacturer' in tool && (
                      <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">
                        {tool.manufacturer}
                      </span>
                    )}
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-[#dc2626] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                    <span><span className="font-semibold text-slate-700">Frames:</span> {tool.frames}</span>
                    <span><span className="font-semibold text-slate-700">Ratings:</span> {tool.ratings}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-white border border-slate-200 rounded-xl p-8 text-center">
          <h3 className="font-bold text-slate-900 text-lg mb-2">Need help identifying a breaker?</h3>
          <p className="text-slate-600 text-sm mb-4 max-w-lg mx-auto">
            If you can&#39;t decode your model number with these tools, our team can help. Send us the catalog number or nameplate photo and we&#39;ll identify it for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Contact Our Team
          </Link>
        </div>
      </div>
    </div>
  );
}
