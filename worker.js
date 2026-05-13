/* ======================= */
/* worker.js */
/* ======================= */

let runningWorker = false;

function burnCPU() {
  while (runningWorker) {
    Math.sqrt(Math.random());
  }
}

onmessage = function(e) {
  if (e.data === 'start') {
    runningWorker = true;
    burnCPU();
  }

  if (e.data === 'stop') {
    runningWorker = false;
  }
};