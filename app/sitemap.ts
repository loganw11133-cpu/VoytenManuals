import { MetadataRoute } from 'next';
import { searchManuals, getCategories, getManufacturers, toSlug } from '@/lib/manuals-db';

const baseUrl = 'https://www.voytenmanuals.com';
const MANUALS_PER_SITEMAP = 1000;

/**
 * Generate sitemap index — Next.js calls this to determine how many sitemaps exist.
 * Returns [{id: 0}, {id: 1}, ...] where id 0 = static/filter pages,
 * and ids 1+ = batches of manual pages.
 */
export async function generateSitemaps() {
  let totalManuals = 0;
  try {
    const result = await searchManuals({ limit: 1, page: 1 });
    totalManuals = result.total;
  } catch {
    // DB not available during build
  }

  const manualSitemapCount = Math.max(1, Math.ceil(totalManuals / MANUALS_PER_SITEMAP));

  // id 0 = static + filter pages, ids 1..N = manual page batches
  const sitemaps = [];
  for (let i = 0; i <= manualSitemapCount; i++) {
    sitemaps.push({ id: i });
  }
  return sitemaps;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  // Sitemap 0: static pages + category/manufacturer/combo filter pages
  if (id === 0) {
    return generateStaticAndFilterSitemap();
  }

  // Sitemaps 1+: batches of individual manual pages
  return generateManualBatchSitemap(id);
}

async function generateStaticAndFilterSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/manufacturers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/products/rl-breakers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/spb-breakers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources/spb-breakers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let manufacturerPages: MetadataRoute.Sitemap = [];
  const comboPages: MetadataRoute.Sitemap = [];

  try {
    const [categories, manufacturers] = await Promise.all([
      getCategories(),
      getManufacturers(),
    ]);

    categoryPages = categories.map(cat => ({
      url: `${baseUrl}/search?category=${encodeURIComponent(cat.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));

    manufacturerPages = manufacturers.map(mfr => ({
      url: `${baseUrl}/manufacturers/${toSlug(mfr.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Category + manufacturer combo pages (high-value long-tail)
    // Run all category manufacturer queries in parallel to avoid serial N+1
    const mfrsByCat = await Promise.all(
      categories.map(cat => getManufacturers(cat.name).then(mfrs => ({ cat, mfrs })))
    );
    for (const { cat, mfrs } of mfrsByCat) {
      for (const mfr of mfrs) {
        comboPages.push({
          url: `${baseUrl}/search?category=${encodeURIComponent(cat.name)}&manufacturer=${encodeURIComponent(mfr.name)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.65,
        });
      }
    }
  } catch {
    // DB not available during build
  }

  return [...staticPages, ...categoryPages, ...manufacturerPages, ...comboPages];
}

async function generateManualBatchSitemap(id: number): Promise<MetadataRoute.Sitemap> {
  try {
    const result = await searchManuals({
      limit: MANUALS_PER_SITEMAP,
      page: id, // id 1 = page 1, id 2 = page 2, etc.
    });

    return result.manuals.map(manual => {
      const d = new Date(manual.updated_at || manual.created_at);
      return {
        url: `${baseUrl}/manual/${manual.slug}`,
        lastModified: isNaN(d.getTime()) ? new Date() : d,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    });
  } catch {
    return [];
  }
}
