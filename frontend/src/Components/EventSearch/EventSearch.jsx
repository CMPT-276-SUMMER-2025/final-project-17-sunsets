// React hook for managing component state
import { useState } from 'react';
// Import CSS styles for this component
import './EventSearch.css';

/**
 * EventSearch Component
 * 
 * This component provides a form for users to search for events.
 * It collects event count, distance radius, and optional keywords, then passes this data
 * to the parent component when the form is submitted.
 * Location is now handled by the header component.
 * 
 * @param {Function} onSearch - Callback function called when form is submitted
 * @param {Object} onSearch.params - Search parameters object
 * @param {number} onSearch.params.eventCount - Number of events to display
 * @param {number} onSearch.params.radius - Search radius in miles
 * @param {string} onSearch.params.keywords - Optional keywords to filter events
 * @param {string} currentLocation - Current location from header component
 */
const EventSearch = ({ onSearch, currentLocation }) => {
  // useState hook to manage the form data
  // searchData: Object containing all form field values
  // setSearchData: Function to update the form data
  const [searchData, setSearchData] = useState({
    eventCount: 10,      // Number of events to show (default 10)
    radius: 50,          // Search radius in miles (default 50)
    category: ''         // Optional category filter
  });

  /**
   * Handle form submission
   * 
   * This function is called when the user clicks the "Search Events" button
   * or presses Enter in any form field.
   * 
   * @param {Event} e - The form submission event object
   */
  const handleSubmit = (e) => {
    // Prevent the default form submission behavior (page reload)
    e.preventDefault();
    
    // Check if location is provided
    if (!currentLocation.trim()) {
      alert('Please enter a location in the header to search for events.');
      return;
    }
    
    // Combine search data with location from header
    const searchParams = {
      ...searchData,
      location: currentLocation,
      keywords: searchData.category  // Map category to keywords for API compatibility
    };
    
    // Call the onSearch function passed from the parent component
    // This passes the combined search parameters to the parent component
    onSearch(searchParams);
  };

  /**
   * Handle input field changes
   * 
   * This function is called whenever the user types in any form field.
   * It updates the corresponding property in the searchData state.
   * 
   * @param {Event} e - The input change event object
   */
  const handleChange = (e) => {
    // Destructure the name and value from the event target (the input field)
    // name comes from the input's name attribute (location, eventCount, keywords)
    // value is the current text in the input field
    const { name, value } = e.target;
    
    // Update the searchData state with the new value
    // prev => ({ ...prev, [name]: value }) is a function that:
    // 1. Takes the previous state (prev)
    // 2. Spreads all existing properties (...prev)
    // 3. Updates only the property that changed ([name]: value)
    setSearchData(prev => ({
      ...prev,
      [name]: name === 'eventCount' || name === 'radius' ? parseInt(value) : value
    }));
  };



  // JSX return statement - renders the search form
  return (
    <div className="event-search">
      <h2>Find Events Near You</h2>
      {/* 
        Form element with onSubmit handler
        When the form is submitted (Enter key or button click), handleSubmit is called
      */}
      <form onSubmit={handleSubmit} className="search-form">

        
        {/* Category input for filtering events */}
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          {/* 
            Category input field
            - Optional field for filtering events by category
            - placeholder provides helpful examples
            - Same controlled component pattern as other inputs
          */}
          <input
            type="text"
            id="category"
            name="category"
            value={searchData.category}
            onChange={handleChange}
            placeholder="e.g., music, sports, food"
          />
        </div>
        
        {/* Distance radius input */}
        <div className="form-group">
          <label htmlFor="radius">Search Radius (miles):</label>
          {/* 
            Distance radius input field
            - Allows users to enter any radius value they want
            - Controlled component pattern with value and onChange
            - name="radius" identifies this field in handleChange
            - type="number" ensures only numeric input
            - min="1" prevents negative or zero values
            - max="500" sets a reasonable upper limit
          */}
          <input
            type="number"
            id="radius"
            name="radius"
            value={searchData.radius}
            onChange={handleChange}
            min="1"
            max="500"
            placeholder="e.g., 25"
          />
        </div>
        
        {/* Number of events input */}
        <div className="form-group">
          <label htmlFor="eventCount">Number of Events:</label>
          {/* 
            Number of events input field
            - Allows users to enter any number of events they want
            - Controlled component pattern with value and onChange
            - name="eventCount" identifies this field in handleChange
            - type="number" ensures only numeric input
            - min="1" prevents negative or zero values
            - max="50" sets a reasonable upper limit for API performance
          */}
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
        
        {/* Submit button to trigger search */}
        <button type="submit" className="search-button">
          Search Events
        </button>
      </form>
    </div>
  );
};

export default EventSearch; 