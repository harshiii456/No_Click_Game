import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Clock, Zap, User, Play, RotateCcw } from 'lucide-react';
import GameContainer from './components/GameContainer';
import ResultModal from './components/ResultModal';
import Leaderboard from './components/Leaderboard';
import { gameService } from './services/gameService';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [gameState, setGameState] = useState({
    isPlaying: false,
    isGameOver: false,
    level: 1,
    attempts: 0,
    startTime: null,
    timeTaken: 0,
    sessionId: null,
    showResult: false,
    showLeaderboard: false
  });

  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    bestTime: null,
    averageAttempts: 0
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [deviceType, setDeviceType] = useState('desktop');
  const gameTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Detect device type
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
      
      if (isTablet) return 'tablet';
      if (isMobile) return 'mobile';
      return 'desktop';
    };

    setDeviceType(detectDevice());
  }, []);

  // Load leaderboard on mount
  useEffect(() => {
    loadLeaderboard();
    loadGameStats();
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState.isPlaying && gameState.startTime) {
      gameTimerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeTaken: Math.floor((Date.now() - prev.startTime) / 1000)
        }));
      }, 100);
    } else {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.startTime]);

  const loadLeaderboard = async () => {
    try {
      const data = await gameService.getLeaderboard();
      setLeaderboard(data.scores || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const loadGameStats = async () => {
    try {
      const data = await gameService.getGameStats();
      setGameStats({
        totalGames: data.stats.totalSessions || 0,
        bestTime: null, // Would need user-specific stats
        averageAttempts: parseFloat(data.stats.averageAttempts) || 0
      });
    } catch (error) {
      console.error('Failed to load game stats:', error);
    }
  };

  const startGame = async () => {
    try {
      const response = await gameService.startGame(deviceType);
      
      setGameState({
        isPlaying: true,
        isGameOver: false,
        level: 1,
        attempts: 0,
        startTime: Date.now(),
        timeTaken: 0,
        sessionId: response.sessionId,
        showResult: false,
        showLeaderboard: false
      });

      toast.success('Game started! Catch the button! 🎯');
    } catch (error) {
      console.error('Failed to start game:', error);
      toast.error('Failed to start game');
    }
  };

  const endGame = async (success = true) => {
    if (!gameState.sessionId) return;

    try {
      const endTime = Date.now();
      const finalTime = Math.floor((endTime - gameState.startTime) / 1000);

      const response = await gameService.endGame({
        sessionId: gameState.sessionId,
        timeTaken: finalTime,
        attempts: gameState.attempts,
        maxLevel: gameState.level,
        username: `Player_${Math.random().toString(36).substr(2, 9)}` // Random username for demo
      });

      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isGameOver: true,
        timeTaken: finalTime,
        showResult: true
      }));

      if (success) {
        toast.success(`🎉 You caught it in ${finalTime}s with ${gameState.attempts} attempts!`);
      }

      // Reload leaderboard
      await loadLeaderboard();
      await loadGameStats();

    } catch (error) {
      console.error('Failed to end game:', error);
      toast.error('Failed to save game result');
    }
  };

  const handleButtonClick = () => {
    endGame(true);
  };

  const handleMiss = () => {
    setGameState(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));
  };

  const handleLevelUp = () => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1
    }));
  };

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      isGameOver: false,
      level: 1,
      attempts: 0,
      startTime: null,
      timeTaken: 0,
      sessionId: null,
      showResult: false,
      showLeaderboard: false
    });
  };

  const toggleLeaderboard = () => {
    setGameState(prev => ({
      ...prev,
      showLeaderboard: !prev.showLeaderboard
    }));
  };

  return (
    <div className="game-container">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div className="difficulty-badge">
            <Zap className="inline w-4 h-4 mr-2" />
            Level {gameState.level}
          </div>
          
          <div className="stats-panel">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {gameState.timeTaken}s
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {gameState.attempts}
              </div>
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                {gameStats.totalGames}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <AnimatePresence mode="wait">
        {!gameState.isPlaying && !gameState.showResult && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center">
              <motion.h1 
                className="text-6xl font-bold mb-4 text-shadow"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                😈 No-Click Game
              </motion.h1>
              <p className="text-xl mb-8 text-gray-300">
                Can you catch the button that doesn't want to be clicked?
              </p>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="start-button"
                >
                  <Play className="inline w-5 h-5 mr-2" />
                  Start Game
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLeaderboard}
                  className="block mx-auto px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors"
                >
                  <Trophy className="inline w-5 h-5 mr-2" />
                  View Leaderboard
                </motion.button>
              </div>

              <div className="mt-8 text-sm text-gray-400">
                <p>🖱️ Desktop: Move your mouse near the button</p>
                <p>📱 Mobile: Touch near the button</p>
                <p>⚡ Difficulty increases over time</p>
              </div>
            </div>
          </motion.div>
        )}

        {gameState.isPlaying && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameContainer
              level={gameState.level}
              onButtonClick={handleButtonClick}
              onMiss={handleMiss}
              onLevelUp={handleLevelUp}
              deviceType={deviceType}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {gameState.showResult && (
          <ResultModal
            timeTaken={gameState.timeTaken}
            attempts={gameState.attempts}
            maxLevel={gameState.level}
            onPlayAgain={startGame}
            onViewLeaderboard={toggleLeaderboard}
            onClose={resetGame}
          />
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {gameState.showLeaderboard && (
          <Leaderboard
            scores={leaderboard}
            onClose={() => setGameState(prev => ({ ...prev, showLeaderboard: false }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
