let workers = [];
let running = false;

let score = 0;
let startTime = 0;
let graphData = [];

const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

const DURATION = 20000; // 20 seconds

// draw graph
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(0, canvas.height);

  for (let i = 0; i < graphData.length; i++) {
    const x = (i / graphData.length) * canvas.width;
    const y = canvas.height - graphData[i];
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = "#22c55e";
  ctx.stroke();
}

function updateGraph(value) {
  graphData.push(value);
  if (graphData.length > 100) graphData.shift();
  drawGraph();
}

function startBenchmark() {
  if (running) return;

  running = true;
  score = 0;
  graphData = [];
  startTime = Date.now();

  document.getElementById("status").innerText = "Status: Running 20s benchmark...";
  document.getElementById("score").innerText = "Score: running...";

  const cores = navigator.hardwareConcurrency || 4;

  for (let i = 0; i < cores; i++) {
    const worker = new Worker("worker.js");

    worker.onmessage = (e) => {
      if (e.data.type === "result") {
        score += e.data.value;
        updateGraph(e.data.value / 5000);
      }
    };

    worker.postMessage({ type: "start" });
    workers.push(worker);
  }

  // stop after 20 seconds
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
  document.getElementById("score").innerText = "Score: " + Math.floor(score);
}

document.getElementById("start").onclick = startBenchmark;
document.getElementById("stop").onclick = stopBenchmark;
