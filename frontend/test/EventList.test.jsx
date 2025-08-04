import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'
import { describe, it, expect, vi } from 'vitest'
import EventList from '../src/Components/EventList/EventList'
import '@testing-library/jest-dom/vitest'

// Mock Ticketmaster API
vi.mock('../src/services/ticketmasterApi', () => ({
    fetchEvents: vi.fn()
}))

// Import mocked API
import { fetchEvents } from '../src/services/ticketmasterApi'

// EventList test suite
describe('EventList tests', () => {
    // Mock data for events
    const mockEvents = [
        {
            id: '1',
            title: 'Concert',
            dateTime: '2025-07-01T18:00:00',
            location: 'Burnaby',
            description: 'Not a real concert',
            organizer: 'No one',
            category: 'music',
            price: '50-120 CAD',
            url: 'www.notarealwebsite.com/tickets/1'
        },
        {
            id: '2',
            title: 'Basketball Game',
            dateTime: '2025-08-01T18:00:00',
            location: 'Vancouver',
            description: 'Not a real game',
            organizer: 'No one',
            category: 'sports',
            price: '70-150 CAD',
            url: 'www.notarealwebsite.com/tickets/2'
        }
    ]

    // Reset mocks before each test
    beforeEach(() => {
        vi.resetAllMocks()
    })

    // Check if events have correct category
    it('Display events with correct category', async () => {
        // Return filtered events
        fetchEvents.mockResolvedValue(mockEvents.filter(event => event.category === 'music'))

        // Render event list with search params for music
        render(
            <EventList
                searchParams = {{
                    location: 'Burnaby',
                    keywords: 'music',
                    eventCount: 10,
                    radius: 100,
                    startDate: '2024-06-20',
                    endDate: '2024-07-10',
                    priceMin: 0,
                    priceMax: 1000
                }}
            />
        )

        // Check that only music events are displayed
        await waitFor(() => {
            expect(screen.getByText('Concert')).toBeInTheDocument()
            expect(screen.queryByText('Basketball Game')).not.toBeInTheDocument()
        })
    })

    // Check if events are within search radius
    it('Display events within search radius', async () => {
        // Return filtered events
        fetchEvents.mockResolvedValue(mockEvents)

        render(
            <EventList
                searchParams = {{
                    location: 'Vancouver',
                    keywords: '',
                    eventCount: 10,
                    radius: 50,
                    startDate: '',
                    endDate: '',
                    priceMin: 0,
                    priceMax: 1000
                }}
            />
        )

        await waitFor(() => {
            expect(fetchEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    radius: 50
                })
            )
        })
    })
})

/*
// Mock navbar
vi.mock('../src/Components/Navbar/Navbar.jsx', () => {
    const MockNavbar = ({ onLocationChange, onLocationSubmit }) => (
        <div>
        <input 
            data-testid="location-input"
            onChange={(e) => onLocationChange(e.target.value)}
        />
        <button 
            data-testid="location-submit"
            onClick={() => onLocationSubmit("Vancouver")}
        >
            Submit Location
        </button>
        </div>
    )
    return {
        default: MockNavbar
    }
})

// Mock EventSearch
vi.mock('../src/Components/EventSearch/EventSearch.jsx', () => {
    const MockEventSearch = ({ onSearch, isVisible }) => (
        <div 
            data-testid="event-search" 
            style={{ display: isVisible ? 'block' : 'none' }}
        >
        <button
            data-testid="search-submit"
            onClick={() => onSearch({ location: "Vancouver", eventCount: 5 })}  
        >
            Search Events
        </button>
        </div>
    )
    return {
        default: MockEventSearch
    }
})

// Mock EventList
vi.mock('../src/Components/EventList/EventList.jsx', () => {
    const MockEventList = ({ searchParams, handleBackToSearch }) => (
        <div data-testid="event-list">
            {searchParams && (
                <>
                    <div data-testid="event-cards">
                        {Array.from({ length: searchParams.eventCount }).map((_, i) => (
                            <div key={i} data-testid="event-card">Event {i+1}</div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
    return {
        default: MockEventList
    }
})

// EventList test suite
describe('EventList tests', () => {

    // Show EventList with correct number of events
    it('Displays EventList with correct number of cards after searching', async () => {
        render(<App />)

        // Submit location and search
        fireEvent.click(screen.getByTestId('location-submit'))
        fireEvent.click(screen.getByTestId('search-submit'))

        // Check if Event List is visible with 5 cards (number defined in mock)
        await waitFor(() => {
            expect(screen.queryByTestId('event-list')).toBeTruthy()
            expect(screen.getAllByTestId('event-card')).toHaveLength(5)
        })
    })

    // Check price range filtering
    it('Correctly filters events by price range', async () => {

    })

})
*/