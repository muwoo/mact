export let commitQueue = [];

export function isFn(r) {
  return r.type instanceof Function;
}

export function getNextFiber(fiber, next, index) {
  if (next) {
    next.return = fiber;
    commitQueue.push(fiber);
    return next;
  } else {
    if (!fiber.index) {
      commitQueue.push(fiber);
    }
    fiber.return.index = fiber.return.index + 1;
    return fiber.return;
  }
}

export function createFiber(parent, newFiber, oldFiber, type) {
  return {
    type: newFiber.type,
    props: newFiber.props,
    dom: oldFiber.dom,
    parent: parent,
    alternate: oldFiber,
    effectTag: type,
  }
}


