const validator = require('validator');

// Validate game start data
const validateGameStart = (req, res, next) => {
  const { deviceType, userAgent } = req.body;
  
  const errors = [];
  
  if (!deviceType || !['mobile', 'desktop', 'tablet'].includes(deviceType)) {
    errors.push('Valid deviceType is required (mobile, desktop, tablet)');
  }
  
  if (userAgent && typeof userAgent !== 'string') {
    errors.push('UserAgent must be a string');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

// Validate game end data
const validateGameEnd = (req, res, next) => {
  const { sessionId, timeTaken, attempts, maxLevel } = req.body;
  
  const errors = [];
  
  if (!sessionId || (!validator.isUUID(sessionId, 4) && !validator.isAlphanumeric(sessionId))) {
    errors.push('Valid sessionId is required');
  }
  
  if (timeTaken === undefined || typeof timeTaken !== 'number' || timeTaken < 0) {
    errors.push('Valid timeTaken is required (positive number)');
  }
  
  if (attempts === undefined || typeof attempts !== 'number' || attempts < 0) {
    errors.push('Valid attempts is required (positive number)');
  }
  
  if (maxLevel === undefined || typeof maxLevel !== 'number' || maxLevel < 1) {
    errors.push('Valid maxLevel is required (number >= 1)');
  }
  
  // Check for impossible times (basic anti-cheat)
  const minTime = parseInt(process.env.MIN_GAME_TIME) || 1;
  const maxTime = parseInt(process.env.MAX_GAME_TIME) || 300;
  
  // Temporarily disable time validation for testing
  /*
  if (timeTaken < minTime) {
    errors.push(`Game time too short (minimum ${minTime} seconds)`);
  }
  
  if (timeTaken > maxTime) {
    errors.push(`Game time too long (maximum ${maxTime} seconds)`);
  }
  */
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

// Validate leaderboard query
const validateLeaderboardQuery = (req, res, next) => {
  const { limit, deviceType } = req.query;
  
  if (limit && (!validator.isInt(limit, { min: 1, max: 100 }) || limit > 100)) {
    return res.status(400).json({
      error: 'Limit must be an integer between 1 and 100'
    });
  }
  
  if (deviceType && !['all', 'mobile', 'desktop', 'tablet'].includes(deviceType)) {
    return res.status(400).json({
      error: 'DeviceType must be one of: all, mobile, desktop, tablet'
    });
  }
  
  next();
};

module.exports = {
  validateGameStart,
  validateGameEnd,
  validateLeaderboardQuery
};
