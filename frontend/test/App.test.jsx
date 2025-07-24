import { render, screen, fireEvent, waitFor } from 'testing-library/react'
import App from './App'
import { describe, it, expect, vi } from 'vitest'

console.log("Running App.test.jsx")

// Mock components to isolate tests
vi.mock('./Components/Navbar/Navbar.jsx', () => ({
    default: ({ onLocationChange, onLocationSubmit }) => (
        <div data-testid="navbar">
            <input
                data-testid="location-input"
                onChange={(e) => onLocationChange(e.target.value)}
            />
            <button
                data-testid="location-submit"
                onClick={() => onLocationSubmit("Test City")}
            >
                Submit
            </button>
        </div>
    )
}))

vi.mock('./Components/EventSearch/EventSearch.jsx', () => ({
  default: ({ onSearch, isVisible }) => (
    <div data-testid="event-search" style={{ display: isVisible ? 'block' : 'none' }}>
      <button 
        data-testid="search-submit"
        onClick={() => onSearch({ location: "Test City", eventCount: 5 })}
      >
        Search
      </button>
    </div>
  )
}))

vi.mock('./Components/EventList/EventList.jsx', () => ({
  default: ({ searchParams }) => (
    <div data-testid="event-list">
      {searchParams && (
        <div data-testid="event-cards">
          {Array.from({ length: searchParams.eventCount }).map((_, i) => (
            <div key={i} data-testid="event-card">Event {i + 1}</div>
          ))}
        </div>
      )}
    </div>
  )
}))

// Create suite for tests - organizes relevant tests in one section
describe('App components', () => {

    /* Define individual tests */

    // Update location
    it('should update location as user types', async () => {
        render(<App />)
        const input = screen.getByTestId('location-input')

        // Enter test location
        fireEvent.change(input, { target: { value: 'Vancouver' } } )
        expect(input.value).toBe('Vancouver')
    })

    // Show Event Search after submitting location
    it('should show Event Search after submitting location', async () => {
        render(<App />)

        // Submit location
        fireEvent.click(screen.getByTestId('location-submit'))

        // Check if Event Search is visible
        await waitFor(() => {
            expect(screen.getByTestId('event-search')).toBeVisible()
        })
    })

    // Show Event List after search
    it('should display Event List with correct number of cards after searching', async () => {
        render(<App />)

        // Submit location and search
        fireEvent.click(screen.getByTestId('location-submit'))
        fireEvent.click(screen.getByTestId('search-submit'))

        // Check if Event List is visible with 5 cards (number defined in mock)
        await waitFor(() => {
            expect(screen.getByTestId('event-list')).toBeInTheDocument()
            expect(screen.getAllByTestId('event-card')).toHaveLength(5)
        })
    })

    // Back button returns to search
    it('should should return to search when clicking back button', async () => {
        render(<App />)

        // Submit location and search
        fireEvent.click(screen.getByTestId('location-submit'))
        fireEvent.click(screen.getByTestId('search-submit'))

        // Click back button
        fireEvent.click(screen.getByText(/back to search/i))

        // Check if search is visible again
        await waitFor(() => {
            expect(screen.getByTestId('event-search')).toBeVisible()
        })
    })
})