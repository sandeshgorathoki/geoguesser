import { useState, useEffect, useCallback, useRef } from 'react';
import type { LatLng } from '@/types/game';

interface UseGoogleMapsProps {
  apiKey: string;
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
  streetViewService: google.maps.StreetViewService | null;
  mapsApi: typeof google.maps | null;
  findValidLocation: (location: LatLng) => Promise<LatLng | null>;
  getRandomValidLocation: () => Promise<LatLng | null>;
}

// List of major cities for random location generation
const MAJOR_CITIES: LatLng[] = [
  { lat: 48.8566, lng: 2.3522 }, // Paris
  { lat: 51.5074, lng: -0.1278 }, // London
  { lat: 40.7128, lng: -74.0060 }, // New York
  { lat: 35.6762, lng: 139.6503 }, // Tokyo
  { lat: -33.8688, lng: 151.2093 }, // Sydney
  { lat: 55.7558, lng: 37.6173 }, // Moscow
  { lat: 52.5200, lng: 13.4050 }, // Berlin
  { lat: 41.3851, lng: 2.1734 }, // Barcelona
  { lat: 45.4642, lng: 9.1900 }, // Milan
  { lat: 52.3667, lng: 4.8945 }, // Amsterdam
  { lat: 59.3293, lng: 18.0686 }, // Stockholm
  { lat: 55.6761, lng: 12.5683 }, // Copenhagen
  { lat: 60.1699, lng: 24.9384 }, // Helsinki
  { lat: 59.9139, lng: 10.7522 }, // Oslo
  { lat: 48.2082, lng: 16.3738 }, // Vienna
  { lat: 50.0755, lng: 14.4378 }, // Prague
  { lat: 47.4979, lng: 19.0402 }, // Budapest
  { lat: 52.2297, lng: 21.0122 }, // Warsaw
  { lat: 37.9838, lng: 23.7275 }, // Athens
  { lat: 41.0082, lng: 28.9784 }, // Istanbul
  { lat: 25.2048, lng: 55.2708 }, // Dubai
  { lat: 1.3521, lng: 103.8198 }, // Singapore
  { lat: 13.7563, lng: 100.5018 }, // Bangkok
  { lat: 39.9042, lng: 116.4074 }, // Beijing
  { lat: 31.2304, lng: 121.4737 }, // Shanghai
  { lat: 37.5665, lng: 126.9780 }, // Seoul
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 28.6139, lng: 77.2090 }, // New Delhi
  { lat: -23.5505, lng: -46.6333 }, // São Paulo
  { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  { lat: 19.4326, lng: -99.1332 }, // Mexico City
  { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  { lat: 41.8781, lng: -87.6298 }, // Chicago
  { lat: 29.7604, lng: -95.3698 }, // Houston
  { lat: 33.4484, lng: -112.0740 }, // Phoenix
  { lat: 39.7392, lng: -104.9903 }, // Denver
  { lat: 47.6062, lng: -122.3321 }, // Seattle
  { lat: 37.7749, lng: -122.4194 }, // San Francisco
  { lat: 32.7157, lng: -117.1611 }, // San Diego
  { lat: 25.7617, lng: -80.1918 }, // Miami
  { lat: 42.3601, lng: -71.0589 }, // Boston
  { lat: 45.5017, lng: -73.5673 }, // Montreal
  { lat: 43.6532, lng: -79.3832 }, // Toronto
  { lat: 49.2827, lng: -123.1207 }, // Vancouver
  { lat: -37.8136, lng: 144.9631 }, // Melbourne
  { lat: -31.9505, lng: 115.8605 }, // Perth
  { lat: -36.8485, lng: 174.7633 }, // Auckland
  { lat: -41.2865, lng: 174.7762 }, // Wellington
  { lat: 64.1466, lng: -21.9426 }, // Reykjavik
  { lat: 60.3913, lng: 5.3221 }, // Bergen
  { lat: 63.4305, lng: 10.3951 }, // Trondheim
  { lat: 69.6492, lng: 18.9553 }, // Tromsø
  { lat: 78.2232, lng: 15.6267 }, // Longyearbyen
  { lat: 55.9533, lng: -3.1883 }, // Edinburgh
  { lat: 53.3498, lng: -6.2603 }, // Dublin
  { lat: 50.8503, lng: 4.3517 }, // Brussels
  { lat: 49.6116, lng: 6.1319 }, // Luxembourg
  { lat: 47.3769, lng: 8.5417 }, // Zurich
  { lat: 46.9480, lng: 7.4474 }, // Bern
  { lat: 46.2044, lng: 6.1432 }, // Geneva
  { lat: 43.7384, lng: 7.4246 }, // Monaco
  { lat: 43.2965, lng: 5.3698 }, // Marseille
  { lat: 43.6047, lng: 1.4442 }, // Toulouse
  { lat: 47.2184, lng: -1.5536 }, // Nantes
  { lat: 48.5734, lng: 7.7521 }, // Strasbourg
  { lat: 45.7640, lng: 4.8357 }, // Lyon
  { lat: 43.6108, lng: 3.8767 }, // Montpellier
  { lat: 44.8378, lng: -0.5792 }, // Bordeaux
  { lat: 50.1109, lng: 8.6821 }, // Frankfurt
  { lat: 48.1351, lng: 11.5820 }, // Munich
  { lat: 53.5511, lng: 9.9937 }, // Hamburg
  { lat: 51.2277, lng: 6.7735 }, // Düsseldorf
  { lat: 50.9375, lng: 6.9603 }, // Cologne
  { lat: 51.3417, lng: 12.2535 }, // Leipzig
  { lat: 51.0504, lng: 13.7373 }, // Dresden
  { lat: 52.4009, lng: 16.9196 }, // Poznan
  { lat: 54.3520, lng: 18.6466 }, // Gdansk
  { lat: 50.0647, lng: 19.9450 }, // Krakow
  { lat: 56.9496, lng: 24.1052 }, // Riga
  { lat: 54.6872, lng: 25.2797 }, // Vilnius
  { lat: 59.4370, lng: 24.7536 }, // Tallinn
  { lat: 60.1699, lng: 24.9384 }, // Helsinki
  { lat: 58.5953, lng: 25.0136 }, // Tartu
  { lat: 56.9677, lng: 28.1056 }, // Riga
  { lat: 53.9045, lng: 27.5615 }, // Minsk
  { lat: 50.4501, lng: 30.5234 }, // Kyiv
  { lat: 46.4825, lng: 30.7233 }, // Odesa
  { lat: 49.8397, lng: 24.0297 }, // Lviv
  { lat: 41.7151, lng: 44.8271 }, // Tbilisi
  { lat: 40.1792, lng: 44.4991 }, // Yerevan
  { lat: 40.4093, lng: 49.8671 }, // Baku
  { lat: 25.2854, lng: 51.5310 }, // Doha
  { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
  { lat: 25.2631, lng: 55.3080 }, // Sharjah
  { lat: 26.2285, lng: 50.5860 }, // Manama
  { lat: 29.3759, lng: 47.9774 }, // Kuwait City
  { lat: 24.7136, lng: 46.6753 }, // Riyadh
  { lat: 21.4858, lng: 39.1925 }, // Jeddah
  { lat: 21.3891, lng: 39.8579 }, // Mecca
  { lat: 24.4686, lng: 39.6142 }, // Medina
];

export function useGoogleMaps({ apiKey }: UseGoogleMapsProps): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [mapsApi, setMapsApi] = useState<typeof google.maps | null>(null);
  const streetViewServiceRef = useRef<google.maps.StreetViewService | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is required'));
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setMapsApi(window.google.maps);
      streetViewServiceRef.current = new window.google.maps.StreetViewService();
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,streetView`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.maps) {
        setMapsApi(window.google.maps);
        streetViewServiceRef.current = new window.google.maps.StreetViewService();
        setIsLoaded(true);
      }
    };
    
    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  const findValidLocation = useCallback(async (location: LatLng): Promise<LatLng | null> => {
    if (!streetViewServiceRef.current) return null;

    return new Promise((resolve) => {
      const service = streetViewServiceRef.current!;
      
      service.getPanorama(
        {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 50000, // 50km radius
          source: google.maps.StreetViewSource.OUTDOOR,
        },
        (data: google.maps.StreetViewPanoramaData | null, status: google.maps.StreetViewStatus) => {
          if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
            const lat = data.location.latLng.lat();
            const lng = data.location.latLng.lng();
            resolve({ lat, lng });
          } else {
            resolve(null);
          }
        }
      );
    });
  }, []);

  const getRandomValidLocation = useCallback(async (): Promise<LatLng | null> => {
    // Try random locations from our list
    const shuffled = [...MAJOR_CITIES].sort(() => Math.random() - 0.5);
    
    for (const city of shuffled.slice(0, 10)) {
      // Add random offset (up to 20km)
      const offsetLat = (Math.random() - 0.5) * 0.4;
      const offsetLng = (Math.random() - 0.5) * 0.4;
      
      const location = {
        lat: city.lat + offsetLat,
        lng: city.lng + offsetLng,
      };

      const validLocation = await findValidLocation(location);
      if (validLocation) {
        return validLocation;
      }
    }

    // Fallback: return a random city
    return shuffled[0];
  }, [findValidLocation]);

  return {
    isLoaded,
    loadError,
    streetViewService: streetViewServiceRef.current,
    mapsApi,
    findValidLocation,
    getRandomValidLocation,
  };
}
