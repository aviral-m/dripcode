import { useEffect, useState } from "react";
import type { ActiveList } from "../shared/types";
import { loadActiveList, saveActiveList } from "../shared/storage";
import Header from "./components/Header";
import ListSelectionView from "./components/ListSelectionView";
import DrawingView from "./components/DrawingView";

function App() {
  const [viewMode, setViewMode] = useState<"loading" | "selection" | "drawing">("loading");
  const [activeList, setActiveList] = useState<ActiveList | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadActiveList().then((list) => {
      if (list) {
        setActiveList(list);
        setViewMode("drawing");
      } else {
        setViewMode("selection");
      }
    });
  }, []);

  const handleSelectList = async (list: ActiveList) => {
    await saveActiveList(list);
    setActiveList(list);
    setViewMode("drawing");
  };

  const handleBack = () => {
    setViewMode("selection");
  };

  const handleToggleHelp = () => setShowHelp((prev) => !prev);

  if (viewMode === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <Header onToggleHelp={handleToggleHelp} />
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-lc-orange border-t-transparent" />
          <span className="ml-2 text-sm text-[var(--muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Header onToggleHelp={handleToggleHelp} />
      {viewMode === "selection" ? (
        <ListSelectionView
          activeListSlug={activeList?.slug ?? null}
          onSelectList={handleSelectList}
        />
      ) : (
        <DrawingView
          key={activeList!.slug}
          activeList={activeList!}
          onBack={handleBack}
          showHelp={showHelp}
        />
      )}
    </div>
  );
}

export default App;
