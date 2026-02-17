export interface LatLng {
  lat: number;
  lng: number;
}

export interface Round {
  id: number;
  targetLocation: LatLng;
  playerGuesses: Record<string, PlayerGuess>;
  completed: boolean;
}

export interface PlayerGuess {
  playerId: string;
  playerName: string;
  guess: LatLng;
  distance: number;
  score: number;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  totalScore: number;
  isHost: boolean;
}

export interface GameState {
  gameId: string;
  mode: 'single' | 'multiplayer';
  status: 'lobby' | 'playing' | 'round_end' | 'game_end';
  currentRound: number;
  totalRounds: number;
  rounds: Round[];
  players: Player[];
  timePerRound: number;
  timeRemaining: number;
}

export const DEFAULT_ROUNDS = 5;
export const DEFAULT_TIME_PER_ROUND = 120; // seconds
export const MAX_SCORE = 5000;

// Famous locations for single player (fallback if random fails)
export const FAMOUS_LOCATIONS: LatLng[] = [
  { lat: 48.8584, lng: 2.2945 }, // Eiffel Tower, Paris
  { lat: 40.6892, lng: -74.0445 }, // Statue of Liberty, NYC
  { lat: 51.5074, lng: -0.1278 }, // London
  { lat: 35.6762, lng: 139.6503 }, // Tokyo
  { lat: -33.8688, lng: 151.2093 }, // Sydney
  { lat: 55.7558, lng: 37.6173 }, // Moscow
  { lat: 41.9028, lng: 12.4964 }, // Rome
  { lat: 52.5200, lng: 13.4050 }, // Berlin
  { lat: 37.7749, lng: -122.4194 }, // San Francisco
  { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
  { lat: 1.3521, lng: 103.8198 }, // Singapore
  { lat: 25.2048, lng: 55.2708 }, // Dubai
  { lat: 48.1351, lng: 11.5820 }, // Munich
  { lat: 59.9139, lng: 10.7522 }, // Oslo
  { lat: 60.1699, lng: 24.9384 }, // Helsinki
  { lat: 59.3293, lng: 18.0686 }, // Stockholm
  { lat: 55.6761, lng: 12.5683 }, // Copenhagen
  { lat: 52.3676, lng: 4.9041 }, // Amsterdam
  { lat: 48.2082, lng: 16.3738 }, // Vienna
  { lat: 47.4979, lng: 19.0402 }, // Budapest
];

// Calculate distance between two points in kilometers using Haversine formula
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// GeoGuessr scoring: exponential decay (rewards precision) + time bonus (rewards speed)
// Max 5000 points. Formula: distance-based score * time multiplier
// Distance: Gaussian decay - within few km = nearly 5000, 50km+ drops significantly
// Time: faster guess = higher multiplier (GeoGuessr penalizes slow answers)
export function calculateScore(
  distanceKm: number,
  timeRemaining?: number,
  timePerRound: number = DEFAULT_TIME_PER_ROUND
): number {
  if (distanceKm <= 0) return MAX_SCORE;

  // GeoGuessr-style exponential decay: steep curve, rewards accuracy
  // sigma ~ 1500km: ~5000 at 0, ~4690 at 500km, ~1840 at 2000km, ~0 at 10000km
  const sigma = 1500;
  const distanceScore = MAX_SCORE * Math.exp(-0.5 * Math.pow(distanceKm / sigma, 2));

  // Time bonus: 0.5x to 1x multiplier. Faster = more points (GeoGuessr penalizes slow guesses)
  const timeMultiplier =
    timeRemaining !== undefined
      ? 0.5 + 0.5 * (timeRemaining / timePerRound)
      : 1;

  return Math.max(0, Math.round(distanceScore * timeMultiplier));
}

// Generate random location (will be used with Google Maps Street View Service)
export function getRandomLocation(): LatLng {
  return FAMOUS_LOCATIONS[Math.floor(Math.random() * FAMOUS_LOCATIONS.length)];
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  } else if (km < 1000) {
    return `${Math.round(km)} km`;
  } else {
    return `${km.toFixed(1)} km`;
  }
}

// Format time for display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
