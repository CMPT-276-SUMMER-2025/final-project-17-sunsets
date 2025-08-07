import { useState, useEffect } from 'react';
import './Directions.css';

/**
 * ===== Directions Component =====
 * 
 * Displays step-by-step navigation instructions from the Google Routes API
 * Shows turn-by-turn directions with approximate trip distance and travel time
 * 
 * @param {Object} routeData - The route data from Google Routes API
 * @param {string} travelMode - The selected travel mode
 * @returns {JSX.Element} The directions display component
 */
const Directions = ({ routeData, travelMode }) => {
  // State variable to store the directions data
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    console.log('Directions component received routeData:', routeData); // Debug log
    // If routeData is valid, set the directions state variable to the routeData
    if (routeData && routeData.routes && routeData.routes.length > 0) {
      setDirections(routeData);
    }
  }, [routeData]);

  /**
   * Format trip duration from seconds to human-readable format
   * 
   * @param {string} duration - Duration in seconds as string
   * @returns {string} Formatted duration (e.g., "25 min", "1 hr 32 min")
   */
  const formatDuration = (duration) => {
    const seconds = parseInt(duration);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };

  /**
   * Format distance from meters to human-readable format
   * 
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance (e.g., "2.5 km", "800 m")
   */
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${meters} m`;
    }
  };

  /**
   * Get travel mode icon based on the selected mode
   * 
   * @param {string} mode - The travel mode
   * @returns {string} The emoji icon for the travel mode
   */
  const getTravelModeIcon = (mode) => {
    switch (mode) {
      case 'DRIVE': return '🚗';
      case 'WALK': return '🚶';
      case 'BICYCLE': return '🚴';
      case 'TRANSIT': return '🚌';
      default: return '🚌';
    }
  };

  // Check if directions data is available; otherwise, return null
  if (!directions) {
    return null;
  }

  // Get the first and only route from the directions data
  // This array can technically contain multiple alt routes, but we
  // set this to 'false' since doing so may increase loading times.
  const route = directions.routes[0];
  // Get the first leg from the route (i.e., one segment of the journey: origin -> destination)
  const leg = route.legs[0];
  // And get the individual steps from the leg (these are the actual direction instructions)
  const steps = leg.steps || [];


  return (
    // Main container for directions panel
    <div className="directions-container">
      {/* Header with title and route summary (distance/time) */}
      <div className="directions-header">
        <h3>
          {getTravelModeIcon(travelMode)} Step-by-Step Directions
        </h3>
          <div className="route-summary">
           <span className="summary-item">
             <strong>Total Distance:</strong> {route.distanceMeters ? formatDistance(route.distanceMeters) : 'Distance not available'}
           </span>
           <span className="summary-item">
             <strong>Total Time:</strong> {route.duration ? formatDuration(route.duration) : 'Time not available'}
           </span>
         </div>
      </div>

      {/* Scrollable list of individual navigation steps */}
      <div className="directions-list">
        {/* Iterate through each step to create individual direction entries */}
        {steps.map((step, index) => (
          <div key={index} className="direction-step">
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <div className="step-instruction">
                {step.navigationInstruction?.instructions || 'Continue on route'}
              </div>
              <div className="step-details">
                <span className="step-distance">
                  {formatDistance(step.distanceMeters)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fallback message when no directions available */}
      {steps.length === 0 && (
        <div className="no-directions">
          <p>No detailed directions available for this route.</p>
          <p>Please use the "Open in Google Maps" button for additional route options.</p>
        </div>
      )}
    </div>
  );
};

export default Directions; 