import axios from 'axios';

// You can set the baseURL as needed
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

export default api;


