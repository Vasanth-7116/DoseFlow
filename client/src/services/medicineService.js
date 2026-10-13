import api from './api';

export const getMedicines = (params = {}, config = {}) => {
  return api.get('/medicines', { params, ...config });
};

export const getMedicineById = (id) => {
  return api.get(`/medicines/${id}`);
};

export const createMedicine = (data) => {
  return api.post('/medicines', data);
};

export const updateMedicine = (id, data) => {
  return api.put(`/medicines/${id}`, data);
};

export const deleteMedicine = (id) => {
  return api.delete(`/medicines/${id}`);
};
