# Favorites Sync Feature

## Overview

Add a sync mechanism that detects when the user's LeetCode favorites list has changed (new additions or removals) and lets them refresh the local pool. Combines a **manual Sync button** with an **automatic background count check** on popup open.

---

## Changes by File

### 1. `src/shared/storage.ts`

**New constants:**
- `LAST_SYNC_TIMESTAMP = 'dripcode_last_sync_timestamp'`
- `LAST_SYNC_COUNT = 'dripcode_last_sync_count'`

**New helpers:**
```typescript
loadLastSyncCount(): Promise<number | null>
saveLastSyncCount(count: number): Promise<void>
loadLastSyncTimestamp(): Promise<number | null>
saveLastSyncTimestamp(): Promise<void>
```

**Modified:** `saveAllProblems()` also persists timestamp + count.

---

### 2. `src/shared/leetcode.ts`

**New query** — fetches only the count (lightweight, no problem data):
```graphql
query favoriteQuestionList($favoriteSlug: String!) {
  favoriteQuestionList(favoriteSlug: $favoriteSlug, limit: 0) {
    totalLength
  }
}
```

**New exports:**
```typescript
fetchFavoriteCount(favoriteSlug: string): Promise<number>
```

---

### 3. `src/popup/App.tsx`

**New state:**
- `syncing: boolean` — loading state for manual sync
- `needsSync: boolean` — count check detected a change

**Init flow:**
1. Load cached data from storage (instant, same as today)
2. If cache exists → render immediately (no visible delay)
3. Spawn background count check:
   - `fetchFavoriteId()` → `fetchFavoriteCount(id)` → compare with `lastSyncCount`
   - If mismatch → `setNeedsSync(true)`, show badge on Sync button
   - On any error (auth/network) → silently swallow, fall back to cached data
4. If cache empty → full fetch (existing behavior with loading spinner)

**`handleSync()`:**
1. `setSyncing(true)`
2. `fetchAllFavoritedProblems()` → `freshProblems`
3. Smart merge (see algorithm below)
4. Save to storage: `allProblems`, `pool`, `lastDraw`, `lastSyncTimestamp`, `lastSyncCount`
5. Update React state
6. `setSyncing(false)`, `setNeedsSync(false)`
7. Show brief "Synced!" feedback

**UI additions:**
- Sync icon button (↻) — placed after the "Reset pool" button
- If `needsSync === true` → orange badge/dot on the icon
- If `syncing === true` → spinner replaces icon, button disabled
- After sync success → show "Synced!" text briefly (~2s)

---

## Smart Merge Algorithm

Preserves draw progress while incorporating the updated favorites list.

### Inputs
- `freshProblems` — current favorites from LeetCode API
- `existingPool` — undrawn problems from storage
- `existingLastDraw` — already drawn problems from storage

### Logic

```
freshSlugs = Set(freshProblems.map(titleSlug))
poolSlugs = Set(existingPool.map(titleSlug))
lastDrawSlugs = Set(existingLastDraw.map(titleSlug))

// Step 1: Keep undrawn problems that are still favorited
newPool = existingPool.filter(p => freshSlugs.has(p.titleSlug))

// Step 2: Add newly favorited problems not yet drawn
freshProblems.forEach(p => {
  if (!poolSlugs.has(p.titleSlug) && !lastDrawSlugs.has(p.titleSlug)) {
    newPool.push(p)
  }
})

// Step 3: Clean up lastDraw (remove unfavorited)
newLastDraw = existingLastDraw.filter(p => freshSlugs.has(p.titleSlug))
```

### Result table

| Scenario | Pool | LastDraw |
|---|---|---|
| Problem added to favorites | Added to pool | Unchanged |
| Problem removed from favorites | Removed | Removed |
| Problem was drawn, still favorited | Not added back | Stays |
| Problem was undrawn, still favorited | Stays | Unchanged |

---

## Error Handling

| Scenario | Background count check | Manual sync |
|---|---|---|
| Not logged in | Silently ignored, `needsSync = false` | Error shown on button |
| Network error | Silently ignored | Error shown on button |
| No favorites list | Silently ignored | Error shown on button |
| Count matches | `needsSync = false` | N/A |
| Count differs | `needsSync = true`, badge shown | Full re-fetch + merge |

---

## Data Flow Diagram

```
Popup opens
  |
  v
Load cache from chrome.storage.local
  |
  +-- Cache exists? ──Yes──> Render UI instantly
  |                                |
  |                                v
  |                         Background count check
  |                                |
  |                         fetchFavoriteId() → fetchFavoriteCount()
  |                                |
  |                    +──Count matches cached?──Yes──> Do nothing
  |                    |
  |                    No
  |                    |
  |                    v
  |              setNeedsSync(true) → badge on Sync button
  |
  +-- No cache? ──> Blocking full fetch (existing behavior)

User clicks Sync
  |
  v
fetchAllFavoritedProblems()
  |
  v
Smart merge → save to storage
  |
  v
Update React state → "Synced!" feedback
```
