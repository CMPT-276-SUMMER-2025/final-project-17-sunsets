// API Configuration - These constants store the Ticketmaster API credentials and endpoint 
// A proxy server will have to be setup in the future to avoid misuse of the following API key.
const API_KEY = 'PKGwgs7x66R2cv0x8CydvJAELtiqTxAV';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

/**
 * Transform Ticketmaster API response to match our event card structure
 * 
 * The Ticketmaster API returns data in a specific format, but our React components
 * expect it in a different format. This function converts between the two.
 * 
 * @param {Object} ticketmasterEvent - Raw event data from Ticketmaster API
 * @returns {Object} Transformed event data for our components
 */
const transformEventData = (ticketmasterEvent) => {
  // Get venue info from the nested data structure
  // The ?. operator safely accesses nested properties without crashing if they don't exist
  const venue = ticketmasterEvent._embedded?.venues?.[0];
  
  // Get price info if it exists
  const priceRange = ticketmasterEvent.priceRanges?.[0];
  
  // Return our standardized event format
  return {
    // Use Ticketmaster's unique event ID
    id: ticketmasterEvent.id,
    
    // Map their 'name' field to our 'title' field
    title: ticketmasterEvent.name,
    
    // Handle different date formats - prefer dateTime, fallback to localDate
    dateTime: ticketmasterEvent.dates?.start?.dateTime || ticketmasterEvent.dates?.start?.localDate,
    
    // Build location string from venue data, with fallback if venue info is missing
    location: venue ? `${venue.name}, ${venue.city?.name}, ${venue.state?.stateCode}` : 'Location TBD',
    
    // Use event info if available, otherwise provide default description
    description: ticketmasterEvent.info || 'No description available',
    
    // Get promoter name or use default organizer name
    organizer: ticketmasterEvent.promoter?.name || 'Event Organizer',
    
    // Extract category from classifications array, default to 'Entertainment'
    category: ticketmasterEvent.classifications?.[0]?.segment?.name || 'Entertainment',
    
    // Format price range if available, otherwise show 'Price varies'
    price: priceRange ? `${priceRange.type} ${priceRange.currency}${priceRange.min} - ${priceRange.currency}${priceRange.max}` : 'Price varies',
    
    // Direct link to buy tickets on Ticketmaster
    url: ticketmasterEvent.url,
    
    // Event image URL if available
    image: ticketmasterEvent.images?.[0]?.url,
    
    // Venue coordinates for map markers (if available)
    venueCoordinates: venue?.location ? {
      lat: parseFloat(venue.location.latitude),
      lng: parseFloat(venue.location.longitude)
    } : null,
    
    // Venue name for marker tooltips
    venueName: venue?.name || 'Unknown Venue'
  };
};

/**
 * Fetch events from Ticketmaster API
 * 
 * This is the main function that talks to Ticketmaster's Discovery API.
 * It takes search parameters, builds the API request, and returns the events.
 * 
 * @param {Object} searchParams - All the search criteria from the user
 * @param {string} searchParams.location - City name to search in
 * @param {string} searchParams.keywords - Optional keywords to filter events
 * @param {number} searchParams.eventCount - Number of events to return
 * @param {number} searchParams.radius - Search radius in kilometers (default 80)
 * @param {string} searchParams.startDate - Start date for event search (YYYY-MM-DD)
 * @param {string} searchParams.endDate - End date for event search (YYYY-MM-DD)
 * @param {number} searchParams.priceMin - Minimum ticket price in CAD
 * @param {number} searchParams.priceMax - Maximum ticket price in CAD
 * @returns {Promise<Array>} Promise that resolves to an array of transformed events
 */
export const fetchEvents = async (searchParams) => {
  try {
    // Build the API request URL with all the search parameters
    const params = new URLSearchParams({
      apikey: API_KEY,                    // Our API key for authentication
      size: searchParams.eventCount || 10, // How many events to return (default 10)
      sort: 'date,asc'                     // Sort events by date, earliest first
    });

    // Add location search if user provided a city
    if (searchParams.location) {
      params.append('city', searchParams.location);
    }

    // Add keyword search if user provided keywords
    if (searchParams.keywords) {
      params.append('keyword', searchParams.keywords);
    }

    // Set search radius and units
    params.append('radius', searchParams.radius || 80);
    params.append('unit', 'km');   // Use kilometers

    // Add date range filtering if user provided dates
    if (searchParams.startDate) {
      // Convert YYYY-MM-DD to ISO 8601 format with time (start of day)
      const startDateTime = `${searchParams.startDate}T00:00:00Z`;
      params.append('startDateTime', startDateTime);
    }
    
    if (searchParams.endDate) {
      // Convert YYYY-MM-DD to ISO 8601 format with time (end of day)
      const endDateTime = `${searchParams.endDate}T23:59:59Z`;
      params.append('endDateTime', endDateTime);
    }

    // Add price range filtering if user provided prices
    if (searchParams.priceMin && searchParams.priceMin !== '') {
      params.append('priceMin', searchParams.priceMin);
    }
    
    if (searchParams.priceMax && searchParams.priceMax !== '') {
      params.append('priceMax', searchParams.priceMax);
    }

    // Set currency to CAD for Canadian users
    params.append('currency', 'CAD');

    // Make the actual API request
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response from the API
    const data = await response.json();
    
    // Check if the API returned any events
    if (!data._embedded || !data._embedded.events) {
      return []; // Return empty array if no events found
    }

    // Transform each event from Ticketmaster's format to our format
    const transformedEvents = data._embedded.events.map(transformEventData);
    
    return transformedEvents;
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching events from Ticketmaster API:', error);
    
    // Throw a user-friendly error message
    throw new Error('Failed to fetch events. Please check your internet connection and try again.');
  }
};

// Note: Removed deprecated coordinate-based search functionality
// App now uses city-based search which is more user-friendly and reliable long term