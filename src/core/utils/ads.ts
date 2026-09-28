/**
 * In-Content Ad Injection Engine for Astro CMS
 */

export interface InjectAdsOptions {
  inContentAd?: string;
  paragraphInterval?: number;
  disableAds?: boolean;
}

export function injectAdsIntoContent(contentHtml: string, options: InjectAdsOptions = {}): string {
  const { inContentAd, paragraphInterval = 2, disableAds = false } = options;

  if (!contentHtml || disableAds || !inContentAd || inContentAd.trim() === "") {
    // Remove any remaining manual shortcodes cleanly
    return contentHtml ? contentHtml.replace(/<!--\s*ad\s*-->/gi, "").replace(/\[ad-slot\]/gi, "") : "";
  }

  const adMarkup = `
    <div class="in-content-ad-wrapper" style="margin: 2rem 0; text-align: center;">
      <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">Sponsor / Iklan</div>
      <div class="ad-markup-content">${inContentAd}</div>
    </div>
  `;

  // 1. Check for manual shortcode: <!-- ad --> or [ad-slot]
  if (/<!--\s*ad\s*-->/i.test(contentHtml) || /\[ad-slot\]/i.test(contentHtml)) {
    return contentHtml
      .replace(/<!--\s*ad\s*-->/gi, adMarkup)
      .replace(/\[ad-slot\]/gi, adMarkup);
  }

  // 2. Auto-injection based on paragraph count (</p> or double newlines)
  if (contentHtml.includes("</p>")) {
    const parts = contentHtml.split("</p>");
    if (parts.length <= paragraphInterval) {
      return contentHtml;
    }
    parts.splice(paragraphInterval, 0, adMarkup);
    return parts.join("</p>");
  }

  // Fallback for line-break formatted content
  if (contentHtml.includes("<br/>") || contentHtml.includes("<br>")) {
    const parts = contentHtml.split(/<br\s*\/?>/i);
    const targetIdx = Math.min(paragraphInterval * 2, Math.floor(parts.length / 2));
    if (parts.length > 4) {
      parts.splice(targetIdx, 0, adMarkup);
      return parts.join("<br/>");
    }
  }

  return contentHtml;
}
