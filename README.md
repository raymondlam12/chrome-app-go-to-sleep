# Go To Sleep 😴

A Chrome extension that blocks distracting websites during your configured sleep hours, helping you enforce a healthy circadian rhythm and avoid doom-scrolling before bed.

## Features

- Define URL patterns and time windows when they should be blocked
- Bypass a block for 5 minutes (e.g. for a legitimate late-night check)
- Rules sync across devices via `chrome.storage.sync`
- No build step — plain HTML/CSS/JS, loads directly into Chrome

## Installing locally (developer mode)

1. Clone the repo:
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the repo directory.
5. The "Go To Sleep 😴" extension icon will appear in your toolbar.

## Usage

1. Click the toolbar icon to open the popup.
2. Enter a **URL pattern** (e.g. `youtube.com`), a **start time**, and an **end time**.
3. Click **Add Rule**. The rule is saved and takes effect immediately.
4. When you visit a blocked site during the configured window you are redirected to a blocked page. You can grant yourself a 5-minute bypass from that page.

## File structure

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (Manifest V3) |
| `background.js` | Service worker — intercepts tab navigations and enforces rules |
| `popup.html/css/js` | Extension popup UI for managing rules |
| `blocked.html/js` | Page shown when a site is blocked; handles bypass requests |

## Key implementation notes

- **Storage:** Rules are stored in `chrome.storage.sync` (synced across devices). Bypass state uses `chrome.storage.session` (cleared when the browser closes).
- **Blocking logic:** The service worker listens to `chrome.tabs.onUpdated`. On each `loading` event it checks whether the URL matches any rule and whether the current local time falls within the rule's window.
- **Bypass:** Granted per tab and URL pattern for 5 minutes via a session storage key (`bypass_<tabId>_<pattern>`).
- **Manifest V3:** Uses a service worker background script (not a persistent background page).

## Making changes

No build tooling is required. Edit any file, then in `chrome://extensions` click the reload button (↺) on the extension card to pick up the changes. For background script changes, the service worker restarts automatically on reload.
