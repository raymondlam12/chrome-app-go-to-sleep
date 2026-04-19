let originalUrl = null;
let matchedPattern = null;
let correctAnswer = null;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateChallenge() {
  const a = randInt(100, 999);
  const b = randInt(100, 999);
  correctAnswer = a * b;
  document.getElementById("equation").textContent = `${a} × ${b} = ?`;
}

async function getRules() {
  const data = await chrome.storage.sync.get("rules");
  return data.rules || [];
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  originalUrl = params.get("dest");

  if (!originalUrl) {
    document.querySelector(".card").innerHTML =
      '<p style="color:#888;font-size:14px;text-align:center;">Nothing to unblock.</p>';
    document.getElementById("sub-text").textContent = "You navigated here directly.";
    return;
  }

  const rules = await getRules();
  for (const rule of rules) {
    if (originalUrl.includes(rule.urlPattern)) {
      matchedPattern = rule.urlPattern;
      break;
    }
  }

  generateChallenge();
}

document.getElementById("submit-btn").addEventListener("click", async () => {
  const input = document.getElementById("answer-input");
  const val = parseInt(input.value, 10);

  if (isNaN(val) || val !== correctAnswer) {
    input.classList.remove("shake");
    void input.offsetWidth;
    input.classList.add("shake");
    input.value = "";
    input.addEventListener("animationend", () => input.classList.remove("shake"), { once: true });
    return;
  }

  if (matchedPattern) {
    await chrome.runtime.sendMessage({ type: "GRANT_BYPASS", pattern: matchedPattern });
  }

  window.location.href = originalUrl;
});

document.getElementById("answer-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("submit-btn").click();
});

init();
