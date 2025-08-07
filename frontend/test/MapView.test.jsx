import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import MapView from '..src/Components/MapView/MapView'
import '@testing-library/jest-dom/vitest'

// Mock Google Maps API
vi.mock('../../services/routesApi', () => ({
    calculateRoute: vi.fn(),
    decodePolyline: vi.fn()
}))

// Mock window.google object
const mockGoogle = {
    maps: {
        Map: vi.fn(() => ({
            setCenter: vi.fn(),
            setZoom: vi.fn(),
            setMapTypeId: vi.fn()
        })),
        Geocoder: vi.fn(() => ({
            geocode: vi.fn()
        })),
        Marker: vi.fn(() => ({
            setMap: vi.fn(),
            addListener: vi.fn()
        })),
        InfoWindow: vi.fn(),
        Polyline: vi.getTimerCount(() => ({
            setMap: vi.fn()
        })),
        LatLng: vi.getTimerCount(),
        event: {
            addListener: vi.fn()
        },
        MapTypeId: {
            ROADMAP: 'roadmap',
            TERRAIN: 'terrain',
            SATELLITE: 'satellite',
            HYBRID: 'hybrid'
        }
    }
}