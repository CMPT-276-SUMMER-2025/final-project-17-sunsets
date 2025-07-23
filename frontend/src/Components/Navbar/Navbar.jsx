import { useState } from 'react';
import './Navbar.css';

/**
 * Navbar Component
 * 
 * This component displays the application title and provides a location input
 * with an Enter button for users to search for events in their area.
 * 
 * @param {Function} onLocationChange - Callback function called when location changes
 * @param {string} onLocationChange.location - New location value
 * @param {Function} onLocationSubmit - Callback function called when Enter button is clicked
 */
const Navbar = ({ onLocationChange, onLocationSubmit }) => {
  // State to manage the location input value
  const [location, setLocation] = useState('');
  // State for button active visual feedback
  const [isButtonActive, setIsButtonActive] = useState(false);

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
   * Handle form submission (Enter key press or button click)
   * 
   * This function is called when the user presses Enter or clicks the Enter button.
   * It notifies the parent component that the location has been submitted.
   * 
   * @param {Event} e - The form submission event object
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only submit if location is not empty
    if (location.trim()) {
      // Visual feedback for button press
      setIsButtonActive(true);
      setTimeout(() => setIsButtonActive(false), 150);
      // Notify parent component that location has been submitted
      if (onLocationSubmit) {
        onLocationSubmit(location.trim());
      }
    }
  };

  return (
    <nav className="navbar">
      {/* Application title on the left */}
      <div className="navbar-title">
        <h1>MetropoLive</h1>
      </div>
      
      {/* Location input and Enter button on the right */}
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
