const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const GameSession = require('../models/GameSession');
const Leaderboard = require('../models/Leaderboard');
const { validateGameStart, validateGameEnd } = require('../middleware/validation');
const { gameStartLimiter, gameEndLimiter } = require('../middleware/rateLimiter');

// Get client IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// POST /api/game/start - Start a new game session
router.post('/start', gameStartLimiter, validateGameStart, async (req, res) => {
  try {
    const { deviceType, userAgent } = req.body;
    
    const sessionId = uuidv4();
    const startTime = new Date();
    const ipAddress = getClientIP(req);
    
    const gameSession = new GameSession({
      sessionId,
      startTime,
      deviceType,
      userAgent: userAgent || req.get('User-Agent'),
      ipAddress
    });
    
    await gameSession.save();
    
    res.status(201).json({
      success: true,
      sessionId,
      startTime: gameSession.startTime,
      message: 'Game session started successfully'
    });
    
  } catch (error) {
    console.error('Error starting game session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start game session',
      message: error.message
    });
  }
});

// POST /api/game/end - End a game session
router.post('/end', gameEndLimiter, validateGameEnd, async (req, res) => {
  try {
    const { sessionId, timeTaken, attempts, maxLevel, username } = req.body;
    
    // Find the game session
    const gameSession = await GameSession.findOne({ sessionId });
    
    if (!gameSession) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    if (gameSession.isCompleted) {
      return res.status(400).json({
        success: false,
        error: 'Game session already completed'
      });
    }
    
    // Update game session
    const endTime = new Date();
    gameSession.endTime = endTime;
    gameSession.timeTaken = timeTaken;
    gameSession.attempts = attempts;
    gameSession.maxLevel = maxLevel;
    gameSession.isCompleted = true;
    
    // Validate game time (anti-cheat)
    const minTime = parseInt(process.env.MIN_GAME_TIME) || 3;
    const maxTime = parseInt(process.env.MAX_GAME_TIME) || 300;
    
    if (timeTaken < minTime || timeTaken > maxTime) {
      gameSession.isValid = false;
    }
    
    await gameSession.save();
    
    // Update leaderboard if username provided and game is valid
    let leaderboardEntry = null;
    if (username && username.trim() && gameSession.isValid) {
      leaderboardEntry = await Leaderboard.updateScore({
        username: username.trim(),
        timeTaken,
        attempts,
        maxLevel,
        deviceType: gameSession.deviceType,
        sessionId,
        isValid: gameSession.isValid
      });
    }
    
    res.status(200).json({
      success: true,
      gameSession: {
        sessionId: gameSession.sessionId,
        timeTaken: gameSession.timeTaken,
        attempts: gameSession.attempts,
        maxLevel: gameSession.maxLevel,
        deviceType: gameSession.deviceType,
        isValid: gameSession.isValid,
        isCompleted: gameSession.isCompleted
      },
      leaderboardEntry,
      message: 'Game session completed successfully'
    });
    
  } catch (error) {
    console.error('Error ending game session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end game session',
      message: error.message
    });
  }
});

// GET /api/game/session/:sessionId - Get game session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const gameSession = await GameSession.findOne({ sessionId })
      .select('-ipAddress -__v');
    
    if (!gameSession) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      gameSession
    });
    
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game session',
      message: error.message
    });
  }
});

// GET /api/game/stats - Get game statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSessions = await GameSession.countDocuments();
    const completedSessions = await GameSession.countDocuments({ isCompleted: true });
    const validSessions = await GameSession.countDocuments({ isCompleted: true, isValid: true });
    
    const deviceStats = await GameSession.aggregate([
      { $match: { isCompleted: true, isValid: true } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);
    
    const averageTime = await GameSession.aggregate([
      { $match: { isCompleted: true, isValid: true } },
      { $group: { _id: null, avgTime: { $avg: '$timeTaken' } } }
    ]);
    
    const averageAttempts = await GameSession.aggregate([
      { $match: { isCompleted: true, isValid: true } },
      { $group: { _id: null, avgAttempts: { $avg: '$attempts' } } }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        validSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(2) : 0,
        validRate: completedSessions > 0 ? (validSessions / completedSessions * 100).toFixed(2) : 0,
        deviceStats: deviceStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        averageTime: averageTime[0]?.avgTime?.toFixed(2) || 0,
        averageAttempts: averageAttempts[0]?.avgAttempts?.toFixed(2) || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game statistics',
      message: error.message
    });
  }
});

module.exports = router;
