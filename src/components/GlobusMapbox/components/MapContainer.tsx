import { CSSProperties } from "react";
import { Theme } from "../constants/mapConfig";

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100vh",
  backgroundColor: "#1452F0",
};

const mapStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "0px",
  position: "relative",
  zIndex: 2,
};

const dotsOverlayStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  backgroundImage:
    "radial-gradient(circle, rgba(255, 255, 255, 0.08) 2px, transparent 2px)",
  backgroundSize: "20px 20px",
  zIndex: 1,
};

const popupOverrideStyle = `
  .mapboxgl-popup {
    z-index: 999 !important;
  }
`;

export const MapContainer = ({ mapContainerRef, theme }: MapContainerProps) => {
  return (
    <div style={containerStyle}>
      <style>{popupOverrideStyle}</style>
      {theme === "light" && <div style={dotsOverlayStyle} />}
      <div ref={mapContainerRef} style={mapStyle} />
    </div>
  );
};
