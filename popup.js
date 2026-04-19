async function getRules() {
  const data = await chrome.storage.sync.get("rules");
  return data.rules || [];
}

async function saveRules(rules) {
  await chrome.storage.sync.set({ rules });
}

function renderRules(rules) {
  const list = document.getElementById("rules-list");
  list.innerHTML = "";

  if (rules.length === 0) {
    list.innerHTML = '<li class="empty-state">No rules yet.</li>';
    return;
  }

  for (const rule of rules) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="rule-info">
        <span class="rule-pattern">${escapeHtml(rule.urlPattern)}</span>
        <span class="rule-time">${to12Hour(rule.startTime)} – ${to12Hour(rule.endTime)}</span>
      </div>
      <button class="btn-delete" data-id="${rule.id}" title="Delete">×</button>
    `;
    list.appendChild(li);
  }

  list.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const rules = await getRules();
      const updated = rules.filter((r) => r.id !== id);
      await saveRules(updated);
      renderRules(updated);
    });
  });
}

function to12Hour(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

document.getElementById("btn-add").addEventListener("click", async () => {
  const pattern = document.getElementById("input-pattern").value.trim();
  const startTime = document.getElementById("input-start").value;
  const endTime = document.getElementById("input-end").value;
  const errorEl = document.getElementById("form-error");

  if (!pattern || !startTime || !endTime) {
    errorEl.style.display = "block";
    return;
  }
  if (startTime >= endTime) {
    errorEl.textContent = "Start time must be before end time.";
    errorEl.style.display = "block";
    return;
  }

  errorEl.style.display = "none";

  const rules = await getRules();
  rules.push({ id: generateId(), urlPattern: pattern, startTime, endTime });
  await saveRules(rules);

  document.getElementById("input-pattern").value = "";
  document.getElementById("input-start").value = "";
  document.getElementById("input-end").value = "";

  renderRules(rules);
});

(async () => {
  const rules = await getRules();
  renderRules(rules);
})();
