'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Renders a Voyten contact email WITHOUT ever placing the plaintext address in
 * the repo source or the server-rendered HTML — reduces address-harvesting and
 * inbound spam. The address is base64-encoded at rest and assembled in the
 * browser after hydration. Before hydration (and with JS disabled) the link
 * points at /contact so the contact funnel still works.
 *
 * Encode a new address with: Buffer.from('addr@host.com').toString('base64')
 */
export default function ObfuscatedEmail({
  encoded,
  subject,
  className,
  icon,
  label,
}: {
  /** base64 of the email address */
  encoded: string;
  /** optional mailto subject line */
  subject?: string;
  /** className applied to the rendered <a> */
  className?: string;
  /** optional node rendered inside the link before the text (e.g. an icon) */
  icon?: ReactNode;
  /** visible content; if omitted, the decoded address is shown as the text */
  label?: ReactNode;
}) {
  const [addr, setAddr] = useState('');

  useEffect(() => {
    try {
      setAddr(atob(encoded));
    } catch {
      /* leave empty — fall back to the contact page */
    }
  }, [encoded]);

  const href = addr
    ? `mailto:${addr}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
    : '/contact';

  return (
    <a href={href} className={className}>
      {icon}
      {label ?? <span>{addr || 'Email us'}</span>}
    </a>
  );
}
