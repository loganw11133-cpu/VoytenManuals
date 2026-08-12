'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

/* YouTube only generates maxresdefault.jpg when the source upload was at least
   720p. For anything smaller that URL 404s and the poster frame renders blank —
   which is exactly what happened to the facility tour on the homepage.

   Ordered largest first. sddefault and hqdefault are 4:3 with letterbox bars,
   but object-cover in the 16:9 frame crops those away, so they still look right. */
const THUMB_SIZES = ['maxresdefault', 'sddefault', 'hqdefault'] as const;
type ThumbSize = (typeof THUMB_SIZES)[number];

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  /** Caption shown over the thumbnail. Defaults to the homepage facility-tour wording. */
  label?: string;
  /** Seconds to start playback at, for videos with a slate or lead-in. */
  start?: number;
  /**
   * Largest thumbnail YouTube actually holds for this video. Set it explicitly
   * when you know maxresdefault is missing — that renders correctly on the
   * first paint instead of relying on a failed request to trigger the fallback
   * below, which is easy to miss around hydration.
   */
  thumbnailSize?: ThumbSize;
}

export default function YouTubeEmbed({
  videoId,
  title,
  label = 'Watch: Tour Our Facility',
  start,
  thumbnailSize = 'maxresdefault',
}: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(() => Math.max(0, THUMB_SIZES.indexOf(thumbnailSize)));
  const imgRef = useRef<HTMLImageElement>(null);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${THUMB_SIZES[sizeIndex]}.jpg`;
  const stepDown = () => setSizeIndex((i) => (i < THUMB_SIZES.length - 1 ? i + 1 : i));

  /* Safety net for any video whose thumbnailSize was not set. The browser can
     finish (and fail) the request before React attaches the onError handler, in
     which case the event is never delivered — so also check on mount for an
     image that has already completed with no intrinsic width. */
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.complete || el.naturalWidth !== 0) return;
    // Deferred rather than called inline: this is recovering from an event that
    // already happened, not synchronising state during render.
    const id = window.setTimeout(stepDown, 0);
    return () => window.clearTimeout(id);
  }, [sizeIndex]);

  if (playing) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${start ? `&start=${start}` : ''}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
      aria-label={`Play video: ${title}`}
    >
      {/* Thumbnail */}
      <Image
        ref={imgRef}
        key={thumbnailUrl}
        src={thumbnailUrl}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        onError={stepDown}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-[#dc2626] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Play size={36} className="text-white ml-1" fill="white" />
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <p className="text-white font-semibold text-sm sm:text-base drop-shadow-lg">
          {label}
        </p>
      </div>
    </button>
  );
}
