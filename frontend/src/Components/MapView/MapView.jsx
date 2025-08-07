// useRef hook to store a reference to map DOM element
// useEffect and useState to manage the map state and user's entered location simultaneously
import { useEffect, useRef, useState } from 'react';
import './MapView.css';

/**
 * ===== MapView Component =====
 * 
 * This component creates an interactive Google Maps panel within the leftmost 2/3 of the page
 * It integrates the Maps JavaScript API dynamically with simple dark-themed map components, 
 * and automatically centers+zooms in on the user's provided location (or just Vancoouver BC by default)
 * 
 * Key MapView Responsibilities:
 *  - loading of the Google Maps API with proper error handling
 *  - Creation/management of the map instance with some dark styling 
 *      (edit: possibly add a toggle for light/dark mode instead)
 *  - Conversion of user input location to lat/long coordiantes with Google Geocoding service.
 *      (Geocoding is part of the places libdary that's part of the Maps JavaScript API)
 *  - Displaying event markers with clickable information windows
 *  - Ceation/clearing of event markers from memory when events change.
 *  - Displaying routes using polylines returned from Routes API calls.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.location - The location the user entered (e.g., city, address; for display only)
 * @param {string} props.submittedLocation - The location that was actually submitted (for geocoding)
 * @param {Array} props.events - Array of events to display as markers on the map
 * @param {Object} props.currentRoute - Current route data to display on the map
 * @returns {JSX.Element} - The actual map view component
 */
