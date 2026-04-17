import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace YOUR_IP with your machine's local IP address when testing on mobile
const API = axios.create({
  baseURL: 'http://192.168.1.100:5000/api', 
});

API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
