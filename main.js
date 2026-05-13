let workers = [];
let running = false;

// Show thread count
const threadCount = navigator.hardwareConcurrency || 'Unknown';
document.getElementById('threads').innerText =
  'Detected Threads: ' + threadCount;

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

  workers.forEach(w => {
    w.postMessage('stop');
    w.terminate(); // extra safety
  });

  workers = [];
  document.getElementById('status').innerText = 'Status: Stopped';
}

document.getElementById('start').onclick = startTest;
document.getElementById('stop').onclick = stopTest;
