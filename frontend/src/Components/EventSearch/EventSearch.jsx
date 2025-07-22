import { useState } from 'react';
import './EventSearch.css';

const EventSearch = ({ onSearch }) => {
  // State to store form data: location, number of events, and optional keywords
  const [searchData, setSearchData] = useState({
    location: '',
    eventCount: 10,
    keywords: ''
  });

  // Handle form submission - prevent default and pass data to parent component
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchData);
  };

  // Handle input changes - update state with new values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="event-search">
      <h2>Find Events Near You</h2>
      <form onSubmit={handleSubmit} className="search-form">
        {/* Location input field - required */}
        <div className="form-group">
          <label htmlFor="location">Location:</label>
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