/* Videos that have a dedicated WATCH PAGE at /videos/<slug>.

   Why: Google Search Console flagged / and /about "Video isn't on a watch page".
   On those pages the video sits beside other content, so it is supplementary and
   never eligible for video indexing. The embeds stay where they are (Logan,
   2026-11-11); each video ALSO gets a page whose only purpose is that one video,
   and the VideoObject JSON-LD lives there, not on / or /about.

   One page per video, never a combined list: Google says a page listing several
   videos of equal prominence is not a watch page either.

   Every field is taken from the video's own YouTube metadata. Leave a field out
   rather than estimate it (the facility tour's duration is not recorded here). */

export interface WatchVideo {
  slug: string;
  youtubeId: string;
  title: string;
  /** Page <title>. */
  pageTitle: string;
  description: string;
  uploadDate: string; // YYYY-MM-DD
  /** ISO 8601, e.g. PT3M25S. Omit when not known. */
  duration?: string;
  /** Human-readable duration for the byline, e.g. 3:25. */
  durationLabel?: string;
  /** Largest thumbnail YouTube actually serves for this upload. */
  thumbnailSize: 'maxresdefault' | 'sddefault';
  /** Seconds to skip a lead-in slate. */
  start?: number;
  /** The page the embed also appears on, for the back link. */
  from: { href: string; label: string };
}

export const watchVideos: WatchVideo[] = [
  {
    slug: 'voyten-electric-facility-tour',
    youtubeId: 'pf5XGcExiM0',
    title: 'Voyten Electric Capabilities — Facility Tour',
    pageTitle: 'Voyten Electric Facility Tour (Video) — Polk, PA',
    description:
      "Tour of Voyten Electric & Electronics' 200,000 sq ft facility in Polk, PA. Specializing in new, surplus, and reconditioned electrical equipment — circuit breakers, switchgear, motor controls, and more. Family owned since 1953.",
    uploadDate: '2025-02-25',
    // Not uploaded at 720p or better, so maxresdefault 404s.
    thumbnailSize: 'sddefault',
    from: { href: '/', label: 'Voyten Manuals home' },
  },
  {
    slug: 'the-people-of-voyten',
    youtubeId: 'TyLrTVjjxCo',
    title: 'The People of Voyten',
    pageTitle: 'The People of Voyten (Video) — Voyten Electric, Polk, PA',
    description:
      'Meet the team at Voyten Electric & Electronics, Inc. — a third-generation family owned electrical equipment wholesaler in Polk, Pennsylvania, started by the late John Voyten in 1953.',
    uploadDate: '2025-03-31',
    duration: 'PT3M25S',
    durationLabel: '3:25',
    thumbnailSize: 'maxresdefault',
    start: 2,
    from: { href: '/about', label: 'About Voyten Electric' },
  },
];

export const getWatchVideo = (slug: string) => watchVideos.find((v) => v.slug === slug);
