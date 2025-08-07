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
    // Always fetch 199 events for maximum user options (API limit is 200)
    const requestedSize = searchParams.eventCount || 10;
    const effectiveSize = 199; // Always fetch 199 events (safe under API limit of 200)
    
    console.log(`Requested size: ${requestedSize}, Effective size: ${effectiveSize}`);
    
    const params = new URLSearchParams({
      apikey: API_KEY,                    // Our API key for authentication
      size: effectiveSize,                 // How many events to return
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

    // Note: Price filtering is now handled in a two-step process
    // First get events, then fetch details for price filtering
    // We don't send priceMin/priceMax to the search API as it doesn't support them

    // Set currency to CAD for Canadian users
    params.append('currency', 'CAD');

    // Debug: Log the API request parameters
    console.log('Ticketmaster API Request Parameters:', Object.fromEntries(params));
    
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

    console.log(`API returned ${data._embedded.events.length} events from Event Search`);
    
    // Transform each event from Ticketmaster's format to our format
    let transformedEvents = data._embedded.events.map(transformEventData);
    
    // Always fetch details for each event to get accurate pricing information
    console.log(`Fetching detailed pricing information for ${transformedEvents.length} events`);
    
    const eventsWithPricing = await Promise.all(
      transformedEvents.map(async (event) => {
        try {
          const details = await fetchEventDetails(event.id);
          
          // Debug: Log the full details response for first few events
          if (transformedEvents.indexOf(event) < 3) {
            console.log(`Event ${event.id} (${event.title}) details:`, details);
            console.log(`Price ranges for ${event.title}:`, details.priceRanges);
          }
          
          // Re-transform the event with detailed pricing data
          const originalEvent = data._embedded.events.find(e => e.id === event.id);
          const eventWithDetailedPricing = transformEventData(originalEvent, details);
          
          return eventWithDetailedPricing;
        } catch (error) {
          console.warn(`Failed to fetch details for event ${event.id}:`, error);
          return {
            ...event,
            priceRanges: []
          };
        }
      })
    );
    
    // Log search effectiveness
    const eventsWithPricingData = eventsWithPricing.filter(event => 
      event.priceRanges && event.priceRanges.length > 0
    );
    
    console.log(`Search effectiveness:`);
    console.log(`  Total events fetched: ${eventsWithPricing.length}`);
    console.log(`  Events with pricing data: ${eventsWithPricingData.length}`);
    console.log(`  Pricing coverage: ${((eventsWithPricingData.length / eventsWithPricing.length) * 100).toFixed(1)}%`);
    
    // If price filtering is requested, check if we have enough data
    if ((searchParams.priceMin && searchParams.priceMin !== '') || (searchParams.priceMax && searchParams.priceMax !== '')) {
      if (eventsWithPricingData.length < 5) {
        console.log(`Warning: Only ${eventsWithPricingData.length} events have pricing data. This might limit price filtering options.`);
      }
    }
    
    // If price filtering is requested, filter the events
    if ((searchParams.priceMin && searchParams.priceMin !== '') || (searchParams.priceMax && searchParams.priceMax !== '')) {
      const userMin = searchParams.priceMin ? parseFloat(searchParams.priceMin) : 0;
      const userMax = searchParams.priceMax ? parseFloat(searchParams.priceMax) : Infinity;
      
      console.log(`Price filtering requested:`);
      console.log(`  Raw priceMin: "${searchParams.priceMin}" (type: ${typeof searchParams.priceMin})`);
      console.log(`  Raw priceMax: "${searchParams.priceMax}" (type: ${typeof searchParams.priceMax})`);
      console.log(`  Parsed userMin: ${userMin} (type: ${typeof userMin})`);
      console.log(`  Parsed userMax: ${userMax} (type: ${typeof userMax})`);
      console.log(`Filtering events by price range: $${userMin} - $${userMax}`);
      
      // Filter events based on price range
      console.log(`Filtering ${eventsWithPricing.length} events with price range $${userMin} - $${userMax}`);
      
      const filteredEvents = eventsWithPricing.filter(event => {
        const inRange = isEventInPriceRange(event.priceRanges, userMin, userMax);
        if (!inRange) {
          console.log(`Event "${event.title}" excluded - price ranges:`, event.priceRanges);
        }
        return inRange;
      });
      
      transformedEvents = filteredEvents;
      
      console.log(`Found ${transformedEvents.length} events within price range out of ${eventsWithPricing.length} total events`);
      
      // Limit to the user's requested event count
      if (transformedEvents.length > requestedSize) {
        console.log(`Limiting results to ${requestedSize} events (user requested ${requestedSize})`);
        transformedEvents = transformedEvents.slice(0, requestedSize);
      }
    } else {
      // No price filtering, but still use the events with pricing data
      transformedEvents = eventsWithPricing;
      console.log(`Displaying all ${transformedEvents.length} events with pricing information`);
      
      // Limit to the user's requested event count
      if (transformedEvents.length > requestedSize) {
        console.log(`Limiting results to ${requestedSize} events (user requested ${requestedSize})`);
        transformedEvents = transformedEvents.slice(0, requestedSize);
      }
    }
    
    // Debug: Summary of pricing data
    const finalEventsWithPricingData = transformedEvents.filter(event => 
      event.priceRanges && event.priceRanges.length > 0
    );
    const finalEventsWithoutPricingData = transformedEvents.filter(event => 
      !event.priceRanges || event.priceRanges.length === 0
    );
    
    console.log(`=== FINAL PRICING SUMMARY ===`);
    console.log(`Total events: ${transformedEvents.length}`);
    console.log(`Events with pricing: ${finalEventsWithPricingData.length}`);
    console.log(`Events without pricing: ${finalEventsWithoutPricingData.length}`);
    console.log(`Percentage with pricing: ${((finalEventsWithPricingData.length / transformedEvents.length) * 100).toFixed(1)}%`);
    console.log(`User requested: ${requestedSize} events`);
    console.log(`Events before limiting: ${transformedEvents.length}`);
    console.log(`Events after limiting: ${Math.min(transformedEvents.length, requestedSize)}`);
    
    // Log first few events with pricing for inspection
    if (finalEventsWithPricingData.length > 0) {
      console.log('Sample events with pricing:');
      finalEventsWithPricingData.slice(0, 3).forEach(event => {
        console.log(`- ${event.title}: ${JSON.stringify(event.priceRanges)}`);
      });
    }
    
    return transformedEvents;
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching events from Ticketmaster API:', error);
    
    // Throw a user-friendly error message
    throw new Error('Failed to fetch events. Please check your internet connection and try again.');
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
    const response = await fetch(`${BASE_URL.replace('/events.json', '')}/events/${eventId}?apikey=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching event details:', error);
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
  console.log(`isEventInPriceRange called with:`, { priceRanges, userMin, userMax });
  
  if (!priceRanges || priceRanges.length === 0) {
    console.log('No price ranges available, returning false');
    return false; // No pricing info available
  }
  
  // Check if any price range overlaps with user's range
  const result = priceRanges.some(range => {
    const rangeMin = range.min;
    const rangeMax = range.max;
    
    console.log(`Checking range: ${rangeMin} - ${rangeMax} against user range: ${userMin} - ${userMax}`);
    
    // Check if ranges overlap
    const overlaps = rangeMin <= userMax && rangeMax >= userMin;
    console.log(`Range overlaps: ${overlaps}`);
    
    return overlaps;
  });
  
  console.log(`Final result for price range check: ${result}`);
  return result;
};

// Note: Removed deprecated coordinate-based search functionality
// App now uses city-based search which is more user-friendly and reliable long term