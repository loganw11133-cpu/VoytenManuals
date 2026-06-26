import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

// The Eaton SPB decoder is intentionally NOT public — its 30-digit edge-stamped
// encoding is competitively/accuracy-sensitive and is maintained internally only.
// Customers who reach this route are funneled to the SPB product landing page.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SpbDecoderPage() {
  redirect('/products/spb-breakers');
}
