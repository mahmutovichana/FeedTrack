import { useState } from 'react'; 
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState('stranger');

  async function getBackendData() {
    try {
      const response = await fetch('https://feedtrack-backend.vercel.app/api');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const body = await response.json();
      setData(body.name);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <button onClick={ getBackendData }> Check me out for some backend data </button>
      <p>Hello {data}</p> 
    </>
  );
}

export default App;
