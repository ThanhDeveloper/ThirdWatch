// Utility functions for notifications

/**
 * Format unread count for display
 */
export const formatUnreadCount = (count) => {
  if (count === 0) return null;
  if (count > 999) return '999+';
  if (count > 99) return '99+';
  return count.toString();
};

/**
 * Get relative time string
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const now = new Date();
  const time = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(time.getTime())) return 'Unknown';
  
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  }
};

/**
 * Sort notifications by timestamp and read status
 */
export const sortNotifications = (notifications) => {
  return [...notifications].sort((a, b) => {
    // Unread first
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    // Then by timestamp (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

// Notification type configuration based on backend enum
// public enum NotificationType { System, Warning, Info, Error, Reminder }
export const notificationConfig = {
  System: {
    icon: 'ComputerDesktopIcon',
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  Warning: {
    icon: 'ExclamationTriangleIcon',
    color: 'amber',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200'
  },
  Info: {
    icon: 'InformationCircleIcon',
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  Error: {
    icon: 'XCircleIcon',
    color: 'red',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200'
  },
  Reminder: {
    icon: 'ClockIcon',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200'
  }
};