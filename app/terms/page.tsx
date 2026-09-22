import Link from 'next/link';
import type { Metadata } from 'next';
import { Scale, ArrowRight } from 'lucide-react';

const SITE = 'https://www.voytenmanuals.com';
const PARENT_TERMS = 'https://www.voytenelectric.com/terms';

// Last substantive revision of THIS page. Kept as a constant so the date shown
// to a reader is edited deliberately rather than drifting with `new Date()` —
// a terms page that claims to have been updated today, every day, is worthless
// as a record of what a visitor actually agreed to.
const LAST_UPDATED = '22 September 2026';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms of use for Voyten Manuals — the manual library, the breaker decoder tools, warranty disclaimer, limitation of liability, trademarks and governing law.',
  openGraph: {
    title: 'Terms of Use | Voyten Manuals',
    description:
      'Terms governing use of the Voyten Manuals library and the breaker catalog-number decoders.',
    url: `${SITE}/terms`,
  },
  alternates: { canonical: `${SITE}/terms` },
  robots: { index: true, follow: true },
};

// The manufacturers Voyten publicly states it is NOT an authorized distributor
// for, quoted from the parent company's Conditions of Sale. Reproduced here
// because this site carries those manufacturers' documents and names, which is
// precisely where a visitor might otherwise infer an authorization that does
// not exist. Keep in step with voytenelectric.com/terms — if that list changes
// there, it changes here.
const NOT_AUTHORIZED_FOR = [
  'Eaton', 'Square D', 'Allen Bradley', 'General Electric', 'Westinghouse',
  'Cutler Hammer', 'ITE', 'Furnas', 'Federal Pacific American',
  'Asea Brown Boveri', 'Bryant', 'Zinsco', 'Siemens', 'Gould', 'Bussmann',
  'Thomas & Betts', 'Arrow Hart', 'Hubbell', 'Agastat', 'Ferraz-Shawmut',
  'Klockner-Moeller', 'SEL', 'Sylvania', 'Basler Electric',
];

