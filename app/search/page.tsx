import { Suspense } from 'react';
import ManualSearchBar from '@/components/ManualSearchBar';
import ManualCard from '@/components/ManualCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import { searchManuals, getCategories, getManufacturers, getSubcategories } from '@/lib/manuals-db';
import Link from 'next/link';
import { Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const manufacturer = params.manufacturer || '';

  const parts: string[] = [];
  if (query) parts.push(`"${query}"`);
  if (manufacturer) parts.push(manufacturer);
  if (category) parts.push(category);

  const titleSuffix = parts.length > 0 ? parts.join(' — ') + ' Manuals' : 'Search Electrical Equipment Manuals';
  const descParts = parts.length > 0
    ? `Search results for ${parts.join(', ')} in our`
    : 'Search our';

  return {
    title: titleSuffix,
    description: `${descParts} library of 4,800+ free electrical equipment manuals. Download PDF instruction guides, renewal parts catalogs, and technical documentation. Powered by Voyten Electric.`,
    robots: { index: !query, follow: true },
  };
}

export const revalidate = 60;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    manufacturer?: string;
    subcategory?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const manufacturer = params.manufacturer || '';
  const subcategory = params.subcategory || '';
  const page = parseInt(params.page || '1');

  const [results, categories, manufacturers, subcategories] = await Promise.all([
    searchManuals({ query, category, manufacturer, subcategory, page, limit: 24 }),
    getCategories(),
    getManufacturers(category || undefined),
    getSubcategories(category || undefined, manufacturer || undefined),
  ]);

  const hasFilters = query || category || manufacturer || subcategory;

  // Build pagination URLs
  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const p = new URLSearchParams();
    const merged = { q: query, category, manufacturer, subcategory, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== '' && v !== '1') p.set(k, String(v));
    }
    return `/search?${p.toString()}`;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Search Manuals</h1>
          <Suspense fallback={null}>
            <ManualSearchBar defaultValue={query} />
          </Suspense>
        </div>
      </div>

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
                <Link href="/search" className="text-sm text-[#1a3a5c] hover:underline mb-4 block">
                  Clear all filters
                </Link>
              )}

              {/* Categories */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Category</h3>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={buildUrl({ category: category === cat.name ? '' : cat.name, subcategory: '', manufacturer: '', page: 1 })}
                      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        category === cat.name
                          ? 'bg-[#1a3a5c] text-white font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.name} <span className="text-xs opacity-60">({cat.count})</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Manufacturers */}
              {manufacturers.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Manufacturer</h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {manufacturers.map((mfr) => (
                      <Link
                        key={mfr.name}
                        href={buildUrl({ manufacturer: manufacturer === mfr.name ? '' : mfr.name, subcategory: '', page: 1 })}
                        className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                          manufacturer === mfr.name
                            ? 'bg-[#1a3a5c] text-white font-medium'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {mfr.name} <span className="text-xs opacity-60">({mfr.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Subcategory</h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={buildUrl({ subcategory: subcategory === sub ? '' : sub, page: 1 })}
                        className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                          subcategory === sub
                            ? 'bg-[#1a3a5c] text-white font-medium'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead capture - sidebar */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Can&#39;t find what you need?</p>
                <Link
                  href="/contact?type=manual-request"
                  className="block text-center text-sm bg-[#c8962e] hover:bg-[#b8862a] text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Request a Manual
                </Link>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                {results.total > 0 ? (
                  <>
                    Showing {((page - 1) * 24) + 1}–{Math.min(page * 24, results.total)} of{' '}
                    <span className="font-semibold">{results.total}</span> manuals
                    {query && <> matching &#34;<span className="font-medium">{query}</span>&#34;</>}
                  </>
                ) : (
                  'No manuals found'
                )}
              </p>
            </div>

            {/* Results Grid */}
            {results.manuals.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {results.manuals.map((manual) => (
                  <ManualCard key={manual.id} manual={manual} />
                ))}
              </div>
            ) : (
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
            )}

            {/* Pagination */}
            {results.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildUrl({ page: page - 1 })}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {page} of {results.totalPages}
                </span>
                {page < results.totalPages && (
                  <Link
                    href={buildUrl({ page: page + 1 })}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
