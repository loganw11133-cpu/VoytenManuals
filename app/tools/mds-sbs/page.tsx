'use client';

import { useEffect, useRef } from 'react';

export default function MdsSbsDecoderPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const resize = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      try {
        const body = iframe.contentDocument?.body;
        const html = iframe.contentDocument?.documentElement;
        if (body && html) {
          const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          iframe.style.height = height + 40 + 'px';
        }
      } catch {
        // cross-origin safety fallback
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', () => {
        resize();
        // Re-measure after interactions may change content height
        const interval = setInterval(resize, 500);
        setTimeout(() => clearInterval(interval), 30000);
      });
    }
  }, []);

  return (
    <div style={{ width: '100%', background: '#f3f4f6' }}>
      <iframe
        ref={iframeRef}
        src="/tools/mds-sbs-decoder.html"
        style={{
          width: '100%',
          minHeight: '100vh',
          border: 'none',
          display: 'block',
        }}
        title="Eaton MDS/SBS Circuit Breaker Decoder"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
