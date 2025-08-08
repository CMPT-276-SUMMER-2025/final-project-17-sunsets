 // API key from environment variables and base url
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;
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
const transformEventData = (ticketmasterEvent, detailedPricing = null) => {
  // Get venue info from the nested data structure
  // ?. operator safely accesses nested properties without crashing if they don't exist
  const venue = ticketmasterEvent._embedded?.venues?.[0];
  
  // Use detailed pricing if available, otherwise fall back to basic pricing from search results
  const priceRanges = detailedPricing?.priceRanges || ticketmasterEvent.priceRanges || [];
  const priceRange = priceRanges[0];
  
  // Return our standardized event format
  return {
    // Use Ticketmaster's unique event ID
    id: ticketmasterEvent.id,
    
    // Map their 'name' field to our 'title' field
    title: ticketmasterEvent.name,
    
    // Handle different date formats - prefer dateTime, but if not available fallback to localDate
    dateTime: ticketmasterEvent.dates?.start?.dateTime || ticketmasterEvent.dates?.start?.localDate,
    
    // Build location string from venue data, with fallback if venue info is missing
    location: venue ? `${venue.name}${venue.city?.name ? `, ${venue.city.name}` : ''}${venue.state?.stateCode ? `, ${venue.state.stateCode}` : ''}` : 'Location TBD',
    
    // Use event info if available, otherwise provide default description
    description: ticketmasterEvent.info || 'No description available',
    
    // Get promoter name or use default organizer name
    organizer: ticketmasterEvent.promoter?.name || 'Event Organizer',
    
    // Extract category from classifications array, default to 'Entertainment'
    category: ticketmasterEvent.classifications?.[0]?.segment?.name || 'Entertainment',
    
    // Format price range if available, otherwise show 'Price varies'
    price: priceRange ? `${priceRange.type} ${priceRange.currency}${priceRange.min} - ${priceRange.currency}${priceRange.max}` : 'Price varies',
    // Store price ranges for filtering (use detailed pricing if available)
    priceRanges: priceRanges,
    
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
 * @param {string} searchParams.keywords - Optional keywords to filter events (such as for user interests)
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
    // Ensure API key is present
    if (!API_KEY) {
      throw new Error('Missing Ticketmaster API key (VITE_TICKETMASTER_API_KEY).');
    }
    // Build the API request URL with all the search parameters
    // Always fetch 199 events for maximum user options (API limit per call is 200)
    const requestedSize = searchParams.eventCount || 10;
    const effectiveSize = 199; 
    
    const params = new URLSearchParams({
      apikey: API_KEY, // Our API key for authentication
      size: effectiveSize, // How many events to return (API limit per call is 200)
      sort: 'date,asc' // Sort events by date, earliest first
    });

    // Add location search if user provided a city
    if (searchParams.location) {
      params.append('city', searchParams.location);
    }

    // Use keyword for open-ended searching
    if (searchParams.category && String(searchParams.category).trim() !== '') {
      params.append('keyword', String(searchParams.category).trim());
    }

    // Set search radius and units
    params.append('radius', searchParams.radius || 80);
    params.append('unit', 'km');   // Use kilometers since we're in Canada

    // Add date range filtering if user provided valid dates
    const startDateStr = searchParams.startDate ? String(searchParams.startDate).trim() : '';
    const endDateStr = searchParams.endDate ? String(searchParams.endDate).trim() : '';
    const todayStr = new Date().toISOString().split('T')[0];

    // Returns true if the string is a valid YYYY-MM-DD date
    const isValidYyyyMmDd = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

    // Apply date range filtering if user provided dates are valid
    const validStartDate = startDateStr && isValidYyyyMmDd(startDateStr) && startDateStr >= todayStr;
    const validEndDate = endDateStr && isValidYyyyMmDd(endDateStr) && (!startDateStr || endDateStr >= startDateStr);

    // Add start date parameter if user provided a valid start date
    // (same for the end date parameter at in the following lines)
    if (validStartDate) {
      const startDateTime = `${startDateStr}T00:00:00Z`;
      params.append('startDateTime', startDateTime);
    }
    if (validEndDate) {
      const endDateTime = `${endDateStr}T23:59:59Z`;
      params.append('endDateTime', endDateTime);
    }

    // Note: Price filtering is now handled in a two-step process
    // First get events, then fetch details for price filtering
    // We don't send priceMin/priceMax to the search API as it doesn't support them

    // Set currency to CAD for Canadian users
    params.append('currency', 'CAD');
    
    // Construct the url with our prameters, and make the actual API call
    const url = `${BASE_URL}?${params.toString()}`;
    const response = await fetch(url);
    
    // Check if the request was successful, and if not throw an error that's caught
    // in EventSearch.jsx and displayed nicely to the user.
    if (!response.ok) {
      let details = '';
      try {
        details = await response.text();
      } catch (_) {
        // Ignore potential secondary error when reading the response text so that
        // we don't hide the original error indicated in the response.
      }
      throw new Error(`Ticketmaster API error ${response.status}${details ? `: ${details}` : ''}`);
    }

    // Parse the JSON response from the API
    const data = await response.json();
    
    // Check if the API returned any events
    if (!data._embedded || !data._embedded.events) {
      return [];
    }
    
    // Transform each event from Ticketmaster's format to our format
    let transformedEvents = data._embedded.events.map(transformEventData);
    
    // Always fetch details for each event to get accurate pricing information
    // This works by making calls to another TKMaster endpoint, namely 'Get Event Details'
    // and is done for each returned event ID.
    const eventsWithPricing = await Promise.all(
      transformedEvents.map(async (event) => {
        try {
          const details = await fetchEventDetails(event.id);
          
          // Re-transform the event with detailed pricing data
          const originalEvent = data._embedded.events.find(e => e.id === event.id);
          const eventWithDetailedPricing = transformEventData(originalEvent, details);
          
          return eventWithDetailedPricing;
        } catch (error) {
          return {
            ...event,
            priceRanges: [] // Empty array to indicate no pricing data available
          };
        }
      })
    );
    
    // If price filtering is requested, filter the events
    if ((searchParams.priceMin && searchParams.priceMin !== '') || (searchParams.priceMax && searchParams.priceMax !== '')) {
      const userMin = searchParams.priceMin ? parseFloat(searchParams.priceMin) : 0;
      const userMax = searchParams.priceMax ? parseFloat(searchParams.priceMax) : Infinity;
      
      // Filter events based on price range
      const filteredEvents = eventsWithPricing.filter(event => {
        const inRange = isEventInPriceRange(event.priceRanges, userMin, userMax);
        return inRange;
      });
      
      transformedEvents = filteredEvents;
      
      // Limit to the user's requested event count
      if (transformedEvents.length > requestedSize) {
        transformedEvents = transformedEvents.slice(0, requestedSize);
      }
    } else {
      // No price filtering, but still use the events with pricing data
      transformedEvents = eventsWithPricing;
      
      // Limit to the user's requested event count
      if (transformedEvents.length > requestedSize) {
        transformedEvents = transformedEvents.slice(0, requestedSize);
      }
    }
    
    return transformedEvents;
  } catch (error) {
    // Surface underlying error details to help users understand what went wrong
    throw new Error(`Failed to fetch events. ${error.message || 'Please try again later.'}`);
  }
};

/**
 * Fetch detailed event information including pricing
 * 
 * @param {string} eventId - The Ticketmaster event ID
 * @returns {Promise<Object>} Promise that resolves to detailed event data
 */
export const fetchEventDetails = async (eventId) => {
  try {
    // Construct 'Get Event Details' endpoint url, and API call
    const response = await fetch(`${BASE_URL.replace('/events.json', '')}/events/${eventId}?apikey=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Wait for the response to be parsed as JSON, then return the data
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch event details.');
  }
};

/**
 * Check if event pricing falls within the specified range
 * 
 * @param {Array} priceRanges - Array of price range objects from API
 * @param {number} userMin - User's minimum price
 * @param {number} userMax - User's maximum price
 * @returns {boolean} True if event has tickets within the price range
 */
  export const isEventInPriceRange = (priceRanges, userMin, userMax) => {
    if (!priceRanges || priceRanges.length === 0) {
      return false; // No pricing info available
    }
  
  // Check if any price range overlaps with user's range
  const result = priceRanges.some(range => {
          const rangeMin = range.min;
      const rangeMax = range.max;
      
      // Check if ranges overlap
      const overlaps = rangeMin <= userMax && rangeMax >= userMin;
      
      return overlaps;
    });
    
    return result;
};