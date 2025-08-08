import { useState } from 'react';
// These are the core functions that handle polyline (route) calculation and display returnd from Routes API
import { calculateRoute, decodePolyline } from '../../services/routesApi';
import Directions from '../Directions/Directions'; // Directions component for displaying nav instructions
import './RouteInput.css';

/**
 * ===== RouteInput Component =====
 * 
 * Displays the route input interface when user clicks "Route" on an event card
 * Allows users to enter their starting address or use browser geolocation (accuracy may vary)
 * Provides transit mode selection and a secondary button to start their route in the 
 * Google Maps app
 * 
 * (edit: our map UI is only meant to be an overview that can be referenced
 * at the user's discretion; adding more fine-grained nav features like real-time gps updates
 * so that users can navigate in real time not only is out of scope, but our application would essentially
 * become a home-brew version of Google Maps, which is not the goal of this project. An overview
 * of the most important navigation components like the full route polyline displayed on an 
 * interactive map with turn-by-turn directions is more than enough for reference purposes, but any more
 * features than this will change the objectives of this project.)
 * 
 * Key Features & Responsibilities:
 * - User address input & validation ('start' address is required to calculate a route)
 * - Geolocation with progressive accuracy enhancement (i.e., we basically increase wait times for sat data to return)
 * - Transit mode selection (WALK, TRANSIT, DRIVE, BICYCLE)
 * - Error handling for location services and address input (this needs improvement following QA testing)
 * - Route calculation using Google Routes API
 * - Directions display using Directions component
 * 
 * @param {Object} selectedEvent - The event the user wants to route to
 * @param {Function} onBack - Callback to return to event list
 * @param {Function} onRouteCalculated - Callback to pass route data to parent
 * @returns {JSX.Element} The route input interface component
 */
