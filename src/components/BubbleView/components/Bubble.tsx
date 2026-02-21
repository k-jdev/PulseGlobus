import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { formatVolume } from "../utils/formatVolume";
import type { PositionedBubble } from "../types";

interface BubbleProps {
  bubble: PositionedBubble;
  /** Current physics position x */
  px: number;
  /** Current physics position y */
  py: number;
  index: number;
  onClick: (bubble: PositionedBubble) => void;
  onDragStart: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, vx: number, vy: number) => void;
}

export default function Bubble({
  bubble,
  px,
  py,
  index,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
}: BubbleProps) {
  const { radius, title, image, volume, id } = bubble;
  const diameter = radius * 2;
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef(false);
  const lastPointer = useRef<{ x: number; y: number; t: number }>({
    x: 0,
    y: 0,
    t: 0,
  });

  // Show full content for larger bubbles, compact for smaller
  const isLarge = radius > 70;
  const isMedium = radius > 50;

  // Smooth scale for hover
  const scale = useMotionValue(1);
  const smoothScale = useSpring(scale, { stiffness: 300, damping: 20 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      hasDragged.current = false;
      lastPointer.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      onDragStart(id);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      scale.set(1.08);
    },
    [id, onDragStart, scale],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartPos.current) return;

      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;

      // Threshold to distinguish tap from drag
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasDragged.current = true;
      }

      // Get container-relative position
      const container = (e.target as HTMLElement).closest(
        "[data-bubble-container]",
      );
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      lastPointer.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      onDrag(id, newX, newY);
    },
    [id, onDrag],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartPos.current) return;

      scale.set(1);

      // Calculate release velocity from last move
      const dt = Math.max(Date.now() - lastPointer.current.t, 1);
      const vx = ((e.clientX - lastPointer.current.x) / dt) * 1000;
      const vy = ((e.clientY - lastPointer.current.y) / dt) * 1000;

      onDragEnd(id, vx, vy);

      // Only fire click if wasn't a drag
      if (!hasDragged.current) {
        onClick(bubble);
      }

      dragStartPos.current = null;
    },
    [id, bubble, onClick, onDragEnd, scale],
  );

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: index * 0.015,
      }}
      className="absolute cursor-grab active:cursor-grabbing group select-none touch-none"
      style={{
        left: px - radius,
        top: py - radius,
        width: diameter,
        height: diameter,
        scale: smoothScale,
        zIndex: dragStartPos.current ? 100 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onHoverStart={() => !dragStartPos.current && scale.set(1.06)}
      onHoverEnd={() => !dragStartPos.current && scale.set(1)}
    >
      {/* Bubble circle */}
      <div
        className="w-full h-full rounded-full bg-white shadow-lg flex flex-col items-center justify-center overflow-hidden relative transition-shadow duration-200 group-hover:shadow-2xl"
        style={{ padding: radius * 0.12 }}
      >
        {/* Image */}
        {image && (
          <div
            className="rounded-full overflow-hidden flex-shrink-0 bg-gray-100"
            style={{
              width: isLarge
                ? radius * 0.6
                : isMedium
                  ? radius * 0.55
                  : radius * 0.5,
              height: isLarge
                ? radius * 0.6
                : isMedium
                  ? radius * 0.55
                  : radius * 0.5,
            }}
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Volume */}
        <p
          className="font-bold text-black leading-tight mt-1 pointer-events-none"
          style={{
            fontSize: isLarge
              ? Math.max(16, radius * 0.22)
              : isMedium
                ? Math.max(13, radius * 0.2)
                : Math.max(10, radius * 0.22),
          }}
        >
          {formatVolume(volume)}
        </p>

        {/* Title - only for large/medium bubbles */}
        {isMedium && (
          <p
            className="text-center text-gray-600 leading-tight mt-0.5 px-1 pointer-events-none"
            style={{
              fontSize: Math.max(9, radius * 0.11),
              maxHeight: isLarge ? radius * 0.5 : radius * 0.35,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: isLarge ? 3 : 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </p>
        )}
      </div>
    </motion.div>
  );
}
