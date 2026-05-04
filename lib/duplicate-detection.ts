import type { AdminSpa } from "./admin-spas";
import { pairKey } from "./ignored-duplicates";

export type DuplicateGroup = {
  /** Human-readable reasons these were flagged (e.g. "Same phone number"). */
  reasons: string[];
  spas: AdminSpa[];
};

// ── Normalisation helpers ─────────────────────────────────────

function normalizeName(name: string): string {
  // Collapse to lowercase alphanumeric only; skip very short strings
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(normalized).hostname;
    return hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  // Require at least 7 digits; take the last 10 to strip country codes
  return digits.length >= 7 ? digits.slice(-10) : null;
}

function normalizeAddress(spa: AdminSpa): string | null {
  if (!spa.address_line_1 || !spa.city) return null;
  const street = spa.address_line_1.toLowerCase().replace(/\s+/g, " ").trim();
  const city = spa.city.toLowerCase().trim();
  const state = (spa.state ?? "").toLowerCase().trim();
  return `${street}|${city}|${state}`;
}

// ── Union-Find (path-compressed, iterative) ───────────────────

function makeParent(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function find(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]; // path halving
    x = parent[x];
  }
  return x;
}

function union(parent: number[], a: number, b: number): void {
  const ra = find(parent, a);
  const rb = find(parent, b);
  if (ra !== rb) parent[ra] = rb;
}

// ── Main export ───────────────────────────────────────────────

/**
 * Detects possible duplicate spa listings.
 *
 * Spas are grouped if they share any of:
 *   - normalised name (≥ 4 chars after stripping punctuation)
 *   - normalised phone number (last 10 digits)
 *   - website domain (without www.)
 *   - street address + city + state
 *
 * Returns groups of 2+ spas, sorted by group size descending.
 *
 * @param ignoredPairs - Set of canonical pair keys (from getIgnoredPairSet())
 *   for pairs that should never be grouped together.
 */
export function detectDuplicates(
  spas: AdminSpa[],
  ignoredPairs: Set<string> = new Set()
): DuplicateGroup[] {
  const n = spas.length;
  if (n < 2) return [];

  const parent = makeParent(n);
  // Track the specific reason(s) for each pair
  const pairReasons = new Map<string, Set<string>>();

  function recordPair(a: number, b: number, reason: string) {
    // Skip pairs the admin has explicitly marked as not duplicates
    if (ignoredPairs.has(pairKey(spas[a].id, spas[b].id))) return;

    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = `${lo}-${hi}`;
    if (!pairReasons.has(key)) pairReasons.set(key, new Set());
    pairReasons.get(key)!.add(reason);
    union(parent, a, b);
  }

  // Build lookup maps: normalised value → list of spa indices
  const byName = new Map<string, number[]>();
  const byPhone = new Map<string, number[]>();
  const byDomain = new Map<string, number[]>();
  const byAddress = new Map<string, number[]>();

  spas.forEach((spa, i) => {
    const name = normalizeName(spa.name);
    if (name.length >= 4) {
      if (!byName.has(name)) byName.set(name, []);
      byName.get(name)!.push(i);
    }

    const phone = normalizePhone(spa.phone ?? spa.business_phone);
    if (phone) {
      if (!byPhone.has(phone)) byPhone.set(phone, []);
      byPhone.get(phone)!.push(i);
    }

    const domain = extractDomain(spa.website ?? spa.business_website);
    if (domain && domain.length > 4) {
      if (!byDomain.has(domain)) byDomain.set(domain, []);
      byDomain.get(domain)!.push(i);
    }

    const address = normalizeAddress(spa);
    if (address) {
      if (!byAddress.has(address)) byAddress.set(address, []);
      byAddress.get(address)!.push(i);
    }
  });

  function processMap(map: Map<string, number[]>, reason: string) {
    for (const indices of map.values()) {
      if (indices.length < 2) continue;
      for (let a = 0; a < indices.length; a++) {
        for (let b = a + 1; b < indices.length; b++) {
          recordPair(indices[a], indices[b], reason);
        }
      }
    }
  }

  processMap(byName, "Same name");
  processMap(byPhone, "Same phone number");
  processMap(byDomain, "Same website domain");
  processMap(byAddress, "Same address");

  // Collect connected components
  const clusters = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(parent, i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(i);
  }

  const groups: DuplicateGroup[] = [];

  clusters.forEach((indices) => {
    if (indices.length < 2) return;

    const clusterReasons = new Set<string>();
    for (let a = 0; a < indices.length; a++) {
      for (let b = a + 1; b < indices.length; b++) {
        const lo = Math.min(indices[a], indices[b]);
        const hi = Math.max(indices[a], indices[b]);
        pairReasons.get(`${lo}-${hi}`)?.forEach((r) => clusterReasons.add(r));
      }
    }

    groups.push({
      reasons: Array.from(clusterReasons),
      spas: indices.map((i) => spas[i]),
    });
  });

  return groups.sort((a, b) => b.spas.length - a.spas.length);
}
