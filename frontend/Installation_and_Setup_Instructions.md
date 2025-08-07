# Installation and Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd final-project-17-sunsets/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root directory:

```bash
# Create .env file
touch .env
```

Add the following content to the `.env` file:

```env
# API Keys for the Event Discovery Application
# Replace these placeholder values with your actual API keys

# Google Maps JavaScript API Key
# Get your key from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Ticketmaster Discovery API Key  
# Get your key from: https://developer-acct.ticketmaster.com/user/login
VITE_TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
```

**Important:** Replace the placeholder values with your actual API keys.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## API Key Requirements

### Google Maps JavaScript API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Routes API
4. Create credentials (API Key)
5. Restrict the API key to the specific APIs you enabled

### Ticketmaster Discovery API Key
1. Go to [Ticketmaster Developer Portal](https://developer-acct.ticketmaster.com/user/login)
2. Create an account or sign in
3. Create a new application
4. Get your API key from the application dashboard

## Troubleshooting

### Common Issues

1. **"API key undefined" errors**
   - Ensure your `.env` file is in the project root directory
   - Verify the environment variable names start with `VITE_`
   - Restart the development server after creating the `.env` file

2. **"Failed to load Google Maps API"**
   - Check that your Google Maps API key is correct
   - Ensure the Maps JavaScript API is enabled in Google Cloud Console
   - Verify the API key has the necessary restrictions

3. **"No events found"**
   - Verify your Ticketmaster API key is correct
   - Check that the Discovery API is enabled for your application
   - Ensure you're searching for events in a supported location

4. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear the `node_modules` folder and run `npm install` again
   - Check that you're using Node.js version 18 or higher

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── Components/          # React components
│   │   ├── EventCard/      # Individual event display
│   │   ├── EventList/      # List of events
│   │   ├── EventSearch/    # Search form
│   │   ├── MapView/        # Google Maps integration
│   │   ├── Navbar/         # Navigation header
│   │   └── RouteInput/     # Route calculation interface
│   ├── services/           # API service functions
│   │   ├── ticketmasterApi.js
│   │   └── routesApi.js
│   └── App.jsx            # Main application component
├── .env                   # Environment variables (create this)
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## Features

The application includes the following features:

- **Event Search**: Search for events by location, date, price, and category
- **Interactive Map**: View events on a Google Maps interface with markers
- **Route Planning**: Calculate routes to events with turn-by-turn directions
- **Price Filtering**: Filter events by price range
- **Category Filtering**: Filter events by category (music, sports, etc.)
- **Responsive Design**: Works on desktop and mobile devices

## Support

If you encounter any issues during installation or setup, please:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure API keys are correctly configured
4. Check the browser console for error messages

For additional help, refer to the project documentation or contact the development team.
