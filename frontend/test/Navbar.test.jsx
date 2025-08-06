import { render, screen, fireEvent } from '@testing-library/react'
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

// Navbar teste suite
describe('Navbar tests', () => {

    // Check if search field input changes
    it('Update search field as user types', async () => {
        render(<App />)
        const input = screen.getByTestId('location-input')

        // Enter test location
        fireEvent.change(input, { target: { value: 'Vancouver' } } )
        expect(input.value).toBe('Vancouver')
    })

})