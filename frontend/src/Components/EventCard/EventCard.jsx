// React hook for state management
import { useState } from 'react';
// CSS styles for event cards
import './EventCard.css';

/**
 * EventCard Component
 * 
 * Shows a single event with basic info visible and more details that can be expanded.
 * Users can click on the card to see more information like description, organizer, etc...
 * 
 * @param {Object} event - All the event data from the API
 * @param {string} event.id - Unique identifier for the event
 * @param {string} event.title - Event name/title
 * @param {string} event.dateTime - Event date and time
 * @param {string} event.location - Event venue and location
 * @param {string} event.description - Detailed event description (not always provided by event organizer)
 * @param {string} event.organizer - Event organizer/promoter
 * @param {string} event.category - Event category/type
 * @param {string} event.price - Event pricing information
 * @param {string} event.url - Direct link to buy tickets
 */
const EventCard = ({ event }) => {
  // Track whether the card is expanded to show full details
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Toggle the expanded state when user clicks the card
   * 
   * This flips the boolean - if it was false, make it true, and vice versa.
   * Controls whether we show the full event details or just the basic info.
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Convert the API date format to something readable
   * 
   * Takes dates like "2024-01-15T18:00:00" and turns them into
   * "Monday, January 15, 2024 at 06:00 PM" for better user experience.
   * 
   * @param {string} dateString - The date string from the API
   * @returns {string} A nicely formatted date string
   */
  const formatDate = (dateString) => {
    // Create a Date object from the raw date string
    const date = new Date(dateString);
    
    // Format it in a user-friendly way
    // Uses a built-in JavaScript function to format the date, and specifies
    // how to display each date component
    return date.toLocaleDateString('en-US', {
      weekday: 'long',    // Full day name (Monday, Tuesday, etc...)
      year: 'numeric',    // Full year (2024)
      month: 'long',      // Full month name (January, February, etc...)
      day: 'numeric',     // Day of month (1, 2, 3, etc...)
      hour: '2-digit',    // Hour in 2-digit format (01, 02, etc...)
      minute: '2-digit'   // Minute in 2-digit format (01, 02, etc...)
    });
  };

  // Render the event card
  return (
    // Add 'expanded' class when card is expanded for styling
    <div className={`event-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Clickable header that toggles expansion */}
      <div className="event-header" onClick={toggleExpanded}>
        {/* Event title and formatted date */}
        <div className="event-title">
          <h3>{event.title}</h3>
          <span className="event-date">{formatDate(event.dateTime)}</span>
        </div>
        
        {/* Event location with map pin emoji (I thought it was a simple alternative to a custom icon)*/}
        <div className="event-location">
          <span>📍 {event.location}</span>
        </div>
        
        {/* Expand/collapse icon that changes based on state */}
        <div className="expand-icon">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {/* 
        Expanded details section - only shown when card is expanded
        The && operator effectively transaltes to "only show this if isExpanded is true"
      */}
      {isExpanded && (
        <div className="event-details">
          {/* Event description */}
          <div className="event-description">
            <p>{event.description}</p>
          </div>

          {/* Event metadata - organizer, category, price */}
          <div className="event-meta">
            <div className="meta-item">
              <strong>Organizer:</strong> {event.organizer}
            </div>
            <div className="meta-item">
              <strong>Category:</strong> {event.category}
            </div>
            {/* Only show price if it exists (prevents "Price: undefined") */}
            {event.price && (
              <div className="meta-item">
                <strong>Price:</strong> {event.price}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="event-actions">
            {/* 
              Only show ticket button if we have a URL (target="_blank" opens in new tab
              and rel="noopener noreferrer" prevents security issues) 
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