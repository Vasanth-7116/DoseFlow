import api from './api';

export const loginUser = async (email, password) => {
  return await api.post('/auth/login', { email, password });
};

export const registerUser = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};

export const getAllUsers = async () => {
  return await api.get('/auth/users');
};

export const createStaffUser = async (userData) => {
  return await api.post('/auth/users', userData);
};

export const updateStaffUser = async (id, userData) => {
  return await api.put(`/auth/users/${id}`, userData);
};

export const deleteStaffUser = async (id) => {
  return await api.delete(`/auth/users/${id}`);
};

