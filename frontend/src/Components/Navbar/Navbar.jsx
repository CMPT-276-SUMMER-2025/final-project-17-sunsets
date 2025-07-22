import React, { useState } from 'react';
import './Navbar.css';
import logo from '../../assets/MetropoLive.jpg';

export default function Navbar({ onSearch }) {
  const [location, setLocation] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(location);
  };

  return (
    <header className="header">
      <div className="brand">
        <img src={logo} alt="MetropoLive Logo" className="logo" />
        <h1 className="title">MetropoLive</h1>
      </div>
      <form onSubmit={onSubmit} className="form">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter Location"
          className="input"
        />
        <button type="submit" className="button">🔍</button>
      </form>
    </header>
  );
}