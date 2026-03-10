'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ManualSearchBarProps {
  size?: 'default' | 'large';
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export default function ManualSearchBar({ size = 'default', placeholder, defaultValue = '', className = '' }: ManualSearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const isLarge = size === 'large';

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search
          size={isLarge ? 22 : 18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || 'Search by title, part number, manufacturer, or keyword...'}
          className={`
            w-full bg-white border border-slate-300 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent
            placeholder:text-slate-400
            ${isLarge ? 'pl-12 pr-36 py-4 text-lg' : 'pl-11 pr-28 py-3 text-sm'}
          `}
        />
        <button
          type="submit"
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            bg-[#1a3a5c] hover:bg-[#0f2840] text-white font-semibold rounded-lg transition-colors
            ${isLarge ? 'px-6 py-2.5 text-sm' : 'px-4 py-2 text-xs'}
          `}
        >
          Search Manuals
        </button>
      </div>
    </form>
  );
}
