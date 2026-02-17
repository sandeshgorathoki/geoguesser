import { useEffect, useRef, useState, useCallback } from 'react';
import type { LatLng } from '@/types/game';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuessMapProps {
  apiKey: string;
  onGuess: (location: LatLng) => void;
  onClose?: () => void;
  hasGuessed: boolean;
  targetLocation?: LatLng | null;
  playerGuess?: LatLng | null;
  showResult?: boolean;
}

export function GuessMap({ 
  apiKey, 
  onGuess, 
  onClose, 
  hasGuessed, 
  targetLocation, 
  playerGuess,
  showResult 
}: GuessMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const targetMarkerRef = useRef<google.maps.Marker | null>(null);
  const lineRef = useRef<google.maps.Polyline | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initMap = () => {
      if (!window.google?.maps) return;

      const map = new window.google.maps.Map(containerRef.current!, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        minZoom: 2,
        streetViewControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
        },
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapRef.current = map;
      setIsMapLoaded(true);

      // Add click listener for placing guess
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (hasGuessed || showResult) return;
        
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();
        
        if (lat !== undefined && lng !== undefined) {
          const location = { lat, lng };
          setSelectedLocation(location);
          
          // Place or move marker
          if (markerRef.current) {
            markerRef.current.setPosition(e.latLng!);
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: e.latLng!,
              map,
              draggable: !hasGuessed && !showResult,
              animation: window.google.maps.Animation.DROP,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#fee2e2"/><circle cx="12" cy="10" r="3" fill="#ef4444"/></svg>`
                ),
                scaledSize: new window.google.maps.Size(36, 36),
                anchor: new window.google.maps.Point(18, 36),
              },
            });

            // Add drag end listener
            markerRef.current.addListener('dragend', () => {
              const pos = markerRef.current?.getPosition();
              if (pos) {
                setSelectedLocation({ lat: pos.lat(), lng: pos.lng() });
              }
            });
          }
        }
      });
    };

    if (window.google?.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [apiKey, hasGuessed, showResult]);

  // Show result markers and line
  useEffect(() => {
    if (!showResult || !mapRef.current || !targetLocation || !playerGuess) return;

    const map = mapRef.current;

    // Add target marker
    targetMarkerRef.current = new window.google.maps.Marker({
      position: { lat: targetLocation.lat, lng: targetLocation.lng },
      map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#dcfce7"/><circle cx="12" cy="10" r="3" fill="#22c55e"/></svg>`
        ),
        scaledSize: new window.google.maps.Size(36, 36),
        anchor: new window.google.maps.Point(18, 36),
      },
      title: 'Actual Location',
    });

    // Add player guess marker if not already there
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: { lat: playerGuess.lat, lng: playerGuess.lng },
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#fee2e2"/><circle cx="12" cy="10" r="3" fill="#ef4444"/></svg>`
          ),
          scaledSize: new window.google.maps.Size(36, 36),
          anchor: new window.google.maps.Point(18, 36),
        },
        title: 'Your Guess',
      });
    }

    // Draw line between guess and target
    lineRef.current = new window.google.maps.Polyline({
      path: [
        { lat: playerGuess.lat, lng: playerGuess.lng },
        { lat: targetLocation.lat, lng: targetLocation.lng },
      ],
      geodesic: true,
      strokeColor: '#6366f1',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map,
    });

    // Fit bounds to show both markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: playerGuess.lat, lng: playerGuess.lng });
    bounds.extend({ lat: targetLocation.lat, lng: targetLocation.lng });
    map.fitBounds(bounds);

    return () => {
      targetMarkerRef.current?.setMap(null);
      lineRef.current?.setMap(null);
    };
  }, [showResult, targetLocation, playerGuess]);

  const handleGuess = useCallback(() => {
    if (selectedLocation) {
      onGuess(selectedLocation);
    }
  }, [selectedLocation, onGuess]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-zinc-900 text-white border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <span className="font-medium">
            {showResult ? 'Round Result' : 'Place Your Guess'}
          </span>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full" />
        
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
            <p className="text-zinc-500">Loading map...</p>
          </div>
        )}
      </div>

      {/* Footer with guess button */}
      {!showResult && !hasGuessed && (
        <div className="p-3 bg-zinc-900 border-t border-zinc-700">
          <Button
            onClick={handleGuess}
            disabled={!selectedLocation}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
          >
            {selectedLocation ? 'GUESS HERE' : 'CLICK ON MAP TO GUESS'}
          </Button>
        </div>
      )}
    </div>
  );
}
