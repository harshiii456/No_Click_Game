const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  timeTaken: {
    type: Number, // in seconds
    min: 0
  },
  attempts: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maxLevel: {
    type: Number,
    min: 1,
    default: 1
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    required: true
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
gameSessionSchema.index({ sessionId: 1 });
gameSessionSchema.index({ createdAt: -1 });
gameSessionSchema.index({ timeTaken: 1 });
gameSessionSchema.index({ isCompleted: 1, isValid: 1 });

// Validation for reasonable game times
gameSessionSchema.pre('save', function(next) {
  if (this.timeTaken) {
    const minTime = parseInt(process.env.MIN_GAME_TIME) || 3;
    const maxTime = parseInt(process.env.MAX_GAME_TIME) || 300;
    
    if (this.timeTaken < minTime || this.timeTaken > maxTime) {
      this.isValid = false;
    }
  }
  next();
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
