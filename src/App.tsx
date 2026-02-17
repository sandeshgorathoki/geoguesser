import { useState, useCallback, useEffect } from 'react';
import { GameLobby } from './components/GameLobby';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { useGame } from './hooks/useGame';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './components/ui/button';

// Get API key from environment or use a placeholder
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function App() {
  const [gameMode, setGameMode] = useState<'lobby' | 'single' | 'multiplayer' | null>(null);
  const [gameId, setGameId] = useState<string>('');
  
  const { isLoaded: isMapsLoaded, loadError: mapsLoadError } = useGoogleMaps({ 
    apiKey: GOOGLE_MAPS_API_KEY 
  });

  const {
    gameState,
    currentGuess,
    hasGuessed,
    playerId,
    startGame,
    submitGuess,
    nextRound,
    getCurrentRound,
    getCurrentPlayer,
    resetGame,
  } = useGame({
    mode: gameMode === 'single' ? 'single' : 'multiplayer',
    gameId: gameId || undefined,
  });

  // Check for join parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinGameId = params.get('join');
    if (joinGameId) {
      setGameId(joinGameId);
      setGameMode('multiplayer');
    }
  }, []);

  const handleStartSinglePlayer = useCallback(() => {
    if (!isMapsLoaded) return;
    setGameMode('single');
    setTimeout(() => {
      startGame();
    }, 100);
  }, [isMapsLoaded, startGame]);

  const handleCreateMultiplayer = useCallback(() => {
    if (!isMapsLoaded) return;
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(newGameId);
    setGameMode('multiplayer');
    setTimeout(() => {
      startGame();
    }, 100);
  }, [isMapsLoaded, startGame]);

  const handleJoinMultiplayer = useCallback((joinGameId: string) => {
    if (!isMapsLoaded) return;
    setGameId(joinGameId);
    setGameMode('multiplayer');
    setTimeout(() => {
      startGame();
    }, 100);
  }, [isMapsLoaded, startGame]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setGameMode('lobby');
    setGameId('');
    window.history.replaceState({}, '', window.location.pathname);
  }, [resetGame]);

  const handleHome = useCallback(() => {
    resetGame();
    setGameMode('lobby');
    setGameId('');
    window.history.replaceState({}, '', window.location.pathname);
  }, [resetGame]);

  // Show loading state while Google Maps loads
  if (!isMapsLoaded && !mapsLoadError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading Google Maps...</p>
          <p className="text-zinc-500 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Show error if Google Maps failed to load
  if (mapsLoadError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Failed to Load Google Maps</h1>
          <p className="text-zinc-400 mb-6">
            Please check your internet connection and try again.
          </p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show API key warning if not set
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Google Maps API Key Required</h1>
          <p className="text-zinc-400 mb-6">
            To use GeoGuessr, you need a Google Maps API key with Street View Static API enabled.
          </p>
          <div className="bg-zinc-800 rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-zinc-300 mb-2">1. Get a free API key from Google Cloud Console</p>
            <p className="text-sm text-zinc-300 mb-2">2. Enable Street View Static API</p>
            <p className="text-sm text-zinc-300">3. Add your key to a .env file:</p>
            <code className="block bg-zinc-900 rounded p-2 mt-2 text-green-400 text-sm">
              VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
            </code>
          </div>
          <Button 
            onClick={() => window.open('https://developers.google.com/maps/documentation/javascript/get-api-key', '_blank')}
            className="bg-green-600 hover:bg-green-700"
          >
            Get API Key
          </Button>
        </div>
      </div>
    );
  }

  // Show lobby
  if (gameMode === 'lobby' || gameMode === null) {
    return (
      <GameLobby
        onStartSinglePlayer={handleStartSinglePlayer}
        onCreateMultiplayer={handleCreateMultiplayer}
        onJoinMultiplayer={handleJoinMultiplayer}
      />
    );
  }

  // Show results screen
  if (gameState.status === 'game_end') {
    return (
      <ResultsScreen
        gameState={gameState}
        playerId={playerId}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    );
  }

  // Show game screen
  return (
    <GameScreen
      gameState={gameState}
      playerId={playerId}
      currentGuess={currentGuess}
      hasGuessed={hasGuessed}
      apiKey={GOOGLE_MAPS_API_KEY}
      onGuess={submitGuess}
      onNextRound={nextRound}
      getCurrentRound={getCurrentRound}
      getCurrentPlayer={getCurrentPlayer}
    />
  );
}

export default App;
