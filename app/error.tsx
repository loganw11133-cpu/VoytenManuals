'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Search, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="bg-slate-50 min-h-[60vh] flex items-center">
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-16 h-16 text-[#dc2626] mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Something Went Wrong</h1>
        <p className="text-slate-500 mb-8">
          We ran into an unexpected error loading this page.
          Try refreshing, or use the links below to continue browsing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#111111] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-white transition-colors"
          >
            <Search size={18} />
            Search Manuals
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-white transition-colors"
          >
            <ArrowLeft size={18} />
            Go Home
          </Link>
        </div>
        <p className="text-slate-400 text-xs mt-8">
          If this keeps happening, call us at 1-800-458-4001 or email info@voytenelectric.com
        </p>
      </div>
    </div>
  );
}
