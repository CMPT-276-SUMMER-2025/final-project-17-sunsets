import { useEffect, useRef, useState } from 'react';
import './MapView.css';

/**
 * MapView Component
 * 
 * Displays an interactive Google Maps panel that takes up the left 2/3 of the page.
 * The map will be styled to match the existing design aesthetic.
 * 
 * @param {Object} props - Component props
 * @param {string} props.location - Current location to center the map on
 */
const MapView = ({ location }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Load the Google Maps API script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDzzzTrEwFB6ase7tvNbnEsD562z2MG6vk&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeMap();
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      // Default center (Vancouver, BC) if no location provided
      const defaultCenter = { lat: 49.2827, lng: -123.1207 };
      
      // Create map instance
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

      mapInstanceRef.current = map;
      
      // Mark map as loaded after a short delay to ensure it's fully rendered
      setTimeout(() => {
        setIsMapLoaded(true);
      }, 500);
    };

    loadGoogleMaps();
  }, []);

  // Update map center when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;

    // Geocode the location to get coordinates
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const position = results[0].geometry.location;
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(13);
      }
    });
  }, [location]);

  return (
    <div className="map-panel">
      <div className="map-header">
        <h2>Interactive Map</h2>
        {location && <p>Showing events near: {location}</p>}
      </div>
      <div ref={mapRef} className={`map-container ${isMapLoaded ? 'loaded' : ''}`}>
        {/* Google Maps will be rendered here */}
      </div>
    </div>
  );
};

export default MapView; 