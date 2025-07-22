import { useState, useEffect } from 'react';
import EventCard from '../EventCard/EventCard';
import './EventList.css';

const EventList = ({ searchParams }) => {
  // State management for events, loading state, and error handling
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data - replace this with actual API response later
  const mockEvents = [
    {
      id: 1,
      title: "Tech Meetup: React Best Practices",
      dateTime: "2024-01-15T18:00:00",
      location: "Downtown Conference Center",
      description: "Join us for an evening of React development tips and tricks. Learn from industry experts about the latest best practices, performance optimization techniques, and advanced patterns that will take your React skills to the next level.",
      organizer: "Tech Community Vancouver",
      category: "Technology",
      price: "Free"
    },
    {
      id: 2,
      title: "Jazz Night at The Blue Note",
      dateTime: "2024-01-16T20:00:00",
      location: "The Blue Note Jazz Club",
      description: "Experience an unforgettable evening of live jazz music featuring local and international artists. Enjoy great food, drinks, and the smooth sounds of jazz in an intimate setting.",
      organizer: "The Blue Note",
      category: "Music",
      price: "$25"
    },
    {
      id: 3,
      title: "Yoga in the Park",
      dateTime: "2024-01-17T09:00:00",
      location: "Stanley Park",
      description: "Start your day with a refreshing yoga session in the beautiful surroundings of Stanley Park. All skill levels welcome. Don't forget to bring your own mat!",
      organizer: "Vancouver Yoga Collective",
      category: "Health & Wellness",
      price: "Free"
    },
    {
      id: 4,
      title: "Food Truck Festival",
      dateTime: "2024-01-18T12:00:00",
      location: "Granville Island",
      description: "Sample delicious cuisine from Vancouver's best food trucks. From gourmet burgers to international street food, there's something for everyone. Live music and family-friendly activities included.",
      organizer: "Vancouver Food Truck Association",
      category: "Food & Drink",
      price: "Free entry"
    },
    {
      id: 5,
      title: "Startup Networking Mixer",
      dateTime: "2024-01-19T19:00:00",
      location: "Innovation Hub",
      description: "Connect with fellow entrepreneurs, investors, and startup enthusiasts. Share ideas, find collaborators, and build your professional network in Vancouver's thriving startup community.",
      organizer: "Vancouver Startup Network",
      category: "Business",
      price: "$15"
    },
    {
      id: 6,
      title: "Art Gallery Opening",
      dateTime: "2024-01-20T18:30:00",
      location: "Contemporary Art Gallery",
      description: "Be among the first to see our latest exhibition featuring works from emerging local artists. Enjoy wine and cheese while exploring thought-provoking contemporary art pieces.",
      organizer: "Contemporary Art Gallery",
      category: "Arts & Culture",
      price: "Free"
    },
    {
      id: 7,
      title: "Hiking Adventure: Grouse Mountain",
      dateTime: "2024-01-21T08:00:00",
      location: "Grouse Mountain Trailhead",
      description: "Join our guided hiking group for a challenging but rewarding trek up Grouse Mountain. Experience breathtaking views of Vancouver and the surrounding mountains. All fitness levels welcome.",
      organizer: "Vancouver Hiking Club",
      category: "Outdoor & Adventure",
      price: "$10"
    },
    {
      id: 8,
      title: "Craft Beer Tasting",
      dateTime: "2024-01-22T19:00:00",
      location: "Craft Beer Market",
      description: "Sample a variety of locally brewed craft beers from Vancouver's top breweries. Learn about brewing techniques, flavor profiles, and the history of craft beer in the Pacific Northwest.",
      organizer: "Craft Beer Market",
      category: "Food & Drink",
      price: "$35"
    },
    {
      id: 9,
      title: "Photography Workshop",
      dateTime: "2024-01-23T14:00:00",
      location: "Vancouver Public Library",
      description: "Improve your photography skills with hands-on instruction from professional photographers. Learn composition, lighting, and post-processing techniques. Bring your own camera.",
      organizer: "Vancouver Photography Society",
      category: "Education",
      price: "$45"
    },
    {
      id: 10,
      title: "Board Game Night",
      dateTime: "2024-01-24T18:00:00",
      location: "Strategy Games Cafe",
      description: "Spend an evening playing board games with fellow enthusiasts. We'll have a wide selection of games available, from classic favorites to the latest releases. No experience necessary!",
      organizer: "Strategy Games Cafe",
      category: "Social",
      price: "$5"
    }
  ];

  // Simulate API call with loading state
  const fetchEvents = async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay for realistic user experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter events based on keywords if provided
      let filteredEvents = mockEvents;
      if (params.keywords) {
        const keywords = params.keywords.toLowerCase().split(',').map(k => k.trim());
        filteredEvents = mockEvents.filter(event => 
          keywords.some(keyword => 
            event.title.toLowerCase().includes(keyword) ||
            event.description.toLowerCase().includes(keyword) ||
            event.category.toLowerCase().includes(keyword)
          )
        );
      }

      // Limit to requested number of events
      filteredEvents = filteredEvents.slice(0, params.eventCount);
      
      setEvents(filteredEvents);
    } catch (err) {
      setError('Failed to fetch events. Please try again.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when search parameters change
  useEffect(() => {
    if (searchParams) {
      fetchEvents(searchParams);
    }
  }, [searchParams]);

  // Loading state with spinner animation
  if (loading) {
    return (
      <div className="event-list">
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching for events...</p>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="event-list">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => fetchEvents(searchParams)}>Try Again</button>
        </div>
      </div>
    );
  }

  // Initial state when no search has been performed
  if (!searchParams) {
    return (
      <div className="event-list">
        <div className="no-search">
          <p>Enter your search preferences to find events near you!</p>
        </div>
      </div>
    );
  }

  // No results found state
  if (events.length === 0) {
    return (
      <div className="event-list">
        <div className="no-events">
          <p>No events found matching your criteria.</p>
          <p>Try adjusting your search terms or location.</p>
        </div>
      </div>
    );
  }

  // Display events with count and individual event cards
  return (
    <div className="event-list">
      <div className="event-count">
        <h3>Found {events.length} event{events.length !== 1 ? 's' : ''} near {searchParams.location}</h3>
      </div>
      <div className="events-container">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventList; 