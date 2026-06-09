'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; text: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Sticky "On this page" table-of-contents rail for the long-form resource guides.
 * Scans the rendered <h2> headings inside #resource-content, assigns ids, and
 * renders anchor links with scrollspy highlighting. Headings inside a
 * [data-no-toc] subtree are skipped. Client island so the page stays a server
 * component.
 */
export default function Toc() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const root = document.getElementById('resource-content');
    if (!root) return;

    let observer: IntersectionObserver | undefined;

    // Defer the DOM scan one frame so we don't call setState synchronously
    // inside the effect body (avoids react-hooks/set-state-in-effect).
    const raf = requestAnimationFrame(() => {
      const headings = (Array.from(root.querySelectorAll('h2')) as HTMLHeadingElement[]).filter(
        h => !h.closest('[data-no-toc]')
      );
      const next: Item[] = headings.map(h => {
        const text = (h.textContent || '').trim();
        if (!h.id) h.id = slugify(text);
        h.classList.add('scroll-mt-24');
        return { id: h.id, text };
      });
      setItems(next);

      observer = new IntersectionObserver(
        entries => {
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActive((visible[0].target as HTMLElement).id);
        },
        { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
      );
      headings.forEach(h => observer!.observe(h));
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <nav>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">On this page</p>
      <ul className="space-y-1 border-l border-slate-200">
        {items.map(it => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={
                'block border-l-2 -ml-px pl-3 py-1 text-sm transition-colors ' +
                (active === it.id
                  ? 'border-[#dc2626] text-[#dc2626] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300')
              }
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-xl bg-[#dc2626] p-4 text-white shadow-sm">
        <p className="text-sm font-bold mb-1">Need parts fast?</p>
        <p className="text-xs text-white/80 mb-3">24/7 emergency sourcing</p>
        <a
          href="tel:1-800-458-4001"
          className="block text-center bg-white text-[#1a1a1a] rounded-lg px-3 py-2 text-sm font-bold hover:bg-slate-100 transition-colors"
        >
          1-800-458-4001
        </a>
      </div>
    </nav>
  );
}
