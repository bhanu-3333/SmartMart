import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://smartmart-1-alwt.onrender.com/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

export const getProducts = () => API.get('/products');
export const getProductByBarcode = (code) => API.get(`/products/barcode/${code}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

export const getCart = () => API.get('/cart');
export const addToCart = (code) => API.post('/cart/add', { code });
export const updateCartQuantity = (productId, quantity) => API.put('/cart/quantity', { productId, quantity });
export const removeFromCart = (productId) => API.delete(`/cart/${productId}`);

export const createOrder = () => API.post('/orders');
export const getMyOrders = () => API.get('/orders/my-orders');
export const getAllOrders = () => API.get('/orders/all');
export const getAdminStats = () => API.get('/orders/stats');
export const getTodayStats = () => API.get('/orders/today-stats');

export default API;
