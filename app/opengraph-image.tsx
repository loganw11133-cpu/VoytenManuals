import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Voyten Manuals - Free Electrical Equipment Manual Library';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 50%, #991b1b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#dc2626',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            VM
          </div>
          <div style={{ display: 'flex', fontSize: '48px', fontWeight: 800, color: 'white' }}>
            Voyten
            <span style={{ color: '#dc2626' }}>Manuals</span>
          </div>
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#e2e8f0',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Free Searchable Library of Electrical Equipment Manuals & Technical Documentation
        </div>
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            gap: '24px',
            fontSize: '18px',
            color: '#94a3b8',
          }}
        >
          <span>Circuit Breakers</span>
          <span style={{ color: '#dc2626' }}>•</span>
          <span>Relays</span>
          <span style={{ color: '#dc2626' }}>•</span>
          <span>Motor Controls</span>
          <span style={{ color: '#dc2626' }}>•</span>
          <span>Switches</span>
          <span style={{ color: '#dc2626' }}>•</span>
          <span>Transformers</span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '16px',
            color: '#64748b',
          }}
        >
          Powered by Voyten Electric & Electronics, Inc. — Since 1953
        </div>
      </div>
    ),
    { ...size }
  );
}
