import api from './api';

export const getSuppliers = (params = {}, config = {}) => {
  return api.get('/suppliers', { params, ...config });
};

export const getSupplierById = (id) => {
  return api.get(`/suppliers/${id}`);
};

export const createSupplier = (data) => {
  return api.post('/suppliers', data);
};

export const updateSupplier = (id, data) => {
  return api.put(`/suppliers/${id}`, data);
};

export const deleteSupplier = (id) => {
  return api.delete(`/suppliers/${id}`);
};
