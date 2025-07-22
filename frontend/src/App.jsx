import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import EventSearch from './Components/EventSearch/EventSearch'
import EventList from './Components/EventList/EventList'
import './App.css'

function App() {
  // Store search parameters and control which view to show (search form vs results)
  const [searchParams, setSearchParams] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // Start with search form visible
  const [currentLocation, setCurrentLocation] = useState(''); // Store current location from header
  const [locationSubmitted, setLocationSubmitted] = useState(false); // Track if location has been submitted

  // Handle search submission - hide search form and show results
  const handleSearch = (params) => {
    setSearchParams(params);
    setShowSearch(false);
  };

  // Handle back button - return to search form and clear results
  const handleBackToSearch = () => {
    setShowSearch(true);
    setSearchParams(null);
  };

  // Handle location change from header
  const handleLocationChange = (location) => {
    setCurrentLocation(location);
  };

  // Handle location submission from header
  const handleLocationSubmit = (location) => {
    setCurrentLocation(location);
    setLocationSubmitted(true);
  };

  return (
    <div className="app">
      {/* Navbar with title and location input */}
      <Navbar onLocationChange={handleLocationChange} onLocationSubmit={handleLocationSubmit} />
      
      <main className="app-main">
        {/* Single scrollable panel that contains either search form or results */}
        <div className="content-panel">
          {showSearch ? (
            // Show search form when showSearch is true
            <EventSearch 
              onSearch={handleSearch} 
              currentLocation={currentLocation}
              isVisible={locationSubmitted}
            />
          ) : (
            // Show results with back button when showSearch is false
            <div className="results-container">
              <button className="back-button" onClick={handleBackToSearch}>
                ← Back to Search
              </button>
              <EventList searchParams={searchParams} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
