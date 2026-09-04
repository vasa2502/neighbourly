"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch website metadata from a URL.
 * Extracts title, description, OG image, and favicon.
 * Used by sponsors to auto-fill their sponsorship card.
 */
export const fetchWebsiteMetadata = action({
  args: { url: v.string() },
  handler: async (_ctx, args) => {
    const url = args.url.trim();
    if (!url) return { error: "URL is required" };

    try {
      // Ensure URL has protocol
      const fetchUrl = url.startsWith("http") ? url : `https://${url}`;
      const parsedUrl = new URL(fetchUrl);

      const response = await fetch(fetchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SponsorBot/1.0)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(10000),
        redirect: "follow",
      });

      if (!response.ok) {
        return { error: `Failed to fetch: ${response.status}` };
      }

      const html = await response.text();
      const metadata: Record<string, string> = {};

      // Extract <title>
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) metadata.title = titleMatch[1].trim();

      // Extract meta tags
      const metaTags = html.match(/<meta\s+[^>]+>/gi) || [];
      for (const tag of metaTags) {
        const nameMatch = tag.match(/(?:name|property)=["']([^"']+)["']/i);
        const contentMatch = tag.match(/content=["']([^"']+)["']/i);
        if (nameMatch && contentMatch) {
          const name = nameMatch[1].toLowerCase();
          const content = contentMatch[1].trim();
          if (name === "description" && !metadata.description) {
            metadata.description = content;
          } else if (name === "og:title" && !metadata.ogTitle) {
            metadata.ogTitle = content;
          } else if (name === "og:description" && !metadata.ogDescription) {
            metadata.ogDescription = content;
          } else if (name === "og:image" && !metadata.ogImage) {
            metadata.ogImage = resolveRelativeUrl(content, parsedUrl.origin);
          } else if (name === "twitter:image" && !metadata.ogImage) {
            metadata.ogImage = resolveRelativeUrl(content, parsedUrl.origin);
          }
        }
      }

      // Extract favicon
      const faviconMatch = html.match(
        /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i
      );
      if (faviconMatch) {
        metadata.favicon = resolveRelativeUrl(faviconMatch[1], parsedUrl.origin);
      } else {
        // Default favicon path
        metadata.favicon = `${parsedUrl.origin}/favicon.ico`;
      }

      return {
        success: true,
        title: metadata.ogTitle || metadata.title || "",
        description: metadata.ogDescription || metadata.description || "",
        image: metadata.ogImage || "",
        favicon: metadata.favicon || "",
        url: fetchUrl,
      };
    } catch (err: any) {
      return { error: err.message || "Failed to fetch metadata" };
    }
  },
});

/** Resolve relative URLs to absolute */
function resolveRelativeUrl(url: string, origin: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
}
