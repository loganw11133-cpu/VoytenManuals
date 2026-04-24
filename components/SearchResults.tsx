'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter, ChevronLeft, ChevronRight, BookOpen, FileText, Download, Building2, Tag, Loader2 } from 'lucide-react';
import LeadCaptureForm from '@/components/LeadCaptureForm';

interface Manual {
  id: number;
  slug: string;
  title: string;
  manual_number: string | null;
  category: string;
  manufacturer: string;
  subcategory: string | null;
  pdf_url: string;
  file_size_bytes: number | null;
  page_count: number | null;
}

interface SearchResultData {
  manuals: Manual[];
  total: number;
  page: number;
  totalPages: number;
}

interface FilterData {
  categories: { name: string; count: number }[];
  manufacturers: { name: string; count: number }[];
  subcategories: string[];
}

interface SearchResultsProps {
  initialResults: SearchResultData;
  initialFilters: FilterData;
  initialQuery: string;
  initialCategory: string;
  initialManufacturer: string;
  initialSubcategory: string;
  initialPage: number;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SearchResults({
  initialResults,
  initialFilters,
  initialQuery,
  initialCategory,
  initialManufacturer,
  initialSubcategory,
  initialPage,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [results, setResults] = useState<SearchResultData>(initialResults);
  const [filters, setFilters] = useState<FilterData>(initialFilters);
  const [loading, setLoading] = useState(false);

  // Sync state when server re-renders with new props (e.g. search form submit)
  const serverKey = `${initialQuery}|${initialCategory}|${initialManufacturer}|${initialSubcategory}|${initialPage}`;
  const [lastServerKey, setLastServerKey] = useState(serverKey);
  if (serverKey !== lastServerKey) {
    setResults(initialResults);
    setFilters(initialFilters);
    setLastServerKey(serverKey);
  }

  // Current filter state from URL
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const manufacturer = searchParams.get('manufacturer') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Fetch results from API
  const fetchResults = useCallback(async (params: URLSearchParams) => {
    setLoading(true);
    try {
      const [resultsRes, filtersRes] = await Promise.all([
        fetch(`/api/manuals?${params.toString()}`),
        fetch(`/api/manuals?filters=true&category=${params.get('category') || ''}`),
      ]);
      const [resultsData, filtersData] = await Promise.all([
        resultsRes.json(),
        filtersRes.json(),
      ]);
      setResults(resultsData);
      setFilters(filtersData);
    } catch {
      // Fall back to current state on error
    } finally {
      setLoading(false);
    }
  }, []);

  // When URL params change from client-side navigation, fetch new data
  useEffect(() => {
    // Skip if URL matches what the server already rendered
    const currentKey = `${query}|${category}|${manufacturer}|${subcategory}|${page}`;
    if (currentKey === lastServerKey) return;

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (manufacturer) params.set('manufacturer', manufacturer);
    if (subcategory) params.set('subcategory', subcategory);
    if (page > 1) params.set('page', String(page));
    params.set('limit', '24');

    fetchResults(params);
  }, [query, category, manufacturer, subcategory, page, fetchResults, lastServerKey]);

  // Navigate without full page reload — just update URL, useEffect handles fetch
  function navigate(overrides: Record<string, string | number | undefined>) {
    const p = new URLSearchParams();
    const merged = { q: query, category, manufacturer, subcategory, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== '' && String(v) !== '1') p.set(k, String(v));
    }
    startTransition(() => {
      router.push(`/search?${p.toString()}`, { scroll: false });
    });
  }

  const hasFilters = query || category || manufacturer || subcategory;
  const isLoading = loading || isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Filter size={16} />
              Filters
            </h2>

            {hasFilters && (
              <button
                onClick={() => navigate({ q: '', category: '', manufacturer: '', subcategory: '', page: 1 })}
                className="text-sm text-[#1a1a1a] hover:underline mb-4 block"
              >
                Clear all filters
              </button>
            )}

            {/* Categories */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Category</h3>
              <div className="space-y-1.5">
                {filters.categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate({ category: category === cat.name ? '' : cat.name, subcategory: '', manufacturer: '', page: 1 })}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      category === cat.name
                        ? 'bg-[#1a1a1a] text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name} <span className="text-xs opacity-60">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manufacturers */}
            {filters.manufacturers.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Manufacturer</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {filters.manufacturers.map((mfr) => (
                    <button
                      key={mfr.name}
                      onClick={() => navigate({ manufacturer: manufacturer === mfr.name ? '' : mfr.name, subcategory: '', page: 1 })}
                      className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        manufacturer === mfr.name
                          ? 'bg-[#1a1a1a] text-white font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mfr.name} <span className="text-xs opacity-60">({mfr.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategories */}
            {filters.subcategories.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Subcategory</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {filters.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => navigate({ subcategory: subcategory === sub ? '' : sub, page: 1 })}
                      className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        subcategory === sub
                          ? 'bg-[#1a1a1a] text-white font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lead capture - sidebar */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Can&#39;t find what you need?</p>
              <Link
                href="/contact?type=manual-request"
                className="block text-center text-sm bg-[#dc2626] hover:bg-[#b91c1c] text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Request a Manual
              </Link>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Subcategory pills */}
          {category && filters.subcategories.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Browse {category} by Type</h3>
              <div className="flex flex-wrap gap-2">
                {filters.subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => navigate({ subcategory: subcategory === sub ? '' : sub, page: 1 })}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      subcategory === sub
                        ? 'bg-[#1a1a1a] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-[#1a1a1a] hover:text-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              {results.total > 0 ? (
                <>
                  {isLoading && <Loader2 size={14} className="inline animate-spin mr-1" />}
                  Showing {((page - 1) * 24) + 1}–{Math.min(page * 24, results.total)} of{' '}
                  <span className="font-semibold">{results.total}</span> manuals
                  {query && <> matching &quot;<span className="font-medium">{query}</span>&quot;</>}
                </>
              ) : (
                isLoading ? 'Loading...' : 'No manuals found'
              )}
            </p>
          </div>

          {/* Results Grid */}
          <div className={`transition-opacity duration-150 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
            {results.manuals.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {results.manuals.map((manual) => (
                  <Link
                    key={manual.id}
                    href={`/manual/${manual.slug}`}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#1a1a1a]/30 hover:shadow-lg transition-all"
                  >
                    <div className="bg-slate-50 group-hover:bg-[#1a1a1a]/5 transition-colors px-5 py-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1a1a1a]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a1a1a] transition-colors">
                        <FileText className="w-6 h-6 text-[#1a1a1a] group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug">
                          {manual.title}
                        </h3>
                        {manual.manual_number && (
                          <p className="text-xs text-slate-400 mt-1 font-mono">#{manual.manual_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="px-5 py-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500 min-w-0">
                          <span className="flex items-center gap-1 truncate">
                            <Building2 size={12} />
                            {manual.manufacturer}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <Tag size={12} />
                            {manual.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#1a1a1a] font-medium flex-shrink-0">
                          <Download size={12} />
                          {manual.page_count ? `${manual.page_count}p` : 'PDF'}
                          {manual.file_size_bytes ? ` · ${formatFileSize(manual.file_size_bytes)}` : ''}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 text-lg mb-2">No manuals found</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  We couldn&#39;t find any manuals matching your search. Try adjusting your filters or let us know what you need.
                </p>
                <div className="max-w-md mx-auto">
                  <LeadCaptureForm type="manual-request" compact />
                </div>
              </div>
            ) : null}
          </div>

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <button
                  onClick={() => navigate({ page: page - 1 })}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {results.totalPages}
              </span>
              {page < results.totalPages && (
                <button
                  onClick={() => navigate({ page: page + 1 })}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
