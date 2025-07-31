// React hook for managing component state
import { useState } from 'react';
// Import CSS styles for this component
import './EventSearch.css';

/**
 * EventSearch Component
 * 
 * The search form that appears after the user enters their location.
 * Collects all the search preferences like dates, price range, number of events, etc.
 * and sends them to the parent component when submitted.
 * 
 * @param {Function} onSearch - Called when form is submitted with search parameters
 * @param {string} currentLocation - The location user entered in the navbar
 * @param {boolean} isVisible - Whether this form should be shown (depends on location being entered)
 */
const EventSearch = ({ onSearch, currentLocation, isVisible = false }) => {
  // All the form field values - this is what gets sent to the API
  // The state variable default values can be seen in the search preferences form.
  const [searchData, setSearchData] = useState({
    eventCount: 10,      // How many events to show (default 10)
    radius: 80,          // Search radius in km (default 80km)
    startDate: '',       // When to start looking for events
    endDate: '',         // When to stop looking for events
    priceMin: '',        // Minimum price user wants to pay
    priceMax: '',        // Maximum price user wants to pay
    category: ''         // What type of events (music, sports, etc.)
  });

  // Visual feedback tracking for when button is pressed
  const [isButtonActive, setIsButtonActive] = useState(false);

  // Show error messages to user if something goes wrong
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handle when user submits the search form
   * 
   * This runs when they click "Search Events" or press "Enter".
   * We validate the input, prepare the data, and send it to the parent.
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = (e) => {
    // Stop the page from refreshing
    e.preventDefault();
    
    // Make sure user entered a location first
    if (!currentLocation.trim()) {
      setErrorMessage('Please enter a location in the header to search for events.');
      return;
    }
    
    // Give button press feedback, then reset after 150ms
    setIsButtonActive(true);
    setTimeout(() => setIsButtonActive(false), 150);

    // Clear any old error messages
    setErrorMessage('');

    // Combine our form data with the location from the navbar (header)
    const searchParams = {
      ...searchData,
      location: currentLocation,
      keywords: searchData.category  // API expects 'keywords' but we call it 'category'
    };
    
    // Send everything to the parent component
    onSearch(searchParams);
  };

  /**
   * Update form fields as user types
   * 
   * This runs every time the user changes any input field.
   * We update the corresponding value in our state.
   * 
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    // Get the field name and new value from the input
    const { name, value } = e.target;
    
    // Copy all previous state data, then update "name" with the new "value"
    // If the field is a number, convert the string to a number (parseInt); otherwise, keep the string
    setSearchData(prev => ({
      ...prev,
      [name]: name === 'eventCount' || name === 'radius' || name === 'priceMin' || name === 'priceMax' ? 
        (value === '' ? '' : parseInt(value)) : value
    }));
  };

  // Render the search form
  return (
    // Controls visibility of the entire form
    // If isVisible is true, the 'visible' class is added; otherwise the 'hidden' class is added
    <div className={`event-search ${isVisible ? 'visible' : 'hidden'}`}>
      <h2>Find Events Near You</h2>
      
      {/* Show error message if there is one */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {/* This section is the actual search form */}
      <form onSubmit={handleSubmit} className="search-form">

        
        {/* 
        What type of events users want (i.e., keywords for different interests)
        Note the use of 'handleChange' prop to update the state variable 'searchData' 
        */}
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            name="category"
            value={searchData.category}
            onChange={handleChange}
            placeholder="e.g., music, sports, food"
          />
        </div>
        
        {/* How far to look for events from the user's location input */}
        <div className="form-group">
          <label htmlFor="radius">Search Radius (km):</label>
          <input
            type="number"
            id="radius"
            name="radius"
            value={searchData.radius}
            onChange={handleChange}
            min="1"
            max="800"
            placeholder="e.g., 40"
          />
        </div>
        
        {/* 
        Date range for applicable events (i.e., start and end dates) 
        The min date for 'endDate' keyword is set to the start date, or today's date if no start date is given
        */}
        <div className="form-group">
          <div className="date-inputs">
            {/* Start date */}
            <div className="date-input">
              <label htmlFor="startDate">From:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={searchData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                placeholder="Start date"
              />
            </div>
            
            {/* End date */}
            <div className="date-input">
              <label htmlFor="endDate">To:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={searchData.endDate}
                onChange={handleChange}
                min={searchData.startDate || new Date().toISOString().split('T')[0]}
                placeholder="End date"
              />
            </div>
          </div>
        </div>
        
        {/* How much users want to spend on event tickets */}
        <div className="form-group">
          <div className="price-inputs">
            {/* Minimum price */}
            <div className="price-input">
              <label htmlFor="priceMin">Min Price (CAD):</label>
              <input
                type="number"
                id="priceMin"
                name="priceMin"
                value={searchData.priceMin}
                onChange={handleChange}
                min="0"
                max="1000"
                placeholder="e.g., 25"
              />
            </div>
            
            {/* Maximum price */}
            <div className="price-input">
              <label htmlFor="priceMax">Max Price (CAD):</label>
              <input
                type="number"
                id="priceMax"
                name="priceMax"
                value={searchData.priceMax}
                onChange={handleChange}
                min="0"
                max="1000"
                placeholder="e.g., 150"
              />
            </div>
          </div>
        </div>
        
        {/* How many events to show */}
        <div className="form-group">
          <label htmlFor="eventCount">Number of Events:</label>
          <input
            type="number"
            id="eventCount"
            name="eventCount"
            value={searchData.eventCount}
            onChange={handleChange}
            min="1"
            max="50"
            placeholder="e.g., 12"
          />
        </div>
        
        {/* Submit button */}
        <button type="submit" className={`search-button${isButtonActive ? ' active' : ''}`}>
          Search Events
        </button>
      </form>
    </div>
  );
};

export default EventSearch; 