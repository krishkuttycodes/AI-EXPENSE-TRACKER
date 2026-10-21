import api from './api';

export const budgetService = {
  async getBudgets(month, year) {
    return await api.get('/budgets', { params: { month, year } });
  },

  async createBudget(budgetData) {
    return await api.post('/budgets', budgetData);
  },

  async updateBudget(id, budgetData) {
    return await api.put(`/budgets/${id}`, budgetData);
  },

  async deleteBudget(id) {
    return await api.delete(`/budgets/${id}`);
  },
};

export default budgetService;
