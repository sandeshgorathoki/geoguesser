import { useEffect, useRef, useState } from 'react';
import type { LatLng } from '@/types/game';
import { Loader2 } from 'lucide-react';

interface StreetViewProps {
  location: LatLng;
  apiKey: string;
  onLoad?: () => void;
}

export function StreetView({ location, apiKey, onLoad }: StreetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadStreetView = () => {
      if (!window.google?.maps) {
        setError('Google Maps API not loaded');
        setIsLoading(false);
        return;
      }

      const service = new window.google.maps.StreetViewService();
      
      service.getPanorama(
        {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius: 50000,
          source: window.google.maps.StreetViewSource.OUTDOOR,
        },
        (data: google.maps.StreetViewPanoramaData | null, status: google.maps.StreetViewStatus) => {
          if (status === window.google.maps.StreetViewStatus.OK && data?.location?.latLng) {
            new window.google.maps.StreetViewPanorama(
              containerRef.current!,
              {
                position: data.location.latLng,
                pov: {
                  heading: Math.random() * 360,
                  pitch: 0,
                },
                zoom: 1,
                addressControl: false,
                showRoadLabels: false,
                clickToGo: true,
                scrollwheel: true,
                disableDefaultUI: true,
                motionTracking: false,
                motionTrackingControl: false,
              }
            );
            setIsLoading(false);
            onLoad?.();
          } else {
            setError('No Street View available at this location');
            setIsLoading(false);
          }
        }
      );
    };

    // Check if Google Maps API is already loaded
    if (window.google?.maps) {
      loadStreetView();
    } else {
      // Load the API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=streetView`;
      script.async = true;
      script.onload = loadStreetView;
      script.onerror = () => {
        setError('Failed to load Google Maps API');
        setIsLoading(false);
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [location, apiKey, onLoad]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center text-white p-8">
          <p className="text-lg mb-2">⚠️ {error}</p>
          <p className="text-sm text-zinc-400">Try refreshing or selecting a different location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading Street View...</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />
    </div>
  );
}
