import type { ActiveList, LeetCodeProblem, ReminderSettings } from "./types";

const KEYS = {
  POOL: "dripcode_pool",
  ALL_PROBLEMS: "dripcode_all_problems",
  LAST_DRAW: "dripcode_last_draw",
  BATCH_SIZE: "dripcode_batch_size",
  LAST_SYNC_TIMESTAMP: "dripcode_last_sync_timestamp",
  LAST_SYNC_COUNT: "dripcode_last_sync_count",
  ACTIVE_LIST: "dripcode_active_list",
  LAST_LIST_SLUG: "dripcode_last_list_slug",
  REMINDER_SETTINGS: "dripcode_reminder_settings",
};

export async function loadPool(): Promise<LeetCodeProblem[]> {
  const result = await chrome.storage.local.get(KEYS.POOL);
  return (result[KEYS.POOL] as LeetCodeProblem[]) ?? [];
}

export async function savePool(pool: LeetCodeProblem[]): Promise<void> {
  await chrome.storage.local.set({ [KEYS.POOL]: pool });
}

export async function loadAllProblems(): Promise<LeetCodeProblem[]> {
  const result = await chrome.storage.local.get(KEYS.ALL_PROBLEMS);
  return (result[KEYS.ALL_PROBLEMS] as LeetCodeProblem[]) ?? [];
}

export async function saveAllProblems(
  problems: LeetCodeProblem[],
): Promise<void> {
  await chrome.storage.local.set({
    [KEYS.ALL_PROBLEMS]: problems,
    [KEYS.LAST_SYNC_COUNT]: problems.length,
    [KEYS.LAST_SYNC_TIMESTAMP]: Date.now(),
  });
}

export async function loadLastSyncCount(): Promise<number | null> {
  const result = await chrome.storage.local.get(KEYS.LAST_SYNC_COUNT);
  return (result[KEYS.LAST_SYNC_COUNT] as number) ?? null;
}

export async function loadLastSyncTimestamp(): Promise<number | null> {
  const result = await chrome.storage.local.get(KEYS.LAST_SYNC_TIMESTAMP);
  return (result[KEYS.LAST_SYNC_TIMESTAMP] as number) ?? null;
}

export async function drawFromPool(count: number): Promise<LeetCodeProblem[]> {
  const pool = await loadPool();
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const drawn = shuffled.slice(0, count);
  const remaining = shuffled.slice(count);
  await savePool(remaining);
  await chrome.storage.local.set({ [KEYS.LAST_DRAW]: drawn });
  return drawn;
}

export async function resetPool(): Promise<void> {
  const all = await loadAllProblems();
  await savePool(all);
}

export async function getLastDraw(): Promise<LeetCodeProblem[]> {
  const result = await chrome.storage.local.get(KEYS.LAST_DRAW);
  return (result[KEYS.LAST_DRAW] as LeetCodeProblem[]) ?? [];
}

export async function getBatchSize(): Promise<number> {
  const result = await chrome.storage.local.get(KEYS.BATCH_SIZE);
  return (result[KEYS.BATCH_SIZE] as number) ?? 3;
}

export async function setBatchSize(size: number): Promise<void> {
  await chrome.storage.local.set({ [KEYS.BATCH_SIZE]: size });
}

export async function syncFavorites(
  freshProblems: LeetCodeProblem[],
): Promise<{ newPool: LeetCodeProblem[]; newLastDraw: LeetCodeProblem[] }> {
  const [existingPool, existingLastDraw, existingAllProblems] =
    await Promise.all([loadPool(), getLastDraw(), loadAllProblems()]);

  const freshSlugs = new Set(freshProblems.map((p) => p.titleSlug));
  const existingSlugs = new Set(existingAllProblems.map((p) => p.titleSlug));

  // Step 1: Keep undrawn problems that are still favorited
  const newPool = existingPool.filter((p) => freshSlugs.has(p.titleSlug));

  // Step 2: Add newly favorited problems not previously seen
  freshProblems.forEach((p) => {
    if (!existingSlugs.has(p.titleSlug)) {
      newPool.push(p);
    }
  });

  // Step 3: Clean up lastDraw (remove unfavorited)
  const newLastDraw = existingLastDraw.filter((p) =>
    freshSlugs.has(p.titleSlug),
  );

  // Save everything
  await Promise.all([
    saveAllProblems(freshProblems),
    savePool(newPool),
    chrome.storage.local.set({ [KEYS.LAST_DRAW]: newLastDraw }),
  ]);

  return { newPool, newLastDraw };
}

export async function saveActiveList(list: ActiveList | null): Promise<void> {
  await chrome.storage.local.set({ [KEYS.ACTIVE_LIST]: list });
}

export async function loadActiveList(): Promise<ActiveList | null> {
  const result = await chrome.storage.local.get(KEYS.ACTIVE_LIST);
  return (result[KEYS.ACTIVE_LIST] as ActiveList) ?? null;
}

export async function saveLastListSlug(slug: string): Promise<void> {
  await chrome.storage.local.set({ [KEYS.LAST_LIST_SLUG]: slug });
}

export async function loadLastListSlug(): Promise<string | null> {
  const result = await chrome.storage.local.get(KEYS.LAST_LIST_SLUG);
  return (result[KEYS.LAST_LIST_SLUG] as string) ?? null;
}

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
};

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const result = await chrome.storage.local.get(KEYS.REMINDER_SETTINGS);
  return (result[KEYS.REMINDER_SETTINGS] as ReminderSettings) ?? DEFAULT_REMINDER_SETTINGS;
}

export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<void> {
  await chrome.storage.local.set({ [KEYS.REMINDER_SETTINGS]: settings });
  await chrome.runtime.sendMessage({ type: "SET_REMINDER", settings }).catch(() => {});
}
