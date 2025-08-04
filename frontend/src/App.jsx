import { useState, useCallback } from 'react'
import Navbar from './Components/Navbar/Navbar'
import EventSearch from './Components/EventSearch/EventSearch'
import EventList from './Components/EventList/EventList'
import MapView from './Components/MapView/MapView'
import RouteInput from './Components/RouteInput/RouteInput'
import './App.css'

/**
 * ===== Main App Component =====
 * 
 * This is the root component that manages the overall application state and coordinates
 * between different views including search, event listing, and routing functionality
 * 
 * The app implements a multi-view UI approach where users can:
 * - Search for events by location and various criteria
 * - View events on an interactive map with markers
 * - Access detailed routing information to plan trips to events
 * 
 * The component manages several key state variables that control key UX features:
 * - Search parameters and results
 * - Location tracking for map centering
 * - Route transit-mode options and event selection
 * - Basic loading transitions between search, results, and routing
 * 
 * @returns {JSX.Element} The main application component
 */
function App() {
  // Main app state - controls what the user sees and manages data flow
  const [searchParams, setSearchParams] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // Start with search form visible
  const [currentLocation, setCurrentLocation] = useState(''); // User's entered location
  const [locationSubmitted, setLocationSubmitted] = useState(false); // Tracks if user submitted location
  const [submittedLocation, setSubmittedLocation] = useState(''); // Location that was actually submitted
  const [events, setEvents] = useState([]); // Store events for map markers
  const [previousSearchData, setPreviousSearchData] = useState(null); // Store previous search form data
  
  // Route-related state variables
  const [isRouteMode, setIsRouteMode] = useState(false); // Controls when to show route input
  const [selectedEvent, setSelectedEvent] = useState(null); // Event user wants to route to
  const [currentRoute, setCurrentRoute] = useState(null); // Store calculated route data

  // When user submits search form, switch to results view
  const handleSearch = (params) => {
    setSearchParams(params);
    setShowSearch(false);
    // Store the search data for when user goes back to search
    setPreviousSearchData({
      eventCount: params.eventCount,
      radius: params.radius,
      startDate: params.startDate,
      endDate: params.endDate,
      priceMin: params.priceMin,
      priceMax: params.priceMax,
      category: params.keywords
    });
    // Clear existing events when new search is performed
    setEvents([]);
  };

  // Back button handler - return to search form and preserve previous search data
  const handleBackToSearch = () => {
    setShowSearch(true);
    setSearchParams(null);
    setIsRouteMode(false); // Exit route mode
    setSelectedEvent(null);
    setEvents([]); // Clear events when going back to search
    // Don't reset locationSubmitted - keep the location active
  };

  // Update location as user types (for real-time feedback)
  const handleLocationChange = (location) => {
    setCurrentLocation(location);
  };

  // When user hits Enter in location field, mark as submitted
  const handleLocationSubmit = (location) => {
    setCurrentLocation(location);
    setLocationSubmitted(true); // Boolean to prevent submission of location upon every keystroke
    setSubmittedLocation(location); // Store the location that was submitted for geocoding
    
    // Clear previous search results and show search form for new location
    setSearchParams(null);
    setShowSearch(true);
    setEvents([]); // Clear existing events
    // Clear previous search data when changing location
    setPreviousSearchData(null);
  };

  // Update events when EventList fetches them
  const handleEventsUpdate = useCallback((newEvents) => {
    setEvents(newEvents);
  }, []);

  // Handle route button click from event card
  const handleRouteRequest = useCallback((event) => {
    setSelectedEvent(event);
    setIsRouteMode(true);
    setShowSearch(false); // Hide search form
  }, []);

  // Handle back from route mode
  const handleBackFromRoute = useCallback(() => {
    setIsRouteMode(false);
    setSelectedEvent(null);
    setCurrentRoute(null); // Clear route data when exiting route mode
    // Return to event list view
    setShowSearch(false);
  }, []);

  // Handle route calculation results from RouteInput
  const handleRouteCalculated = useCallback((routeData) => {
    setCurrentRoute(routeData);
  }, []);

  return (
    <div className="app">
      {/* Top navigation bar with app title and location input */}
      <Navbar onLocationChange={handleLocationChange} onLocationSubmit={handleLocationSubmit} />
      
      <main className="app-main">
        {/* Map panel on the left - takes up left 2/3 of the page */}
        <MapView 
          location={currentLocation} 
          submittedLocation={submittedLocation}
          events={events}
          currentRoute={currentRoute}
        />
        
        {/* Content panel on the right - takes up right 1/3 of the page */}
        <div className="content-panel">
          {showSearch ? (
            // Show search form when user hasn't submitted yet
            <EventSearch 
              onSearch={handleSearch} 
              currentLocation={currentLocation}
              isVisible={locationSubmitted}
              previousSearchData={previousSearchData}
            />
          ) : isRouteMode ? (
            // Show route input interface when user clicks "Route" on an event
            <RouteInput 
              selectedEvent={selectedEvent}
              onBack={handleBackFromRoute}
              onRouteCalculated={handleRouteCalculated}
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
                onRouteRequest={handleRouteRequest}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
