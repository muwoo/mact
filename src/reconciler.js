import {scheduleWork} from './scheduler';
import {isFn, getNextFiber, commitQueue, createFiber} from './utils';
import {createDom, updateDom} from './h';
import {resetCursor} from './hooks';
// 备份，用于diff
let currentRoot = null;
// 缓存将要删除的节点
let deletions = [];

let rootFiber = null;
let WIP = null;

const UPDATE = 0;
const PLACEMENT = 1;
const DELETE = 2;

function render(vnode, node) {
  // 构建根树
  rootFiber = {
    node,
    props: {
      children: [vnode],
    },
    alternate: currentRoot,
  };
  reCall(rootFiber);
}

function reCall(fiber) {
  scheduleWork(worker, fiber);
  rootFiber = fiber;
  resetCursor();
}

function worker(deadLine, fiber) {
  WIP = fiber;
  let shouldYield = false;
  while(WIP && !shouldYield) {
    WIP = reconciler(WIP);
    shouldYield = deadLine.timeRemaining() < 1
  }
  if (!WIP && fiber) {
    commitRoot();
  }
  scheduleWork(worker, WIP);
}

function reconciler(wipFiber) {
  isFn(wipFiber) ? updateFnComponent(wipFiber) : updateHostComponent(wipFiber);
  // return child node
  if (wipFiber.child) {
    return wipFiber.child;
  }
  // return sibling node
  let nextFiber = wipFiber;
  while(nextFiber) {
    const sibling = nextFiber.sibling;
    if (sibling) {
      return sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateFnComponent(wipFiber) {
  const children = [wipFiber.type()];
  reconcilerChildren(wipFiber, children);
}

function updateHostComponent(wipFiber) {
  if (!wipFiber.node) {
    wipFiber.node = createDom(wipFiber);
  }
  reconcilerChildren(wipFiber, wipFiber.props.children);
}

function reconcilerChildren(wipFiber, children) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let preFiber = null;

  while(index < children.length) {
    let newFiber = null;
    const element = children[index];
    const sameNode = oldFiber && element && oldFiber.type === element.type;

    if (sameNode) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        node: oldFiber.node,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: UPDATE,
      }
    }
    if (element && !sameNode) {
      newFiber = {
        type: element.type,
        props: element.props,
        node: null,
        parent: wipFiber,
        alternate: null,
        effectTag: PLACEMENT,
      }
    }
    if (oldFiber && !sameNode) {
      oldFiber.effectTag = DELETE;
      deletions.push(oldFiber)
    }
    if (index > 0) {
      preFiber.sibling = newFiber;
    } else {
      wipFiber.child = newFiber;
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    preFiber = newFiber;
    index += 1;
  }
}
function commitRoot() {
  deletions.forEach(commitWorker)
  commitWorker(rootFiber.child)
  currentRoot = rootFiber;
  rootFiber = null
}


function commitWorker(wipFiber) {
  if (!wipFiber) return;
  if (wipFiber.parent && wipFiber.node) {
    let parent = wipFiber.parent;
    while (!parent.node) {
      parent = parent.parent;
    }
    if (
      wipFiber.effectTag === PLACEMENT &&
      wipFiber.node != null
    ) {
      parent.node.append(wipFiber.node);
    } else if (
      wipFiber.effectTag === UPDATE &&
      wipFiber.node != null
    ) {
      updateDom(
        wipFiber.node,
        wipFiber.alternate.props,
        wipFiber.props
      )
    } else if (wipFiber.effectTag === DELETE) {
      commitDeletion(wipFiber, parent.node)
    }

  }
  commitWorker(wipFiber.child);
  commitWorker(wipFiber.sibling);
}

function commitDeletion(fiber, parent) {
  if (fiber.node) {
    parent.removeChild(fiber.node)
  } else {
    commitDeletion(fiber.child, parent)
  }
}


export {
  render,
  currentRoot,
  reCall,
}
