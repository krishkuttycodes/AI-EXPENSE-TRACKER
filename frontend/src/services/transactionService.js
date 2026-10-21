import api from './api';

export const transactionService = {
  async getTransactions(params = {}) {
    return await api.get('/transactions', { params });
  },

  async getTransaction(id) {
    return await api.get(`/transactions/${id}`);
  },

  async createTransaction(transactionData) {
    return await api.post('/transactions', transactionData);
  },

  async updateTransaction(id, transactionData) {
    return await api.put(`/transactions/${id}`, transactionData);
  },

  async deleteTransaction(id) {
    return await api.delete(`/transactions/${id}`);
  },

  /**
   * Export transactions as CSV download
   */
  async downloadCSV(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const query = new URLSearchParams(params).toString();
    const token = localStorage.getItem('token');

    const res = await fetch(`${baseURL}/transactions/export/csv?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to generate CSV export');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

export default transactionService;
