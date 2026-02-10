import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://no-click-game-api.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`Received response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const gameService = {
  // Start a new game session
  startGame: async (deviceType) => {
    try {
      const response = await api.post('/game/start', {
        deviceType,
        userAgent: navigator.userAgent
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to start game');
    }
  },

  // End a game session
  endGame: async (gameData) => {
    try {
      const response = await api.post('/game/end', gameData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to end game');
    }
  },

  // Get game session details
  getSession: async (sessionId) => {
    try {
      const response = await api.get(`/game/session/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get session');
    }
  },

  // Get game statistics
  getGameStats: async () => {
    try {
      const response = await api.get('/game/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get game stats');
    }
  },

  // Get leaderboard
  getLeaderboard: async (limit = 10, deviceType = 'all') => {
    try {
      const response = await api.get('/leaderboard', {
        params: { limit, deviceType }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get leaderboard');
    }
  },

  // Get user scores
  getUserScores: async (username) => {
    try {
      const response = await api.get(`/leaderboard/user/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get user scores');
    }
  },

  // Get leaderboard statistics
  getLeaderboardStats: async () => {
    try {
      const response = await api.get('/leaderboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get leaderboard stats');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Health check failed');
    }
  }
};

export default gameService;
