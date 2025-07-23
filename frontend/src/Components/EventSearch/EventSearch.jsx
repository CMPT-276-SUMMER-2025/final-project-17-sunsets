// React hook for managing component state
import { useState } from 'react';
// Import CSS styles for this component
import './EventSearch.css';

/**
 * EventSearch Component
 * 
 * This provides a form for users to search for events.
 * It collects user input for event count, distance radius, date range, price range, and optional keywords, 
 * then passes this data to the parent component when the form is submitted. 
 * Location is now handled by the header component, and the search preferences will only become visible after the
 * user has entered a valid location in the header. 
 * 
 * @param {Function} onSearch - Callback function called when search pref form is submitted
 * @param {Object} onSearch.params - Search parameters object
 * @param {number} onSearch.params.eventCount - Number of events to display
 * @param {number} onSearch.params.radius - Search radius in kilometers
 * @param {string} onSearch.params.startDate - Start date for event search (YYYY-MM-DD)
 * @param {string} onSearch.params.endDate - End date for event search (same as start date)
 * @param {number} onSearch.params.priceMin - Minimum ticket price in CAD
 * @param {number} onSearch.params.priceMax - Maximum ticket price (also CAD)
 * @param {string} onSearch.params.keywords - Optional keywords to filter events
 * @param {string} currentLocation - Current location from site header component
 * @param {boolean} isVisible - Whether the search form should be visible (dependent on valid location input)
 */
const EventSearch = ({ onSearch, currentLocation, isVisible = false }) => {
  // useState hook to manage the form data
  // searchData: Object containing all form field values
  // setSearchData: Function to update the form data
  const [searchData, setSearchData] = useState({
    eventCount: 10,      // Number of events to show (default 10)
    radius: 80,          // Search radius in kilometers (default 80 km)
    startDate: '',       // Start date for event search
    endDate: '',         // End date for event search
    priceMin: '',        // Minimum ticket price in CAD
    priceMax: '',        // Maximum ticket price in CAD
    category: ''         // Optional category filter
  });

  const [isButtonActive, setIsButtonActive] = useState(false);

  /**
   * Handle form submission
   * 
   * This function is called when the user clicks the "Search Events" button
   * or presses Enter.
   * 
   * @param {Event} e - The form submission event object
   */
  const handleSubmit = (e) => {
    // Prevents the browser's default behavior for form submission, which is to reload the entire page.
    e.preventDefault();
    
    // Check if location is provided
    if (!currentLocation.trim()) {
      // If no location is provided, display an alert and return
      alert('Please enter a location in the header to search for events.');
      return;
    }
    
    setIsButtonActive(true);
    setTimeout(() => setIsButtonActive(false), 150);

    // Combine search data with location from header
    const searchParams = {
      ...searchData,
      location: currentLocation,
      keywords: searchData.category  // Map category to keywords for API compatibility
    };
    
    // Call the onSearch function passed from the parent component
    // Passes the combined search parameters as an argument to onSearch
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
      [name]: name === 'eventCount' || name === 'radius' || name === 'priceMin' || name === 'priceMax' ? 
        (value === '' ? '' : parseInt(value)) : value
    }));
  };



  // JSX return statement - renders the search form
  return (
    <div className={`event-search ${isVisible ? 'visible' : 'hidden'}`}>
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
          <label htmlFor="radius">Search Radius (km):</label>
          {/* 
            Distance radius input field
            - Allows users to enter any radius value they want
            - Controlled component pattern with value and onChange
            - name="radius" identifies this field in handleChange
            - type="number" ensures only numeric input
            - min="1" prevents negative or zero values
            - max="800" sets a reasonable upper limit for kilometers
          */}
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
        
        {/* Date range inputs */}
        <div className="form-group">
          <div className="date-inputs">
            {/* 
              Start date input field
              - Allows users to specify when they want to start looking for events
              - type="date" provides a date picker interface
              - min attribute prevents selecting past dates
            */}
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
            
            {/* 
              End date input field
              - Allows users to specify when they want to stop looking for events
              - type="date" provides a date picker interface
              - min attribute ensures end date is not before start date
            */}
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
        
        {/* Price range inputs */}
        <div className="form-group">
          <div className="price-inputs">
            {/* 
              Minimum price input field
              - Allows users to specify the minimum ticket price they're willing to pay
              - type="number" ensures only numeric input
              - min="0" allows free events
              - placeholder provides helpful example
            */}
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
            
            {/* 
              Maximum price input field
              - Allows users to specify the maximum ticket price they're willing to pay
              - type="number" ensures only numeric input
              - min="0" allows free events
              - placeholder provides helpful example
            */}
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
        <button type="submit" className={`search-button${isButtonActive ? ' active' : ''}`}>
          Search Events
        </button>
      </form>
    </div>
  );
};

export default EventSearch; 