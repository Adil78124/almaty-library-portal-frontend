/**
 * Соответствие сущностей Prisma и HTTP API (CRUD).
 * Синглтоны: GET + PUT. Остальные: GET/POST на коллекцию, GET/PATCH/DELETE по id.
 */
export const CONTENT_API = {
  siteSettings: { model: "SiteSettings", list: null, singleton: "/api/site-settings" },
  homeHero: { model: "HomeHero", list: null, singleton: "/api/home/hero" },
  marqueeItems: { model: "MarqueeItem", collection: "/api/home/marquee" },
  homeMetrics: { model: "HomeMetric", collection: "/api/home/metrics" },
  navItems: { model: "NavItem", collection: "/api/nav-items" },
  news: { model: "NewsArticle", collection: "/api/news" },
  events: { model: "Event", collection: "/api/events" },
  digitalLibraryItems: {
    model: "DigitalLibraryItem",
    collection: "/api/digital-library-items",
  },
  newArrivals: { model: "NewArrival", collection: "/api/new-arrivals" },
  localHistory: { model: "LocalHistoryCard", collection: "/api/local-history" },
  gallery: { model: "GalleryItem", collection: "/api/gallery" },
  partnerLinks: { model: "PartnerLink", collection: "/api/partner-links" },
  socialLinks: { model: "SocialLink", collection: "/api/social-links" },
  mediaAssets: { model: "MediaAsset", collection: "/api/media-assets" },
} as const
