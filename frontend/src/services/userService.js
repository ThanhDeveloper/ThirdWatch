import apiClient from './api';

/**
 * User service for handling user-related operations
 */
class UserService {
  /**
   * Get current authenticated user
   * @returns {Promise<Object>} Current user data
   */

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/user/me', { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
