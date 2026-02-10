// MongoDB initialization script
db = db.getSiblingDB('no-click-game');

// Create collections with validation
db.createCollection('gamesessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sessionId', 'startTime', 'deviceType'],
      properties: {
        sessionId: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        startTime: {
          bsonType: 'date',
          description: 'must be a date and is required'
        },
        deviceType: {
          enum: ['mobile', 'desktop', 'tablet'],
          description: 'must be one of the specified values'
        },
        timeTaken: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number'
        },
        attempts: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number'
        },
        maxLevel: {
          bsonType: 'number',
          minimum: 1,
          description: 'must be a number >= 1'
        },
        isCompleted: {
          bsonType: 'bool',
          description: 'must be a boolean'
        },
        isValid: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('leaderboards', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'bestTime', 'bestAttempts', 'maxLevel', 'deviceType'],
      properties: {
        username: {
          bsonType: 'string',
          maxLength: 50,
          description: 'must be a string with max 50 characters'
        },
        bestTime: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number'
        },
        bestAttempts: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number'
        },
        maxLevel: {
          bsonType: 'number',
          minimum: 1,
          description: 'must be a number >= 1'
        },
        deviceType: {
          enum: ['mobile', 'desktop', 'tablet'],
          description: 'must be one of the specified values'
        },
        sessionId: {
          bsonType: 'string',
          description: 'must be a string'
        },
        totalGames: {
          bsonType: 'number',
          minimum: 1,
          description: 'must be a number >= 1'
        },
        isValid: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

// Create indexes for better performance
db.gamesessions.createIndex({ sessionId: 1 }, { unique: true });
db.gamesessions.createIndex({ createdAt: -1 });
db.gamesessions.createIndex({ timeTaken: 1 });
db.gamesessions.createIndex({ isCompleted: 1, isValid: 1 });

db.leaderboards.createIndex({ bestTime: 1 });
db.leaderboards.createIndex({ deviceType: 1, bestTime: 1 });
db.leaderboards.createIndex({ createdAt: -1 });
db.leaderboards.createIndex({ username: 1 });

print('Database initialized successfully');
