import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL('https://voytenmanuals.com'),
  title: {
    default: "Voyten Manuals | Free Electrical Equipment Manual Library — PDF Downloads",
    template: "%s | Voyten Manuals"
  },
  description: "Free searchable library of 4,800+ electrical equipment manuals including EOL and legacy equipment documentation. Download PDF instruction guides, renewal parts catalogs, wiring diagrams, and technical documentation for circuit breakers, relays, motor controls, switches, transformers, and more. Westinghouse, GE, Siemens, Square D, Cutler-Hammer, ITE, ABB — including discontinued and end-of-life models. Powered by Voyten Electric — serving the industry since 1953.",
  keywords: [
    "electrical manuals",
    "circuit breaker manuals",
    "electrical part manuals",
    "electrical equipment documentation",
    "renewal parts catalog",
    "instruction manual PDF",
    "Westinghouse manuals",
    "Westinghouse circuit breaker manual",
    "Square D manuals",
    "Square D Masterpact manual",
    "General Electric manuals",
    "GE breaker manual",
    "Cutler-Hammer manuals",
    "Cutler-Hammer Digitrip manual",
    "Siemens manuals",
    "Siemens breaker manual",
    "ITE manuals",
    "ABB manuals",
    "Allis-Chalmers manuals",
    "breaker manual PDF",
    "free electrical manuals",
    "download electrical manuals",
    "electrical technical documentation",
    "relay manuals",
    "overcurrent relay manual",
    "protective relay manual",
    "motor control manuals",
    "motor control center manual",
    "MCC manual",
    "transformer manuals",
    "bus duct manuals",
    "switchgear manual",
    "trip unit manual",
    "Digitrip manual",
    "Micrologic manual",
    "retrofit kit instructions",
    "renewal parts list",
    "characteristic curves",
    "wiring diagram",
    "DS breaker manual",
    "AKR breaker manual",
    "Magnum DS manual",
    "power circuit breaker manual",
    "low voltage breaker manual",
    "medium voltage breaker manual",
    "EOL electrical equipment",
    "end of life breaker support",
    "EOL circuit breaker replacement",
    "legacy electrical equipment manuals",
    "legacy breaker documentation",
    "obsolete breaker manual",
    "discontinued circuit breaker parts",
    "obsolete electrical equipment support",
    "legacy switchgear documentation",
    "EOL motor control replacement",
    "end of life relay support",
    "legacy Westinghouse breaker",
    "obsolete GE breaker parts",
    "discontinued Square D parts",
    "EOL Cutler-Hammer replacement",
    "legacy Siemens breaker support",
    "Voyten Electric",
    "Voyten Manuals",
    "electrical equipment wholesaler",
    "remanufactured electrical equipment",
  ],
  authors: [{ name: "Voyten Electric & Electronics, Inc." }],
  creator: "Voyten Electric & Electronics, Inc.",
  publisher: "Voyten Electric & Electronics, Inc.",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://voytenmanuals.com",
    siteName: "Voyten Manuals",
    title: "Voyten Manuals | Free Electrical Equipment Manual Library — 4,800+ PDFs",
    description: "Free searchable library of electrical equipment manuals — instruction guides, renewal parts catalogs, characteristic curves, and technical documentation for current, EOL, and legacy equipment. Download PDFs for circuit breakers, relays, motor controls, switches, transformers from Westinghouse, GE, Siemens, Square D, and more. Parts available for discontinued models.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Voyten Manuals - Free Electrical Equipment Manual Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voyten Manuals | 4,800+ Free Electrical Equipment Manuals",
    description: "Free searchable library of electrical equipment manuals and technical documentation. Download PDFs instantly — no login required. Powered by Voyten Electric.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://voytenmanuals.com",
  },
  other: {
    'google-site-verification': '',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Voyten Electric & Electronics, Inc.",
  "alternateName": ["Voyten Electric", "Voyten Manuals"],
  "url": "https://voytenmanuals.com",
  "logo": "https://voytenmanuals.com/images/voyten-logo.png",
  "description": "Free searchable library of 4,800+ electrical equipment manuals and technical documentation. Backed by Voyten Electric & Electronics, Inc. — a third-generation family owned electrical equipment wholesaler since 1953.",
  "telephone": "+1-800-458-4001",
  "email": "info@voytenelectric.com",
  "foundingDate": "1953",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 45
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "173 Voyten Blvd",
    "addressLocality": "Polk",
    "addressRegion": "PA",
    "postalCode": "16342",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.3695,
    "longitude": -79.9306
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "sameAs": [
    "https://voytenelectric.com",
    "https://www.voyten.com"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Electrical Equipment Manuals",
    "itemListElement": [
      { "@type": "OfferCatalog", "name": "Circuit Breaker Manuals", "description": "Air breakers, insulated case, molded case, trip units, retrofit kits" },
      { "@type": "OfferCatalog", "name": "Relay & Meter Manuals", "description": "Overcurrent relays, protective relays, metering equipment" },
      { "@type": "OfferCatalog", "name": "Motor Control Manuals", "description": "Motor control centers, starters, contactors, overloads" },
      { "@type": "OfferCatalog", "name": "Switch Manuals", "description": "Disconnect switches, transfer switches, safety switches" },
      { "@type": "OfferCatalog", "name": "Fuse Documentation", "description": "Fuse links, fuse holders, fuse catalogs" },
      { "@type": "OfferCatalog", "name": "Transformer Manuals", "description": "Dry-type, oil-filled, pad-mounted, instrument transformers" },
      { "@type": "OfferCatalog", "name": "Bus Product Manuals", "description": "Bus duct, busway, bus plugs, insulators" }
    ]
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+1-800-458-4001",
      "contactType": "sales",
      "areaServed": "US",
      "availableLanguage": "English"
    },
    {
      "@type": "ContactPoint",
      "telephone": "+1-814-432-5893",
      "contactType": "customer service",
      "areaServed": "US",
      "availableLanguage": "English"
    }
  ],
  "knowsAbout": [
    "End of Life (EOL) electrical equipment",
    "Legacy circuit breaker support",
    "Discontinued electrical equipment parts",
    "Remanufactured switchgear",
    "Obsolete breaker replacement",
    "Electrical equipment technical documentation"
  ]
};

// WebSite schema for sitelinks search box
const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Voyten Manuals",
  "url": "https://voytenmanuals.com",
  "description": "Free searchable library of electrical equipment manuals and technical documentation",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://voytenmanuals.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1a3a5c" />
        <meta name="geo.region" content="US-PA" />
        <meta name="geo.placename" content="Polk, Pennsylvania" />
        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
