/**
 * ===== Routes API Service =====
 * 
 * Handles calls to the Google Routes API for calculating paths between two locations
 * This service file constructs API requests based on user preferences and processes responses
 * in order to extract the route information that the user needs
 * This includes distance, duration, and data encoded polylines that is displayed on the map panel
 */

// 'decode' function is used to decode the encoded polyline string
// This should be the latest library for decoding polylines
import { decode } from '@googlemaps/polyline-codec'; 

// API key from environment variables
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

/**
 * Calculate a route between two locations with Routes API
 * 
 * @param {Object} origin - The starting location coordinates
 * @param {Object} destination - The destination location coordinates  
 * @param {string} travelMode - The travel mode (WALK, TRANSIT, DRIVE, BICYCLE)
 * @returns {Promise<Object>} The route calculation response
 */
export const calculateRoute = async (origin, destination, travelMode) => {
  try {
    // Convert travel mode to proper API format
    // This helper function is more for validation that the correct travel mode
    // is being passed to the API endpoint, and ensures that a safe default is used
    // in the event that something invalid is passed.
    const getTravelMode = (mode) => {
      switch (mode) {
        case 'DRIVE': return 'DRIVE';
        case 'WALK': return 'WALK';
        case 'BICYCLE': return 'BICYCLE';
        case 'TRANSIT': return 'TRANSIT';
        default: return 'TRANSIT';
      }
    };

    // From the request body based on the format examples provided in Routes API documentation
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

    // Use the most optimal traffic-aware route for driving mode
    if (travelMode === 'DRIVE') {
      requestBody.routingPreference = "TRAFFIC_AWARE_OPTIMAL";
    }

    // Make the API call with the request body and travel mode
    const response = await fetch(ROUTES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters'
      },
      body: JSON.stringify(requestBody)
    });

    // If the API call isn't successful, throw an error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Routes API Error Response:', errorText);
      throw new Error(`Routes API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Otherwise, wait for the response to be parsed as JSON and return
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
};

/**
 * Here we have to decode the returned polyline string from the Routes API into 
 * an array of coordinates that can be placed on our map panel
 * 
 * @param {string} encodedPolyline - The encoded polyline string from the API
 * @returns {Array} - Array of coordinate objects with lat/lng properties
 */
export const decodePolyline = (encodedPolyline) => {
  if (!encodedPolyline) {
    return [];
  }
  
  // Decode the polyline string into an array of coordinate objects, then
  // itterate through these to extract the lat/lng values for use in the map panel
  const decodedPoints = decode(encodedPolyline);
  const coordinates = decodedPoints.map(point => ({
    lat: point[0],
    lng: point[1]
  }));

  return coordinates;
};

 