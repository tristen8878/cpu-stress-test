let workers = [];
let running = false;

let score = 0;
const DURATION = 20000;

// show CPU threads
const threads = navigator.hardwareConcurrency || 'Unknown';
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("threads").innerText = "Threads: " + threads;

  document.getElementById("start").onclick = startBenchmark;
  document.getElementById("stop").onclick = stopBenchmark;
});

function startBenchmark() {
  if (running) return;
  running = true;

  score = 0;

  document.getElementById("status").innerText =
    "Status: Running for 20 seconds please wait!";

  document.getElementById("score").innerText = "Score: running...";

  const cores = navigator.hardwareConcurrency || 4;

  for (let i = 0; i < cores; i++) {
    const worker = new Worker("worker.js");

    worker.onmessage = (e) => {
      if (e.data.type === "result") {
        score += e.data.value;
      }
    };

    worker.postMessage({ type: "start" });
    workers.push(worker);
  }

  setTimeout(stopBenchmark, DURATION);
}

function stopBenchmark() {
  if (!running) return;

  running = false;

  workers.forEach(w => {
    w.postMessage({ type: "stop" });
    w.terminate();
  });

  workers = [];

  document.getElementById("status").innerText = "Status: Finished";

  document.getElementById("score").innerText =
    "Score: " + Math.floor(score / 100000);
}
