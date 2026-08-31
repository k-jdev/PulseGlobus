import { BubbleView, GlobusMapbox, Navbar, SubNavigation } from "@/features";
import { MapControlProvider } from "@/lib/map/MapControlContext";
import { useAppSelector } from "@/store/hooks";
import { selectViewMode } from "@/store/slices/uiSlice";

function App() {
  const viewMode = useAppSelector(selectViewMode);

  return (
    <MapControlProvider>
      <div className="relative w-full h-screen overflow-hidden">
        <Navbar />
        <SubNavigation />
        {viewMode === "globe" ? <GlobusMapbox /> : <BubbleView />}
      </div>
    </MapControlProvider>
  );
}

export default App;
