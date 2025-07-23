import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import EventSearch from './Components/EventSearch/EventSearch'
import EventList from './Components/EventList/EventList'
import './App.css'

function App() {
  // Main app state - controls what the user sees and manages data flow
  const [searchParams, setSearchParams] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // Start with search form visible
  const [currentLocation, setCurrentLocation] = useState(''); // User's entered location
  const [locationSubmitted, setLocationSubmitted] = useState(false); // Tracks if user submitted location

  // When user submits search form, switch to results view
  const handleSearch = (params) => {
    setSearchParams(params);
    setShowSearch(false);
  };

  // Back button handler - return to search form and clear previous results
  const handleBackToSearch = () => {
    setShowSearch(true);
    setSearchParams(null);
  };

  // Update location as user types (for real-time feedback)
  const handleLocationChange = (location) => {
    setCurrentLocation(location);
  };

  // When user hits Enter in location field, mark as submitted
  const handleLocationSubmit = (location) => {
    setCurrentLocation(location);
    setLocationSubmitted(true);
  };

  return (
    <div className="app">
      {/* Top navigation bar with app title and location input */}
      <Navbar onLocationChange={handleLocationChange} onLocationSubmit={handleLocationSubmit} />
      
      <main className="app-main">
        {/* Main content area - either search form or results */}
        <div className="content-panel">
          {showSearch ? (
            // Show search form when user hasn't submitted yet
            <EventSearch 
              onSearch={handleSearch} 
              currentLocation={currentLocation}
              isVisible={locationSubmitted}
            />
          ) : (
            // Show results with back button after search
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
