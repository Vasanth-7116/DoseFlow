import api from './api';

export const getPurchases = (params = {}) => {
  return api.get('/purchases', { params });
};

export const createPurchase = (purchaseData) => {
  return api.post('/purchases', purchaseData);
};
