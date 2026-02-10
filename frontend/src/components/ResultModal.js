import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, RotateCcw, Crown, Medal, Award } from 'lucide-react';

const ResultModal = ({ timeTaken, attempts, maxLevel, onPlayAgain, onViewLeaderboard, onClose }) => {
  const getPerformanceRating = () => {
    if (timeTaken < 10 && attempts < 10) return { icon: Crown, color: 'text-yellow-400', title: 'Legendary!' };
    if (timeTaken < 20 && attempts < 20) return { icon: Trophy, color: 'text-purple-400', title: 'Excellent!' };
    if (timeTaken < 30 && attempts < 30) return { icon: Medal, color: 'text-blue-400', title: 'Great Job!' };
    return { icon: Award, color: 'text-green-400', title: 'Good Effort!' };
  };

  const getStatsColor = (value, goodThreshold) => {
    return value <= goodThreshold ? 'text-green-400' : 'text-gray-300';
  };

  const rating = getPerformanceRating();
  const RatingIcon = rating.icon;

  return (
    <motion.div
      className="game-over-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block"
          >
            <RatingIcon className={`w-16 h-16 mx-auto mb-2 ${rating.color}`} />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">{rating.title}</h2>
          <p className="text-gray-300">You caught the button!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-game-dark/50 rounded-lg backdrop-blur-sm"
          >
            <Clock className={`w-8 h-8 mx-auto mb-2 ${getStatsColor(timeTaken, 20)}`} />
            <div className={`text-2xl font-bold ${getStatsColor(timeTaken, 20)}`}>
              {timeTaken}s
            </div>
            <div className="text-xs text-gray-400">Time</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center p-4 bg-game-dark/50 rounded-lg backdrop-blur-sm"
          >
            <Target className={`w-8 h-8 mx-auto mb-2 ${getStatsColor(attempts, 25)}`} />
            <div className={`text-2xl font-bold ${getStatsColor(attempts, 25)}`}>
              {attempts}
            </div>
            <div className="text-xs text-gray-400">Attempts</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center p-4 bg-game-dark/50 rounded-lg backdrop-blur-sm"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-purple-400">
              {maxLevel}
            </div>
            <div className="text-xs text-gray-400">Max Level</div>
          </motion.div>
        </div>

        {/* Performance Analysis */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30"
        >
          <h3 className="font-bold mb-2 text-center">Performance Analysis</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Speed Rating:</span>
              <span className={getStatsColor(timeTaken, 20)}>
                {timeTaken < 10 ? '⚡ Lightning Fast' : timeTaken < 20 ? '🔥 Quick' : timeTaken < 30 ? '👍 Good' : '🐌 Steady'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Accuracy:</span>
              <span className={getStatsColor(attempts, 25)}>
                {attempts < 10 ? '🎯 Sharpshooter' : attempts < 20 ? '✅ Precise' : attempts < 30 ? '👌 Decent' : '🎲 Persistent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Difficulty:</span>
              <span className="text-purple-400">
                {maxLevel > 5 ? '💀 Expert' : maxLevel > 3 ? '🔥 Advanced' : '🌟 Beginner'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewLeaderboard}
              className="py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </motion.button>
          </div>
        </div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-center text-xs text-gray-400"
        >
          {timeTaken < 10 && attempts < 10 && "🏆 You're in the top 1% of players!"}
          {timeTaken >= 10 && timeTaken < 20 && "⭐ Great performance! Keep practicing!"}
          {timeTaken >= 20 && timeTaken < 30 && "💪 Good effort! You're getting better!"}
          {timeTaken >= 30 && "🎯 Practice makes perfect! Try again!"}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ResultModal;
