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
      const payload = response?.data?.data || {};
      const normalized = {
        name: payload.userName || '',
        email: payload.email || '',
        password: payload.password || '',
        profilePictureUrl: (payload.profilePictureUrl && String(payload.profilePictureUrl).trim()) || '',
      };

      // Persist minimal info for greeting
      try {
        localStorage.setItem('user', JSON.stringify({ name: normalized.name }));
      } catch (_) { }

      return normalized;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
