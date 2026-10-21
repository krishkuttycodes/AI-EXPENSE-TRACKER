import api from './api';

export const analyticsService = {
  async getDashboard(month, year) {
    return await api.get('/analytics/dashboard', { params: { month, year } });
  },
};

export default analyticsService;
