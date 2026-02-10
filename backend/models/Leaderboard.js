const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  bestTime: {
    type: Number, // in seconds
    required: true,
    min: 0
  },
  bestAttempts: {
    type: Number,
    required: true,
    min: 0
  },
  maxLevel: {
    type: Number,
    required: true,
    min: 1
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'GameSession'
  },
  totalGames: {
    type: Number,
    default: 1
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
leaderboardSchema.index({ bestTime: 1 });
leaderboardSchema.index({ deviceType: 1, bestTime: 1 });
leaderboardSchema.index({ createdAt: -1 });
leaderboardSchema.index({ username: 1 });

// Static method to get top scores
leaderboardSchema.statics.getTopScores = function(limit = 10, deviceType = null) {
  const query = { isValid: true };
  if (deviceType && deviceType !== 'all') {
    query.deviceType = deviceType;
  }
  
  return this.find(query)
    .sort({ bestTime: 1, bestAttempts: 1 })
    .limit(limit)
    .select('username bestTime bestAttempts maxLevel deviceType createdAt');
};

// Static method to update or create leaderboard entry
leaderboardSchema.statics.updateScore = function(gameData) {
  return this.findOneAndUpdate(
    { 
      username: gameData.username,
      deviceType: gameData.deviceType 
    },
    {
      $set: {
        bestTime: gameData.timeTaken,
        bestAttempts: gameData.attempts,
        maxLevel: gameData.maxLevel,
        sessionId: gameData.sessionId,
        isValid: gameData.isValid
      },
      $inc: { totalGames: 1 }
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
