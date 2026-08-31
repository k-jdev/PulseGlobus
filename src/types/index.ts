export const CATEGORIES = [
  "All Markets",
  "Politics",
  "Sports",
  "Crypto",
  "Finance",
  "Geopolitics",
  "Tech",
  "Culture",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const TIME_FILTERS = ["1h", "6h", "24h"] as const;

export type TimeFilter = (typeof TIME_FILTERS)[number];

export type ViewMode = "globe" | "bubble";

export type Theme = "light" | "dark";

/** Side panel that can be open in the sub-navigation. Only one at a time. */
export type SidePanel = "breakingNews" | "liveTrades" | null;
