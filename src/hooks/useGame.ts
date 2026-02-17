import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  GameState,
  Player,
  Round,
  LatLng,
  PlayerGuess,
} from '@/types/game';
import {
  DEFAULT_ROUNDS,
  DEFAULT_TIME_PER_ROUND,
  calculateDistance,
  calculateScore,
  getRandomLocation,
} from '@/types/game';

interface UseGameProps {
  mode: 'single' | 'multiplayer';
  playerName?: string;
  gameId?: string;
}

export function useGame({ mode, playerName = 'Player', gameId }: UseGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    gameId: gameId || uuidv4(),
    mode,
    status: 'lobby',
    currentRound: 0,
    totalRounds: DEFAULT_ROUNDS,
    rounds: [],
    players: [],
    timePerRound: DEFAULT_TIME_PER_ROUND,
    timeRemaining: DEFAULT_TIME_PER_ROUND,
  });

  const [currentGuess, setCurrentGuess] = useState<LatLng | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerIdRef = useRef<string>(uuidv4());
  const hasGuessedRef = useRef(false);
  hasGuessedRef.current = hasGuessed;
  const submitGuessRef = useRef<((guess: { lat: number; lng: number }) => void) | null>(null);

  // Initialize player
  useEffect(() => {
    const newPlayer: Player = {
      id: playerIdRef.current,
      name: playerName,
      totalScore: 0,
      isHost: mode === 'single' || gameState.players.length === 0,
    };

    setGameState((prev) => ({
      ...prev,
      players: [newPlayer],
    }));
  }, [mode, playerName]);

  // Timer management
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.timeRemaining > 0 && !hasGuessed) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            if (!hasGuessedRef.current) submitGuessRef.current?.({ lat: 0, lng: 0 });
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.status, gameState.timeRemaining, hasGuessed]);

  const startGame = useCallback(() => {
    const rounds: Round[] = Array.from({ length: DEFAULT_ROUNDS }, (_, i) => ({
      id: i + 1,
      targetLocation: getRandomLocation(),
      playerGuesses: {},
      completed: false,
    }));

    setGameState((prev) => ({
      ...prev,
      status: 'playing',
      currentRound: 1,
      rounds,
      timeRemaining: DEFAULT_TIME_PER_ROUND,
    }));
    setHasGuessed(false);
    setCurrentGuess(null);
  }, []);

  const submitGuess = useCallback((guess: LatLng) => {
    setCurrentGuess(guess);
    setGameState((prev) => {
      const currentRoundData = prev.rounds[prev.currentRound - 1];
      const distance = calculateDistance(guess, currentRoundData.targetLocation);
      const score =
        guess.lat === 0 && guess.lng === 0
          ? 0
          : calculateScore(distance, prev.timeRemaining, DEFAULT_TIME_PER_ROUND);

      const playerGuess: PlayerGuess = {
        playerId: playerIdRef.current,
        playerName: prev.players.find((p) => p.id === playerIdRef.current)?.name || 'Player',
        guess,
        distance,
        score,
        timestamp: Date.now(),
      };

      const updatedRounds = [...prev.rounds];
      updatedRounds[prev.currentRound - 1] = {
        ...currentRoundData,
        playerGuesses: {
          ...currentRoundData.playerGuesses,
          [playerIdRef.current]: playerGuess,
        },
        completed: true,
      };

      const updatedPlayers = prev.players.map((p) =>
        p.id === playerIdRef.current ? { ...p, totalScore: p.totalScore + score } : p
      );

      return {
        ...prev,
        rounds: updatedRounds,
        players: updatedPlayers,
        status: 'round_end',
      };
    });

    setHasGuessed(true);
  }, []);
  submitGuessRef.current = submitGuess;

  const nextRound = useCallback(() => {
    setGameState((prev) => {
      const nextRoundNum = prev.currentRound + 1;
      
      if (nextRoundNum > prev.totalRounds) {
        return {
          ...prev,
          status: 'game_end',
        };
      }

      return {
        ...prev,
        status: 'playing',
        currentRound: nextRoundNum,
        timeRemaining: DEFAULT_TIME_PER_ROUND,
      };
    });

    setHasGuessed(false);
    setCurrentGuess(null);
  }, []);

  const getCurrentRound = useCallback(() => {
    return gameState.rounds[gameState.currentRound - 1];
  }, [gameState.rounds, gameState.currentRound]);

  const getCurrentPlayer = useCallback(() => {
    return gameState.players.find((p) => p.id === playerIdRef.current);
  }, [gameState.players]);

  const getLeaderboard = useCallback(() => {
    return [...gameState.players].sort((a, b) => b.totalScore - a.totalScore);
  }, [gameState.players]);

  const resetGame = useCallback(() => {
    setGameState({
      gameId: uuidv4(),
      mode,
      status: 'lobby',
      currentRound: 0,
      totalRounds: DEFAULT_ROUNDS,
      rounds: [],
      players: gameState.players.map((p) => ({ ...p, totalScore: 0 })),
      timePerRound: DEFAULT_TIME_PER_ROUND,
      timeRemaining: DEFAULT_TIME_PER_ROUND,
    });
    setHasGuessed(false);
    setCurrentGuess(null);
  }, [mode, gameState.players]);

  return {
    gameState,
    currentGuess,
    hasGuessed,
    playerId: playerIdRef.current,
    startGame,
    submitGuess,
    nextRound,
    getCurrentRound,
    getCurrentPlayer,
    getLeaderboard,
    resetGame,
  };
}
