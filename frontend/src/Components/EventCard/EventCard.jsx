import { useState } from 'react';
import './EventCard.css';

const EventCard = ({ event }) => {
  // State to track whether the card is expanded to show details
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle between expanded and collapsed states
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Format date string to readable format (e.g., "Monday, January 15, 2024 at 06:00 PM")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`event-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Clickable header that toggles expansion */}
      <div className="event-header" onClick={toggleExpanded}>
        <div className="event-title">
          <h3>{event.title}</h3>
          <span className="event-date">{formatDate(event.dateTime)}</span>
        </div>
        <div className="event-location">
          <span>📍 {event.location}</span>
        </div>
        {/* Expand/collapse icon that changes based on state */}
        <div className="expand-icon">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {/* Expanded details section - only shown when isExpanded is true */}
      {isExpanded && (
        <div className="event-details">
          {/* Event description */}
          <div className="event-description">
            <p>{event.description}</p>
          </div>

          {/* Event metadata (organizer, category, price) */}
          <div className="event-meta">
            <div className="meta-item">
              <strong>Organizer:</strong> {event.organizer}
            </div>
            <div className="meta-item">
              <strong>Category:</strong> {event.category}
            </div>
            {/* Only show price if it exists */}
            {event.price && (
              <div className="meta-item">
                <strong>Price:</strong> {event.price}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="event-actions">
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