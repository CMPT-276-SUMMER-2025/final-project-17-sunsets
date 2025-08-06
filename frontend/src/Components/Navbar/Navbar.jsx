import { useState } from 'react';
import './Navbar.css';
// Import the logo
import logo from '../../assets/MetropoLive.png';

/**
 * Navbar Component
 * 
 * The top navigation bar that shows the app title and lets users enter their location.
 * Once they submit a location, the search form becomes available.
 * 
 * @param {Function} onLocationChange - Called whenever user types in location field
 * @param {Function} onLocationSubmit - Called when user hits Enter or clicks button
 */
const Navbar = ({ onLocationChange, onLocationSubmit }) => {
  // Track what user types in the location field
  const [location, setLocation] = useState('');
  // Visual feedback when button is pressed
  const [isButtonActive, setIsButtonActive] = useState(false);

  /**
   * Update location state as user types
   * 
   * This runs every time the user types in the location input field.
   * We update our local state and also tell the parent component about the change.
   * 
   * @param {Event} e - The input change event
   */
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    // Let parent component know about the change
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  /**
   * Handle when user submits location (Enter key or button click)
   * 
   * This triggers the search form to become visible and tells the parent
   * that we have a valid location to work with.
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only proceed if user actually entered something
    if (location.trim()) {
      // Give visual feedback that button was pressed
      setIsButtonActive(true);
      setTimeout(() => setIsButtonActive(false), 150);
      
      // Tell parent component we have a location
      if (onLocationSubmit) {
        onLocationSubmit(location.trim());
      }
    }
  };

  return (
    <nav className="navbar">
      {/* App title with logo on the left side */}
      <div className="navbar-title">
        <img 
          src={logo} 
          alt="MetropoLive Logo" 
          className="navbar-logo clickable-logo"
          onClick={() => window.location.reload()}
          title="Click to refresh the page"
        />
        <h1>MetropoLive</h1>
      </div>
      
      {/* Location input and submit button on the right */}
      <div className="navbar-location">
        <form onSubmit={handleSubmit} className="location-form">
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Enter your location to start..."
            className="location-input"
          />
          <button 
            type="submit" 
            className={`enter-button${isButtonActive ? ' active' : ''}`}
            disabled={!location.trim()}
          >
            Enter
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
