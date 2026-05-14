let workers = [];
let running = false;

let singleScore = 0;
let multiScore = 0;

const SINGLE_DURATION = 5000;
const MULTI_DURATION = 20000;

const ring = document.getElementById("ring");
const card = document.getElementById("card");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("threads").innerText =
    "Threads: " + (navigator.hardwareConcurrency || "Unknown");

  document.getElementById("start").onclick = startBenchmark;
  document.getElementById("stop").onclick = stopBenchmark;

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
    document.getElementById("score").innerText =
      `Single: ${current.single ?? current} | Multi: ${current.multi ?? ""}`;
  }, 16);
}

function animateRing(duration) {
  const total = duration;
  let elapsed = 0;

  const interval = setInterval(() => {
    elapsed += 100;

    const progress = elapsed / total;
    const offset = 125 - (125 * progress);

    if (ring) ring.style.strokeDashoffset = offset;

    if (elapsed >= total) clearInterval(interval);
  }, 100);
}

function startBenchmark() {
  if (running) return;
  running = true;

  card.classList.add("running");

  document.getElementById("status").innerText =
    "Running single-thread test...";

  runSingleThreadTest(() => {
    startMultiThreadTest();
  });
}

function runSingleThreadTest(callback) {
  singleScore = 0;

  const worker = new Worker("worker.js");

  worker.onmessage = (e) => {
    if (e.data.type === "result") {
      singleScore += e.data.value;
    }
  };

  worker.postMessage({ type: "start" });

  animateRing(SINGLE_DURATION);

  setTimeout(() => {
    worker.postMessage({ type: "stop" });
    worker.terminate();
    callback();
  }, SINGLE_DURATION);
}

function startMultiThreadTest() {
  multiScore = 0;
  workers = [];

  document.getElementById("status").innerText =
    "Running multi-thread test...";

  const cores = navigator.hardwareConcurrency || 4;

  for (let i = 0; i < cores; i++) {
    const worker = new Worker("worker.js");

    worker.onmessage = (e) => {
      if (e.data.type === "result") {
        multiScore += e.data.value;
      }
    };

    worker.postMessage({ type: "start" });
    workers.push(worker);
  }

  animateRing(MULTI_DURATION);

  setTimeout(stopBenchmark, MULTI_DURATION);
}

function stopBenchmark() {
  running = false;

  card.classList.remove("running");

  workers.forEach(w => {
    w.postMessage({ type: "stop" });
    w.terminate();
  });

  workers = [];

  const single = Math.floor(singleScore / 100000);
  const multi = Math.floor(multiScore / 100000);

  document.getElementById("status").innerText = "Finished";

  animateFinalScore(single, multi);

  saveToLeaderboard(multi);
  renderLeaderboard();
}

function animateFinalScore(single, multi) {
  let i = 0;

  const interval = setInterval(() => {
    i += 1;

    document.getElementById("score").innerText =
      `Single: ${Math.floor(single * i / 20)} | Multi: ${Math.floor(multi * i / 20)}`;

    if (i >= 20) {
      clearInterval(interval);
      document.getElementById("score").innerText =
        `Single: ${single} | Multi: ${multi}`;
    }
  }, 30);
}

function saveToLeaderboard(finalScore) {
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
