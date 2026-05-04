import { CTA_VARIANTS, type CtaVariant } from "@/lib/cta-variants";

/**
 * Expands CTA blocks stored in the DB as empty divs into their full HTML.
 *
 * The Tiptap CtaExtension saves:
 *   <div class="guide-cta" data-variant="couples"></div>
 *
 * The public page has no React NodeView, so this post-processor replaces
 * the empty div with the full heading/body/link markup before rendering.
 */
export function processBlogContent(html: string): string {
  return html.replace(
    /<div class="guide-cta" data-variant="([^"]*)">\s*<\/div>/g,
    (_, variant) => {
      const meta =
        CTA_VARIANTS[variant as CtaVariant] ?? CTA_VARIANTS.general;
      return `<div class="guide-cta" data-variant="${variant}"><p class="guide-cta-heading">${meta.heading}</p><p class="guide-cta-body">${meta.body}</p><a href="${meta.href}" class="guide-cta-link">${meta.linkText}</a></div>`;
    }
  );
}
