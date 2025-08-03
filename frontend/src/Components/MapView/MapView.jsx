// useRef hook is used to store the reference to the DOM element where the map will be rendered
// useEffect and useState are used to manage the state of the map and the location dynamically
import { useEffect, useRef, useState } from 'react';
import './MapView.css';

/**
 * MapView Component
 * 
 * This component creates an interactive Google Maps panel that takes up the left 2/3 of the page.
 * It loads the Google Maps API dynamically, sets up a dark-themed map, and centers it on the user's
 * entered location. The map provides a visual context for where events are happening.
 * 
 * The component handles several key responsibilities:
 * 1. Dynamic loading of the Google Maps API with proper error handling
 * 2. Creating and managing the map instance with custom dark styling
 * 3. Centering the map on user-submitted locations using geocoding
 * 4. Displaying event markers with clickable information windows
 * 5. Managing marker lifecycle (adding/removing markers when events change)
 * 6. Displaying calculated routes using polylines
 * 
 * Future enhancements will include:
 * - Displaying calculated routes between user location and event venues
 * - Showing turn-by-turn directions on the map
 * - Highlighting different route options based on transit mode
 * 
 * @param {Object} props - Component properties
 * @param {string} props.location - The location the user entered (city, address, etc...) - for display only
 * @param {string} props.submittedLocation - The location that was actually submitted (for geocoding)
 * @param {Array} props.events - Array of events to display as markers on the map
 * @param {Object} props.currentRoute - Current route data to display on the map
 * @returns {JSX.Element} The map view component
 */
const MapView = ({ location, submittedLocation, events, currentRoute }) => {
  // Reference to the DOM element where the map will be rendered
  const mapRef = useRef(null);
  // Store the actual Google Maps instance so we can control it later
  const mapInstanceRef = useRef(null);
  // Track whether the map has finished loading so we can hide the loading text
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  // Store references to markers so we can remove them when needed
  const markersRef = useRef([]);
  // Store reference to current route polyline so we can remove it when needed
  const routePolylineRef = useRef(null);

  useEffect(() => {
    // This function handles loading the Google Maps API and setting up the map
    const loadGoogleMaps = async () => {
      // Check if Google Maps is already loaded (prevents duplicate loading)
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create a script tag to load the Google Maps API
      // script.async allows the script to load asynchronously, and 
      // script.defer allows it to load after the page itself has loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDzzzTrEwFB6ase7tvNbnEsD562z2MG6vk&libraries=places`;
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
      if (!mapRef.current || !window.google) return;

      // Start with Vancouver BC as the default center if no location is provided
      const defaultCenter = { lat: 49.2827, lng: -123.1207 };
      
      // Create the actual Google Maps instance with default styling for testing
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12
        // Removed custom styles to test if they're causing the polyline issue
      });

      // Store the map instance so we can control it from other parts of the component
      mapInstanceRef.current = map;
      
      // Give the map a moment (500ms) to fully render before hiding the loading text
      // This prevents the loading text from disappearing too early and possibly confusing the user
      setTimeout(() => {
        setIsMapLoaded(true);
      }, 500);
    };

    // Start the process of loading and setting up the map
    loadGoogleMaps();
  }, []);

  // When the user submits a new location, center the map on that location
  useEffect(() => {
    // Only proceed if we have a map instance and a submitted location to center on
    if (!mapInstanceRef.current || !submittedLocation) return;

    // Convert the submitted location's text (like "Coquitlam, BC") into map coordinates
    const geocoder = new window.google.maps.Geocoder();
    // This function takes the 'submittedLocation' string and converts it into map coordinates
    // When geocoding is successful, 'results' will contain the map coordinates and 'status' will 
    // reflect this success (i.e., used in the Geocoder callback function)
    geocoder.geocode({ address: submittedLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const position = results[0].geometry.location;
        // Move the map to the new location and zoom in a bit
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(12);
      }
    });
  }, [submittedLocation]); // Only trigger when submittedLocation changes, not on every keystroke

  // When events change, update the markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !events) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Add new markers for each event with venue coordinates
    events.forEach(event => {
      if (event.venueCoordinates) {
        const marker = new window.google.maps.Marker({
          position: event.venueCoordinates,
          map: mapInstanceRef.current,
          title: event.title,
          // The marker color is temporarily blue to contrast with the overall dark theme
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4a90e2',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Add click listener to show event info
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${event.title}</h4>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${event.venueName}</p>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${event.dateTime}</p>
              <p style="margin: 0; color: #666; font-size: 12px;">${event.price}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        // Store marker reference for later removal
        markersRef.current.push(marker);
      }
    });
  }, [events]);

  // When route data changes, display the route on the map
  useEffect(() => {
    console.log('=== POLYLINE DEBUG START ===');
    console.log('Map instance available:', !!mapInstanceRef.current);
    console.log('Current route data:', currentRoute);
    
    if (!mapInstanceRef.current) {
      console.log('❌ No map instance available');
      return;
    }

    // If currentRoute is null, remove existing route polyline
    if (!currentRoute) {
      console.log('❌ No current route data');
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
      return;
    }

    // Remove existing route polyline if there is one
    if (routePolylineRef.current) {
      console.log('🗑️ Removing existing polyline');
      routePolylineRef.current.setMap(null);
    }

    console.log('📍 Route coordinates:', currentRoute.coordinates);
    console.log('📍 Number of coordinates:', currentRoute.coordinates?.length);

    // Wait for the map to be fully loaded before adding the polyline
    const addPolyline = () => {
      console.log('🚀 Starting polyline creation...');
      
      // Convert coordinates to Google Maps LatLng objects
      const path = currentRoute.coordinates.map(coord => {
        const latLng = new window.google.maps.LatLng(coord.lat, coord.lng);
        console.log('📍 Converting coord:', coord, 'to LatLng:', latLng);
        return latLng;
      });

      console.log('🛣️ Converted path:', path);
      console.log('🛣️ Path length:', path.length);

      // Create a new polyline for the route
      const routePolyline = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#4a90e2',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstanceRef.current
      });

      console.log('✅ Polyline created:', routePolyline);
      console.log('✅ Polyline map:', routePolyline.getMap());
      console.log('✅ Polyline path:', routePolyline.getPath());

      // Store the polyline reference for later removal
      routePolylineRef.current = routePolyline;

      // Center on the route
      if (currentRoute.coordinates && currentRoute.coordinates.length > 0) {
        const midIndex = Math.floor(currentRoute.coordinates.length / 2);
        const midCoord = currentRoute.coordinates[midIndex];
        const center = new window.google.maps.LatLng(midCoord.lat, midCoord.lng);
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(13);
        
        console.log('🎯 Map centered on:', center);
      }
      
      console.log('=== POLYLINE DEBUG END ===');
    };

    // Add the polyline after a short delay to ensure map is ready
    console.log('⏰ Scheduling polyline creation in 200ms...');
    setTimeout(addPolyline, 200);

  }, [currentRoute]);

  return (
    <div className="map-panel">
      {/* Header section with title and current location display */}
      <div className="map-header">
        <h2>Interactive Map</h2>
        {location && <p>Showing events near: {location}</p>}
        {currentRoute && (
          <div className="route-summary">
            <p><strong>Route:</strong> {currentRoute.distance} • {currentRoute.duration}</p>
            <p><strong>Mode:</strong> {currentRoute.travelMode}</p>
          </div>
        )}
      </div>
      {/* The actual map container - Google Maps will render inside this div tag */}
      <div ref={mapRef} className={`map-container ${isMapLoaded ? 'loaded' : ''}`}>
      </div>
    </div>
  );
};

export default MapView; 