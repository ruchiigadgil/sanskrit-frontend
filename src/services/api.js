
import axios from 'axios';

const BASE_URL = 'https://sanskrit-backend-4cpp.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data) => {
    try {
      const response = await axiosInstance.post('/login', data);
      const { token, user } = response.data;
      tokenManager.setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },
  register: async (data) => {
    try {
      const response = await axiosInstance.post('/register', {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },
  profile: async () => {
    try {
      const response = await axiosInstance.get('/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch profile');
    }
  },
  getSentences: async () => {
    try {
      const response = await axiosInstance.get('/sentences');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch sentences');
    }
  },
  getVerbGame: async () => {
    try {
      const response = await axiosInstance.get('/get-game');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch verb game');
    }
  },
  getNumberGame: async () => {
    try {
      const response = await axiosInstance.get('/get-number-game');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch number game');
    }
  },
  getNumberGames: async (count = 5) => {
    try {
      const response = await axiosInstance.get(`/get-number-games?count=${count}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch number games');
    }
  },
  getTenseQuestion: async () => {
    try {
      const response = await axiosInstance.get('/tense-question');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch tense question');
    }
  },
  getTenseQuestions: async (count = 5) => {
    try {
      const response = await axiosInstance.get(`/get-tense-questions?count=${count}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch tense questions');
    }
  },
  getMatchingGame: async () => {
    try {
      const response = await axiosInstance.get('/get-matching-game');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch matching game');
    }
  },
  getSentenceGame: async () => {
    try {
      const response = await axiosInstance.get('/get-sentence-game');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sentence game:', error.response?.data || error.message);
      return null; // Handle gracefully
    }
  },
  updateScore: async (data) => {
    try {
      const response = await axiosInstance.post('/update-score', {
        user_id: data.user_id,
        score: data.score,
        game_type: data.game_type,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update score');
    }
  },
  saveScore: async (data) => {
    try {
      const response = await axiosInstance.post('/save-score', {
        user_id: data.user_id,
        score: data.score,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to save score');
    }
  },
  getStatus: async () => {
    try {
      const response = await axiosInstance.get('/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch status');
    }
  },
};

export const tokenManager = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData?.expires && new Date(userData.expires) < new Date()) {
      console.warn('Token expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return token;
  },
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
};