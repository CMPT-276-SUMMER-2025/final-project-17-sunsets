import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import EventSearch from './Components/EventSearch/EventSearch'
import EventList from './Components/EventList/EventList'
import MapView from './Components/MapView/MapView'
import './App.css'

function App() {
  // Main app state - controls what the user sees and manages data flow
  const [searchParams, setSearchParams] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // Start with search form visible
  const [currentLocation, setCurrentLocation] = useState(''); // User's entered location
  const [locationSubmitted, setLocationSubmitted] = useState(false); // Tracks if user submitted location
  const [submittedLocation, setSubmittedLocation] = useState(''); // Location that was actually submitted
  const [events, setEvents] = useState([]); // Store events for map markers

  // When user submits search form, switch to results view
  const handleSearch = (params) => {
    setSearchParams(params);
    setShowSearch(false);
    // Clear existing events when new search is performed
    setEvents([]);
  };

  // Back button handler - return to search form and clear previous results
  const handleBackToSearch = () => {
    setShowSearch(true);
    setSearchParams(null);
    setEvents([]); // Clear events when going back to search
  };

  // Update location as user types (for real-time feedback)
  const handleLocationChange = (location) => {
    setCurrentLocation(location);
  };

  // When user hits Enter in location field, mark as submitted
  const handleLocationSubmit = (location) => {
    setCurrentLocation(location);
    setLocationSubmitted(true);
    setSubmittedLocation(location); // Store the location that was submitted for geocoding
  };

  // Update events when EventList fetches them
  const handleEventsUpdate = (newEvents) => {
    setEvents(newEvents);
  };

  return (
    <div className="app">
      {/* Top navigation bar with app title and location input */}
      <Navbar onLocationChange={handleLocationChange} onLocationSubmit={handleLocationSubmit} />
      
      <main className="app-main">
        {/* Map panel on the left - takes up 2/3 of the page */}
        <MapView 
          location={currentLocation} 
          submittedLocation={submittedLocation}
          events={events}
        />
        
        {/* Content panel on the right - takes up 1/3 of the page */}
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
              <EventList 
                searchParams={searchParams} 
                onEventsUpdate={handleEventsUpdate}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
