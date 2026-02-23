export const CATEGORY_TAG_SLUGS: Record<string, string[]> = {
  Politics: [
    "politics",
    "elections",
    "global-elections",
    "world-elections",
    "primaries",
    "us-presidential-election",
    "president",
    "trump",
    "trump-presidency",
    "trump-machado",
    "world",
  ],
  Sports: [
    "sports",
    "soccer",
    "basketball",
    "football",
    "baseball",
    "hockey",
    "nba",
    "nfl",
    "mlb",
    "nhl",
    "ufc",
    "golf",
    "tennis",
    "olympics",
    "winter-games",
    "esports",
    "games",
    "dota-2",
    "league-of-legends",
    "premier-league",
    "EPL",
    "champions-league",
    "ucl",
    "la-liga",
    "bundesliga",
    "2026-fifa-world-cup",
    "fifa-world-cup",
    "nba-champion",
    "nba-finals",
    "stanley-cup",
    "pga-tour",
    "the-masters",
    "mvp",
    "medal-count",
    "mens-winter-olympics-hockey",
  ],
  Crypto: [
    "crypto",
    "crypto-prices",
    "bitcoin",
    "ethereum",
    "solana",
    "defi",
    "web3",
    "blockchain",
  ],
  Finance: [
    "finance",
    "economy",
    "economic-policy",
    "stocks",
    "equities",
    "fed",
    "fed-rates",
    "business",
    "ipo",
    "ipos",
    "commodities",
    "comex-silver-futures",
    "silver",
    "pltr",
    "hit-price",
    "macro-election-1",
    "finance-rewards-300",
  ],
  Geopolitics: [
    "geopolitics",
    "middle-east",
    "iran",
    "israel",
    "world",
    "venezuela",
    "maduro",
    "hungary",
    "netherlands",
    "dutch-election",
  ],
  Tech: ["tech", "big-tech", "ai", "science", "openai", "sam-altman", "aliens"],
  Culture: ["pop-culture", "awards", "tweets-markets"],
};

export const SLUG_TO_CATEGORY: Record<string, string> = {};
for (const [cat, slugs] of Object.entries(CATEGORY_TAG_SLUGS)) {
  for (const slug of slugs) {
    if (!SLUG_TO_CATEGORY[slug]) {
      SLUG_TO_CATEGORY[slug] = cat;
    }
  }
}

export function resolveCategoryFromTags(
  tags?: Array<{ slug: string; forceShow?: boolean }>,
  fallbackCategory?: string,
): string {
  if (tags && tags.length > 0) {
    // First pass: forceShow tags
    for (const tag of tags) {
      const cat = SLUG_TO_CATEGORY[tag.slug];
      if (cat && tag.forceShow) return cat;
    }
    // Second pass: any matching tag
    for (const tag of tags) {
      const cat = SLUG_TO_CATEGORY[tag.slug];
      if (cat) return cat;
    }
  }

  // Fallback: try to match event.category directly
  if (fallbackCategory) {
    const normalized = fallbackCategory.trim();
    // Check if it already matches a known category (case-insensitive)
    const found = Object.keys(CATEGORY_TAG_SLUGS).find(
      (cat) => cat.toLowerCase() === normalized.toLowerCase(),
    );
    if (found) return found;
  }

  return "other";
}
