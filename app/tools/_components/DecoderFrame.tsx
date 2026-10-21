'use client';

import { useEffect, useRef } from 'react';

/**
 * Client iframe wrapper for the static public/tools/*-decoder.html decoders.
 * Kept as a small client island so each /tools/[slug]/page.tsx can stay a
 * server component and export its own SEO metadata.
 */
export default function DecoderFrame({ src, title }: { src: string; title: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    // Height = the bottom edge of the decoder's own content. Never read
    // scrollHeight here: it is at least the iframe's current height (and
    // MDS-SBS/MW-IEC give body min-height: 100vh), so every measure fed the
    // last height back in and the frame grew 40px a tick into blank space
    // under the results.
    const resize = () => {
      const frame = iframeRef.current;
      try {
        const doc = frame?.contentDocument;
        const win = doc?.defaultView;
        if (!frame || !doc?.body || !win) return;
        let bottom = 0;
        for (const el of Array.from(doc.body.children)) {
          const rect = el.getBoundingClientRect();
          if (!rect.width && !rect.height) continue; // scripts, styles, hidden boxes
          const marginBottom = parseFloat(win.getComputedStyle(el).marginBottom) || 0;
          bottom = Math.max(bottom, rect.bottom + win.scrollY + marginBottom);
        }
        const bodyStyle = win.getComputedStyle(doc.body);
        bottom += (parseFloat(bodyStyle.paddingBottom) || 0) + (parseFloat(bodyStyle.marginBottom) || 0);
        if (bottom > 0) frame.style.height = Math.ceil(bottom) + 'px';
      } catch {
        // cross-origin safety fallback
      }
    };

    const disconnect = () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      resizeObserver = mutationObserver = null;
    };

    // Re-fit whenever the content changes size: a decode, a cleared result,
    // late webfonts, or the page width reflowing the decoder.
    const onLoad = () => {
      disconnect();
      const body = iframe.contentDocument?.body;
      if (!body) return;
      resizeObserver = new ResizeObserver(resize);
      const observeChildren = () => {
        for (const el of Array.from(body.children)) resizeObserver?.observe(el);
      };
      observeChildren();
      mutationObserver = new MutationObserver(() => {
        observeChildren();
        resize();
      });
      mutationObserver.observe(body, { childList: true });
      resize();
    };

    iframe.addEventListener('load', onLoad);
    // The frame can finish loading before hydration attaches the listener.
    if (iframe.contentDocument?.readyState === 'complete' && iframe.contentDocument.body?.children.length) onLoad();

    return () => {
      iframe.removeEventListener('load', onLoad);
      disconnect();
    };
  }, []);

  return (
    <div style={{ width: '100%', background: '#f3f4f6' }}>
      <iframe
        ref={iframeRef}
        src={src}
        style={{
          width: '100%',
          // Placeholder until the first measure; a minHeight here would
          // leave blank space under any decoder shorter than the window.
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
        title={title}
        sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
