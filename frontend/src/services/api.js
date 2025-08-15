import axios from 'axios';
import { Environment } from '@/lib/environment';

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: Environment.API.BaseURL,
  timeout: Environment.API.Timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for adding auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling common errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (!response) {
      // Network error or timeout
      throw new ApiError('Network error. Please check your connection.', 0, null);
    }

    const { status, data } = response;

    switch (status) {
      case 400:
        throw new ApiError('Bad request', status, data);
      case 401:
        localStorage.removeItem('authToken');
        window.location.href = '/auth/sign-in';
        throw new ApiError('Unauthorized', status, data);
      case 403:
        throw new ApiError('Forbidden', status, data);
      case 404:
        // Only redirect to 404 page for actual 404 routes, not API errors
        if (window.location.pathname !== '/404') {
          throw new ApiError('Resource not found', status, data);
        }
        break;
      case 500:
        throw new ApiError('Internal server error', status, data);
      default:
        throw new ApiError('An unexpected error occurred', status, data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
