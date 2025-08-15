import apiClient from './api';

/**
 * Authentication service for handling login, logout, and token management
 */
class AuthService {
  /**
   * Login user with email and password
   * @param {string} email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, userName } = camelizeKeys(response.data);

      // Store tokens and minimal user profile
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({ name: userName }));

      // Flag to trigger welcome toast after navigation
      sessionStorage.setItem('showWelcomeToast', '1');

      return { accessToken, refreshToken, userName };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/sign-in';
  }

  /**
   * Get current user from localStorage
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get auth token
   * @returns {string|null} Auth token or null
   */
  getToken() {
    return localStorage.getItem('authToken');
  }
}

// Helper: converts PascalCase keys to camelCase to be JS-friendly
function camelizeKeys(data) {
  if (!data || typeof data !== 'object') return data;
  const entries = Object.entries(data).map(([k, v]) => [
    k.charAt(0).toLowerCase() + k.slice(1),
    v,
  ]);
  return Object.fromEntries(entries);
}

export default new AuthService();
