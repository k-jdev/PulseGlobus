import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useGetEventsWithMarketsQuery } from "@/store/services/polymarketApi";
import type { PolymarketEvent } from "@/store/services/polymarketApi";
import Bubble from "./components/Bubble";
import BubblePopup from "./components/BubblePopup";
import { useBubbleLayout } from "./hooks/useBubbleLayout";
import { useBubblePhysics } from "./hooks/useBubblePhysics";
import type { BubbleData, PositionedBubble } from "./types";
import type { TimeFilter } from "@/App";
import type { Category } from "@/components/SubNavigation";

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

  return {
    id: event.id,
    title: event.title,
    image: event.image || primaryMarket.image || "",
    volume: event.volume || 0,
    volume24hr: event.volume24hr || 0,
    category: (event.category || "other").toLowerCase(),
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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [selectedBubble, setSelectedBubble] = useState<PositionedBubble | null>(
    null,
  );

  // Fetch polymarket events
  const { data: events, isLoading } = useGetEventsWithMarketsQuery({
    limit: 200,
    active: true,
    order: "volume24hr",
  });

  // Measure container
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

  // Convert events to bubble data
  const allBubbles = useMemo<BubbleData[]>(() => {
    if (!events) return [];
    return events
      .map(eventToBubble)
      .filter((b): b is BubbleData => b !== null && b.volume > 0);
  }, [events]);

  // Filter by category
  const filteredBubbles = useMemo(() => {
    let bubbles = allBubbles;

    if (activeCategory !== "All Markets") {
      bubbles = bubbles.filter(
        (b) => b.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    // Filter by time
    switch (timeFilter) {
      case "1h":
        return bubbles.sort((a, b) => b.volume24hr - a.volume24hr).slice(0, 30);
      case "6h":
        return bubbles.sort((a, b) => b.volume24hr - a.volume24hr).slice(0, 50);
      case "24h":
      default:
        return bubbles.sort((a, b) => b.volume - a.volume).slice(0, 80);
    }
  }, [allBubbles, activeCategory, timeFilter]);

  // Layout bubbles (initial positions)
  const positionedBubbles = useBubbleLayout(
    filteredBubbles,
    containerSize.width,
    containerSize.height,
  );

  // Physics simulation
  const { positions, startDrag, updateDrag, endDrag } = useBubblePhysics(
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
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#2563EB]">
      {/* Bubble container — starts below navbar + sub-nav */}
      <div
        ref={containerRef}
        className="absolute inset-0 top-[120px]"
        data-bubble-container
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full"
            />
          </div>
        )}

        {/* Render positioned bubbles */}
        {positionedBubbles.map((bubble, i) => {
          const pos = positions.get(bubble.id);
          return (
            <Bubble
              key={bubble.id}
              bubble={bubble}
              px={pos?.x ?? bubble.x}
              py={pos?.y ?? bubble.y}
              index={i}
              onClick={handleBubbleClick}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>

      {/* Popup */}
      <BubblePopup
        bubble={selectedBubble}
        onClose={() => setSelectedBubble(null)}
      />
    </div>
  );
}
