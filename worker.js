let runningWorker = false;

function burnCPU() {
  function loop() {
    if (!runningWorker) return;

    // heavy CPU load per cycle
    for (let i = 0; i < 5e7; i++) {
      Math.sqrt(i * Math.random());
    }

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
    close();
  }
};
