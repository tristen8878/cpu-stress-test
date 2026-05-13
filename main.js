let workers = [];
let running = false;

let singleScore = 0;
let multiScore = 0;

const SINGLE_DURATION = 5000;
const MULTI_DURATION = 20000;

const threads = navigator.hardwareConcurrency || "Unknown";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("threads").innerText =
    "Threads: " + threads;

  document.getElementById("start").onclick = startBenchmark;
  document.getElementById("stop").onclick = stopBenchmark;

  renderLeaderboard();
});

function startBenchmark() {
  if (running) return;
  running = true;

  document.getElementById("status").innerText =
    "Running single-thread test...";

  document.getElementById("score").innerText = "Score: running...";

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

  setTimeout(stopBenchmark, MULTI_DURATION);
}

function stopBenchmark() {
  running = false;

  workers.forEach(w => {
    w.postMessage({ type: "stop" });
    w.terminate();
  });

  workers = [];

  const single = Math.floor(singleScore / 100000);
  const multi = Math.floor(multiScore / 100000);

  document.getElementById("status").innerText = "Finished";

  document.getElementById("score").innerText =
    `Single: ${single} | Multi: ${multi}`;

  saveToLeaderboard(multi);
  renderLeaderboard();
}

function saveToLeaderboard(finalScore) {
  const name =
    document.getElementById("nameInput").value || "Unknown CPU";

  const data = JSON.parse(localStorage.getItem("lb") || "[]");

  data.push({
    name,
    score: finalScore
  });

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
