# mact
react like frame


```jsx
import {render, h, useState, useEffect} from '../../src';

const App = () => {
  let [count, setCount] = useState(0);
  let [num, setNum] = useState(0);
  useEffect(() => {
    console.log('num has update');
  }, [num]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <button onClick={() => setNum(num + 1)}>{num}</button>
    </div>
  )
};

render(<App />, document.getElementById('root'));
```
