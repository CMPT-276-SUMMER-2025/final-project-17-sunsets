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
 * @param {Object} props - Component properties
 * @param {string} props.location - The location the user entered (city, address, etc...) - for display only
 * @param {string} props.submittedLocation - The location that was actually submitted (for geocoding)
 * @param {Array} props.events - Array of events to display as markers on the map
 */
const MapView = ({ location, submittedLocation, events }) => {
  // Reference to the DOM element where the map will be rendered
  const mapRef = useRef(null);
  // Store the actual Google Maps instance so we can control it later
  const mapInstanceRef = useRef(null);
  // Track whether the map has finished loading so we can hide the loading text
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  // Store references to markers so we can remove them when needed
  const markersRef = useRef([]);

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
      
      // Create the actual Google Maps instance with our custom dark styling (aligns with the
      // similarly dark/glowing red theme of the rest of the app)
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          {
            featureType: 'all',
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
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi',
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
        ]
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

  return (
    <div className="map-panel">
      {/* Header section with title and current location display */}
      <div className="map-header">
        <h2>Interactive Map</h2>
        {location && <p>Showing events near: {location}</p>}
      </div>
      {/* The actual map container - Google Maps will render inside this div tag */}
      <div ref={mapRef} className={`map-container ${isMapLoaded ? 'loaded' : ''}`}>
      </div>
    </div>
  );
};

export default MapView; 