import { useState } from 'react';
import './Navbar.css';

/**
 * Navbar Component
 * 
 * This component displays the application title and provides a location input
 * for users to search for events in their area.
 * 
 * @param {Function} onLocationChange - Callback function called when location changes
 * @param {string} onLocationChange.location - New location value
 */
const Navbar = ({ onLocationChange }) => {
  // State to manage the location input value
  const [location, setLocation] = useState('');

  /**
   * Handle location input changes
   * 
   * This function is called whenever the user types in the location field.
   * It updates the local state and notifies the parent component.
   * 
   * @param {Event} e - The input change event object
   */
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    // Notify parent component of location change
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  /**
   * Handle form submission (Enter key press)
   * 
   * This function is called when the user presses Enter in the location field.
   * It prevents the default form submission behavior.
   * 
   * @param {Event} e - The form submission event object
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // The location change is already handled by handleLocationChange
  };

  return (
    <nav className="navbar">
      {/* Application title on the left */}
      <div className="navbar-title">
        <h1>MetropoLive</h1>
      </div>
      
      {/* Location input on the right */}
      <div className="navbar-location">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Enter your city..."
            className="location-input"
          />
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
