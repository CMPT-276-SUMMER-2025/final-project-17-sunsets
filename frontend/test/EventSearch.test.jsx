import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

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
    const MockEventSearch = ({ onSearch, isVisible, previousSearchData }) => (
        <div 
            data-testid="event-search" 
            style={{ display: isVisible ? 'block' : 'none' }}
        >
            <form data-testid="search-form">
                <input
                    data-testid="category-input"
                    name="category"
                    defaultValue={previousSearchData?.category || ''}
                />
                <input
                    data-testid="radius-input"
                    name="radius"
                    type="number"
                    defaultValue={previousSearchData?.radius || 80}
                />
                <input
                    data-testid="start-date-input"
                    name="startDate"
                    type="date"
                    defaultValue={previousSearchData?.startDate || ''}
                />
                <input
                    data-testid="end-date-input"
                    name="endDate"
                    type="date"
                    defaultValue={previousSearchData?.endDate || ''}
                />
                <input
                    data-testid="price-min-input"
                    name="priceMin"
                    type="number"
                    defaultValue={previousSearchData?.priceMin || ''}
                />
                <input
                    data-testid="price-max-input"
                    name="priceMax"
                    type="number"
                    defaultValue={previousSearchData?.priceMax || ''}
                />
                <input
                    data-testid="event-count-input"
                    name="eventCount"
                    type="number"
                    defaultValue={previousSearchData?.startDate || 10}
                />
                <button
                    data-testid="search-submit"
                    onClick={(e) => {
                        e.preventDefault()
                        onSearch({
                            location: "Vancouver",
                            category: 'music',
                            radius: 50,
                            startDate: '2025-01-01',
                            endDate: '2025-12-31',
                            priceMin: 10,
                            priceMax: 100,
                            eventCount: 20
                        })
                    }}
                >
                    Search Events
                </button>
            </form>
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
    
    // Allow all fields to be changed
    it('Allow all fields to be changed', async () => {
        render(<App />)
        const user = userEvent.setup()

        // Enter location
        fireEvent.click(screen.getByTestId('location-submit'))

        /* Edit all fields */

        // Category
        const categoryInput = screen.getByTestId('category-input')
        await user.clear(categoryInput)
        await user.type(categoryInput, 'music')
        expect(categoryInput.value).toBe('music')

        // Radius
        const radiusInput = screen.getByTestId('radius-input')
        await user.clear(radiusInput)
        await user.type(radiusInput, '50') 
        expect(radiusInput.value).toBe('50')

        // Date
        const startDateInput = screen.getByTestId('start-date-input')
        await user.type(startDateInput, '2025-01-01')
        expect(startDateInput.value).toBe('2025-01-01')

        const endDateInput = screen.getByTestId('end-date-input')
        await user.type(endDateInput, '2025-12-31')
        expect(endDateInput.value).toBe('2025-12-31')

        // Price
        const priceMinInput = screen.getByTestId('price-min-input')
        await user.type(priceMinInput, '10')
        expect(priceMinInput.value).toBe('10')

        const priceMaxInput = screen.getByTestId('price-max-input')
        await user.type(priceMaxInput, '100')
        expect(priceMaxInput.value).toBe('100')

        // Event count
        const eventCountInput = screen.getByTestId('event-count-input')
        await user.clear(eventCountInput)
        await user.type(eventCountInput, '20')
        expect(eventCountInput.value).toBe('20')
    })

})