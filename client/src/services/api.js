import axios from 'axios';

// Configuration de l'API - supporte les variables d'environnement
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me')
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getMyProducts: (params) => api.get('/products/my-products', { params }), // Pour sellers
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  updateVariantStock: (variantId, stock) => api.put(`/products/variants/${variantId}/stock`, { stock }),
  deleteVariant: (variantId) => api.delete(`/products/variants/${variantId}`)
};

export const cartService = {
  get: () => api.get('/cart'),
  add: (productVariantId, quantity = 1) => api.post('/cart', { productVariantId, quantity }),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart/clear')
};

export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

export const expiredCartService = {
  saveExpiredItems: (items) => api.post('/expired-cart/save', { items }),
  getHistory: (options = {}) => api.get('/expired-cart/history', { params: options }),
  reorderItem: (expiredItemId, quantity) => 
    api.post(`/expired-cart/reorder-to-cart/${expiredItemId}`, { quantity })
};

export default api;
