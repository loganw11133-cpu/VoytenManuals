import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/tools/'],
    },
    sitemap: 'https://voytenmanuals.com/sitemap.xml',
  };
}
