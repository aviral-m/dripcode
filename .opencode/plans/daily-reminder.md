# Daily Drip Reminder

Add a configurable daily notification that reminds the user to practice DripCode.
Alarm/notifications use Chrome's built-in APIs; the UI lives on the list selection page.

## Manifest Changes

**`public/manifest.json`** — add `"alarms"` and `"notifications"` to the `permissions` array:

```json
"permissions": ["cookies", "storage", "alarms", "notifications"]
```

## New Types

**`src/shared/types.ts`** — add:

```ts
export interface ReminderSettings {
  enabled: boolean
  hour: number    // 0-23
  minute: number  // 0-59
}
```

## Storage

**`src/shared/storage.ts`** — new key and functions:

| Key | Default |
|-----|---------|
| `dripcode_reminder_settings` | `{ enabled: false, hour: 9, minute: 0 }` |

- `loadReminderSettings()` → `ReminderSettings`
- `saveReminderSettings(settings)` — persists to storage, then sends
  `{ type: "SET_REMINDER", settings }` to background worker via
  `chrome.runtime.sendMessage`

## Background Worker

**`src/background/index.ts`** — replace minimal worker with:

### Message handler (`chrome.runtime.onMessage`)
- **`SET_REMINDER`**: receives `{ enabled, hour, minute }`
  - If enabled: calculate next occurrence of the given hour:minute in epoch ms,
    call `chrome.alarms.create("daily-drip", { when, periodInMinutes: 1440 })`
  - If disabled: `chrome.alarms.clear("daily-drip")`
- **`CLEAR_BADGE`**: `chrome.action.setBadgeText({ text: "" })`

### Alarm handler (`chrome.alarms.onAlarm`)
- Fired for `"daily-drip"` alarm:
  - `chrome.action.setBadgeText({ text: "DRIP" })`
  - `chrome.notifications.create({ type: "basic", title: "DripCode",
    message: "Time for your daily drip!", iconUrl: "icons/icon128.png",
    requireInteraction: true })`

### Notification click handler (`chrome.notifications.onClicked`)
- `chrome.action.openPopup()` — opens DripCode popup
- `chrome.action.setBadgeText({ text: "" })`

### Keep existing `onInstalled` listener

## ReminderSettings Component

**`src/popup/components/ReminderSettings.tsx`**

A compact settings row with:

```
⏰ Daily Reminder          [OFF/ON]

Hour [▼ 9 ▲]  Minute [▼ 00 ▲]  [AM ▼]
```

- **Hour**: dropdown 1–12
- **Minute**: dropdown 00 / 15 / 30 / 45
- **AM/PM**: toggle
- Values persist immediately on change via `saveReminderSettings()`
- Stored internally as 24-hour time (0–23)

States:
- **Enabled + active**: toggle ON, pickers editable
- **Disabled**: toggle OFF, pickers grayed out

## Placement in ListSelectionView

**`src/popup/components/ListSelectionView.tsx`** — add the reminder section
**below** the scrollable list container:

```tsx
return (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-5 overflow-y-auto max-h-[320px] custom-scrollbar pr-2">
      {/* existing list sections */}
    </div>

    <ReminderSettings />
  </div>
)
```

This keeps it always visible without scrolling.

## Badge Cleanup in Popup

**`src/popup/components/ListSelectionView.tsx`** — on mount (inside existing
`useEffect`), send:

```ts
chrome.runtime.sendMessage({ type: "CLEAR_BADGE" })
```

## Build

No changes to `vite.config.ts` — background script entry point already exists.

## Implementation Order

1. Update manifest permissions
2. Add `ReminderSettings` type and storage functions
3. Rewrite background worker with alarm + notification logic
4. Build `ReminderSettings.tsx` component
5. Wire into `ListSelectionView.tsx`
6. Add badge cleanup on mount
7. Test: set time 1 min ahead, wait for alarm, verify notification + popup opens
   on click
