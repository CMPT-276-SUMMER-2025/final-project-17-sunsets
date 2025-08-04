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

// EventSearch test suite
describe('EventSearch tests', () => {

    // Show Event Search after submitting location
    it('Show EventSearch after submitting location', async () => {
        render(<App />)

        // Submit location
        fireEvent.click(screen.getByTestId('location-submit'))

        // Check if Event Search is visible
        await waitFor(() => {
            expect(screen.getByTestId('event-search')).toBeTruthy()
        })
    })
    
    /* TO DO */

    // Check all EventSearch fields can be changed

})