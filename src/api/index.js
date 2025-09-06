import axios from 'axios';

const getToken = () => {
  const token = JSON.parse(localStorage.getItem('token'));
  return token || null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 300000, // Set a reasonable timeout
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error details for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    return Promise.reject(error);
  }
);

export default api;

