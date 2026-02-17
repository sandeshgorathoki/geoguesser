import { useState, useEffect, useCallback } from 'react';
import { StreetView } from './StreetView';
import { GuessMap } from './GuessMap';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Timer,
  ChevronRight,
  Trophy,
  Flag,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { LatLng } from '@/types/game';
import type { GameState, Round } from '@/types/game';
import { formatTime, formatDistance, MAX_SCORE } from '@/types/game';

interface GameScreenProps {
  gameState: GameState;
  playerId: string;
  currentGuess: LatLng | null;
  hasGuessed: boolean;
  apiKey: string;
  onGuess: (location: LatLng) => void;
  onNextRound: () => void;
  getCurrentRound: () => (Round & { targetLocation: LatLng }) | undefined;
  getCurrentPlayer: () => { totalScore: number } | undefined;
}

export function GameScreen({
  gameState,
  playerId,
  currentGuess,
  hasGuessed,
  apiKey,
  onGuess,
  onNextRound,
  getCurrentRound,
  getCurrentPlayer,
}: GameScreenProps) {
  const [showMap, setShowMap] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scoreRevealed, setScoreRevealed] = useState(false);

  const currentRound = getCurrentRound();
  const currentPlayer = getCurrentPlayer();
  const playerGuess = currentRound?.playerGuesses[playerId];

  // Show result when round ends
  useEffect(() => {
    if (gameState.status === 'round_end') {
      setShowResult(true);
      setShowMap(true);
      setIsMapExpanded(true);
      setScoreRevealed(false);
      const timer = setTimeout(() => setScoreRevealed(true), 400);
      return () => clearTimeout(timer);
    }
  }, [gameState.status]);

  const handleGuess = useCallback((location: LatLng) => {
    onGuess(location);
    setShowMap(true);
    setIsMapExpanded(true);
  }, [onGuess]);

  const handleNextRound = useCallback(() => {
    setShowResult(false);
    setScoreRevealed(false);
    if (!isMapExpanded) setShowMap(true);
    onNextRound();
  }, [onNextRound, isMapExpanded]);

  const progress =
    ((gameState.currentRound - 1) / gameState.totalRounds) * 100 +
    (gameState.status === 'round_end' ? 100 / gameState.totalRounds : 0);

  if (!currentRound) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const scorePct = playerGuess ? (playerGuess.score / MAX_SCORE) * 100 : 0;
  const scoreColor =
    scorePct >= 80 ? 'text-green-500' : scorePct >= 50 ? 'text-yellow-500' : scorePct >= 20 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-zinc-800/95 backdrop-blur border-b border-zinc-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-full mx-auto">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">ROUND</p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {gameState.currentRound} <span className="text-zinc-500">/ {gameState.totalRounds}</span>
                </p>
              </div>
            </div>

            {!hasGuessed && gameState.status === 'playing' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-700/50">
                <Timer
                  className={`w-5 h-5 transition-colors ${
                    gameState.timeRemaining < 30 ? 'text-red-500' : 'text-blue-400'
                  }`}
                />
                <span
                  className={`text-lg font-mono font-bold transition-colors ${
                    gameState.timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-white'
                  }`}
                >
                  {formatTime(gameState.timeRemaining)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div className="text-right">
              <p className="text-xs text-zinc-400">SCORE</p>
              <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                {currentPlayer?.totalScore.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Progress value={progress} className="h-1.5 bg-zinc-700 rounded-full overflow-hidden" />
        </div>
      </header>

      {/* Main: Side-by-side Street View + Map (stack on small screens) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* Street View - 50% on md+, full when map hidden */}
        <div
          className={`relative transition-all duration-300 ease-out min-h-[35vh] ${
            showMap
              ? isMapExpanded
                ? 'hidden'
                : 'w-full md:w-1/2 min-w-0 flex-1'
              : 'flex-1'
          }`}
        >
          <StreetView location={currentRound.targetLocation} apiKey={apiKey} />

          {!showResult && (
            <Button
              onClick={() => setShowMap(!showMap)}
              className="absolute bottom-4 right-4 bg-zinc-800/90 hover:bg-zinc-700 text-white shadow-xl z-10 border border-zinc-600/50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          )}
        </div>

        {/* Map Panel - 50% on md+, full height on mobile, or fullscreen when expanded */}
        {showMap && (
          <div
            className={`bg-zinc-800/95 backdrop-blur border-l border-zinc-700 flex flex-col transition-all duration-300 ease-out ${
              isMapExpanded ? 'fixed inset-0 z-50' : 'w-full md:w-1/2 min-w-0 flex-1 min-h-[40vh] md:min-h-0'
            }`}
          >
            <div className="flex items-center justify-between p-2 border-b border-zinc-700">
              <span className="text-sm font-medium text-zinc-300">World Map</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="h-8 w-8 text-zinc-400 hover:text-white"
              >
                {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex-1 min-h-0 relative">
              <GuessMap
                apiKey={apiKey}
                onGuess={handleGuess}
                onClose={isMapExpanded ? () => setIsMapExpanded(false) : undefined}
                hasGuessed={hasGuessed}
                targetLocation={showResult ? currentRound.targetLocation : null}
                playerGuess={currentGuess}
                showResult={showResult}
              />
            </div>

            {/* Round Result Overlay with animated score reveal */}
            {showResult && playerGuess && (
              <div className="shrink-0 p-4 space-y-3 border-t border-zinc-700 bg-zinc-900/80">
                <div
                  className={`flex items-center justify-between transition-all duration-700 ease-out ${
                    scoreRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  <div>
                    <p className="text-xs text-zinc-500">Distance</p>
                    <p className="text-lg font-semibold text-white">{formatDistance(playerGuess.distance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Round Score</p>
                    <p className={`text-2xl font-bold tabular-nums ${scoreColor}`}>
                      +{playerGuess.score.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`h-2 bg-zinc-700 rounded-full overflow-hidden transition-all duration-1000 delay-200 ${
                    scoreRevealed ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 delay-300 ${
                      scorePct >= 80
                        ? 'bg-green-500'
                        : scorePct >= 50
                          ? 'bg-yellow-500'
                          : scorePct >= 20
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: scoreRevealed ? `${scorePct}%` : '0%' }}
                  />
                </div>
                <Button
                  onClick={handleNextRound}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 shadow-lg shadow-green-500/20 transition-transform hover:scale-[1.02]"
                >
                  {gameState.currentRound >= gameState.totalRounds ? (
                    <>
                      SEE FINAL RESULTS <Trophy className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      NEXT ROUND <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {showResult && !playerGuess && (
              <div className="shrink-0 p-4">
                <Button
                  onClick={handleNextRound}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4"
                >
                  {gameState.currentRound >= gameState.totalRounds ? (
                    <>SEE FINAL RESULTS <Trophy className="w-4 h-4 ml-2" /></>
                  ) : (
                    <>NEXT ROUND <ChevronRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
