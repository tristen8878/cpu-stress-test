let runningWorker = false;

function burnCPU() {
  function loop() {
    if (!runningWorker) return;

    // Heavy work chunk
    for (let i = 0; i < 1e6; i++) {
      Math.sqrt(Math.random());
    }

    // Yield so stop message can be received
    setTimeout(loop, 0);
  }

  loop();
}

onmessage = function(e) {
  if (e.data === 'start') {
    runningWorker = true;
    burnCPU();
  }

  if (e.data === 'stop') {
    runningWorker = false;
    close(); // terminate worker
  }
};
