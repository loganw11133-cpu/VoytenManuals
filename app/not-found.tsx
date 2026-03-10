import Link from 'next/link';
import { Search, BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-slate-50 min-h-[60vh] flex items-center">
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          The page you&#39;re looking for doesn&#39;t exist or may have been moved.
          Try searching our manual library instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#0f2840] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
      </div>
    </div>
  );
}
