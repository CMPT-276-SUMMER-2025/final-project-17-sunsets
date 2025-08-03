/**
 * Routes API Service
 * 
 * Handles calls to the Google Routes API for calculating routes between locations.
 * This service constructs API requests based on user preferences and processes responses
 * to extract route information including distance, duration, and encoded polylines.
 */

const API_KEY = 'AIzaSyDzzzTrEwFB6ase7tvNbnEsD562z2MG6vk';
const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

/**
 * Calculate a route between two locations using Google Routes API
 * 
 * @param {Object} origin - The starting location coordinates
 * @param {Object} destination - The destination location coordinates  
 * @param {string} travelMode - The travel mode (WALK, TRANSIT, DRIVE, BICYCLE)
 * @param {Object} preferences - User routing preferences
 * @returns {Promise<Object>} The route calculation response
 */
export const calculateRoute = async (origin, destination, travelMode, preferences = {}) => {
  try {
    // Convert travel mode to proper API format
    const getTravelMode = (mode) => {
      switch (mode) {
        case 'DRIVE': return 'DRIVE';
        case 'WALK': return 'WALK';
        case 'BICYCLE': return 'BICYCLE';
        case 'TRANSIT': return 'TRANSIT';
        default: return 'DRIVE';
      }
    };

    // Test with the exact format from Google's documentation
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng
          }
        }
      },
      travelMode: getTravelMode(travelMode),
      computeAlternativeRoutes: false,
      languageCode: "en-US",
      units: "METRIC"
    };

    // Only add routing preference for DRIVE and TRANSIT modes
    if (travelMode === 'DRIVE' || travelMode === 'TRANSIT') {
      requestBody.routingPreference = "TRAFFIC_AWARE";
    }

    console.log('Routes API Request:', JSON.stringify(requestBody, null, 2));
    console.log('Origin coordinates:', origin);
    console.log('Destination coordinates:', destination);

    // Make the API request
    const response = await fetch(ROUTES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Routes API Error Response:', errorText);
      throw new Error(`Routes API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Routes API Response:', data);
    return data;

  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
};

/**
 * Decode an encoded polyline string into an array of coordinates
 * This converts the Google-encoded polyline back to lat/lng coordinates for map display
 * 
 * @param {string} encodedPolyline - The encoded polyline string from the API
 * @returns {Array} Array of coordinate objects with lat/lng properties
 */
export const decodePolyline = (encodedPolyline) => {
  console.log('Decoding polyline:', encodedPolyline);
  
  const poly = [];
  let index = 0, len = encodedPolyline.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let shift = 0, result = 0;

    do {
      let b = encodedPolyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      let b = encodedPolyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push({
      lat: lat / 1e5,
      lng: lng / 1e5
    });
  }

  console.log('Decoded coordinates:', poly);
  return poly;
};

/**
 * Format duration string from API response
 * Converts duration like "165s" to a human-readable format
 * 
 * @param {string} duration - Duration string from API (e.g., "165s")
 * @returns {string} Formatted duration (e.g., "2 min 45 sec")
 */
export const formatDuration = (duration) => {
  const seconds = parseInt(duration.replace('s', ''));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} sec`;
  } else if (remainingSeconds === 0) {
    return `${minutes} min`;
  } else {
    return `${minutes} min ${remainingSeconds} sec`;
  }
};

/**
 * Format distance from meters to human-readable format
 * 
 * @param {number} distanceMeters - Distance in meters
 * @returns {string} Formatted distance (e.g., "0.8 km" or "500 m")
 */
export const formatDistance = (distanceMeters) => {
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  } else {
    const kilometers = (distanceMeters / 1000).toFixed(1);
    return `${kilometers} km`;
  }
}; 