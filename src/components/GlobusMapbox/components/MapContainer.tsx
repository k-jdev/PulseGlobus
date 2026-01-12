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

const buttonStyle: CSSProperties = {
  position: "absolute",
  top: "20px",
  right: "20px",
  zIndex: 1000,
  padding: "10px 20px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
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

export const MapContainer = ({
  mapContainerRef,
  theme,
  onThemeChange,
}: MapContainerProps) => {
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    onThemeChange(newTheme);
  };

  return (
    <div style={containerStyle}>
      <style>{popupOverrideStyle}</style>
      {theme === "light" && <div style={dotsOverlayStyle} />}
      <div ref={mapContainerRef} style={mapStyle} />
      <button
        onClick={handleThemeToggle}
        style={buttonStyle}
        title={`Switch on ${theme === "light" ? "dark" : "light"} theme`}
      >
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </div>
  );
};
