import { useState } from 'react';
import './RouteInput.css';

/**
 * RouteInput Component
 * 
 * Displays the route input interface when user clicks "Route" on an event card.
 * Allows users to enter their starting address or use browser geolocation.
 * Provides transit mode selection and routing preferences for different travel options.
 * 
 * The component manages multiple states including:
 * - User address input and validation
 * - Geolocation with progressive accuracy enhancement
 * - Transit mode selection (WALK, TRANSIT, DRIVE, BICYCLE)
 * - Dynamic routing preferences based on selected transit mode
 * - Error handling for location services and address input
 * 
 * Key features:
 * - Progressive geolocation accuracy with multiple attempts
 * - Reverse geocoding to convert coordinates to readable addresses
 * - Dynamic transit preference buttons that change based on selected mode
 * - Support for eco-friendly routing options
 * - Comprehensive error handling with user-friendly messages
 * 
 * Future enhancements will include:
 * - Integration with Google Routes API for actual route calculation
 * - Route display on the map
 * - Turn-by-turn directions
 * - Route history and saved routes
 * 
 * @param {Object} selectedEvent - The event the user wants to route to
 * @param {Function} onBack - Callback to return to event list
 * @returns {JSX.Element} The route input interface component
 */
const RouteInput = ({ selectedEvent, onBack }) => {
  const [userAddress, setUserAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [selectedTransitMode, setSelectedTransitMode] = useState('TRANSIT'); // Default to transit
  const [transitPreferences, setTransitPreferences] = useState({
    avoidTolls: false,
    avoidHighways: false,
    avoidHills: false,
    avoidBusyRoads: false,
    lessWalking: false,
    fewerTransfers: false,
    bicycleType: 'REGULAR',
    ecoFriendly: false
  });

  /**
   * Handle address input change
   * Updates the user address state and clears any previous error messages
   */
  const handleAddressChange = (e) => {
    setUserAddress(e.target.value);
    setLocationError(''); // Clear any previous errors
  };

  /**
   * Handle transit mode selection
   * Updates the selected transit mode state
   */
  const handleTransitModeChange = (mode) => {
    setSelectedTransitMode(mode);
  };

  /**
   * Handle transit preference toggle
   * Updates the transit preferences state
   */
  const handlePreferenceToggle = (preference) => {
    setTransitPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  /**
   * Handle bicycle type change
   * Updates the bicycle type preference
   */
  const handleBicycleTypeChange = (type) => {
    setTransitPreferences(prev => ({
      ...prev,
      bicycleType: type
    }));
  };

  /**
   * Render transit preference buttons based on selected mode
   * Returns appropriate preference buttons for each transit mode
   */
  const renderTransitPreferences = () => {
    switch (selectedTransitMode) {
      case 'DRIVE':
        return (
          <div className="input-group">
            <label>Driving Options:</label>
            <div className="transit-preferences">
              <button
                type="button"
                className={`preference-button ${transitPreferences.avoidTolls ? 'active' : ''}`}
                onClick={() => handlePreferenceToggle('avoidTolls')}
              >
                🚫 Avoid Tolls
              </button>
              <button
                type="button"
                className={`preference-button ${transitPreferences.avoidHighways ? 'active' : ''}`}
                onClick={() => handlePreferenceToggle('avoidHighways')}
              >
                🛣️ Avoid Highways
              </button>
              <button
                type="button"
                className={`preference-button ${transitPreferences.ecoFriendly ? 'active' : ''}`}
                onClick={() => handlePreferenceToggle('ecoFriendly')}
              >
                🌱 Eco-Friendly
              </button>
            </div>
          </div>
        );

      case 'BICYCLE':
        return (
          <div className="input-group">
            <label>Cycling Options:</label>
            <div className="transit-preferences">
              <div className="bicycle-type-buttons">
                <button
                  type="button"
                  className={`preference-button ${transitPreferences.bicycleType === 'REGULAR' ? 'active' : ''}`}
                  onClick={() => handleBicycleTypeChange('REGULAR')}
                >
                  🚴 Regular Bike
                </button>
                <button
                  type="button"
                  className={`preference-button ${transitPreferences.bicycleType === 'ELECTRIC' ? 'active' : ''}`}
                  onClick={() => handleBicycleTypeChange('ELECTRIC')}
                >
                  ⚡ E-Bike
                </button>
              </div>
              <div className="bicycle-preference-buttons">
                <button
                  type="button"
                  className={`preference-button ${transitPreferences.avoidHills ? 'active' : ''}`}
                  onClick={() => handlePreferenceToggle('avoidHills')}
                >
                  🏔️ Avoid Hills
                </button>
                <button
                  type="button"
                  className={`preference-button ${transitPreferences.avoidBusyRoads ? 'active' : ''}`}
                  onClick={() => handlePreferenceToggle('avoidBusyRoads')}
                >
                  🛣️ Quiet Roads
                </button>
              </div>
            </div>
          </div>
        );

      case 'TRANSIT':
        return (
          <div className="input-group">
            <label>Transit Options:</label>
            <div className="transit-preferences">
              <button
                type="button"
                className={`preference-button ${transitPreferences.lessWalking ? 'active' : ''}`}
                onClick={() => handlePreferenceToggle('lessWalking')}
              >
                🚶 Less Walking
              </button>
              <button
                type="button"
                className={`preference-button ${transitPreferences.fewerTransfers ? 'active' : ''}`}
                onClick={() => handlePreferenceToggle('fewerTransfers')}
              >
                🔄 Fewer Transfers
              </button>
            </div>
          </div>
        );

      case 'WALK':
        return null; // No specific preferences for walking in Routes API

      default:
        return null;
    }
  };

  /**
   * Convert coordinates to address using reverse geocoding
   * Takes latitude and longitude coordinates and converts them to a readable address
   * using Google Maps Geocoder API
   * 
   * @param {number} latitude - The latitude coordinate
   * @param {number} longitude - The longitude coordinate
   * @returns {Promise<string>} The formatted address string
   */
  const reverseGeocode = (latitude, longitude) => {
    // Check if Google Maps API is available
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return Promise.reject('Google Maps API not available');
    }

    // Create a new geocoder instance
    const geocoder = new window.google.maps.Geocoder();
    
    // Return a promise that resolves with the formatted address
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { location: { lat: latitude, lng: longitude } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            // Successfully got the address
            resolve(results[0].formatted_address);
          } else {
            // Geocoding failed
            reject(`Geocoding failed: ${status}`);
          }
        }
      );
    });
  };

  /**
   * Get user's current location using browser geolocation with progressive accuracy
   * 
   * Attempts to get the user's location with increasing accuracy by making multiple attempts
   * with longer timeouts
   * 
   * This may help to improve accuracy, but can also increase the wait time for geolocation data to return
   */
  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    setLocationError('');

    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLoadingLocation(false);
      return;
    }

    /**
     * Progressive accuracy enhancement function
     * Makes multiple attempts to get location with increasing timeouts
     * to improve accuracy, especially for GPS-based location
     * 
     * @param {number} attempt - Current attempt number (1-3)
     * @param {number} maxAttempts - Maximum number of attempts (3)
     */
    const getLocationWithProgressiveAccuracy = (attempt = 1, maxAttempts = 3) => {
      // Configure geolocation options with increasing timeout for better accuracy
      const geolocationOptions = {
        enableHighAccuracy: true,    // Request GPS-level accuracy when available
        timeout: 15000 + (attempt * 5000), // Increase timeout with each attempt (15s, 20s, 25s)
        maximumAge: 0               // Don't use cached location, always get fresh data
      };

      // Make the geolocation request
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Extract location data from the position object
            const { latitude, longitude, accuracy } = position.coords;
            
            // If accuracy is poor (>100m) and we haven't reached max attempts, try again
            // This helps improve accuracy especially on mobile devices where GPS needs time
            if (accuracy > 100 && attempt < maxAttempts) {
              // Wait 2 seconds before making the next attempt to allow GPS to acquire more satellites
              setTimeout(() => {
                getLocationWithProgressiveAccuracy(attempt + 1, maxAttempts);
              }, 2000);
              return;
            }
            
            // Convert the coordinates to a readable address using reverse geocoding
            const address = await reverseGeocode(latitude, longitude);
            setUserAddress(address);
            
          } catch (error) {
            // If reverse geocoding fails, fall back to a generic location message
            console.error('Reverse geocoding failed:', error);
            setUserAddress('Current Location');
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          // Handle different types of geolocation errors
          let errorMessage = 'Unable to get your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              // If timeout occurs and we haven't reached max attempts, try again with longer timeout
              if (attempt < maxAttempts) {
                setTimeout(() => {
                  getLocationWithProgressiveAccuracy(attempt + 1, maxAttempts);
                }, 1000);
                return;
              }
              errorMessage = 'Location request timed out after multiple attempts. Please try again or enter your address manually.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting your location.';
          }
          
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
        },
        geolocationOptions
      );
    };

    // Start the progressive accuracy enhancement process
    getLocationWithProgressiveAccuracy(1, 3);
  };

  /**
   * Handle route calculation (placeholder for future implementation)
   * Validates that user has entered a starting location before proceeding
   */
  const handleCalculateRoute = () => {
    if (!userAddress.trim()) {
      setLocationError('Please enter your starting address or use your current location.');
      return;
    }
    
    // TODO: Implement actual route calculation using Google Routes API
    console.log('Calculating route from:', userAddress, 'to:', selectedEvent.title);
  };

  return (
    <div className="route-input">
      <div className="route-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Events
        </button>
        <h2>Route to Event</h2>
      </div>

      <div className="selected-event">
        <h3>{selectedEvent?.title}</h3>
        <p>📍 {selectedEvent?.location}</p>
        <p>📅 {selectedEvent?.dateTime}</p>
      </div>

      <div className="route-form">
        <div className="input-group">
          <label htmlFor="user-address">Starting Location:</label>
          <div className="input-button-row">
            <input
              id="user-address"
              type="text"
              value={userAddress}
              onChange={handleAddressChange}
              placeholder="Enter your address (e.g., 123 Main St, Vancouver, BC)"
              className={locationError ? 'error' : ''}
            />
            <button 
              className="geolocation-button"
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? 'Getting Location...' : '📍 Use Geolocation'}
            </button>
          </div>
          {locationError && <p className="error-message">{locationError}</p>}
        </div>

        <div className="input-group">
          <label>Transit Mode:</label>
          <div className="transit-mode-buttons">
            <button
              type="button"
              className={`transit-mode-button ${selectedTransitMode === 'WALK' ? 'active' : ''}`}
              onClick={() => handleTransitModeChange('WALK')}
            >
              🚶 Walking
            </button>
            <button
              type="button"
              className={`transit-mode-button ${selectedTransitMode === 'TRANSIT' ? 'active' : ''}`}
              onClick={() => handleTransitModeChange('TRANSIT')}
            >
              🚌 Transit
            </button>
            <button
              type="button"
              className={`transit-mode-button ${selectedTransitMode === 'DRIVE' ? 'active' : ''}`}
              onClick={() => handleTransitModeChange('DRIVE')}
            >
              🚗 Driving
            </button>
            <button
              type="button"
              className={`transit-mode-button ${selectedTransitMode === 'BICYCLE' ? 'active' : ''}`}
              onClick={() => handleTransitModeChange('BICYCLE')}
            >
              🚴 Cycling
            </button>
          </div>
        </div>

        {renderTransitPreferences()}

        <div className="route-actions">
          <button 
            className="calculate-route-button"
            onClick={handleCalculateRoute}
            disabled={!userAddress.trim()}
          >
            🗺️ Calculate Route
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteInput; 