const RouteInput = ({ selectedEvent, onBack, onRouteCalculated }) => {
  // User start address, loading, error, and transit mode states
  const [userAddress, setUserAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [selectedTransitMode, setSelectedTransitMode] = useState('TRANSIT'); // Default to TRANSIT
  const [userCoordinates, setUserCoordinates] = useState(null); // Store raw GPS coordinates

  // Route calculation states
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeData, setRouteData] = useState(null);

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

  
  // Handle address input change
  // Updates the user address state and clears any previous error messages
  const handleAddressChange = (e) => {
    setUserAddress(e.target.value);
    setLocationError(''); // Clear any previous errors
    // Clear stored coordinates when user manually types an address
    setUserCoordinates(null);
    // Clear previous route data when user changes address
    setRouteData(null);
  };

  // Handle transit mode selection
  // Updates the selected transit mode state to whatever mode
  // the user selects for their route
  const handleTransitModeChange = (mode) => {
    setSelectedTransitMode(mode);
    // Clear previous route data when user changes transit mode
    setRouteData(null);
  };


  // Build Google Maps URL with directions using the official API format
  // Maps our transit modes to Google's travel mode parameters
  const buildGoogleMapsUrl = () => {
    // Return if either the user address or the event location is not set
    if (!userAddress.trim() || !selectedEvent?.location) {
      return '';
    }
    // Encode the user address and event locations
    // The formatting from encodeURIComponent replaces spaces with %20
    // and commas with %2C, which is necessary for the Google Maps URL
    const origin = encodeURIComponent(userAddress);
    const destination = encodeURIComponent(selectedEvent.location);
    // Map our internal transit modes to Google Maps travel mode values
    const travelModeMap = {
      'DRIVE': 'driving',
      'WALK': 'walking',
      'BICYCLE': 'bicycling',
      'TRANSIT': 'transit'
    };
    // Set the travel mode to the selected transit mode, or default to transit
    // and return the resulting URL with the user's trip
    const travelMode = travelModeMap[selectedTransitMode] || 'transit';
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`;
  };

  // Open Google Maps in a new tab with the route from user's address to the event
  const handleOpenInGoogleMaps = () => {
    const googleMapsUrl = buildGoogleMapsUrl();
    if (!googleMapsUrl) return;
    window.open(googleMapsUrl, '_blank');
  };


  /**
   * Convert coordinates to an address string using reverse geocoding 
   * (opposite of what's done in MapView.jsx)
   * Geocoding service is again used for this conversion
   * 
   * @param {number} latitude - The latitude coordinate
   * @param {number} longitude - The longitude coordinate
   * @returns {Promise<string>} The formatted address string
   */
  const reverseGeocode = (latitude, longitude) => {
    // Check if Google Maps API is available
    if (!window.google || !window.google.maps) {
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
     * to improve accuracy, especially for GPS-based location (e.g., mobile devices)
     * 
     * @param {number} attempt - Current attempt number (1-3)
     * @param {number} maxAttempts - Maximum number of attempts (3)
     */
    const getGeoLocation = (attempt = 1, maxAttempts = 3) => {
      // Configure geolocation options with increasing timeout for better accuracy
      const geolocationOptions = {
        enableHighAccuracy: true,    // Request GPS-level accuracy when available
        timeout: 15000 + (attempt * 5000), // Increase timeout with each attempt (15s, 20s, 25s)
        maximumAge: 0               // Don't use the device's cached location; always get fresh data
      };

      // Send location request to the browser's geolocation API
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Extract location data from the position object
            const { latitude, longitude, accuracy } = position.coords;
            
            // If accuracy is poor (>100m) and we haven't reached max attempts, try again
            // This helps improve accuracy especially on mobile devices where GPS may need more
            // time to respond to our request(s)
            if (accuracy > 100 && attempt < maxAttempts) {
              // Wait 2 seconds before making the next attempt to allow GPS to potentially 
              // acquire more satellites and improve accuracy
              setTimeout(() => {
                getGeoLocation(attempt + 1, maxAttempts);
              }, 2000);
              return;
            }
            
                         // Store the raw GPS coordinates for direct use in route calculation
             setUserCoordinates({ lat: latitude, lng: longitude });
             
             // Convert the coordinates to a readable address using reverse geocoding
             const address = await reverseGeocode(latitude, longitude);
             setUserAddress(address);
            
          } catch (error) {
            // If reverse geocoding fails, fall back to a generic location message
            setUserAddress('Current Location');
          }
          setIsLoadingLocation(false); // Loading indicator can be stopped since we have a geolocation (or an error)
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
                  getGeoLocation(attempt + 1, maxAttempts);
                }, 1000);
                return;
              }
              errorMessage = 'Location request timed out after multiple attempts. Please try again or enter your address manually.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting your location. Please enter an address manually.';
          }
          
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
        },
        geolocationOptions
      );
    };

    // Start the geolocation retreival process with 3 attempts
    getGeoLocation(1, 3);
  };

  // Handle route calculation using Google Routes API
  // Validates user input, geocode addresses, and then calculate user's route
  const handleCalculateRoute = async () => {
    if (!userAddress.trim()) {
      setLocationError('Please enter your starting address or use your current location.');
      return;
    }

         setIsCalculatingRoute(true);
     setRouteError('');

         try {
       // Create geocoder instance for both user and event location geocoding
       const geocoder = new window.google.maps.Geocoder();
       
       // Use stored GPS coordinates if available, otherwise geocode the address
       let userLocation;
       if (userCoordinates) {
         // Use the stored GPS coordinates directly
         userLocation = userCoordinates;
       } else {
         // Geocode the user's address to get respective coordinates
         const userLocationPromise = new Promise((resolve, reject) => {
           geocoder.geocode({ address: userAddress }, (results, status) => {
             if (status === 'OK' && results[0]) {
               const location = results[0].geometry.location;
               resolve({ lat: location.lat(), lng: location.lng() });
             } else {
               reject(`Unable to process your address: "${userAddress}". Please check the spelling and try again.`);
             }
           });
         });
         userLocation = await userLocationPromise;
       }

       // Geocode the event location to get respective coordinates
       const eventLocationPromise = new Promise((resolve, reject) => {
         geocoder.geocode({ address: selectedEvent.location }, (results, status) => {
           if (status === 'OK' && results[0]) {
             const location = results[0].geometry.location;
             resolve({ lat: location.lat(), lng: location.lng() });
           } else {
             reject(`Unable to find the event location: "${selectedEvent.location}". Please contact support if this persists.`);
           }
         });
       });

       // Wait for event geocoding to complete (user location is already resolved)
       const eventLocation = await eventLocationPromise;

             // Calculate the route using Google Routes API with selected travel mode
      const routeResponse = await calculateRoute(
        userLocation,
        eventLocation,
        selectedTransitMode
      );
      


             if (routeResponse.routes && routeResponse.routes.length > 0) {
         const route = routeResponse.routes[0]; // Get the first (and only) route from the response
         
         // Decode the polyline for map display
         const routeCoordinates = decodePolyline(route.polyline.encodedPolyline);
         
         // Store route coordinates for map display
         const routeData = {
           coordinates: routeCoordinates
         };

         // Store the full route data for directions display
         setRouteData(routeResponse);

         // Pass route data to parent component for polyline display
         if (onRouteCalculated) {
           onRouteCalculated(routeData);
         }
      } else {

        setRouteError('No route found. Please try different preferences or locations.');
      }

    } catch (error) {
      setRouteError('Unable to calculate route. Please check your address and try again.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  return (
    <div className="route-input">
      {/* Header with back button and page title */}
      <div className="route-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Events
        </button>
        <h2>Route to Event</h2>
      </div>

      {/* Display selected event details */}
      <div className="selected-event">
        <h3>{selectedEvent?.title}</h3>
        <p>📍 {selectedEvent?.location}</p>
        <p>📅 {selectedEvent?.dateTime ? formatDate(selectedEvent.dateTime) : 'Date not available'}</p>
      </div>

      {/* Main form for route input */}
      <div className="route-form">
        {/* Starting location input section */}
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

        {/* Transit mode selection buttons */}
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

        {/* Action buttons for route calculation and Google Maps */}
        <div className="route-actions">
          <button 
            className="calculate-route-button"
            onClick={handleCalculateRoute}
            disabled={!userAddress.trim() || isCalculatingRoute}
          >
            {isCalculatingRoute ? 'Calculating Route...' : '🗺️ Calculate Route & Directions'}
          </button>
          <button 
            className="google-maps-button"
            onClick={handleOpenInGoogleMaps}
            disabled={!userAddress.trim()}
          >
            🌐 Open in Google Maps
          </button>
        </div>

        {/* Display route calculation errors */}
        {routeError && <p className="error-message">{routeError}</p>}
      </div>

      {/* Display step-by-step directions */}
      {routeData && (
        <Directions 
          routeData={routeData} 
          travelMode={selectedTransitMode} 
        />
      )}
    </div>
  );
};

export default RouteInput; 