const MapView = ({ location, submittedLocation, events, currentRoute }) => {
  // Reference to the DOM element where the map will be rendered
  const mapDomRef = useRef(null);
  // Store the actual Google Maps instance so we can control it later
  const mapInstanceRef = useRef(null);
  // Track whether the map has finished loading so we can hide the loading text
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  // Track references to markers so we can remove them from memory
  const markersRef = useRef([]);
  // Create a reference to the current route's polyline
  const routePolylineRef = useRef(null);

  useEffect(() => {
    // This function handles loading/setting up a map instance
    const loadGoogleMaps = async () => {
      // Check if the 'google' object already exists in the global window object & whether
      // the 'maps' object inside it is available (prevents duplicate calls)
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create a script tag to load the Maps JavaScript API
      // script.async allows the script to load asynchronously, and 
      // script.defer allows it to load after the page itself has loaded
      const script = document.createElement('script');
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      // Debug: Check if environment variable is loaded
      console.log('Google Maps API Key from env:', GOOGLE_API_KEY);
      console.log('All env variables:', import.meta.env);
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      // When the script loads successfully, initialize our map
      script.onload = () => {
        initializeMap();
      };

      // If the script fails to load, log an error
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };

      // Add the script to the page head
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      // Make sure we have both the DOM element and Google Maps API
      if (!mapDomRef.current || !window.google) return;

      // Start with Vancouver BC as the default center if no location is provided
      const defaultCenter = { lat: 49.2827, lng: -123.1207 };
      
      // Basic dark-themed styling for key map components
      const darkMapStyles = [
        {
          featureType: 'all', // Catch-all for every map element
          elementType: 'geometry',
          stylers: [{ color: '#242424' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#242424' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'administrative.locality', // City/town names
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi', // Point of interest (e.g., parks, museums, etc.)
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ];
      
      const map = new window.google.maps.Map(mapDomRef.current, {
        center: defaultCenter,
        zoom: 12,
        styles: darkMapStyles
      });

      // Store the map instance so we can control it from other parts of the component
      mapInstanceRef.current = map;
      
      // Give the map a second (500ms) to fully render before hiding loading text
      // This prevents the loading text from disappearing too early and possibly confusing users
      setTimeout(() => {
        setIsMapLoaded(true);
      }, 500);
    };

    // Start the process of loading and setting up the map
    loadGoogleMaps();
  }, []);

  // This function accounts for when the user submits a new location, and
  // the map should re-center on the users new area of interest
  useEffect(() => {
    // Only proceed if we have a map instance and a submitted location to center on
    if (!mapInstanceRef.current || !submittedLocation) return;

    // Convert the submitted location string into lat/long values with Geocoding service
    const geocoder = new window.google.maps.Geocoder();
    // This function takes the 'submittedLocation' string and converts it into map coordinates
    // When geocoding is successful, 'results' will contain the actual values and 'status' will 
    // reflect this success (i.e., used in the Geocoder callback function)
    geocoder.geocode({ address: submittedLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const position = results[0].geometry.location;
        // Move the map to the new location and zoom in a bit
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(12);
      }
    });
  }, [submittedLocation]); // Only trigger when submittedLocation changes (prevents re-centering on every keystroke)

  // When events change, update the markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !events) return;

    // Clear existing markers by iterating through their array and setting them to null
    // Also set markersRef to an empty array to return the previously allocated memory for later use
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Add new markers for each event with venue coordinates
    console.log(`Total events: ${events.length}`);
    console.log(`Events with venue coordinates: ${events.filter(e => e.venueCoordinates).length}`);
    
    events.forEach(event => {
      // Always geocode the location string to get coordinates for markers
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: event.location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const position = results[0].geometry.location;
          
          const marker = new window.google.maps.Marker({
            position: position,
            map: mapInstanceRef.current,
            title: event.title,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4a90e2',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });

          // Add click listener to show event info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: #340;">${event.title}</h4>
                <p style="margin: 0 0 4px 0; color: #650; font-size: 12px;">${event.location}</p>
                <p style="margin: 0 0 4px 0; color: #650; font-size: 12px;">${event.dateTime}</p>
                <p style="margin: 0; color: #650; font-size: 12px;">${event.price}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });

          // Store marker reference for later removal
          markersRef.current.push(marker);
        } else {
          console.log(`Failed to geocode location for event: ${event.title} at ${event.location}`);
        }
      });
    });
  }, [events]);

  // When route data changes, update the route on the map
  useEffect(() => {
    // If no map instance is available, simply return
    if (!mapInstanceRef.current) {
      return;
    }

    // If currentRoute is null, and then if there is a route polyline, 
    // remove it from the map and set the polyline ref to null
    if (!currentRoute) {
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
      return;
    }

    // Remove existing route polyline if there is one
    // In this case there is new route data, but we need to clear the current polyline
    // before drawing the new one
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
    }

    // Wait for the map to be fully loaded before adding the polyline
    const addPolyline = () => {
      // Convert coordinates to Google Maps LatLng objects
      // Uses map function to iterate over each coordinate in the 'currentRoute.coordinates' 
      // array and convert these to Google Maps LatLng objects 
      // map function returns a new array with the converted coordinates
      const path = currentRoute.coordinates.map(coord => {
        const latLng = new window.google.maps.LatLng(coord.lat, coord.lng);
        return latLng;
      });

      // Create a new polyline object with the new LatLng coordinate objects
      const routePolyline = new window.google.maps.Polyline({
        path: path,
        geodesic: true, // Makes the line follow Earth's curvature instead of being just a straight line
        strokeColor: '#4A90E2', // Basic dark blue color (not sure what else is better)
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: mapInstanceRef.current
      });

      // Store the polyline reference for later removal
      routePolylineRef.current = routePolyline;

      // Center on the route without changing zoom
      if (currentRoute.coordinates && currentRoute.coordinates.length > 0) {
        // Find the middle index of the route coordinates array and get the
        // corresponding middle coordinate
        const midIndex = Math.floor(currentRoute.coordinates.length / 2);
        const midCoord = currentRoute.coordinates[midIndex];
        const center = new window.google.maps.LatLng(midCoord.lat, midCoord.lng);
        mapInstanceRef.current.setCenter(center);
      }
    };

    // Add the polyline after a short delay to ensure map is ready
    setTimeout(addPolyline, 200);

  }, [currentRoute]);

  return (
    <div className="map-panel">
      {/* Header section with title and current location display */}
      <div className="map-header">
        <h2>Event Map</h2>
        {location && <p>Search Location: {location}</p>}
      </div>
      {/* The actual map container - Google Maps will render inside this div tag */}
      <div ref={mapDomRef} className={`map-container ${isMapLoaded ? 'loaded' : ''}`}>
      </div>
    </div>
  );
};

export default MapView; 