import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import RouteInput from '../src/Components/RouteInput/RouteInput'
import '@testing-library/jest-dom/vitest'
import * as routesApi from '../src/services/routesApi'

// Mock geolocation API
vi.mock('@googlemaps/polyline-codec', () => ({
    decode: vi.fn(() => {
        [49.2827, -123.1207],
        [49.2830, -123.1210]
    })
}))

// Mock routes API
vi.mock('../src/services/routesApi', () => ({
    calculateRoute: vi.fn(() => Promise.resolve({
        routes: [{
            polyline: { encodedPolyline: 'mockPolylineString' },
            duration: '15 mins',
            distanceMeters: 2500,
            duration: '30 mins',
            legs: [
                {
                    steps: [
                        {
                            navigationInstruction: { instructions: 'Head north on Main St' },
                            distanceMeters: 500
                        },
                        {
                            navigationInstruction: { instructions: 'Turn right onto 1st Ave' },
                            distanceMeters: 2000
                        }
                    ]
                }
            ]
        }]
    })),
    decodePolyline: vi.fn(() => [
        { lat: 49.2827, lng: -123.1207},
        { lat: 49.2830, lng: -123.1210}
    ])
}))

// Mock window.navigator.geolocation
const mockGeolocation = {
    getCurrentPosition: vi.fn()
}
window.navigator.geolocation = mockGeolocation

// Mock Google Maps geocoder
window.google = {
    maps: {
        Geocoder: vi.fn(() => ({
            geocode: vi.fn((request, callback) => {
                callback([{
                    geometry: { location: { lat: () => 49.2827, lng: () => -123.1207 } },
                    formatted_address: '123 Random Street, Vancouver, BC'
                }], 'OK')
            })
        })),
        LatLng: vi.fn()
    }
}

// RouteInput test suite
describe('RouteInput tests', () => {

    const mockEvent = {
        title: 'Real Event',
        location: 'Real Stadium, Vancouver',
        dateTime: '2025-01-01T18:00:00',
        venueCoordinates: { lat: 49.2830, lng: -123.1210 }
    }

    const mockProps = {
        selectedEvent: mockEvent,
        onBack: vi.fn(),
        onRouteCalculated: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // Check if geolocation automatically fills starting address
    it('Geolocate user and automatically fill starting address', async () => {
        // Mock successful geolocation
        mockGeolocation.getCurrentPosition.mockImplementation((success) =>
            success({
                coords: {
                    latitude: 49.2827,
                    longitude: -123.1207,
                    accuracy: 50
                }
            })
        )

        render(<RouteInput {...mockProps} />)
        const user = userEvent.setup()

        await waitFor(() => {
            user.click(screen.getByText('📍 Use Geolocation'))
            expect(screen.getByDisplayValue(/123 Random Street/)).toBeInTheDocument()
        })
    })

    // Switch between transit modes
    it('Switch between transit modes', async () => {
        render(<RouteInput {...mockProps} />)
        const user = userEvent.setup()

        // Create list of modes
        const modes = [
            { text: '🚶 Walking', mode: 'WALK' },
            { text: '🚌 Transit', mode: 'TRANSIT' },
            { text: '🚗 Driving', mode: 'DRIVE' },
            { text: '🚴 Cycling', mode: 'BICYCLE' }
        ]

        // Create button for each mode and click
        for (const { text, mode } of modes) {
            const button = screen.getByText(text)
            await user.click(button)
            expect(button).toHaveClass('active')
        }
    })

    // Check if directions are shown
    it('Calculate route and show step-by-step directions', async () => {
        routesApi.calculateRoute.mockImplementationOnce(() =>
            Promise.resolve({
                routes: [{
                    polyline: {
                        encodedPolyline: 'mockEncodedString'
                    },
                    distanceMeters: 2500,
                    duration: '30 mins',
                    legs: [
                        {
                            steps: [
                                {
                                    navigationInstruction: { instructions: 'Head north on Main St' },
                                    distanceMeters: 500
                                },
                                {
                                    navigationInstruction: { instructions: 'Turn right onto 1st Ave' },
                                    distanceMeters: 2000
                                }
                            ]
                        }
                    ]
                }]
            })
        )

        routesApi.decodePolyline.mockImplementationOnce(() => [
            { lat: 49.2827, lng: -123.1207 },
            { lat: 49.2830, lng: -123.1210 }
        ])

        render(<RouteInput {...mockProps} />)
        const user = userEvent.setup()

        // Enter address, change transit mode, and calculate route
        await user.type(screen.getByPlaceholderText(/Enter your address/), '123 My Street, Vancouver')
        await user.click(screen.getByText('🚗 Driving'))
        await user.click(screen.getByText('🗺️ Calculate Route & Directions'))
        
        await waitFor(() => {
            expect(mockProps.onRouteCalculated).toHaveBeenCalled()
        })
    })

    // Test Open in Google Maps button
    it('Open route in Google Maps', async () => {
        global.open = vi.fn()

        render(<RouteInput {...mockProps} />)
        const user = userEvent.setup()

        // Enter address and calculate route first
        await user.type(screen.getByPlaceholderText(/Enter your address/), '123 My Street, Vancouver')
        await user.click(screen.getByText('🚗 Driving'))
        await user.click(screen.getByText('🗺️ Calculate Route & Directions'))

        // Wait for route calculation
        await waitFor(() => {
            expect(mockProps.onRouteCalculated).toHaveBeenCalled()
        })

        // Click Open in Google Maps button
        await user.click(screen.getByText('🌐 Open in Google Maps'))
        
        // Mock Google Maps URL
        const googleMapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=123%20My%20Street%2C%20Vancouver&destination=Real%20Stadium%2C%20Vancouver&travelmode=driving'
        expect(global.open).toHaveBeenCalledWith(googleMapsUrl, '_blank')
    })
})