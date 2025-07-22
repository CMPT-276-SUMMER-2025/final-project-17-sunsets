// React hook for managing component state
import { useState } from 'react';
// Import CSS styles for this component
import './EventSearch.css';

/**
 * EventSearch Component
 * 
 * This component provides a form for users to search for events.
 * It collects location, event count, and optional keywords, then
 * passes this data to the parent component when the form is submitted.
 * 
 * @param {Function} onSearch - Callback function called when form is submitted
 * @param {Object} onSearch.params - Search parameters object
 * @param {string} onSearch.params.location - City to search for events
 * @param {number} onSearch.params.eventCount - Number of events to display
 * @param {string} onSearch.params.keywords - Optional keywords to filter events
 */
const EventSearch = ({ onSearch }) => {
  // useState hook to manage the form data
  // searchData: Object containing all form field values
  // setSearchData: Function to update the form data
  const [searchData, setSearchData] = useState({
    location: '',        // City name entered by user
    eventCount: 10,      // Number of events to show (default 10)
    keywords: ''         // Optional search keywords
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
    
    // Call the onSearch function passed from the parent component
    // This passes the current searchData to the parent component
    onSearch(searchData);
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
      [name]: value
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
        {/* Location input field - required */}
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          {/* 
            Controlled input component
            - value={searchData.location} makes this a controlled component (React manages the value)
            - onChange={handleChange} calls our handler whenever the user types
            - name="location" is used in handleChange to know which field changed
            - required ensures the form can't be submitted without a location
          */}
          <input
            type="text"
            id="location"
            name="location"
            value={searchData.location}
            onChange={handleChange}
            placeholder="Enter your city or address"
            required
          />
        </div>
        
        {/* Dropdown to select number of events to display */}
        <div className="form-group">
          <label htmlFor="eventCount">Number of Events:</label>
          {/* 
            Controlled select component
            - value={searchData.eventCount} makes this controlled by React
            - onChange={handleChange} updates state when selection changes
            - name="eventCount" identifies this field in handleChange
          */}
          <select
            id="eventCount"
            name="eventCount"
            value={searchData.eventCount}
            onChange={handleChange}
          >
            <option value={5}>5 events</option>
            <option value={10}>10 events</option>
            <option value={15}>15 events</option>
            <option value={20}>20 events</option>
          </select>
        </div>
        
        {/* Optional keywords input for filtering events */}
        <div className="form-group">
          <label htmlFor="keywords">Keywords (optional):</label>
          {/* 
            Optional keywords input
            - Not required, so users can search without keywords
            - placeholder provides helpful examples
            - Same controlled component pattern as location input
          */}
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={searchData.keywords}
            onChange={handleChange}
            placeholder="e.g., music, sports, food"
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