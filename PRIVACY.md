# Privacy Policy for DripCode

**Last updated:** June 10, 2026

## Data Collection

DripCode **does not collect, transmit, or share any personal data**. All data processed by the extension remains on your device.

## Data Accessed

### LeetCode Authentication Cookies

DripCode reads two cookies from `leetcode.com` — `csrftoken` and `LEETCODE_SESSION` — solely to authenticate GraphQL API requests that fetch your favorites lists. These cookies are:

- Read only when you interact with the extension (e.g., loading lists or syncing)
- Never stored by the extension
- Never sent to any server other than LeetCode's own API (`https://leetcode.com/*`)

### Local Storage

The following data is stored locally on your device using `chrome.storage.local`:

- **Favorites list ID** — the list you selected
- **Problem pool** — the list of problems in your current pool
- **Drawn problems** — problems previously drawn (to track remaining count)
- **Settings** — your drip batch size and daily reminder preferences
- **Sync metadata** — timestamps and counts for detecting changes to your LeetCode favorites

This data never leaves your device and is cleared if you uninstall the extension.

## Permissions Justification

| Permission | Purpose |
|---|---|
| `cookies` | Read LeetCode auth cookies to call the LeetCode GraphQL API |
| `storage` | Store your problem pool and settings locally |
| `alarms` | Schedule daily reminder notifications |
| `notifications` | Show daily reminder notifications |
| `https://leetcode.com/*` | Access the LeetCode GraphQL API |

## Third-Party Services

DripCode communicates only with `https://leetcode.com/graphql` to fetch your favorites lists. No other external services are contacted.

## Contact

If you have questions about this privacy policy, please open an issue on the extension's GitHub repository.
