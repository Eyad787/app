/** Feature flags and site-wide settings. */
export const FEATURES = {
  /** Draw a small watermark on free downloads. Off until monetization ships. */
  watermarkOnFreeDownloads: false,
  /** Render the (currently empty) ad slot placeholders. */
  showAdSlots: true,
};

export const WATERMARK_TEXT = "photo-id.example";

/** Public URL used for canonical links and the sitemap (set VITE_SITE_URL in Vercel). */
export const SITE_URL: string = (import.meta.env?.VITE_SITE_URL as string | undefined) ?? "https://example.com";
