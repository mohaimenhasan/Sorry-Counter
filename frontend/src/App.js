import React, { useState } from 'react';
import './App.css';

function App() {
  const [apologies, setApologies] = useState({});
  const [person, setPerson] = useState('');
  const [count, setCount] = useState('');

  const handlePersonChange = (e) => setPerson(e.target.value);
  const handleCountChange = (e) => setCount(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCount = apologies[person] ? apologies[person] + parseInt(count, 10) : parseInt(count, 10);
    setApologies({ ...apologies, [person]: newCount });
    setPerson('');
    setCount('');
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>Sorry Counter</h1>
        </header>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Person's name"
            value={person}
            onChange={handlePersonChange}
            className="input"
          />
          <input
            type="number"
            placeholder="Number of sorries"
            value={count}
            onChange={handleCountChange}
            className="input"
          />
          <button type="submit" className="button">Add Sorry Count</button>
        </form>
        <div className="counter-list">
          <h2>Counts</h2>
          <ul>
            {Object.entries(apologies).map(([key, value]) => (
              <li key={key}>{`${key}: ${value} sorry(s)`}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
