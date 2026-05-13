/* ======================= */
/* main.js */
/* ======================= */

let workers = [];
let running = false;

function startTest() {
  if (running) return;
  running = true;
  document.getElementById('status').innerText = 'Status: Running...';

  const cores = navigator.hardwareConcurrency || 4;

  for (let i = 0; i < cores; i++) {
    const worker = new Worker('worker.js');
    worker.postMessage('start');
    workers.push(worker);
  }
}

function stopTest() {
  running = false;
  workers.forEach(w => w.postMessage('stop'));
  workers = [];
  document.getElementById('status').innerText = 'Status: Stopped';
}

// Display thread count on load
const threadCount = navigator.hardwareConcurrency || 'Unknown';
document.getElementById('threads').innerText = 'Detected Threads: ' + threadCount;

document.getElementById('start').onclick = startTest;
document.getElementById('stop').onclick = stopTest;