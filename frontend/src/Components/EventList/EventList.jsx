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
 * This component fetches events from the Ticketmaster API and displays them as cards.
 * It handles loading states, errors, and shows different messages based on what's happening.
 * 
 * @param {Object} searchParams - All the search criteria from the search form
 * @param {string} searchParams.location - City to search for events
 * @param {string} searchParams.keywords - Optional keywords to filter events
 * @param {number} searchParams.eventCount - Number of events to display
 * @param {number} searchParams.radius - Search radius in kilometers
 * @param {string} searchParams.startDate - Start date for event search
 * @param {string} searchParams.endDate - End date for event search
 * @param {number} searchParams.priceMin - Minimum ticket price in CAD
 * @param {number} searchParams.priceMax - Maximum ticket price in CAD
 */
const EventList = ({ searchParams }) => {
  // State variables to track what's happening
  
  // The list of events we got from the API
  const [events, setEvents] = useState([]);
  
  // Whether we're currently loading events from the API
  const [loading, setLoading] = useState(false);
  
  // Any error message if something went wrong
  const [error, setError] = useState(null);

  /**
   * Fetch events from the Ticketmaster API
   * 
   * This function makes the actual API call and handles all the different states
   * (loading, success, error). It's called whenever the search parameters change.
   * 
   * @param {Object} params - The search parameters to send to the API
   */
  const fetchEventsData = async (params) => {
    // Show loading spinner
    setLoading(true);
    
    // Clear any old errors
    setError(null);
    
    try {
      // Call our API service to get events from Ticketmaster
      const eventsData = await fetchEvents(params);
      
      // Update our events list with the new data
      setEvents(eventsData);
    } catch (err) {
      // Something went wrong - show error message to user
      setError(err.message || 'Failed to fetch events. Please try again.');
      
      // Log the error for debugging
      console.error('Error fetching events:', err);
    } finally {
      // Always hide loading spinner, whether it worked or not
      setLoading(false);
    }
  };

  /**
   * useEffect Hook - React's way of handling side effects
   * 
   * This runs whenever the searchParams prop changes (when user does a new search).
   * It automatically fetches new events from the API.
   * 
   * The [searchParams] at the end means "run this effect when searchParams changes"
   */
  useEffect(() => {
    // Only fetch if we actually have search parameters
    if (searchParams) {
      fetchEventsData(searchParams);
    }
  }, [searchParams]);

  // Show different content based on what's happening
  
  // Show loading spinner while fetching events
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
          {/* Let user try again */}
          <button onClick={() => fetchEventsData(searchParams)}>Try Again</button>
        </div>
      </div>
    );
  }

  // Show message when user hasn't searched yet
  if (!searchParams) {
    return (
      <div className="event-list">
        <div className="no-search">
          <p>Enter your search preferences to find events near you!</p>
        </div>
      </div>
    );
  }

  // Show message when no events were found
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

  // Show the list of events
  return (
    <div className="event-list">
      {/* Show how many events we found */}
      <div className="event-count">
        <h3>Found {events.length} event{events.length !== 1 ? 's' : ''} near {searchParams.location}</h3>
      </div>
      
      {/* Container for all the event cards */}
      <div className="events-container">
        {/* 
          Create an EventCard component for each event we got from the API
          The key prop helps React efficiently update the list when data changes
        */}
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventList; 