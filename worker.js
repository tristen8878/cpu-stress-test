let running = false;

function work() {
  function loop() {
    if (!running) return;

    let ops = 0;

    for (let i = 0; i < 2e6; i++) {
      Math.sqrt(i * Math.random());
      ops++;
    }

    postMessage({
      type: "result",
      value: ops
    });

    setTimeout(loop, 0);
  }

  loop();
}

onmessage = function (e) {
  if (e.data.type === "start") {
    running = true;
    work();
  }

  if (e.data.type === "stop") {
    running = false;
    close();
  }
};
