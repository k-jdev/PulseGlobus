import { CSSProperties } from "react";

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100vh",
  backgroundColor: "#000000",
};

const mapStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "0px",
};

export const MapContainer = ({ mapContainerRef }: MapContainerProps) => {
  return (
    <div style={containerStyle}>
      <div ref={mapContainerRef} style={mapStyle} />
    </div>
  );
};
