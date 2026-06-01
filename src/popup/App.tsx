import { useEffect, useState, useCallback } from "react";
import type { LeetCodeProblem } from "../shared/types";
import {
  loadPool,
  savePool,
  saveAllProblems,
  loadAllProblems,
  loadLastSyncCount,
  drawFromPool,
  resetPool,
  getLastDraw,
  getBatchSize,
  setBatchSize,
  syncFavorites,
} from "../shared/storage";
import {
  fetchAllFavoritedProblems,
  fetchFavoriteId,
  fetchFavoriteCount,
} from "../shared/leetcode";
import Header from "./components/Header";
import DrawButton from "./components/DrawButton";
import ProblemCard from "./components/ProblemCard";
import Settings from "./components/Settings";
import FlipNumber from "./components/FlipNumber";

function App() {
  const [pool, setPool] = useState<LeetCodeProblem[]>([]);
  const [allProblems, setAllProblems] = useState<LeetCodeProblem[]>([]);
  const [lastDraw, setLastDraw] = useState<LeetCodeProblem[]>([]);
  const [batchSize, setBatchSizeState] = useState(3);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const checkForChanges = useCallback(async (lastCount: number | null) => {
    try {
      const favoriteId = await fetchFavoriteId();
      const freshCount = await fetchFavoriteCount(favoriteId);
      if (lastCount === null || freshCount !== lastCount) {
        setNeedsSync(true);
      }
    } catch {
      // Silently swallow errors (auth, network, etc.)
    }
  }, []);

  const init = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [poolData, allData, lastDrawData, size, lastSyncCount] =
        await Promise.all([
          loadPool(),
          loadAllProblems(),
          getLastDraw(),
          getBatchSize(),
          loadLastSyncCount(),
        ]);
      setPool(poolData);
      setAllProblems(allData);
      setLastDraw(lastDrawData);
      setBatchSizeState(size);

      if (allData.length === 0) {
        const problems = await fetchAllFavoritedProblems();
        setAllProblems(problems);
        setPool(problems);
        await saveAllProblems(problems);
        await savePool(problems);
      } else {
        checkForChanges(lastSyncCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [checkForChanges]);

  useEffect(() => {
    init();
  }, [init]);

  const handleDraw = async () => {
    try {
      setDrawing(true);
      setError(null);
      const drawn = await drawFromPool(batchSize);
      setLastDraw(drawn);
      const remaining = await loadPool();
      setPool(remaining);
      await Promise.all(
        drawn.map((problem) =>
          chrome.tabs.create({
            url: `https://leetcode.com/problems/${problem.titleSlug}/`,
            active: false,
          }),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draw failed");
    } finally {
      setDrawing(false);
    }
  };

  const handleReset = async () => {
    try {
      setError(null);
      await resetPool();
      setPool([...allProblems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncMessage(null);
      const freshProblems = await fetchAllFavoritedProblems();
      const { newPool, newLastDraw } = await syncFavorites(freshProblems);
      setAllProblems(freshProblems);
      setPool(newPool);
      setLastDraw(newLastDraw);
      setNeedsSync(false);
      setSyncMessage("Synced!");
      setTimeout(() => setSyncMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleBatchSizeChange = async (size: number) => {
    setBatchSizeState(size);
    await setBatchSize(size);
  };

  const handleToggleHelp = () => setShowHelp((prev) => !prev);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Header onToggleHelp={handleToggleHelp} />
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-lc-orange border-t-transparent" />
          <span className="ml-2 text-sm text-[var(--muted)]">
            Loading problems...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Header onToggleHelp={handleToggleHelp} />
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={init}
            className="mt-2 text-sm text-lc-orange hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (allProblems.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Header onToggleHelp={handleToggleHelp} />
        <div className="rounded-lg border border-[var(--border)] p-6 text-center">
          <p className="text-sm text-[var(--muted)]">No favorites found.</p>
          <a
            href="https://leetcode.com/problems/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-lc-orange hover:underline"
          >
            Go favorite some problems!
          </a>
        </div>
      </div>
    );
  }

  const poolEmpty = pool.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <Header onToggleHelp={handleToggleHelp} />

      <div className="flex items-center justify-between">
        <FlipNumber value={pool.length} />
        <Settings
          batchSize={batchSize}
          onBatchSizeChange={handleBatchSizeChange}
        />
      </div>

      {showHelp && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)] space-y-1.5">
          <p>
            <strong className="text-[var(--foreground)]">{pool.length}</strong>{" "}
            problem{pool.length !== 1 ? "s" : ""} in the pool — favorited
            problems not yet drawn
          </p>
          <p>
            <strong className="text-[var(--foreground)]">{batchSize}</strong>{" "}
            drip size — problems drawn per click
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <DrawButton
          disabled={poolEmpty}
          loading={drawing}
          onClick={handleDraw}
        />
        <button
          onClick={handleReset}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
        >
          Reset pool ({allProblems.length} problems)
        </button>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="relative w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-lc-orange border-t-transparent" />
              Syncing...
            </span>
          ) : syncMessage ? (
            syncMessage
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              ↻ Sync with LeetCode
              {needsSync && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-lc-orange" />
              )}
            </span>
          )}
        </button>
      </div>

      {lastDraw.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Last Draw
          </h2>
          <div className="flex flex-col gap-2">
            {lastDraw.map((problem) => (
              <ProblemCard key={problem.titleSlug} problem={problem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
