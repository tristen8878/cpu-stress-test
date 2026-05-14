let workers = [];
let running = false;

let score = 0;
const DURATION = 20000;

const ring = document.getElementById("ring");
const card = document.getElementById("card");

const threads = navigator.hardwareConcurrency || "Unknown";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("threads").innerText = "Threads: " + threads;

  document.getElementById("start").onclick = start;
  document.getElementById("stop").onclick = stop;
  document.getElementById("theme").onclick = toggleTheme;

  renderLeaderboard();
});

function animateScore(target) {
  let current = 0;
  const step = Math.ceil(target / 60);

  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    document.getElementById("score").innerText = current;
  }, 16);
}

function animateRing(ms) {
  const total = DURATION;
  const interval = setInterval(() => {
    const progress = ms / total;
    const offset = 125 - (125 * progress);
    ring.style.strokeDashoffset = offset;

    if (ms >= total) clearInterval(interval);
    ms += 100;
  }, 100);
}

function start() {
  if (running) return;
  running = true;

  score = 0;

  document.getElementById("status").innerText = "Running...";
  card.classList.add("running");

  const cores = navigator.hardwareConcurrency || 4;

  for (let i = 0; i < cores; i++) {
    const w = new Worker("worker.js");

    w.onmessage = e => {
      if (e.data.type === "result") {
        score += e.data.value;
      }
    };

    w.postMessage({ type: "start" });
    workers.push(w);
  }

  animateRing(0);

  setTimeout(stop, DURATION);
}

function stop() {
  if (!running) return;
  running = false;

  workers.forEach(w => {
    w.postMessage({ type: "stop" });
    w.terminate();
  });

  workers = [];

  const final = Math.floor(score / 100000);

  document.getElementById("status").innerText = "Finished";
  card.classList.remove("running");

  animateScore(final);

  save(final);
  renderLeaderboard();
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

function save(finalScore) {
  const name =
    document.getElementById("nameInput").value || "Unknown CPU";

  const data = JSON.parse(localStorage.getItem("lb") || "[]");

  data.push({ name, score: finalScore });

  data.sort((a, b) => b.score - a.score);

  localStorage.setItem("lb", JSON.stringify(data.slice(0, 10)));
}

function renderLeaderboard() {
  const data = JSON.parse(localStorage.getItem("lb") || "[]");

  const el = document.getElementById("boardList");

  if (!data.length) {
    el.innerHTML = "No results yet";
    return;
  }

  el.innerHTML = data
    .map((d, i) => `#${i + 1} ${d.name} - ${d.score}`)
    .join("<br>");
}
