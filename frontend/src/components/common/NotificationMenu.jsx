import React from 'react';
import {
  Menu,
  MenuHandler,
  MenuList,
  IconButton,
  Typography,
  Button,
} from '@material-tailwind/react';
import {
  BellIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { notificationConfig, formatUnreadCount, sortNotifications, getRelativeTime } from '@/lib/notificationUtils';

// Icon mapping for notification types based on backend enum
const iconMap = {
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ClockIcon
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete, isLast }) => {
  const config = notificationConfig[notification.type] || notificationConfig.System;
  const IconComponent = iconMap[config.icon];

  return (
    <div className={`notification-item group relative transition-all duration-200 cursor-pointer hover:bg-gray-50/80 ${
      !isLast ? 'border-b border-gray-100' : ''
    } ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Icon with status indicator */}
        <div className="relative flex-shrink-0">
          <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
            !notification.isRead 
              ? `${config.bgColor} ${config.iconColor} shadow-sm` 
              : 'bg-gray-100 text-gray-500'
          }`}>
            <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          {!notification.isRead && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 ring-2 ring-white shadow-sm"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold leading-5 mb-1 transition-colors ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {notification.title}
              </h4>
              {notification.description && (
                <p className={`text-xs sm:text-sm leading-5 transition-colors ${
                  !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {notification.description}
                </p>
              )}
            </div>

            {/* Actions - Always visible on mobile, hover on desktop */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="p-1 sm:p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Mark as read"
                >
                  <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="p-1 sm:p-1.5 rounded-md hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete notification"
              >
                <XMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <span className="text-xs text-gray-500 font-medium">
              {getRelativeTime(notification.createdAt)}
            </span>
            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
              config.color === 'red' ? 'bg-red-100 text-red-700' :
              config.color === 'blue' ? 'bg-blue-100 text-blue-700' :
              config.color === 'amber' ? 'bg-amber-100 text-amber-700' :
              'bg-indigo-100 text-indigo-700'
            }`}>
              {notification.type}
            </span>
          </div>
        </div>
      </div>

      {/* Unread indicator bar */}
      {!notification.isRead && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          config.color === 'red' ? 'bg-red-500' :
          config.color === 'blue' ? 'bg-blue-500' :
          config.color === 'amber' ? 'bg-amber-500' :
          'bg-indigo-500'
        }`}></div>
      )}
    </div>
  );
};

const NotificationMenu = ({ notifications = [], onMarkAsRead, onMarkAllAsRead, onDelete }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const sortedNotifications = sortNotifications(notifications);
  const displayCount = formatUnreadCount(unreadCount);

  return (
    <Menu placement="bottom-end">
      <MenuHandler>
        <div className="relative">
          <IconButton 
            variant="text" 
            color="blue-gray"
            className="relative hover:bg-gray-100 transition-colors duration-200 rounded-lg"
          >
            {unreadCount > 0 ? (
              <BellIconSolid className="h-6 w-6 text-blue-600" />
            ) : (
              <BellIcon className="h-6 w-6 text-gray-600" />
            )}
          </IconButton>
          {displayCount && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg">
              {displayCount}
            </div>
          )}
        </div>
      </MenuHandler>
      
      <MenuList className="w-96 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] border border-gray-200 shadow-xl max-h-[80vh] sm:max-h-[70vh] overflow-hidden p-0 rounded-xl bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-3 sm:p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="text"
                color="blue"
                className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 hover:bg-blue-50 transition-colors rounded-lg"
                onClick={onMarkAllAsRead}
              >
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Mark all</span>
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] sm:max-h-[calc(70vh-80px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {sortedNotifications.length > 0 ? (
            <div>
              {sortedNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  isLast={index === sortedNotifications.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BellIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h4>
              <p className="text-sm text-gray-500 max-w-sm">
                You don't have any notifications right now. We'll let you know when something important happens.
              </p>
            </div>
          )}
        </div>
      </MenuList>
    </Menu>
  );
};

export default NotificationMenu;