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
      },{ withCredentials: true });

      const { success, message } = response.data;

      // Flag to trigger welcome toast after navigation
      sessionStorage.setItem('showWelcomeToast', '1');

      return { success, message };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    await apiClient.post('/auth/logout', {}, { withCredentials: true });
    window.location.href = '/auth/sign-in';
  }
}

export default new AuthService();
