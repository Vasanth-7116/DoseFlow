import api from './api';

export const getDashboardStats = () => {
  return api.get('/dashboard/stats');
};

export const getSalesComparison = () => {
  return api.get('/dashboard/sales-comparison');
};

export const getLowStockAlerts = () => {
  return api.get('/dashboard/alerts/low-stock');
};

export const getExpiryAlerts = (days = 45) => {
  return api.get('/dashboard/alerts/expiry', { params: { days } });
};

export const getReorderSuggestions = () => {
  return api.get('/dashboard/reorder-suggestions');
};
