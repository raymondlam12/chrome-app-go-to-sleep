const BLOCKED_URL = chrome.runtime.getURL("blocked.html");

function currentTimeStr() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function isTimeBlocked(startTime, endTime) {
  const now = currentTimeStr();
  return now >= startTime && now < endTime;
}

async function getRules() {
  const data = await chrome.storage.sync.get("rules");
  return data.rules || [];
}

async function getBypass(tabId, pattern) {
  const key = `bypass_${tabId}_${pattern}`;
  const data = await chrome.storage.session.get(key);
  const expiresAt = data[key];
  return expiresAt && Date.now() < expiresAt;
}

async function setBypass(tabId, pattern) {
  const key = `bypass_${tabId}_${pattern}`;
  await chrome.storage.session.set({ [key]: Date.now() + 5 * 60 * 1000 });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading") return;
  const url = tab.url || changeInfo.url;
  if (!url || url.startsWith(BLOCKED_URL) || url.startsWith("chrome://")) return;

  const rules = await getRules();

  for (const rule of rules) {
    if (!url.includes(rule.urlPattern)) continue;
    if (!isTimeBlocked(rule.startTime, rule.endTime)) continue;

    const bypassed = await getBypass(tabId, rule.urlPattern);
    if (bypassed) continue;

    chrome.tabs.update(tabId, { url: `${BLOCKED_URL}?dest=${encodeURIComponent(url)}` });
    return;
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GRANT_BYPASS") {
    const tabId = sender.tab.id;
    setBypass(tabId, msg.pattern).then(() => sendResponse({ ok: true }));
    return true;
  }
});
