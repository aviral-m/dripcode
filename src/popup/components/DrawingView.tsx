import { useEffect, useState, useCallback } from "react";
import type { ActiveList, LeetCodeProblem } from "../../shared/types";
import {
  loadPool,
  savePool,
  saveAllProblems,
  loadAllProblems,
  loadLastSyncCount,
  loadLastListSlug,
  saveLastListSlug,
  drawFromPool,
  resetPool,
  getLastDraw,
  getBatchSize,
  setBatchSize,
  syncFavorites,
} from "../../shared/storage";
import {
  fetchFavoriteProblems,
  fetchFavoriteCount,
} from "../../shared/leetcode";
import DripButton from "./DripButton";
import ProblemCard from "./ProblemCard";
import Settings from "./Settings";
import FlipNumber from "./FlipNumber";

interface DrawingViewProps {
  activeList: ActiveList;
  onBack: () => void;
  showHelp: boolean;
}

const categoryLabels: Record<ActiveList["type"], string> = {
  created: "My Lists",
  collected: "Saved by Me",
};

function DrawingView({ activeList, onBack, showHelp }: DrawingViewProps) {
  const [pool, setPool] = useState<LeetCodeProblem[]>([]);
  const [allProblems, setAllProblems] = useState<LeetCodeProblem[]>([]);
  const [lastDraw, setLastDraw] = useState<LeetCodeProblem[]>([]);
  const [batchSize, setBatchSizeState] = useState(3);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const checkForChanges = useCallback(
    async (lastCount: number | null) => {
      try {
        const freshCount = await fetchFavoriteCount(activeList.slug);
        if (lastCount === null || freshCount !== lastCount) {
          setNeedsSync(true);
        }
      } catch {
        // Silently swallow errors (auth, network, etc.)
      }
    },
    [activeList.slug],
  );

  const init = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        poolData,
        allData,
        lastDrawData,
        size,
        lastSyncCount,
        lastListSlug,
      ] = await Promise.all([
        loadPool(),
        loadAllProblems(),
        getLastDraw(),
        getBatchSize(),
        loadLastSyncCount(),
        loadLastListSlug(),
      ]);

      setBatchSizeState(size);

      if (lastListSlug !== activeList.slug || allData.length === 0) {
        const problems = await fetchFavoriteProblems(activeList.slug);
        setAllProblems(problems);
        setPool(problems);
        setLastDraw([]);
        await saveAllProblems(problems);
        await savePool(problems);
        await chrome.storage.local.remove("dripcode_last_draw");
        await saveLastListSlug(activeList.slug);
      } else {
        setPool(poolData);
        setAllProblems(allData);
        setLastDraw(lastDrawData);
        checkForChanges(lastSyncCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeList.slug, checkForChanges]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const [
          poolData,
          allData,
          lastDrawData,
          size,
          lastSyncCount,
          lastListSlug,
        ] = await Promise.all([
          loadPool(),
          loadAllProblems(),
          getLastDraw(),
          getBatchSize(),
          loadLastSyncCount(),
          loadLastListSlug(),
        ]);
        if (cancelled) return;
        setBatchSizeState(size);
        if (lastListSlug !== activeList.slug || allData.length === 0) {
          const problems = await fetchFavoriteProblems(activeList.slug);
          if (cancelled) return;
          setAllProblems(problems);
          setPool(problems);
          setLastDraw([]);
          await saveAllProblems(problems);
          await savePool(problems);
          await chrome.storage.local.remove("dripcode_last_draw");
          await saveLastListSlug(activeList.slug);
        } else {
          setPool(poolData);
          setAllProblems(allData);
          setLastDraw(lastDrawData);
          checkForChanges(lastSyncCount);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeList.slug, checkForChanges]);

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
      setError(err instanceof Error ? err.message : "Drip failed");
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
      const freshProblems = await fetchFavoriteProblems(activeList.slug);
      const { newPool, newLastDraw } = await syncFavorites(freshProblems);
      setAllProblems(freshProblems);
      setPool(newPool);
      setLastDraw(newLastDraw);
      setNeedsSync(false);
      await saveLastListSlug(activeList.slug);
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="self-start text-sm text-lc-orange hover:underline cursor-pointer"
        >
          ← Back to lists
        </button>
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
        <button
          onClick={onBack}
          className="self-start text-sm text-lc-orange hover:underline cursor-pointer"
        >
          ← Back to lists
        </button>
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
        <button
          onClick={onBack}
          className="self-start text-sm text-lc-orange hover:underline cursor-pointer"
        >
          ← Back to lists
        </button>
        <div className="rounded-lg border border-[var(--border)] p-6 text-center">
          <p className="text-sm text-[var(--muted)]">This list is empty.</p>
          <a
            href="https://leetcode.com/problems/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-lc-orange hover:underline"
          >
            Add problems on LeetCode
          </a>
        </div>
      </div>
    );
  }

  const poolEmpty = pool.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-lc-orange hover:underline cursor-pointer"
        >
          ← Back to lists
        </button>
        <span className="text-xs text-[var(--muted)]">
          {activeList.name} · {categoryLabels[activeList.type]}
        </span>
      </div>

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
            problem{pool.length !== 1 ? "s" : ""} in the pool — problems not yet
            drawn from <strong>{activeList.name}</strong>
          </p>
          <p>
            <strong className="text-[var(--foreground)]">{batchSize}</strong>{" "}
            drip size — problems drawn per click
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <DripButton
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
            Last Drip
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

export default DrawingView;
