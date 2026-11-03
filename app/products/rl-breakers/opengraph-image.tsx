import { ImageResponse } from 'next/og';

// Social / link-preview card for /products/rl-breakers. The page sets its own
// `openGraph` metadata, which replaces the root one, so without this file the
// page had no og:image at all. Same palette as app/opengraph-image.tsx.
// RL is "Voyten Type RL/VRL" on every front-facing surface — never a Siemens mark.

export const runtime = 'edge';
export const alt = 'Voyten Type RL/VRL breakers — new-surplus and reconditioned, 800–5000A. 24/7: 1-800-458-4001';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 55%, #991b1b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: '#dc2626',
            borderRadius: '999px',
            padding: '8px 22px',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}
        >
          New Surplus Inventory
        </div>
        <div style={{ display: 'flex', fontSize: '76px', fontWeight: 800, lineHeight: 1.05 }}>
          Voyten Type&nbsp;<span style={{ color: '#dc2626' }}>RL/VRL</span>&nbsp;Breakers
        </div>
        <div style={{ display: 'flex', fontSize: '34px', color: '#cbd5e1', marginTop: '20px' }}>
          Low voltage power circuit breakers · 800A–5000A · Type LA
        </div>
        <div style={{ display: 'flex', fontSize: '28px', color: '#94a3b8', marginTop: '14px' }}>
          Static Trip III trip units · 23 renewal-part categories · Free manuals
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '56px',
            fontSize: '30px',
          }}
        >
          <div style={{ display: 'flex', fontWeight: 800 }}>24/7: 1-800-458-4001</div>
          <div style={{ display: 'flex', color: '#94a3b8', fontSize: '24px' }}>
            Voyten Electric &amp; Electronics, Inc. — voytenmanuals.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
