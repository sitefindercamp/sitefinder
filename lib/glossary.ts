/**
 * Korean spa glossary — used to auto-inject hover tooltips into guide content.
 *
 * Keys must be lowercase. Longer / more specific phrases should be listed first
 * so the regex tries them before shorter sub-strings.
 */
export const GLOSSARY: Record<string, string> = {
  // Multi-word terms first (matched before single-word sub-terms)
  "italy towel": "A coarse, exfoliating mitt that's a staple of Korean spa culture. Technicians use it to scrub away dead skin during a seshin (body scrub) treatment.",
  "body scrub": "A seshin-style treatment where a skilled technician uses an Italy towel to vigorously exfoliate your entire body — one of the signature experiences at a Korean spa.",

  // Single-word Korean terms
  "jjimjilbang": "A large Korean bathhouse and spa complex with heated sauna rooms, baths, and communal lounge areas — often open 24 hours. Families and friend groups frequent these for a full day out.",
  "jimjilbang": "Alternate spelling of jjimjilbang — a large Korean bathhouse complex featuring saunas, baths, and communal lounge space.",
  "seshin": "A professional body-scrub treatment (세신) where a technician uses an Italy towel to remove dead skin cells. Can feel intense the first time but leaves skin incredibly smooth.",
  "bulgama": "A kiln-style charcoal sauna dome (불가마) — one of the hottest rooms in the spa, used in short sessions for deep sweating and detoxification.",
  "hwangto": "A yellow-clay sauna room (황토방) popular in Korean spas. Yellow clay (황토) is believed to have far-infrared and detoxifying properties.",
  "hanjeungmak": "A traditional wood-fired Korean sauna (한증막) — one of the oldest forms of Korean thermal therapy, now often recreated as a dome or barrel room inside modern jjimjilbangs.",
  "ondol": "Traditional Korean underfloor heating (온돌). The warm stone floors in Korean sauna lounges are a modern take on this ancient system of radiating heat from below.",
  "sikhye": "A sweet, chilled Korean rice punch (식혜) commonly served in jjimjilbang lounges. Mildly fermented with a light sweetness — a refreshing cool-down drink after a hot sauna session.",
  "dduk": "Short for 때밀이 — an exfoliation treatment using an Italy towel. The word literally refers to the dead skin (때) that is scrubbed off during the service.",
  "gwisin": "A small, arch-shaped hot room found in some jjimjilbangs — named for its rounded, ghost-like silhouette (귀신 = ghost in Korean).",
};

/** Escape a string for safe use inside a RegExp */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Inject glossary tooltip spans into an HTML string.
 *
 * - Only modifies text content between HTML tags (never touches attributes).
 * - Each term is highlighted at most once per page (first occurrence).
 * - Longer terms are matched before shorter sub-strings.
 */
export function injectGlossaryTooltips(html: string): string {
  const terms = Object.keys(GLOSSARY);
  if (terms.length === 0) return html;

  // Sort longer terms first so e.g. "italy towel" beats "italy" if both existed
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${sorted.map(escapeRegex).join("|")})\\b`, "gi");

  const used = new Set<string>();

  // Only touch text content between > and <
  return html.replace(/>([^<]+)</g, (_, text: string) => {
    const decorated = text.replace(pattern, (matched) => {
      const key = matched.toLowerCase();
      if (used.has(key)) return matched; // only first occurrence
      used.add(key);
      const definition = GLOSSARY[key] ?? "";
      if (!definition) return matched;
      return `<span class="glossary-term" tabindex="0">${matched}<span class="glossary-tooltip" role="tooltip">${definition}</span></span>`;
    });
    return `>${decorated}<`;
  });
}
