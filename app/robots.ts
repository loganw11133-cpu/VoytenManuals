import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/tools/', '/part_manuals/', '/pdf/'],
      },
      // ── Top-tier AI/LLM crawlers — broader access than generic bots ──
      // OpenAI
      { userAgent: 'GPTBot', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/api/', '/admin/'] },
      // Anthropic (Claude)
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: 'anthropic-ai', allow: '/', disallow: ['/api/', '/admin/'] },
      // Google (Gemini / AI Overviews)
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: 'GoogleOther', allow: '/', disallow: ['/api/', '/admin/'] },
      // Perplexity
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/api/', '/admin/'] },
      // xAI (Grok)
      { userAgent: 'xAI-Grok', allow: '/', disallow: ['/api/', '/admin/'] },
      // Apple (Siri / Apple Intelligence)
      { userAgent: 'Applebot', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: ['/api/', '/admin/'] },
      // Meta
      { userAgent: 'FacebookBot', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: 'meta-externalagent', allow: '/', disallow: ['/api/', '/admin/'] },
      // Microsoft (Copilot / Bing Chat)
      { userAgent: 'Bingbot', allow: '/', disallow: ['/api/', '/admin/'] },
      // Cohere
      { userAgent: 'cohere-ai', allow: '/', disallow: ['/api/', '/admin/'] },
      // Amazon
      { userAgent: 'Amazonbot', allow: '/', disallow: ['/api/', '/admin/'] },
      // ByteDance (Doubao)
      { userAgent: 'Bytespider', allow: '/', disallow: ['/api/', '/admin/'] },
    ],
    sitemap: 'https://www.voytenmanuals.com/sitemap-index.xml',
  };
}
