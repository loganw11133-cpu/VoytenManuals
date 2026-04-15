import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/tools/', '/part_manuals/', '/pdf/'],
    },
    sitemap: 'https://voytenmanuals.com/sitemap-index.xml',
  };
}
