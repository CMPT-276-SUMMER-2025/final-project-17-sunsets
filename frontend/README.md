# Event Finder

A React application that helps users discover events near them using the Ticketmaster Discover API.

## Features

- **Real-time Event Search**: Search for events using the Ticketmaster Discover API
- **Location-based Search**: Enter a city or use your current location to find nearby events
- **Keyword Filtering**: Filter events by keywords (e.g., "music", "sports", "food")
- **Event Details**: View comprehensive event information including dates, locations, prices, and descriptions
- **Direct Ticket Links**: Click "Buy Tickets" to purchase tickets directly from Ticketmaster
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. **Search for Events**:
   - Enter a city name in the location field, or
   - Click "📍 Use My Location" to automatically detect your location
   - Optionally add keywords to filter events (e.g., "concert", "basketball")
   - Select the number of events you want to see (5-20)
   - Click "Search Events"

2. **View Event Details**:
   - Click on any event card to expand and see more details
   - View event description, organizer, category, and pricing information
   - Click "🎫 Buy Tickets" to purchase tickets directly from Ticketmaster
   - Click "🗺️ Route" to get directions to the venue

3. **Navigate Results**:
   - Use the "← Back to Search" button to return to the search form
   - Try different search terms or locations to find more events

## API Integration

This application uses the Ticketmaster Discover API to fetch real event data. The API integration includes:

- **Event Search**: Search for events by location and keywords
- **Geolocation**: Use browser geolocation to find events near the user
- **Data Transformation**: Convert Ticketmaster API responses to match the application's data structure
- **Error Handling**: Graceful handling of API errors and network issues

### API Features Used

- Location-based search (city or coordinates)
- Keyword filtering
- Event count limits
- Date sorting
- Price range information
- Venue details
- Direct ticket purchase links

## Technical Details

### Project Structure

```
src/
├── Components/
│   ├── EventCard/          # Individual event display component
│   ├── EventList/          # List of events with API integration
│   ├── EventSearch/        # Search form with location detection
│   └── Navbar/            # Navigation component
├── services/
│   └── ticketmasterApi.js # API service for Ticketmaster integration
├── App.jsx                # Main application component
└── main.jsx              # Application entry point
```

### Key Technologies

- **React 19**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Ticketmaster API**: Real event data from Ticketmaster's Discover API
- **CSS3**: Modern styling with gradients, animations, and responsive design

### API Configuration

The application uses a pre-configured API key for the Ticketmaster Discover API. The API service handles:

- Request formatting and parameter building
- Response parsing and data transformation
- Error handling and user feedback
- Geolocation integration

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: The "Use My Location" feature requires HTTPS in production or localhost for development.

## Troubleshooting

### Common Issues

1. **No events found**: Try a different city or broader keywords
2. **Location not working**: Ensure your browser allows location access
3. **API errors**: Check your internet connection and try again
4. **Slow loading**: The API may take a few seconds to respond

### Development

To modify the API integration:

1. Edit `src/services/ticketmasterApi.js` to change API parameters
2. Update the data transformation in the `transformEventData` function
3. Modify error handling as needed

## Dev Logs (25/07/22): 

Most of the design elements included in our mid-fidelity prototype have been implemented, and the event search function
that populates the event cards functions as intended. 

I now have to add the option to limit event search by distance (radius), ticket price, and date.

I'll leave the "Route" button blank for now, as M1.5 only specifies the first API features needing to be developed (I know
that the event data API wasn't listed as first on the M1 report, but it needed the most attention due to the API access problems
experienced with Eventbrite, Meetup GraphQL, and AllEvents--the latter two of which required an obscure application process
in order to access their respecive APIs, which I only found out about after paying for the Meetup Pro service).
