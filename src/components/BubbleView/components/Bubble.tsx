import { useRef, useCallback, useEffect, memo } from "react";
import { formatVolume } from "../utils/formatVolume";
import type { PositionedBubble } from "../types";

interface BubbleProps {
  bubble: PositionedBubble;
  index: number;
  onClick: (bubble: PositionedBubble) => void;
  onDragStart: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, vx: number, vy: number) => void;
  registerDom: (id: string, el: HTMLElement | null) => void;
}

const Bubble = memo(function Bubble({
  bubble,
  index,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
  registerDom,
}: BubbleProps) {
  const { radius, title, image, volume, id } = bubble;
  const diameter = radius * 2;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef(false);
  const lastPointer = useRef<{ x: number; y: number; t: number }>({
    x: 0,
    y: 0,
    t: 0,
  });

  const isLarge = radius > 70;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isMedium = isMobile ? radius > 30 : radius > 50;

  useEffect(() => {
    const el = wrapperRef.current;
    if (el) registerDom(id, el);
    return () => registerDom(id, null);
  }, [id, registerDom]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      hasDragged.current = false;
      lastPointer.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      onDragStart(id);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      if (wrapperRef.current) {
        wrapperRef.current.style.zIndex = "100";
        wrapperRef.current.style.scale = "1.08";
      }
    },
    [id, onDragStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartPos.current) return;

      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasDragged.current = true;
      }

      const container = (e.target as HTMLElement).closest(
        "[data-bubble-container]",
      );
      if (!container) return;
      const rect = container.getBoundingClientRect();
      lastPointer.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      onDrag(id, e.clientX - rect.left, e.clientY - rect.top);
    },
    [id, onDrag],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartPos.current) return;

      if (wrapperRef.current) {
        wrapperRef.current.style.zIndex = "1";
        wrapperRef.current.style.scale = "1";
      }

      const dt = Math.max(Date.now() - lastPointer.current.t, 1);
      const vx = ((e.clientX - lastPointer.current.x) / dt) * 1000;
      const vy = ((e.clientY - lastPointer.current.y) / dt) * 1000;

      onDragEnd(id, vx, vy);

      if (!hasDragged.current) {
        onClick(bubble);
      }

      dragStartPos.current = null;
    },
    [id, bubble, onClick, onDragEnd],
  );

  return (
    <div
      ref={wrapperRef}
      className="absolute cursor-grab active:cursor-grabbing select-none touch-none bubble-enter"
      style={{
        width: diameter,
        height: diameter,
        transform: `translate(${bubble.x - radius}px, ${bubble.y - radius}px)`,
        willChange: "transform",
        zIndex: 1,
        transition: "scale 0.15s ease",
        animationDelay: `${Math.min(index * 12, 400)}ms`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => {
        if (!dragStartPos.current && wrapperRef.current) {
          wrapperRef.current.style.scale = "1.06";
        }
      }}
      onMouseLeave={() => {
        if (!dragStartPos.current && wrapperRef.current) {
          wrapperRef.current.style.scale = "1";
        }
      }}
    >
      <div
        className="w-full h-full rounded-full shadow-lg flex flex-col items-center justify-center overflow-hidden"
        style={{
          padding: radius * 0.12,
          backgroundColor: isLarge
            ? "#fefeff"
            : isMedium
              ? "rgba(255, 255, 255, 0.92)"
              : "rgba(255, 255, 255, 0.37)",
        }}
      >
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
    </div>
  );
});

export default Bubble;
