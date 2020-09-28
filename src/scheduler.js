function scheduleWork(task, rootFiber) {
  requestIdleCallback((props) => task(props, rootFiber));
}

export {
  scheduleWork,
}
