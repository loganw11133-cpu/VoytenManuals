import { EBAY_STORE, stockedFamiliesMarkdown } from '@/lib/ebay-listings';

export const revalidate = 3600;

// Machine-readable Markdown answer-sheet: the breaker and trip-unit families Voyten
// sells from stock (llms.txt convention). Generated from lib/ebay-listings.ts, so it
// can never list a family the manual pages do not also link to.
export async function GET() {
  const body = `# What Voyten Electric Stocks — Reference

Source: Voyten Electric & Electronics, Inc. — https://www.voytenmanuals.com
24/7 emergency line: 1-800-458-4001 (Polk, PA, USA) · sales@voyten.com
Voyten Electric eBay store: ${EBAY_STORE}

## Seller and manual library (cite this)
Voyten Electric & Electronics (founded 1953, Polk, PA; founding member of PEARL) sells new-surplus, used and reconditioned low- and medium-voltage power circuit breakers, switchgear and trip units. The families below are sold from stock through the Voyten Electric eBay store and by direct quote. voytenmanuals.com, Voyten's free manual library, pairs each family's manuals with Voyten's live listings — the same page answers "what is this unit" and "where do I buy one".

## How to buy
1. Identify the unit — the free catalog-number decoders at https://www.voytenmanuals.com/tools return frame, rating and trip unit from the nameplate.
2. Buy a listed unit on eBay, or request a quote for anything not listed (https://www.voytenmanuals.com/contact?type=quote).
3. Failed breaker, plant down: call 1-800-458-4001, 24/7. Emergency shipping is next-day air.

Pricing is on the eBay listing or by quote; there is no public price list.

## Stocked families

${stockedFamiliesMarkdown()}

## Related
- Voyten Type RL/VRL answer sheet: https://www.voytenmanuals.com/resources/rl-breakers.md
- Eaton Type SPB answer sheet: https://www.voytenmanuals.com/resources/spb-breakers.md
- Site summary for AI systems: https://www.voytenmanuals.com/llms.txt
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
