import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, X, Filter, Crown, Medal, Award, Smartphone, Monitor, Tablet } from 'lucide-react';

const Leaderboard = ({ scores, onClose }) => {
  const [filter, setFilter] = useState('all');
  const [filteredScores, setFilteredScores] = useState(scores);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredScores(scores);
    } else {
      setFilteredScores(scores.filter(score => score.deviceType === filter));
    }
  }, [filter, scores]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-gray-400">#{rank}</span>;
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4 text-blue-400" />;
      case 'desktop': return <Monitor className="w-4 h-4 text-green-400" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-purple-400" />;
      default: return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'border-yellow-400/50 bg-yellow-400/10';
      case 2: return 'border-gray-300/50 bg-gray-300/10';
      case 3: return 'border-orange-600/50 bg-orange-600/10';
      default: return 'border-gray-600/30 bg-gray-600/10';
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceStats = () => {
    const stats = {};
    scores.forEach(score => {
      stats[score.deviceType] = (stats[score.deviceType] || 0) + 1;
    });
    return stats;
  };

  const deviceStats = getDeviceStats();

  return (
    <motion.div
      className="game-over-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <p className="text-sm text-gray-400">Top performers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Smartphone className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <div className="text-lg font-bold">{deviceStats.mobile || 0}</div>
            <div className="text-xs text-gray-400">Mobile</div>
          </div>
          <div className="text-center p-3 bg-green-500/20 rounded-lg border border-green-500/30">
            <Monitor className="w-5 h-5 mx-auto mb-1 text-green-400" />
            <div className="text-lg font-bold">{deviceStats.desktop || 0}</div>
            <div className="text-xs text-gray-400">Desktop</div>
          </div>
          <div className="text-center p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <Tablet className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <div className="text-lg font-bold">{deviceStats.tablet || 0}</div>
            <div className="text-xs text-gray-400">Tablet</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center justify-center mb-6 space-x-2">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          {['all', 'mobile', 'desktop', 'tablet'].map((device) => (
            <motion.button
              key={device}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(device)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === device
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {device.charAt(0).toUpperCase() + device.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredScores.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No scores yet for this filter</p>
              <p className="text-sm">Be the first to set a record!</p>
            </div>
          ) : (
            filteredScores.map((score, index) => (
              <motion.div
                key={`${score.username}-${index}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`leaderboard-item border-2 ${getRankColor(index + 1)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-white">{score.username}</div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      {getDeviceIcon(score.deviceType)}
                      <span>Level {score.maxLevel}</span>
                      <span>•</span>
                      <span>{new Date(score.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-400">
                      {formatTime(score.bestTime)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {score.bestAttempts} attempts
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>{filteredScores.length} players</span>
            <span>Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;
