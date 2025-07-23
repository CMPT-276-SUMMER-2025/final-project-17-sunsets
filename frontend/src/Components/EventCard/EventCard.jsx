// React hook for managing component state
import { useState } from 'react';
// Import CSS styles for this component
import './EventCard.css';

/**
 * EventCard Component
 * 
 * This component displays a single event with expandable details.
 * It shows basic event info by default and reveals more details when clicked.
 * 
 * @param {Object} event - Event data object containing all event information
 * @param {string} event.id - Unique identifier for the event
 * @param {string} event.title - Event name/title
 * @param {string} event.dateTime - Event date and time
 * @param {string} event.location - Event venue and location
 * @param {string} event.description - Detailed event description
 * @param {string} event.organizer - Event organizer/promoter
 * @param {string} event.category - Event category/type
 * @param {string} event.price - Event pricing information
 * @param {string} event.url - Direct link to buy tickets
 */
const EventCard = ({ event }) => {
  // useState hook to manage the expanded/collapsed state of the card
  // isExpanded: Boolean that tracks if the card shows full details
  // setIsExpanded: Function to toggle the expanded state
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Toggle the expanded state of the card
   * 
   * This function is called when the user clicks on the card header.
   * It flips the isExpanded boolean from true to false or vice versa.
   */
  const toggleExpanded = () => {
    // !isExpanded flips the boolean value (true becomes false, false becomes true)
    setIsExpanded(!isExpanded);
  };

  /**
   * Format date string to readable format
   * 
   * Converts ISO date strings (like "2024-01-15T18:00:00") into
   * human-readable format (like "Monday, January 15, 2024 at 06:00 PM")
   * 
   * @param {string} dateString - ISO date string from the API
   * @returns {string} Formatted date string for display
   */
  const formatDate = (dateString) => {
    // Create a JavaScript Date object from the string
    const date = new Date(dateString);
    
    // Use toLocaleDateString to format the date in a user-friendly way
    // The options object specifies how to format each part of the date
    return date.toLocaleDateString('en-US', {
      weekday: 'long',    // Full day name (Monday, Tuesday, etc.)
      year: 'numeric',    // Full year (2024)
      month: 'long',      // Full month name (January, February, etc.)
      day: 'numeric',     // Day of month (1, 2, 3, etc.)
      hour: '2-digit',    // Hour in 2-digit format (01, 02, etc.)
      minute: '2-digit'   // Minute in 2-digit format (01, 02, etc.)
    });
  };

  // JSX return statement - this is what gets rendered to the DOM
  return (
    // Template literal syntax allows us to conditionally add CSS classes
    // If isExpanded is true, the card gets both 'event-card' and 'expanded' classes
    // If isExpanded is false, it only gets 'event-card' class
    <div className={`event-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Clickable header that toggles expansion when clicked */}
      <div className="event-header" onClick={toggleExpanded}>
        {/* Event title and date section */}
        <div className="event-title">
          {/* Display the event title from the API data */}
          <h3>{event.title}</h3>
          {/* Display formatted date using our formatDate function */}
          <span className="event-date">{formatDate(event.dateTime)}</span>
        </div>
        
        {/* Event location section */}
        <div className="event-location">
          {/* Display location with a map pin emoji */}
          <span>📍 {event.location}</span>
        </div>
        
        {/* Expand/collapse icon that changes based on state */}
        <div className="expand-icon">
          {/* Conditional rendering: show minus sign if expanded, plus sign if collapsed */}
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {/* 
        Expanded details section - only shown when isExpanded is true
        The && operator is a shorthand for conditional rendering in React
        If isExpanded is true, render the details section
        If isExpanded is false, render nothing (null)
      */}
      {isExpanded && (
        <div className="event-details">
          {/* Event description section */}
          <div className="event-description">
            <p>{event.description}</p>
          </div>

          {/* Event metadata section - organizer, category, price */}
          <div className="event-meta">
            <div className="meta-item">
              <strong>Organizer:</strong> {event.organizer}
            </div>
            <div className="meta-item">
              <strong>Category:</strong> {event.category}
            </div>
            {/* 
              Conditional rendering: only show price if it exists
              This prevents showing "Price: undefined" if the API doesn't provide price data
            */}
            {event.price && (
              <div className="meta-item">
                <strong>Price:</strong> {event.price}
              </div>
            )}
          </div>

          {/* Action buttons section */}
          <div className="event-actions">
            {/* 
              Conditional rendering: only show ticket button if event.url exists
              target="_blank" opens the link in a new tab
              rel="noopener noreferrer" is a security best practice for external links
            */}
            {event.url && (
              <a 
                href={event.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ticket-button"
              >
                🎫 Buy Tickets
              </a>
            )}
            <button className="route-button">
              🗺️ Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard; 