import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'
import { describe, it, expect, vi } from 'vitest'

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
                    <button 
                        data-testid="mock-back-button"
                        onClick={handleBackToSearch}
                    >
                        ← Back to Search
                    </button>
                </>
            )}
        </div>
    )
    return {
        default: MockEventList
    }
})

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

    /* TO DO */

    // Show EventList with correct price ranges

    // Show EventList with correct distance

    // Show EventList with correct category of events

    // Check if back button works

})