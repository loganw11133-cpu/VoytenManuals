'use client';

import { useEffect, useRef } from 'react';

export default function MwIecDecoderPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const resize = () => {
      const frame = iframeRef.current;
      if (!frame) return;
      try {
        const body = frame.contentDocument?.body;
        const html = frame.contentDocument?.documentElement;
        if (body && html) {
          const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          frame.style.height = height + 40 + 'px';
        }
      } catch {
        // cross-origin safety fallback
      }
    };

    const clearTimers = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    const onLoad = () => {
      resize();
      clearTimers();
      interval = setInterval(resize, 500);
      timeout = setTimeout(clearTimers, 30000);
    };

    iframe.addEventListener('load', onLoad);

    return () => {
      iframe.removeEventListener('load', onLoad);
      clearTimers();
    };
  }, []);

  return (
    <div style={{ width: '100%', background: '#f3f4f6' }}>
      <iframe
        ref={iframeRef}
        src="/tools/mw-iec-decoder.html"
        style={{
          width: '100%',
          minHeight: '100vh',
          border: 'none',
          display: 'block',
        }}
        title="Eaton Magnum IEC (MW) Circuit Breaker Decoder"
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
    </div>
  );
}
