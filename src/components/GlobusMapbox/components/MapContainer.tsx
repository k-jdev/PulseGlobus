import { CSSProperties } from "react";
import { Theme } from "../constants/mapConfig";

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const lightContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100vh",
  background: "radial-gradient(circle at center, #0048FF 0%, #001D68 100%)",
  overflow: "hidden",
};

const darkContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100vh",
  background: "radial-gradient(circle at center, #1a1a2e 0%, #0d0d14 100%)",
  overflow: "hidden",
};

const mapStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "0px",
  position: "relative",
  zIndex: 2,
};

const lightDotsOverlayStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  backgroundImage:
    "radial-gradient(circle, rgba(255, 255, 255, 0.10) 1.5px, transparent 1.5px)",
  backgroundSize: "20px 20px",
  zIndex: 1,
};

const darkDotsOverlayStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  backgroundImage:
    "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
  backgroundSize: "20px 20px",
  zIndex: 1,
};

const lightPopupOverrideStyle = `
  .mapboxgl-popup {
    z-index: 999 !important;
  }
  
  .mapboxgl-map {
    background: transparent !important;
  }
`;

const darkPopupOverrideStyle = `
  .mapboxgl-popup {
    z-index: 999 !important;
  }
  
  .mapboxgl-map {
    background: transparent !important;
  }
`;

export const MapContainer = ({ mapContainerRef, theme }: MapContainerProps) => {
  const containerStyle =
    theme === "light" ? lightContainerStyle : darkContainerStyle;
  const dotsStyle =
    theme === "light" ? lightDotsOverlayStyle : darkDotsOverlayStyle;
  const popupStyle =
    theme === "light" ? lightPopupOverrideStyle : darkPopupOverrideStyle;

  return (
    <div style={containerStyle}>
      <style>{popupStyle}</style>
      <div style={dotsStyle} />
      <div ref={mapContainerRef} style={mapStyle} />
    </div>
  );
};
