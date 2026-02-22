import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useGetEventsWithMarketsQuery } from "@/store/services/polymarketApi";
import type { PolymarketEvent } from "@/store/services/polymarketApi";
import Bubble from "./components/Bubble";
import BubblePopup from "./components/BubblePopup";
import { useBubbleLayout } from "./hooks/useBubbleLayout";
import { useBubblePhysics } from "./hooks/useBubblePhysics";
import type { BubbleData, PositionedBubble } from "./types";
import type { TimeFilter } from "@/App";
import type { Category } from "@/components/SubNavigation";

const CATEGORY_TAG_SLUGS: Record<string, string[]> = {
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

const SLUG_TO_CATEGORY: Record<string, string> = {};
for (const [cat, slugs] of Object.entries(CATEGORY_TAG_SLUGS)) {
  for (const slug of slugs) {
    if (!SLUG_TO_CATEGORY[slug]) {
      SLUG_TO_CATEGORY[slug] = cat;
    }
  }
}

function resolveCategoryFromTags(
  tags?: Array<{ slug: string; forceShow?: boolean }>,
): string {
  if (!tags || tags.length === 0) return "other";

  for (const tag of tags) {
    const cat = SLUG_TO_CATEGORY[tag.slug];
    if (cat && tag.forceShow) return cat;
  }

  for (const tag of tags) {
    const cat = SLUG_TO_CATEGORY[tag.slug];
    if (cat) return cat;
  }

  return "other";
}

interface BubbleViewProps {
  timeFilter?: TimeFilter;
  activeCategory?: Category;
}

function eventToBubble(event: PolymarketEvent): BubbleData | null {
  if (!event.markets || event.markets.length === 0) return null;

  const primaryMarket = event.markets[0];
  let outcomes: string[] = [];
  let outcomePrices: number[] = [];

  try {
    outcomes = JSON.parse(primaryMarket.outcomes || "[]");
    outcomePrices = JSON.parse(primaryMarket.outcomePrices || "[]").map(Number);
  } catch {
    /* ignore */
  }

  const category = resolveCategoryFromTags(event.tags as any);

  return {
    id: event.id,
    title: event.title,
    image: event.image || primaryMarket.image || "",
    volume: event.volume || 0,
    volume24hr: event.volume24hr || 0,
    volume1wk: event.volume1wk || 0,
    volume1mo: event.volume1mo || 0,
    category,
    slug: primaryMarket.slug || "",
    eventSlug: event.slug || "",
    outcomes,
    outcomePrices,
    description: primaryMarket.description || event.description || "",
    endDate: primaryMarket.endDate || event.endDate || "",
    liquidity: event.liquidity || 0,
  };
}

export default function BubbleView({
  timeFilter = "24h",
  activeCategory = "All Markets",
}: BubbleViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(() => ({
    width: window.innerWidth,
    height: Math.max(window.innerHeight - 120, 400),
  }));
  const [selectedBubble, setSelectedBubble] = useState<PositionedBubble | null>(
    null,
  );

  const { data: events, isLoading } = useGetEventsWithMarketsQuery({
    limit: 200,
    active: true,
    order: "volume24hr",
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const allBubbles = useMemo<BubbleData[]>(() => {
    if (!events) return [];
    return events
      .map(eventToBubble)
      .filter((b): b is BubbleData => b !== null && b.volume > 0);
  }, [events]);

  const filteredBubbles = useMemo(() => {
    let bubbles = allBubbles;

    if (activeCategory !== "All Markets") {
      bubbles = bubbles.filter((b) => b.category === activeCategory);
    }

    switch (timeFilter) {
      case "1h":
        return [...bubbles]
          .sort((a, b) => b.volume24hr - a.volume24hr)
          .slice(0, 30);
      case "6h":
        return [...bubbles]
          .sort(
            (a, b) =>
              (b.volume1wk || b.volume24hr) - (a.volume1wk || a.volume24hr),
          )
          .slice(0, 50);
      case "24h":
      default:
        return [...bubbles]
          .sort((a, b) => (b.volume1mo || b.volume) - (a.volume1mo || a.volume))
          .slice(0, 80);
    }
  }, [allBubbles, activeCategory, timeFilter]);

  const positionedBubbles = useBubbleLayout(
    filteredBubbles,
    containerSize.width,
    containerSize.height,
  );

  const { registerDom, startDrag, updateDrag, endDrag } = useBubblePhysics(
    positionedBubbles,
    containerSize.width,
    containerSize.height,
  );

  const handleBubbleClick = useCallback((bubble: PositionedBubble) => {
    setSelectedBubble(bubble);
  }, []);

  const handleDragStart = useCallback(
    (id: string) => startDrag(id),
    [startDrag],
  );

  const handleDrag = useCallback(
    (id: string, x: number, y: number) => updateDrag(id, x, y),
    [updateDrag],
  );

  const handleDragEnd = useCallback(
    (id: string, vx: number, vy: number) => endDrag(id, vx, vy),
    [endDrag],
  );

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-[#2563EB]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Bubble container — starts below navbar + sub-nav */}
      <div
        ref={containerRef}
        className="absolute inset-0 top-[140px]"
        data-bubble-container
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {positionedBubbles.map((bubble, i) => (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            index={i}
            onClick={handleBubbleClick}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            registerDom={registerDom}
          />
        ))}
      </div>

      <BubblePopup
        bubble={selectedBubble}
        onClose={() => setSelectedBubble(null)}
      />
    </div>
  );
}
