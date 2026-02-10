const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const { validateLeaderboardQuery } = require('../middleware/validation');
const { leaderboardLimiter } = require('../middleware/rateLimiter');

// GET /api/leaderboard - Get top scores
router.get('/', leaderboardLimiter, validateLeaderboardQuery, async (req, res) => {
  try {
    const { limit = 10, deviceType = 'all' } = req.query;
    
    const scores = await Leaderboard.getTopScores(parseInt(limit), deviceType);
    
    res.status(200).json({
      success: true,
      scores,
      count: scores.length,
      deviceType,
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      message: error.message
    });
  }
});

// GET /api/leaderboard/user/:username - Get user's best scores
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }
    
    const userScores = await Leaderboard.find({ 
      username: username.trim(),
      isValid: true 
    })
    .sort({ bestTime: 1 })
    .select('bestTime bestAttempts maxLevel deviceType totalGames createdAt');
    
    if (userScores.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No scores found for this user'
      });
    }
    
    res.status(200).json({
      success: true,
      username: username.trim(),
      scores: userScores,
      count: userScores.length
    });
    
  } catch (error) {
    console.error('Error fetching user scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user scores',
      message: error.message
    });
  }
});

// GET /api/leaderboard/stats - Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalEntries = await Leaderboard.countDocuments({ isValid: true });
    
    const deviceStats = await Leaderboard.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: '$deviceType', count: { $sum: 1 }, avgTime: { $avg: '$bestTime' } } }
    ]);
    
    const bestOverallTime = await Leaderboard.findOne({ isValid: true })
      .sort({ bestTime: 1 })
      .select('username bestTime deviceType');
    
    const mostAttempts = await Leaderboard.findOne({ isValid: true })
      .sort({ bestAttempts: -1 })
      .select('username bestAttempts deviceType');
    
    const highestLevel = await Leaderboard.findOne({ isValid: true })
      .sort({ maxLevel: -1 })
      .select('username maxLevel deviceType');
    
    res.status(200).json({
      success: true,
      stats: {
        totalEntries,
        deviceStats: deviceStats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            avgTime: stat.avgTime?.toFixed(2) || 0
          };
          return acc;
        }, {}),
        bestOverallTime,
        mostAttempts,
        highestLevel
      }
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard statistics',
      message: error.message
    });
  }
});

module.exports = router;
