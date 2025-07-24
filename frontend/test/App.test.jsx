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