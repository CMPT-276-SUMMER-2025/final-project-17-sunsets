// API Configuration - These constants store the Ticketmaster API credentials and endpoint 
// A proxy server will have to be setup in the future to avoid misuse of the following API key.
const API_KEY = 'PKGwgs7x66R2cv0x8CydvJAELtiqTxAV';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

/**
 * Transform Ticketmaster API response to match our event card structure
 * 
 * This function takes the raw data from Ticketmaster's API and converts it into
 * a format that matches our React component's expected data structure.
 * 
 * @param {Object} ticketmasterEvent - Raw event data from Ticketmaster API
 * @returns {Object} Transformed event data for our components
 */
const transformEventData = (ticketmasterEvent) => {
  // Extract venue information from the nested _embedded object
  // The ?. operator (optional chaining) safely accesses nested properties
  // If any property in the chain is null/undefined, it returns undefined instead of throwing an error
  const venue = ticketmasterEvent._embedded?.venues?.[0];
  
  // Extract price range information if available
  const priceRange = ticketmasterEvent.priceRanges?.[0];
  
  // Return a new object with our standardized structure
  return {
    // Use Ticketmaster's unique event ID
    id: ticketmasterEvent.id,
    
    // Map Ticketmaster's 'name' field to our 'title' field
    title: ticketmasterEvent.name,
    
    // Handle different date formats - prefer dateTime, fallback to localDate
    // The || operator provides a fallback if the first value is falsy
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
    image: ticketmasterEvent.images?.[0]?.url
  };
};

/**
 * Fetch events from Ticketmaster API
 * 
 * This is the main function that communicates with Ticketmaster's Discovery API.
 * It builds the API request URL with search parameters and handles the response.
 * 
 * @param {Object} searchParams - Object containing search criteria
 * @param {string} searchParams.location - City name to search in
 * @param {string} searchParams.keywords - Optional keywords to filter events
 * @param {number} searchParams.eventCount - Number of events to return
 * @param {number} searchParams.radius - Search radius in miles (default 50)
 * @returns {Promise<Array>} Promise that resolves to an array of transformed events
 */
export const fetchEvents = async (searchParams) => {
  try {
    // URLSearchParams is a built-in JavaScript class that helps build URL query strings
    // It automatically handles URL encoding and proper formatting
    const params = new URLSearchParams({
      apikey: API_KEY,                    // Your API key for authentication
      size: searchParams.eventCount || 10, // Number of events to return (default 10)
      sort: 'date,asc'                     // Sort events by date, earliest first
    });

    // Add location-based search if a city is provided
    if (searchParams.location) {
      // Ticketmaster API uses 'city' parameter for location-based searches
      params.append('city', searchParams.location);
    }

    // Add keyword search if provided by the user
    if (searchParams.keywords) {
      // The 'keyword' parameter filters events by search terms
      params.append('keyword', searchParams.keywords);
    }

    // Set search radius and units for location-based searches
    // Use user-provided radius or default to 50 miles
    params.append('radius', searchParams.radius || 50);
    params.append('unit', 'miles');   // Use miles as the unit

    // Note: Removed countryCode parameter to allow global search
    // This enables searching for events in Canada, UK, Australia, and other countries

    // Make the HTTP request to Ticketmaster API
    // fetch() is a built-in JavaScript function for making HTTP requests
    // await pauses execution until the request completes
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    // Check if the request was successful (status codes 200-299)
    // response.ok is a boolean that's true for successful status codes
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response from the API
    // await is needed because .json() returns a Promise
    const data = await response.json();
    
    // Check if the API returned any events
    // Ticketmaster wraps events in a _embedded.events array
    if (!data._embedded || !data._embedded.events) {
      return []; // Return empty array if no events found
    }

    // Transform each event from Ticketmaster's format to our component's format
    // .map() creates a new array by applying transformEventData to each event
    const transformedEvents = data._embedded.events.map(transformEventData);
    
    return transformedEvents;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching events from Ticketmaster API:', error);
    
    // Throw a user-friendly error message
    // This error will be caught by the React component and displayed to the user
    throw new Error('Failed to fetch events. Please check your internet connection and try again.');
  }
};

// Note: Removed deprecated coordinate-based search functionality
// The app now uses city-based search which is more user-friendly and reliable 