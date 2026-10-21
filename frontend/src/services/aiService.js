import api from './api';

export const aiService = {
  async chat(message, month, year) {
    return await api.post('/ai/chat', { message, month, year });
  },

  async getInsights(month, year) {
    return await api.get('/ai/insights', { params: { month, year } });
  },

  async getHistory() {
    return await api.get('/ai/history');
  },

  async clearHistory() {
    return await api.delete('/ai/history');
  },
};

export default aiService;
