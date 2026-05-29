import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/tools/', '/part_manuals/', '/pdf/'],
      },
      // Explicitly allow AI crawlers full access to public content
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Anthropic-AI', 'PerplexityBot', 'Google-Extended', 'Applebot', 'Bytespider', 'cohere-ai'],
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://www.voytenmanuals.com/sitemap-index.xml',
  };
}
