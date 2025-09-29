import apiClient from './api';

/**
 * Webhook service for managing webhook endpoint operations
 */
class WebhookService {
  /**
   * Get the active webhook endpoint
   * @returns {Promise<Object|null>} Active endpoint data or null
   */
  async getActiveEndpoint() {
    try {
      const response = await apiClient.get('/hooks/active-endpoint', { withCredentials: true });
      return response?.data?.data || null;
    } catch (error) {
      // If 404, it means no active endpoint
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new webhook endpoint
   * @param {string} providerName - Provider name (e.g., GitHub, Stripe)
   * @param {string} httpMethod - HTTP method (GET or POST)
   * @returns {Promise<Object>} Created endpoint data
   */
  async createEndpoint(providerName, httpMethod) {
    try {
      const response = await apiClient.post('/hooks/create', {
        providerName: providerName.trim(),
        httpMethod: httpMethod.toUpperCase(),
      }, { withCredentials: true });
      
      return response?.data?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get webhook request histories
   * @returns {Promise<Array>} Array of webhook request histories
   */
  async getHistories() {
    try {
      const response = await apiClient.get('/hooks/histories', { withCredentials: true });
      return response?.data?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get request payload data with metadata
   * @param {string} endpointId - Endpoint ID
   * @param {string} historyId - History ID
   * @returns {Promise<Object>} Request payload data with size and other metadata
   */
  async getRequestPayload(endpointId, historyId) {
    try {
      const response = await apiClient.get(
        `/hooks/endpoint-id/${endpointId}/history-id/${historyId}/payload`, 
        { withCredentials: true }
      );
      
      const data = response?.data?.data;
      if (!data) return {};
      
      // Parse JSON string payload to object
      let payload = data.payload;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (parseError) {
          console.error('Failed to parse payload JSON:', parseError);
          payload = data.payload;
        }
      }
      
      return {
        id: data.id,
        payload: payload,
        size: data.size
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new WebhookService();