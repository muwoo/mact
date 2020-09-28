import {reCall, currentRoot} from './reconciler';

let hooks = {list: [], effects: []};
let cursor = 0;

export function resetCursor() {
  cursor = 0;
}
function useState(initState) {
  let state = initState;
  let currentIndex = cursor;
  const update = (newState) => {
    if (newState !== initState) {
      hooks.list[currentIndex] = newState;
      const wipRoot = {
        node: currentRoot.node,
        props: currentRoot.props,
        alternate: currentRoot,
      };
      reCall(wipRoot);
    }
  };
  if (hooks.list[cursor]) {
    state = hooks.list[cursor];
  }
  cursor += 1;
  return [state, update]
}

function useEffect(callback, dep) {
  // 模拟异步
  setTimeout(() => {
    if (!hooks.effects[cursor]) {
      hooks.effects[cursor] = {
        callback,
        dep,
      };
      callback();
    } else {
      if (JSON.stringify(hooks.effects[cursor].dep) !== JSON.stringify(dep)) {
        hooks.effects[cursor] = {
          callback,
          dep,
        };
        callback();
      }
    }
  });
}

export {
  useState,
  useEffect,
}
