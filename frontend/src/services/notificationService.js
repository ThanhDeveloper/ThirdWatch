import api from './api';

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.notifications = [];
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  // Get all notifications
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      this.notifications = response.data?.data || [];
      this.notify();
      return this.notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/mark-as-read`);
      this.notifications = this.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      this.notify();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await api.patch('/notifications/mark-all-as-read');
      this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
      this.notify();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`);
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.notify();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Create new notification (for real-time updates)
  addNotification(notification) {
    this.notifications.unshift({
      ...notification,
      id: notification.id || Date.now(),
      createdAt: notification.createdAt || new Date().toISOString(),
      isRead: false
    });
    this.notify();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;