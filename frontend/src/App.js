import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [apologies, setApologies] = useState([]);
  const [person, setPerson] = useState('');
  const [count, setCount] = useState('');

  useEffect(() => {
    fetchApologies();
  }, []);

  const fetchApologies = async () => {
    try {
      const response = await axios.get('https://apologyhandler.azurewebsites.net/api/GetAllApologies');
      setApologies(response.data);
    } catch (error) {
      console.error('Error fetching apologies:', error);
    }
  };

  const handlePersonChange = (e) => setPerson(e.target.value);
  const handleCountChange = (e) => setCount(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://apologyhandler.azurewebsites.net/api/postapologies', {
        userId: person,
        count: parseInt(count, 10)
      });
      setApologies(apologies.map(apology => apology.userId === person
        ? { ...apology, count: response.data.count }
        : apology
      ));
      if (!apologies.some(apology => apology.userId === person)) {
        setApologies([...apologies, response.data]);
      }
      setPerson('');
      setCount('');
    } catch (error) {
      console.error('Error posting apology:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.post(`https://apologyhandler.azurewebsites.net/api/deleteapology?userId=${userId}`);
      setApologies(apologies.filter(apology => apology.userId !== userId));
    } catch (error) {
      console.error('Error deleting apology:', error);
    }
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
            {apologies.map(({ userId, count }) => (
              <li key={userId}>
                {`${userId}: ${count} sorry(s)`}
                <FontAwesomeIcon
                  icon={faTrash}
                  onClick={() => handleDelete(userId)}
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
