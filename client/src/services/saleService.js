import api from './api';

export const getSales = (params = {}) => {
  return api.get('/sales', { params });
};

export const createSale = (saleData) => {
  return api.post('/sales', saleData);
};
