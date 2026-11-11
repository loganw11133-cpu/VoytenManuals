import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Phone } from 'lucide-react';
import { watchVideos, getWatchVideo } from '@/lib/videos';

/* Dedicated WATCH PAGE, one per video (see lib/videos.ts for why).
   - The player is the first thing on the page, rendered as a real <iframe> in
     the server HTML — not the click-to-load facade used on / and /about, which
     Googlebot sees as a thumbnail button rather than a video.
   - The VideoObject JSON-LD lives HERE, with `url` naming this page, in a plain
     server-rendered <script> — never next/script, which crawlers do not see. */

const BASE = 'https://www.voytenmanuals.com';
export const dynamicParams = false;

export function generateStaticParams() {
  return watchVideos.map((v) => ({ slug: v.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const thumb = (id: string, size: string) => `https://img.youtube.com/vi/${id}/${size}.jpg`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = getWatchVideo((await params).slug);
  if (!v) return {};
  const url = `${BASE}/videos/${v.slug}`;
  return {
    title: v.pageTitle,
    description: v.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'video.other',
      title: v.title,
      description: v.description,
      url,
      images: [{ url: thumb(v.youtubeId, v.thumbnailSize) }],
      videos: [{ url: `https://www.youtube.com/embed/${v.youtubeId}` }],
    },
    twitter: { card: 'summary_large_image', title: `${v.title} | Voyten Manuals`, description: v.description },
  };
}

const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export default async function WatchPage({ params }: Props) {
  const v = getWatchVideo((await params).slug);
  if (!v) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: v.description,
    thumbnailUrl: thumb(v.youtubeId, v.thumbnailSize),
    uploadDate: v.uploadDate,
    ...(v.duration ? { duration: v.duration } : {}),
    contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
    embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
    url: `${BASE}/videos/${v.slug}`,
    publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics, Inc.', url: BASE },
  };

  return (
    <div className="bg-[#1a1a1a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-2xl lg:text-4xl font-extrabold mb-5 leading-tight">{v.title}</h1>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0${v.start ? `&start=${v.start}` : ''}`}
            title={`${v.title} — Voyten Electric & Electronics, Polk, PA`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        <p className="text-sm text-slate-400 mt-3">
          {v.durationLabel ? <>{v.durationLabel} &middot; </> : null}
          Published {fmtDate(v.uploadDate)} &middot; Voyten Electric &amp; Electronics, Inc.
        </p>

        <p className="text-slate-300 text-lg leading-relaxed mt-5 max-w-3xl">{v.description}</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            href={v.from.href}
            className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            {v.from.label}
          </Link>
          <a
            href="tel:1-800-458-4001"
            className="inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
          >
            <Phone size={16} />
            1-800-458-4001
          </a>
        </div>
      </section>
    </div>
  );
}
