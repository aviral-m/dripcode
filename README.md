# DripCode

A Chrome extension that randomizes your LeetCode favorites into daily practice batches. Uses a deck-of-cards model: drawn problems are removed from the pool until you reset.

## Features

- Draw random problems from any LeetCode favorites list
- Configurable drip size (1–10 problems per draw)
- Pool tracking — shows remaining problems at a glance
- Sync with LeetCode to pick up new favorites
- Daily reminder notifications

## Prerequisites

- Node.js 18+
- npm

## Setup & Build

```bash
npm install
npm run build
```

Output goes to `dist/`.

## Install in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

The extension icon will appear in your toolbar. Pin it for quick access.

## Usage

1. Click the DripCode icon in the toolbar
2. Sign in to LeetCode (if prompted) — the extension reads your cookies for auth
3. Select a favorites list
4. Adjust drip size with the gear icon (default: 3)
5. Click **Drip** to draw problems — each opens in a new background tab
6. Use **Reset pool** to return all problems to the pool
7. Click **Sync with LeetCode** to refresh from your favorites

## Development

```bash
npm run dev     # Vite dev server with HMR
npm run build   # TypeScript check + production build
npm run lint    # ESLint
```

### Icons

```bash
npm run generate-icons
```

Reads `public/icons/icon.svg` and outputs 16×16, 48×48, and 128×128 PNGs.
