import { useMemo } from "react";
import type { BubbleData, PositionedBubble } from "../types";

const MIN_RADIUS = 32;
const MAX_RADIUS = 140;

/**
 * Simple circle-packing using a spiral placement algorithm.
 * Places bubbles from largest to smallest, spiraling outward
 * from center, checking for overlaps.
 */
function packCircles(
  bubbles: BubbleData[],
  containerWidth: number,
  containerHeight: number,
): PositionedBubble[] {
  if (bubbles.length === 0 || containerWidth === 0 || containerHeight === 0)
    return [];

  // Calculate radii based on volume
  const maxVol = Math.max(...bubbles.map((b) => b.volume), 1);
  const minVol = Math.min(...bubbles.map((b) => b.volume), 0);
  const volRange = maxVol - minVol || 1;

  // Determine scale factor based on container size
  const area = containerWidth * containerHeight;
  const scaleFactor = Math.sqrt(area) / 1800;

  const withRadius = bubbles.map((b) => {
    const normalized = (b.volume - minVol) / volRange;
    const radius = Math.max(
      MIN_RADIUS * scaleFactor,
      Math.min(
        MAX_RADIUS * scaleFactor,
        (MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(normalized)) *
          scaleFactor,
      ),
    );
    return { ...b, radius };
  });

  // Sort: largest first for better packing
  withRadius.sort((a, b) => b.radius - a.radius);

  const placed: PositionedBubble[] = [];
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const padding = 6;

  for (const bubble of withRadius) {
    let bestX = cx;
    let bestY = cy;
    let found = false;

    if (placed.length === 0) {
      placed.push({ ...bubble, x: cx, y: cy });
      continue;
    }

    // Spiral outward from center
    const maxDist = Math.max(containerWidth, containerHeight);
    const step = 3;
    const angleStep = 0.15;

    for (let dist = 0; dist < maxDist && !found; dist += step) {
      const numAngles = Math.max(
        6,
        Math.floor((2 * Math.PI * dist) / (bubble.radius * 0.5)),
      );
      const aStep = (2 * Math.PI) / numAngles;

      for (let angle = 0; angle < 2 * Math.PI; angle += aStep) {
        const testX = cx + dist * Math.cos(angle + dist * angleStep);
        const testY = cy + dist * Math.sin(angle + dist * angleStep);

        // Check bounds (allow some overflow)
        if (
          testX - bubble.radius < -bubble.radius * 0.5 ||
          testX + bubble.radius > containerWidth + bubble.radius * 0.5 ||
          testY - bubble.radius < -bubble.radius * 0.5 ||
          testY + bubble.radius > containerHeight + bubble.radius * 0.5
        ) {
          continue;
        }

        // Check overlap with all placed bubbles
        let overlaps = false;
        for (const p of placed) {
          const dx = testX - p.x;
          const dy = testY - p.y;
          const dist2 = Math.sqrt(dx * dx + dy * dy);
          if (dist2 < bubble.radius + p.radius + padding) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          bestX = testX;
          bestY = testY;
          found = true;
          break;
        }
      }
    }

    placed.push({ ...bubble, x: bestX, y: bestY });
  }

  return placed;
}

export function useBubbleLayout(
  bubbles: BubbleData[],
  containerWidth: number,
  containerHeight: number,
): PositionedBubble[] {
  return useMemo(
    () => packCircles(bubbles, containerWidth, containerHeight),
    [bubbles, containerWidth, containerHeight],
  );
}
