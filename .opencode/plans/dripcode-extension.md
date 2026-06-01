# Dripcode � LeetCode Daily Playlist Randomizer

## Project Overview

A Chrome Extension (Manifest V3) that fetches problems from a user's LeetCode favorites list and lets them draw randomized batches for practice. Uses a "deck of cards" model � drawn problems are removed from the pool until reset.

---

## Tech Stack

- **Language**: TypeScript
- **Build**: Vite 6 (vanilla, no Plasmo/WXT)
- **Framework**: React 18
- **Styling**: Tailwind CSS v4
- **Extension**: Manifest V3
- **Package Manager**: npm

---

## Auth Approach: Standalone (Cookies API)

- \permissions: ["cookies", "storage"]\
- \host_permissions: ["https://leetcode.com/*"]\
- Popup/background reads \LEETCODE_SESSION\ + \csrftoken\ via \chrome.cookies.get\
- Injects them into GraphQL fetch headers
- No content script needed � works from any tab

---

## Core Mechanics

- **Fetching**: Two small GraphQL queries (not \problemsetQuestionList\)
  1. \avoritesLists { allFavorites { idHash } }\ � discover favorites list hash
  2. \avoriteQuestionList(favoriteSlug, limit: 10000) { questions { titleSlug title difficulty frontendQuestionId } }\ � get all favorited problems with details
- **Pool**: Full favorites list stored in \chrome.storage.local\ as "remaining pool"
- **Draw**: Click draws N problems (user-configurable, default 3), opens them in new tabs, removes them from pool
- **Reset**: One-click restores pool to full favorites list
- **Persistence**: Pool state survives popup closes

---

## Project Structure

\\\
dripcode/
+-- public/
� +-- manifest.json
� +-- icons/ # icon16.png, icon48.png, icon128.png
+-- src/
� +-- popup/
� � +-- index.html
� � +-- main.tsx
� � +-- App.tsx
� � +-- App.css
� � +-- components/
� � +-- Header.tsx
� � +-- ProblemCard.tsx
� � +-- DrawButton.tsx
� � +-- Settings.tsx
� +-- background/
� � +-- index.ts # Service worker
� +-- shared/
� +-- types.ts
� +-- storage.ts # chrome.storage helpers
� +-- leetcode.ts # GraphQL client, cookie reader
+-- vite.config.ts
+-- tsconfig.json
+-- tsconfig.node.json
+-- postcss.config.js
+-- package.json
\\\

## Vite Build Config

- Multi-entry: \popup/index.html\ and \ackground/index.ts\
- \ase: './'\ for relative paths in Chrome
- Clean output to \dist/\

## Implementation Phases

### Phase 1: Scaffold

- \
  pm create vite\ with react-ts template
- Install: \ ailwindcss @tailwindcss/vite\, \@types/chrome\
- Configure vite.config.ts (multi-entry, base: './')
- Create manifest.json in public/
- Create placeholder icons

### Phase 2: API Layer (\src/shared/leetcode.ts\)

- \getLeetCodeCookies()\ � reads csrftoken + LEETCODE_SESSION via chrome.cookies API
- \etchGraphQL(query, variables)\ � posts to leetcode.com/graphql with cookie auth
- \etchFavoriteId()\ � query #1: get favorites list hash
- \etchFavoriteProblems(favoriteSlug)\ � query #2: get all favorited problems

### Phase 3: Pool Logic (\src/shared/storage.ts\)

- \loadPool()\ � get remaining pool from chrome.storage.local
- \savePool(pool)\ � persist pool
- \drawFromPool(count)\ � pick \count\ random items, remove from pool, return them
- \
  esetPool(problems)\ � refill pool with full list
- \getLastDraw()\ � get last drawn set for display

### Phase 4: Background Service Worker

- Minimal for now � lifecycle events, cookie access

### Phase 5: Popup UI

- \Header\ � "? Dripcode" branding
- \DrawButton\ � big primary button, disabled when pool empty
- \ResetButton\ � secondary, resets pool
- \ProblemCard\ � shows #, title, difficulty badge (??????), click to open
- \LastDraw\ � shows problems from last draw
- \Settings\ � batch size (1-10), difficulty filter

### Phase 6: Polish

- Loading skeleton
- Error states: "Not logged in", "No favorites", "Network error"
- Empty pool: "Pool empty! Reset to continue"
- Edge cases handle

## Edge Cases

- **Not logged in**: Detect missing cookies ? show login prompt
- **Empty favorites**: Show "Go favorite some problems!" with link
- **Pool exhausted**: Draw disabled, show reset prompt
- **Network error**: Retry with backoff, show toast
- **Rate limit (429)**: Exponential backoff

## User Choices (Recorded)

- **Batch behavior**: Draw without replacement (deck of cards)
- **Default batch size**: 3 (configurable 1-10)
- **Auth**: Standalone (cookies API)
- **Framework**: Vanilla Vite (no Plasmo/WXT)
- **API**: Two-query favorites approach (not problemsetQuestionList)
