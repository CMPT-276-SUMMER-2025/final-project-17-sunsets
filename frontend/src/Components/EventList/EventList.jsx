// React hooks for managing component state and side effects
import { useState, useEffect } from 'react';
// Import our custom EventCard component to display individual events
import EventCard from '../EventCard/EventCard';
// Import our API service function to fetch real events from Ticketmaster
import { fetchEvents } from '../../services/ticketmasterApi';
// Import CSS styles for this component
import './EventList.css';

/**
 * EventList Component
 * 
 * This component displays a list of events fetched from the Ticketmaster API.
 * It handles the entire lifecycle of fetching, displaying, and managing events.
 * 
 * @param {Object} searchParams - Search criteria passed from the parent component
 * @param {string} searchParams.location - City to search for events
 * @param {string} searchParams.keywords - Optional keywords to filter events
 * @param {number} searchParams.eventCount - Number of events to display
 * @param {number} searchParams.radius - Search radius in miles
 */
const EventList = ({ searchParams }) => {
  // React useState hook creates state variables that trigger re-renders when changed
  // Each useState call returns an array: [currentValue, functionToUpdateValue]
  
  // events: Array of event objects fetched from the API
  // setEvents: Function to update the events array
  const [events, setEvents] = useState([]);
  
  // loading: Boolean that tracks if we're currently fetching data from the API
  // setLoading: Function to update the loading state
  const [loading, setLoading] = useState(false);
  
  // error: String containing error message, or null if no error
  // setError: Function to update the error state
  const [error, setError] = useState(null);

  /**
   * Fetch events from Ticketmaster API
   * 
   * This function handles the API call to get events based on search parameters.
   * It manages loading states and error handling for a smooth user experience.
   * 
   * @param {Object} params - Search parameters (location, keywords, eventCount)
   */
  const fetchEventsData = async (params) => {
    // Set loading state to true to show loading spinner
    setLoading(true);
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Call our API service function to fetch events from Ticketmaster
      // await pauses execution until the API call completes
      const eventsData = await fetchEvents(params);
      
      // Update the events state with the fetched data
      // This will trigger a re-render of the component with the new events
      setEvents(eventsData);
    } catch (err) {
      // If the API call fails, set an error message for the user
      // Use the error message from the API or a default message
      setError(err.message || 'Failed to fetch events. Please try again.');
      
      // Log the error for debugging purposes
      console.error('Error fetching events:', err);
    } finally {
      // Always set loading to false, whether the API call succeeded or failed
      // This ensures the loading spinner disappears
      setLoading(false);
    }
  };

  /**
   * useEffect Hook - React's way of handling side effects
   * 
   * This hook runs whenever the searchParams prop changes.
   * It automatically fetches new events when the user performs a new search.
   * 
   * The second parameter [searchParams] is the dependency array:
   * - If searchParams changes, the effect runs again
   * - If searchParams stays the same, the effect doesn't run
   */
  useEffect(() => {
    // Only fetch events if searchParams exists (user has performed a search)
    if (searchParams) {
      fetchEventsData(searchParams);
    }
  }, [searchParams]); // Dependency array - effect runs when searchParams changes

  // Conditional rendering based on component state
  // React components can return different JSX based on their state
  
  // Show loading spinner while fetching data from API
  if (loading) {
    return (
      <div className="event-list">
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching for events...</p>
        </div>
      </div>
    );
  }

  // Show error message if API call failed
  if (error) {
    return (
      <div className="event-list">
        <div className="error">
          <p>{error}</p>
          {/* onClick handler calls fetchEventsData to retry the API call */}
          <button onClick={() => fetchEventsData(searchParams)}>Try Again</button>
        </div>
      </div>
    );
  }

  // Show initial message when user hasn't performed a search yet
  if (!searchParams) {
    return (
      <div className="event-list">
        <div className="no-search">
          <p>Enter your search preferences to find events near you!</p>
        </div>
      </div>
    );
  }

  // Show message when API returned no events for the search criteria
  if (events.length === 0) {
    return (
      <div className="event-list">
        <div className="no-events">
          <p>No events found matching your criteria.</p>
          <p>Try adjusting your search terms or location.</p>
        </div>
      </div>
    );
  }

  // Main render - display the list of events
  return (
    <div className="event-list">
      {/* Show count of events found */}
      <div className="event-count">
        <h3>Found {events.length} event{events.length !== 1 ? 's' : ''} near {searchParams.location}</h3>
      </div>
      
      {/* Container for all event cards */}
      <div className="events-container">
        {/* 
          .map() creates a new array by transforming each event object into an EventCard component
          key={event.id} is required by React to efficiently update the list when data changes
          event={event} passes the event data as a prop to the EventCard component
        */}
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventList; 