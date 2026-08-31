interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MarkerConnectorProps {
  markerPosition: { x: number; y: number };
  popup: Rect;
  isVisible: boolean;
}

/**
 * Point where the marker→popup line meets the popup border, so the dashed line
 * stops at the card edge instead of running under it.
 */
function findPopupEdgePoint(
  popup: Rect,
  markerX: number,
  markerY: number,
): { x: number; y: number } {
  const centerX = popup.left + popup.width / 2;
  const centerY = popup.top + popup.height / 2;
  const dx = markerX - centerX;
  const dy = markerY - centerY;

  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
    return { x: centerX, y: centerY };
  }

  const halfWidth = popup.width / 2;
  const halfHeight = popup.height / 2;

  if (Math.abs(dx) / halfWidth > Math.abs(dy) / halfHeight) {
    const x = dx > 0 ? popup.left + popup.width : popup.left;
    const y = centerY + dy * ((x - centerX) / dx);
    return {
      x,
      y: Math.max(popup.top, Math.min(popup.top + popup.height, y)),
    };
  }

  const y = dy > 0 ? popup.top + popup.height : popup.top;
  const x = centerX + dx * ((y - centerY) / dy);
  return {
    x: Math.max(popup.left, Math.min(popup.left + popup.width, x)),
    y,
  };
}

const fade = { transition: "opacity 150ms ease" };

export function MarkerConnector({
  markerPosition,
  popup,
  isVisible,
}: MarkerConnectorProps) {
  const edge = findPopupEdgePoint(popup, markerPosition.x, markerPosition.y);

  return (
    <svg
      className="md:hidden fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: "visible", clipPath: "inset(144px 0 0 0)" }}
    >
      <line
        x1={markerPosition.x}
        y1={markerPosition.y}
        x2={edge.x}
        y2={edge.y}
        stroke="#1452f0"
        strokeWidth="2"
        strokeDasharray="8 6"
        strokeLinecap="round"
        opacity={isVisible ? 0.6 : 0}
        style={fade}
      />
      <circle
        cx={markerPosition.x}
        cy={markerPosition.y}
        r="8"
        fill="#1452f0"
        stroke="#ffffff"
        strokeWidth="3"
        opacity={isVisible ? 1 : 0}
        style={fade}
      />
      <circle
        cx={markerPosition.x}
        cy={markerPosition.y}
        r="3"
        fill="#ffffff"
        opacity={isVisible ? 1 : 0}
        style={fade}
      />
    </svg>
  );
}
