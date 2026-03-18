import { MetadataRoute } from 'next';
import { searchManuals, getCategories, getManufacturers } from '@/lib/manuals-db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://voytenmanuals.com';

  // Static pages
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
  ];

  // Category, manufacturer, and combo landing pages for SEO
  let categoryPages: MetadataRoute.Sitemap = [];
  let manufacturerPages: MetadataRoute.Sitemap = [];
  let comboPages: MetadataRoute.Sitemap = [];

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
      url: `${baseUrl}/search?manufacturer=${encodeURIComponent(mfr.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Category + manufacturer combo pages (high-value long-tail)
    for (const cat of categories) {
      const mfrsForCat = await getManufacturers(cat.name);
      for (const mfr of mfrsForCat) {
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

  // All individual manual pages — paginate through entire DB
  let manualPages: MetadataRoute.Sitemap = [];
  try {
    const batchSize = 1000;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const results = await searchManuals({ limit: batchSize, page });
      manualPages.push(
        ...results.manuals.map(manual => ({
          url: `${baseUrl}/manual/${manual.slug}`,
          lastModified: new Date(manual.updated_at || manual.created_at),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      );
      hasMore = page < results.totalPages;
      page++;
    }
  } catch {
    // DB not available during build — that's fine
  }

  return [...staticPages, ...categoryPages, ...manufacturerPages, ...comboPages, ...manualPages];
}
