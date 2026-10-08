import { MetadataRoute } from 'next';

// AI/LLM crawlers given broader access than generic bots (GEO strategy).
// They may crawl everything EXCEPT api/admin and the internal SPB decoder.
const AI_CRAWLERS = [
  // OpenAI
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  // Anthropic (Claude) — Claude-User / Claude-SearchBot fetch pages live while
  // answering a user, which is where "where do I buy a ..." questions get answered.
  'ClaudeBot', 'anthropic-ai', 'Claude-User', 'Claude-SearchBot',
  // Google (Gemini / AI Overviews)
  'Google-Extended', 'GoogleOther',
  // Perplexity (Perplexity-User = live fetch for a user's question)
  'PerplexityBot', 'Perplexity-User',
  // DuckDuckGo AI answers, Mistral Le Chat
  'DuckAssistBot', 'MistralAI-User',
  // xAI (Grok)
  'xAI-Grok',
  // Apple (Siri / Apple Intelligence)
  'Applebot', 'Applebot-Extended',
  // Meta
  'FacebookBot', 'meta-externalagent',
  // Microsoft (Copilot / Bing Chat)
  'Bingbot',
  // Cohere
  'cohere-ai',
  // Amazon
  'Amazonbot',
  // ByteDance (Doubao)
  'Bytespider',
];

// The Eaton SPB decoder is internal-only — block it for every crawler.
const SPB_DECODER = '/tools/spb';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', SPB_DECODER, '/part_manuals/', '/pdf/'],
      },
      // ── Top-tier AI/LLM crawlers — broader access, but never the SPB decoder ──
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', '/admin/', SPB_DECODER],
      })),
    ],
    sitemap: 'https://www.voytenmanuals.com/sitemap-index.xml',
  };
}