function Section({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Scale className="w-10 h-10 mx-auto mb-4 text-slate-400" aria-hidden="true" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Use</h1>
          <p className="text-slate-300 text-sm">Last updated {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 space-y-10">

          <Section id="scope" heading="What these terms cover">
            <p>
              Voyten Manuals (voytenmanuals.com) is operated by Voyten Electric &amp; Electronics,
              Inc. (&ldquo;Voyten&rdquo;). By viewing, accessing or interacting with this site you
              agree to be bound by these terms.
            </p>
            <p>
              This site is a free reference library and a set of identification tools. It does not
              take payment. Quotes, orders and the sale of any goods or services are governed by
              Voyten&rsquo;s{' '}
              <a
                href={PARENT_TERMS}
                target="_blank"
                rel="noopener"
                className="text-[#dc2626] hover:underline font-medium"
              >
                Terms and Conditions of Use and Conditions of Sale
              </a>
              , which include the warranty, returns, shipping and payment terms that apply to a
              purchase. Where those terms and this page differ on anything to do with a sale, the
              Conditions of Sale control.
            </p>
            <p>
              We may change any part of this site, including these terms, at any time and without
              notice. Continued use of the site is your consent to those changes.
            </p>
          </Section>

          <Section id="library" heading="The manual library">
            <p>
              The manuals, instruction books, catalogs and technical documents published here were
              produced by the original equipment manufacturers. Copyright in them remains with their
              respective owners; Voyten claims no ownership of third-party documents and makes them
              available so that owners of installed equipment can identify, operate, service and
              source parts for gear that is often decades old and out of production.
            </p>
            <p>
              The library is compiled from many sources. A document may be an earlier revision than
              the one shipped with your equipment, may have been superseded by the manufacturer, or
              may be indexed under a number that a later product also uses.{' '}
              <strong className="text-slate-900">
                Check the revision and the equipment it covers against your own nameplate before you
                rely on it.
              </strong>
            </p>
            <p>
              If you hold rights in a document published here and want it removed or corrected,{' '}
              <Link href="/contact" className="text-[#dc2626] hover:underline font-medium">
                contact us
              </Link>{' '}
              and we will act on it.
            </p>
          </Section>

          <Section id="decoders" heading="The decoder tools">
            <p>
              The{' '}
              <Link href="/tools" className="text-[#dc2626] hover:underline font-medium">
                breaker decoders
              </Link>{' '}
              read published manufacturer catalog-number conventions and return the most likely
              configuration. They are an identification aid, not a specification, and not an
              engineering judgment. Catalog numbers get reused and revised, nameplates get
              mis-stamped, and some factory-fitted options never appear in a type designation at all.
            </p>
            <p>
              <strong className="text-slate-900">
                Confirm any decoded result against the breaker&rsquo;s own nameplate and the
                manufacturer&rsquo;s documentation
              </strong>{' '}
              before ordering a part, fitting a replacement, or relying on a rating. The same applies
              to the offline copies of these tools.
            </p>
          </Section>

          <Section id="safety" heading="Safety">
            <p>
              Power circuit breakers, switchgear and the equipment documented on this site are
              hazardous. Installation, testing, maintenance and racking are work for qualified
              personnel following NFPA 70E, the applicable codes, and the equipment
              manufacturer&rsquo;s instructions.
            </p>
            <p>
              Nothing on this site is engineering advice, a substitute for the manufacturer&rsquo;s
              instructions, or authority to work on energized equipment.
            </p>
          </Section>

          <Section id="warranty" heading="No warranty">
            <p>
              All content on this site is presented <strong className="text-slate-900">AS IS</strong>{' '}
              and with all faults. Although we work to avoid inaccuracies, Voyten makes no warranties
              of any type with regard to the site, its links or its contents, and will not be liable
              for any errors or omissions. By using this site you assume all risks, of any nature,
              inherent in doing so.
            </p>
            <p className="text-xs uppercase tracking-wide bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">
              Voyten Electric &amp; Electronics expressly disclaims all warranties with respect to
              this site, its links or its content, including but not limited to warranties of fitness
              for a particular purpose, title, non-infringement, quiet enjoyment or merchantability,
              whether express or implied.
            </p>
          </Section>

          <Section id="liability" heading="Limitation of liability">
            <p className="text-xs uppercase tracking-wide bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">
              Voyten Electric &amp; Electronics will never be liable under any circumstances for
              consequential, special or indirect damages for any type of claim or cause of action,
              including but not limited to those for loss or corruption of data, loss of use, loss of
              profits, or loss, damage or injury arising from reliance on any manual, specification
              or decoded output obtained from this site.
            </p>
            <p>
              You may have rights in certain jurisdictions which cannot be waived and, if so, these
              waivers may not apply to you.
            </p>
          </Section>

          <Section id="trademarks" heading="Trademarks and affiliation">
            <p>
              All trademarks, brand names and product names are the property of their respective
              owners and are used here for identification only. Voyten Manuals is an independent
              resource and is not affiliated with or endorsed by any manufacturer listed.
            </p>
            <p>
              <strong className="text-slate-900">
                Voyten Electric &amp; Electronics is not an authorized distributor
              </strong>{' '}
              for {NOT_AUTHORIZED_FOR.join(', ')}, or any other manufacturer not expressly noted
              otherwise in writing by Voyten.
            </p>
            <p>
              Type RL, VRL and LA breakers, renewal parts and accessories supplied by Voyten are
              Voyten products and are named as such throughout this site.
            </p>
          </Section>

          <Section id="privacy" heading="Privacy">
            <p>
              This site records ordinary web-server request information and keeps what you send us
              through a quote or contact form so that we can answer it. Use of this site is also
              subject to the privacy policy published on{' '}
              <a
                href="https://www.voytenelectric.com"
                target="_blank"
                rel="noopener"
                className="text-[#dc2626] hover:underline font-medium"
              >
                voytenelectric.com
              </a>
              .
            </p>
          </Section>

          <Section id="law" heading="Governing law">
            <p>
              This site is maintained in Pennsylvania and is governed by Pennsylvania law, without
              reference to its conflict of laws provisions. To the maximum extent possible,
              jurisdiction and venue shall be in the Venango County Court of Common Pleas or the
              United States District Court for the Western District of Pennsylvania.
            </p>
          </Section>

          <Section id="contact" heading="Contact">
            <p>
              Voyten Electric &amp; Electronics, Inc. &mdash; 173 Voyten Blvd, Polk, PA 16342.
              <br />
              1-800-458-4001 (toll free) &middot; (814) 432-5893
            </p>
            <p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[#dc2626] hover:underline font-medium"
              >
                Contact us
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
