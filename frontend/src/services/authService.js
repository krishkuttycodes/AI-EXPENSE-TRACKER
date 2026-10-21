import api from './api';

export const authService = {
  async register(userData) {
    return await api.post('/auth/register', userData);
  },

  async login(credentials) {
    return await api.post('/auth/login', credentials);
  },

  async getProfile() {
    return await api.get('/auth/profile');
  },

  async updateProfile(profileData) {
    return await api.put('/auth/profile', profileData);
  },
};

export default authService;
