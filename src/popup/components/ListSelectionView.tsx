import { useEffect, useState } from "react";
import type { ActiveList, FavoriteList } from "../../shared/types";
import {
  fetchCreatedLists,
  fetchCollectedLists,
} from "../../shared/leetcode";

interface ListSectionProps {
  title: string;
  lists: FavoriteList[];
  type: ActiveList["type"];
  activeSlug: string | null;
  onSelectList: (list: ActiveList) => void;
}

function ListSection({
  title,
  lists,
  type,
  activeSlug,
  onSelectList,
}: ListSectionProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h2>
      <div className="flex flex-col gap-1.5">
        {lists.map((list) => {
          const isActive = activeSlug === list.slug;
          return (
            <button
              key={list.slug}
              onClick={() => onSelectList({ ...list, type })}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-left cursor-pointer transition-colors ${
                isActive
                  ? "border-lc-orange bg-lc-orange/5 text-lc-orange font-medium"
                  : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)] active:bg-[var(--border)]"
              }`}
            >
              <span className="flex items-center justify-between">
                {list.name}
                {isActive && <span className="text-lc-orange">✓</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ListSelectionViewProps {
  activeListSlug: string | null;
  onSelectList: (list: ActiveList) => void;
}

function ListSelectionView({
  activeListSlug,
  onSelectList,
}: ListSelectionViewProps) {
  const [createdLists, setCreatedLists] = useState<FavoriteList[]>([]);
  const [collectedLists, setCollectedLists] = useState<FavoriteList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const [created, collected] = await Promise.all([
        fetchCreatedLists(),
        fetchCollectedLists(),
      ]);
      setCreatedLists(created);
      setCollectedLists(collected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-lc-orange border-t-transparent" />
        <span className="text-sm text-[var(--muted)]">
          Loading your lists...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadLists}
          className="mt-2 text-sm text-lc-orange hover:underline cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (createdLists.length === 0 && collectedLists.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 text-center">
        <p className="text-sm text-[var(--muted)]">No lists found.</p>
        <a
          href="https://leetcode.com/problems/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-lc-orange hover:underline"
        >
          Browse problems on LeetCode
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--muted)]">
        Select a list to draw problems from:
      </p>

      {createdLists.length > 0 && (
        <ListSection
          title="My Lists"
          lists={createdLists}
          type="created"
          activeSlug={activeListSlug}
          onSelectList={onSelectList}
        />
      )}

      {collectedLists.length > 0 && (
        <ListSection
          title="Saved by Me"
          lists={collectedLists}
          type="collected"
          activeSlug={activeListSlug}
          onSelectList={onSelectList}
        />
      )}
    </div>
  );
}

export default ListSelectionView;
