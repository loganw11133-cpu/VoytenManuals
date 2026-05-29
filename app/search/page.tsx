import { Suspense } from 'react';
import ManualSearchBar from '@/components/ManualSearchBar';
import SearchResults from '@/components/SearchResults';
import { searchManuals, getCategories, getManufacturers, getSubcategories } from '@/lib/manuals-db';
import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const manufacturer = params.manufacturer || '';
  const subcategory = params.subcategory || '';

  const parts: string[] = [];
  if (query) parts.push(`"${query}"`);
  if (manufacturer) parts.push(manufacturer);
  if (category) parts.push(category);

  const titleSuffix = parts.length > 0 ? parts.join(' — ') + ' Manuals' : 'Search Electrical Equipment Manuals';
  const descParts = parts.length > 0
    ? `Search results for ${parts.join(', ')} in our`
    : 'Search our';

  const canonicalParams = new URLSearchParams();
  if (category) canonicalParams.set('category', category);
  if (manufacturer) canonicalParams.set('manufacturer', manufacturer);
  if (subcategory) canonicalParams.set('subcategory', subcategory);
  const canonicalUrl = canonicalParams.toString()
    ? `https://www.voytenmanuals.com/search?${canonicalParams.toString()}`
    : 'https://www.voytenmanuals.com/search';

  const desc = `${descParts} library of 8,400+ free electrical equipment manuals. Download PDF guides, parts catalogs, and technical docs.`;

  return {
    title: titleSuffix,
    description: desc,
    robots: { index: !query, follow: true },
    openGraph: {
      title: titleSuffix,
      description: desc,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleSuffix,
      description: desc,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export const revalidate = 3600;

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

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Search Manuals</h1>
          <Suspense fallback={
            <div className="relative">
              <div className="w-full h-12 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          }>
            <ManualSearchBar defaultValue={query} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="grid sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl" />)}
            </div>
          </div>
        </div>
      }>
        <SearchResults
          initialResults={results}
          initialFilters={{ categories, manufacturers, subcategories }}
          initialQuery={query}
          initialCategory={category}
          initialManufacturer={manufacturer}
          initialSubcategory={subcategory}
          initialPage={page}
        />
      </Suspense>
    </div>
  );
}
