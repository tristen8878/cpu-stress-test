let workers = [];
let running = false;

// show CPU threads
const threads = navigator.hardwareConcurrency || 'Unknown';
document.getElementById('threads').innerText =
  `Detected Threads: ${threads}`;

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
    w.terminate();
  });

  workers = [];

  document.getElementById('status').innerText = 'Status: Stopped';
}

document.getElementById('start').onclick = startTest;
document.getElementById('stop').onclick = stopTest;
