export type TocEntry = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** Strip HTML tags from a string */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

/** Convert heading text to a URL-friendly ID */
function slugify(text: string): string {
  return stripTags(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Parse all H2 and H3 headings from an HTML string.
 * Returns an array of TOC entries with generated IDs.
 */
export function parseHeadings(html: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const seen = new Map<string, number>();
  const regex = /<(h[23])[^>]*>([\s\S]*?)<\/h[23]>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1][1], 10) as 2 | 3;
    const rawText = stripTags(match[2]).trim();
    let id = slugify(rawText);

    // Deduplicate IDs
    if (seen.has(id)) {
      const count = (seen.get(id) ?? 0) + 1;
      seen.set(id, count);
      id = `${id}-${count}`;
    } else {
      seen.set(id, 0);
    }

    entries.push({ id, text: rawText, level });
  }

  return entries;
}

// ── Content segment splitting (for guide CTA blocks) ────────────────────────

export type ContentSegment =
  | { type: "prose"; html: string }
  | { type: "cta"; variant: string };

/**
 * Split an HTML string into alternating prose and CTA segments.
 * CTA markers are: <div class="guide-cta" data-variant="..."></div>
 * Prose segments are passed to dangerouslySetInnerHTML as-is.
 */
export function splitContentSegments(html: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  // Matches <div class="guide-cta" data-variant="VARIANT"></div> (self-closing or empty)
  const ctaRegex =
    /<div[^>]*class="guide-cta"[^>]*data-variant="([^"]*)"[^>]*>\s*<\/div>/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ctaRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const prose = html.slice(lastIndex, match.index).trim();
      if (prose) segments.push({ type: "prose", html: prose });
    }
    segments.push({ type: "cta", variant: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    const prose = html.slice(lastIndex).trim();
    if (prose) segments.push({ type: "prose", html: prose });
  }

  return segments;
}

/**
 * Inject `id` attributes into H2/H3 tags in the HTML string,
 * using the IDs from a pre-parsed entries array (same order).
 */
export function injectHeadingIds(html: string, entries: TocEntry[]): string {
  let idx = 0;
  return html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, (_, tag, attrs, content) => {
    const entry = entries[idx++];
    if (!entry) return `<${tag}${attrs}>${content}</${tag}>`;
    // Remove any existing id= to avoid duplicates
    const cleanAttrs = attrs.replace(/\s*id="[^"]*"/g, "");
    return `<${tag} id="${entry.id}"${cleanAttrs}>${content}</${tag}>`;
  });
}
