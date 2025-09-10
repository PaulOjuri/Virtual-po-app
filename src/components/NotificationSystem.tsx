import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, Clock, Calendar, CheckSquare, AlertCircle, Settings, BellOff, Volume2, VolumeX } from 'lucide-react';
import { NotesService, Reminder } from '../services/notesService';
import { CalendarService } from '../services/calendarService';

export interface Notification {
  id: string;
  type: 'todo' | 'calendar' | 'ceremony' | 'note' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
  data?: any; // Additional data specific to notification type
}

export interface NotificationAction {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void;
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ onNotificationClick, isExpanded, onToggleExpanded }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Test notifications to see the badge
    {
      id: 'test-1',
      type: 'todo',
      title: 'Task Reminder',
      message: 'Complete the design review',
      timestamp: new Date(),
      isRead: false,
      priority: 'medium',
    },
    {
      id: 'test-2',
      type: 'calendar',
      title: 'Meeting in 15 minutes',
      message: 'Stand-up meeting with the team',
      timestamp: new Date(),
      isRead: false,
      priority: 'high',
    },
    {
      id: 'test-3',
      type: 'note',
      title: 'Note reminder',
      message: 'Review project specifications',
      timestamp: new Date(),
      isRead: true,
      priority: 'low',
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    soundEnabled: true,
    browserNotifications: true,
    categories: {
      todos: true,
      ceremonies: true,
      meetings: true,
      deadlines: true,
      notes: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  useEffect(() => {
    loadNotifications();
    requestNotificationPermission();
    
    // Set up polling for new reminders
    const interval = setInterval(() => {
      checkForNewReminders();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Load existing notifications from localStorage
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsedNotifications);
      }
      
      // Load user notification settings
      const storedSettings = localStorage.getItem('notificationSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = (notifications: Notification[]) => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setNotifications(notifications);
  };

  const saveSettings = (newSettings: typeof settings) => {
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const checkForNewReminders = useCallback(async () => {
    if (!settings.enabled) return;
    
    try {
      const now = new Date();
      const reminders = await NotesService.getReminders(true);
      
      for (const reminder of reminders) {
        const reminderTime = new Date(reminder.reminderTime);
        
        // Check if reminder time has passed and we haven't notified yet
        if (reminderTime <= now && !hasNotificationForReminder(reminder.id)) {
          await createNotificationFromReminder(reminder);
        }
      }
    } catch (error) {
      console.error('Error checking for reminders:', error);
    }
  }, [settings.enabled]);

  const hasNotificationForReminder = (reminderId: string): boolean => {
    return notifications.some(n => n.data?.reminderId === reminderId);
  };

  const createNotificationFromReminder = async (reminder: Reminder) => {
    if (!shouldShowNotification(reminder.type)) return;
    
    const notification: Notification = {
      id: `reminder-${reminder.id}-${Date.now()}`,
      type: reminder.type as any,
      title: getNotificationTitle(reminder),
      message: reminder.message,
      timestamp: new Date(),
      isRead: false,
      priority: getPriorityFromReminder(reminder),
      actions: getActionsForReminder(reminder),
      data: { reminderId: reminder.id, ...reminder }
    };

    const newNotifications = [notification, ...notifications];
    saveNotifications(newNotifications);
    
    // Show browser notification if enabled
    if (settings.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      showBrowserNotification(notification);
    }
    
    // Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationSound(notification.priority);
    }
  };

  const getNotificationTitle = (reminder: Reminder): string => {
    switch (reminder.type) {
      case 'todo':
        return 'Todo Reminder';
      case 'ceremony':
        return 'Ceremony Reminder';
      case 'calendar':
        return 'Calendar Event';
      case 'note':
        return 'Note Reminder';
      default:
        return 'Reminder';
    }
  };

  const getPriorityFromReminder = (reminder: Reminder): Notification['priority'] => {
    if (reminder.type === 'ceremony') return 'high';
    if (reminder.type === 'todo') return 'medium';
    return 'medium';
  };

  const getActionsForReminder = (reminder: Reminder): NotificationAction[] => {
    const actions: NotificationAction[] = [
      { label: 'Dismiss', action: 'dismiss', style: 'secondary' }
    ];

    switch (reminder.type) {
      case 'todo':
        actions.unshift(
          { label: 'Mark Done', action: 'complete_todo', style: 'primary' },
          { label: 'Snooze', action: 'snooze', style: 'secondary' }
        );
        break;
      case 'ceremony':
      case 'calendar':
        actions.unshift(
          { label: 'Join Meeting', action: 'join_meeting', style: 'primary' },
          { label: 'Snooze 5 min', action: 'snooze_5', style: 'secondary' }
        );
        break;
      case 'note':
        actions.unshift(
          { label: 'Open Note', action: 'open_note', style: 'primary' }
        );
        break;
    }

    return actions;
  };

  const shouldShowNotification = (type: string): boolean => {
    if (!settings.enabled) return false;
    
    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = parseInt(settings.quietHours.start.replace(':', ''));
      const endTime = parseInt(settings.quietHours.end.replace(':', ''));
      
      if (startTime > endTime) { // Overnight quiet hours
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      } else {
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      }
    }
    
    // Check category settings
    switch (type) {
      case 'todo':
        return settings.categories.todos;
      case 'ceremony':
        return settings.categories.ceremonies;
      case 'calendar':
        return settings.categories.meetings;
      case 'note':
        return settings.categories.notes;
      default:
        return true;
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent'
    });

    browserNotification.onclick = () => {
      window.focus();
      setIsOpen(true);
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
      browserNotification.close();
    };

    // Auto-close after 10 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  };

  const playNotificationSound = (priority: Notification['priority']) => {
    if (!settings.soundEnabled) return;
    
    const audio = new Audio();
    
    switch (priority) {
      case 'urgent':
        audio.src = '/sounds/urgent.mp3';
        break;
      case 'high':
        audio.src = '/sounds/high.mp3';
        break;
      default:
        audio.src = '/sounds/default.mp3';
        break;
    }
    
    audio.play().catch(() => {
      // Ignore audio play errors (e.g., user hasn't interacted with page yet)
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleNotificationAction = async (notification: Notification, action: string) => {
    switch (action) {
      case 'dismiss':
        markAsRead(notification.id);
        break;
      case 'complete_todo':
        if (notification.data?.todoId) {
          await NotesService.toggleTodo(notification.data.todoId);
          markAsRead(notification.id);
        }
        break;
      case 'snooze':
        snoozeNotification(notification.id, 15); // 15 minutes
        break;
      case 'snooze_5':
        snoozeNotification(notification.id, 5); // 5 minutes
        break;
      case 'join_meeting':
        if (notification.data?.meetingLink) {
          window.open(notification.data.meetingLink, '_blank');
        }
        markAsRead(notification.id);
        break;
      case 'open_note':
        if (notification.data?.noteId && onNotificationClick) {
          onNotificationClick(notification);
        }
        markAsRead(notification.id);
        break;
    }
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updatedNotifications);
  };

  const snoozeNotification = (notificationId: string, minutes: number) => {
    // Remove current notification and create a new reminder
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      deleteNotification(notificationId);
      
      // Create new reminder for snooze time
      const snoozeTime = new Date(Date.now() + minutes * 60000);
      NotesService.createReminder({
        reminderTime: snoozeTime,
        type: notification.type as any,
        message: `${notification.title} (snoozed)`,
        noteId: notification.data?.noteId,
        todoId: notification.data?.todoId,
        calendarEventId: notification.data?.calendarEventId
      });
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'todo':
        return <CheckSquare size={16} className="text-blue-500" />;
      case 'calendar':
      case 'ceremony':
        return <Calendar size={16} className="text-green-500" />;
      case 'note':
        return <Clock size={16} className="text-purple-500" />;
      case 'system':
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = () => {
    const newExpandedState = !isExpanded;
    onToggleExpanded?.(newExpandedState);
    setIsOpen(newExpandedState);
  };

  // Use isExpanded prop if provided, otherwise fall back to local isOpen state
  const isPanelOpen = isExpanded !== undefined ? isExpanded : isOpen;

  // If expanded is controlled externally, render just the button and let parent handle the panel
  if (isExpanded !== undefined) {
    return (
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-colors ${
          unreadCount > 0 
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-sm min-w-[14px] h-3 flex items-center justify-center px-0.5 scale-75">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-colors ${
          unreadCount > 0 
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-sm min-w-[14px] h-3 flex items-center justify-center px-0.5 scale-75">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isPanelOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
              <button
                onClick={handleToggle}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'bg-blue-50' : 'bg-white'
                    } hover:bg-gray-50`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleNotificationAction(notification, action.action)}
                                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                  action.style === 'primary'
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : action.style === 'danger'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Link */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 w-full">
              <Settings size={16} />
              <span>Notification Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the notification panel content separately for use in sidebar
export const NotificationPanel: React.FC<{
  notifications: Notification[];
  onNotificationAction: (notification: Notification, action: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}> = ({ notifications, onNotificationAction, onMarkAllAsRead, onClose }) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'todo':
        return <CheckSquare size={16} className="text-blue-500" />;
      case 'calendar':
      case 'ceremony':
        return <Calendar size={16} className="text-green-500" />;
      case 'note':
        return <Clock size={16} className="text-purple-500" />;
      case 'system':
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Bell size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700"
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-blue-50' : 'bg-white'
                } hover:bg-gray-50`}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {/* Actions */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        {notification.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => onNotificationAction(notification, action.action)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                              action.style === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : action.style === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Link */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 w-full">
          <Settings size={16} />
          <span>Notification Settings</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSystem;