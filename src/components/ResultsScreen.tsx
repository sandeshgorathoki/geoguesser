import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, 
  RotateCcw, 
  Home, 
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Flag
} from 'lucide-react';
import type { GameState, Round } from '@/types/game';
import { formatDistance, MAX_SCORE } from '@/types/game';

interface ResultsScreenProps {
  gameState: GameState;
  playerId: string;
  onPlayAgain: () => void;
  onHome: () => void;
}

interface RoundResultProps {
  round: Round;
  roundNumber: number;
  playerId: string;
}

function RoundResult({ round, roundNumber, playerId }: RoundResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const playerGuess = round.playerGuesses[playerId];
  
  if (!playerGuess) return null;

  const scorePercentage = (playerGuess.score / MAX_SCORE) * 100;
  
  let scoreColor = 'text-red-500';
  let scoreBg = 'bg-red-500';
  if (scorePercentage >= 80) {
    scoreColor = 'text-green-500';
    scoreBg = 'bg-green-500';
  } else if (scorePercentage >= 50) {
    scoreColor = 'text-yellow-500';
    scoreBg = 'bg-yellow-500';
  } else if (scorePercentage >= 20) {
    scoreColor = 'text-orange-500';
    scoreBg = 'bg-orange-500';
  }

  return (
    <Card className="bg-zinc-800/50 border-zinc-700 overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/70 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
            <Flag className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Round {roundNumber}</p>
            <p className="text-sm text-zinc-500">
              {formatDistance(playerGuess.distance)} from target
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-2xl font-bold ${scoreColor}`}>
              {playerGuess.score.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500">points</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="bg-zinc-900/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Your Guess:</span>
              <span className="text-white">
                {playerGuess.guess.lat.toFixed(4)}, {playerGuess.guess.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Actual Location:</span>
              <span className="text-white">
                {round.targetLocation.lat.toFixed(4)}, {round.targetLocation.lng.toFixed(4)}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Accuracy</span>
                <span className={scoreColor}>{Math.round(scorePercentage)}%</span>
              </div>
              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${scoreBg} transition-all duration-500`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function ResultsScreen({ gameState, playerId, onPlayAgain, onHome }: ResultsScreenProps) {
  const [copied, setCopied] = useState(false);
  
  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const sortedPlayers = [...gameState.players].sort((a, b) => b.totalScore - a.totalScore);
  const isWinner = sortedPlayers[0]?.id === playerId;
  
  const totalPossibleScore = gameState.totalRounds * MAX_SCORE;
  const scorePercentage = currentPlayer 
    ? (currentPlayer.totalScore / totalPossibleScore) * 100 
    : 0;

  const handleShare = () => {
    const text = `I scored ${currentPlayer?.totalScore.toLocaleString()} points in GeoGuessr! Can you beat me?`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-yellow-500/20">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isWinner ? '🎉 You Won!' : 'Game Complete!'}
          </h1>
          <p className="text-zinc-400">
            {gameState.mode === 'single' 
              ? 'Great job exploring the world!' 
              : 'Thanks for playing with friends!'}
          </p>
        </div>

        {/* Final Score Card */}
        <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <p className="text-sm text-zinc-400 mb-1">YOUR FINAL SCORE</p>
              <p className="text-6xl font-bold text-white mb-2">
                {currentPlayer?.totalScore.toLocaleString()}
              </p>
              <p className="text-zinc-500">
                out of {totalPossibleScore.toLocaleString()} possible points
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Performance</span>
                <span className="text-white">{Math.round(scorePercentage)}%</span>
              </div>
              <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard (for multiplayer) */}
        {gameState.mode === 'multiplayer' && gameState.players.length > 1 && (
          <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Leaderboard
              </h2>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.id === playerId ? 'bg-zinc-700/50' : 'bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-zinc-400 text-black' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">
                        {player.name}
                        {player.id === playerId && (
                          <span className="text-xs text-zinc-500 ml-2">(You)</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-white">
                      {player.totalScore.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Round Details */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Round Summary</h2>
          <div className="space-y-3">
            {gameState.rounds.map((round, index) => (
              <RoundResult
                key={round.id}
                round={round}
                roundNumber={index + 1}
                playerId={playerId}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-6"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            PLAY AGAIN
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 border-zinc-600 text-white hover:bg-zinc-800 py-6"
          >
            {copied ? (
              <><Check className="w-5 h-5 mr-2" /> COPIED!</>
            ) : (
              <><Share2 className="w-5 h-5 mr-2" /> SHARE RESULT</>
            )}
          </Button>
          <Button
            onClick={onHome}
            variant="outline"
            className="flex-1 border-zinc-600 text-white hover:bg-zinc-800 py-6"
          >
            <Home className="w-5 h-5 mr-2" />
            HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
