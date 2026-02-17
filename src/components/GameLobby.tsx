import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users, Globe, MapPin, Trophy, Clock, ChevronRight } from 'lucide-react';
import { DEFAULT_ROUNDS, DEFAULT_TIME_PER_ROUND, formatTime } from '@/types/game';

interface GameLobbyProps {
  onStartSinglePlayer: (playerName: string) => void;
  onCreateMultiplayer: (playerName: string) => void;
  onJoinMultiplayer: (gameId: string, playerName: string) => void;
}

export function GameLobby({ onStartSinglePlayer, onCreateMultiplayer, onJoinMultiplayer }: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [activeTab, setActiveTab] = useState('single');

  const handleStartSingle = () => {
    const name = playerName.trim() || 'Player';
    onStartSinglePlayer(name);
  };

  const handleCreateMultiplayer = () => {
    const name = playerName.trim() || 'Player';
    onCreateMultiplayer(name);
  };

  const handleJoinMultiplayer = () => {
    const name = playerName.trim() || 'Player';
    if (gameId.trim()) {
      onJoinMultiplayer(gameId.trim(), name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Globe className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">GeoGuessr</h1>
          <p className="text-zinc-400 text-lg">Explore the world. Test your knowledge.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-800/50 p-1">
            <TabsTrigger 
              value="single" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400"
            >
              <User className="w-4 h-4 mr-2" />
              Single Player
            </TabsTrigger>
            <TabsTrigger 
              value="multiplayer"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400"
            >
              <Users className="w-4 h-4 mr-2" />
              Multiplayer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Single Player</CardTitle>
                <CardDescription className="text-zinc-400">
                  Play at your own pace and challenge yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Player Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-zinc-900 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Game Settings */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-900/50 rounded-lg p-4 text-center">
                    <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{DEFAULT_ROUNDS}</p>
                    <p className="text-xs text-zinc-500">Rounds</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{formatTime(DEFAULT_TIME_PER_ROUND)}</p>
                    <p className="text-xs text-zinc-500">Per Round</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 text-center">
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">5000</p>
                    <p className="text-xs text-zinc-500">Max Score</p>
                  </div>
                </div>

                <Button
                  onClick={handleStartSingle}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-6 text-lg"
                >
                  START GAME
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiplayer">
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Multiplayer</CardTitle>
                <CardDescription className="text-zinc-400">
                  Play with friends in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Player Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-zinc-900 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Create Game */}
                  <div className="bg-zinc-900/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Create Game</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                      Start a new game and invite friends
                    </p>
                    <Button
                      onClick={handleCreateMultiplayer}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      CREATE GAME
                    </Button>
                  </div>

                  {/* Join Game */}
                  <div className="bg-zinc-900/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Join Game</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                      Enter a game code to join
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Game Code"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        className="bg-zinc-900 border-zinc-600 text-white placeholder:text-zinc-500 flex-1"
                      />
                      <Button
                        onClick={handleJoinMultiplayer}
                        disabled={!gameId.trim()}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white"
                      >
                        JOIN
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Game Settings */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-900/50 rounded-lg p-4 text-center">
                    <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{DEFAULT_ROUNDS}</p>
                    <p className="text-xs text-zinc-500">Rounds</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{formatTime(DEFAULT_TIME_PER_ROUND)}</p>
                    <p className="text-xs text-zinc-500">Per Round</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 text-center">
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">5000</p>
                    <p className="text-xs text-zinc-500">Max Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Globe className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-white">Explore the World</p>
            <p className="text-xs text-zinc-500">Visit amazing places</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-white">Test Your Skills</p>
            <p className="text-xs text-zinc-500">Guess locations accurately</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm font-medium text-white">Compete</p>
            <p className="text-xs text-zinc-500">Challenge friends</p>
          </div>
        </div>
      </div>
    </div>
  );
}
