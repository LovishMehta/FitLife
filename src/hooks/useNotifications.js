/**
 * FatToFit useNotifications Hook
 * Custom hook for managing notifications in components
 */

import { useEffect, useState, useCallback } from 'react';
import notificationService from '../services/notificationService';
import useAuthStore from '../stores/useAuthStore';

const useNotifications = () => {
  const { profile, updateProfile } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);

  useEffect(() => {
    initializeNotifications();

    // Set up listeners
    const notificationListener = notificationService.addNotificationListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Handle foreground notification
      }
    );

    const responseListener = notificationService.addResponseListener(
      (response) => {
        console.log('Notification tapped:', response);
        // Handle notification tap - navigate to relevant screen
        handleNotificationResponse(response);
      }
    );

    return () => {
      notificationService.removeListeners();
    };
  }, []);

  const initializeNotifications = async () => {
    const result = await notificationService.initialize();
    setIsInitialized(result.success);
    setPermissionStatus(result.success ? 'granted' : 'denied');

    if (result.success && profile) {
      // Set up notifications based on user preferences
      await notificationService.setupDefaultNotifications({
        morningPrompt: profile.notification_morning,
        eveningPrompt: profile.notification_evening,
        workoutReminder: profile.notification_workout_reminder,
      });
    }

    await refreshScheduledNotifications();
  };

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    
    // Navigation can be handled here based on notification type
    // This would typically use navigation ref to navigate
    console.log('Handle notification:', data?.type);
  };

  const refreshScheduledNotifications = async () => {
    const notifications = await notificationService.getScheduledNotifications();
    setScheduledNotifications(notifications);
  };

  const toggleMorningPrompt = useCallback(async (enabled) => {
    await notificationService.scheduleMorningPrompt(enabled);
    await updateProfile({ notification_morning: enabled });
    await refreshScheduledNotifications();
  }, [updateProfile]);

  const toggleEveningPrompt = useCallback(async (enabled) => {
    await notificationService.scheduleEveningPrompt(enabled);
    await updateProfile({ notification_evening: enabled });
    await refreshScheduledNotifications();
  }, [updateProfile]);

  const toggleWorkoutReminder = useCallback(async (enabled) => {
    if (!enabled) {
      await notificationService.cancelNotificationsByType('workout_reminder');
    }
    await updateProfile({ notification_workout_reminder: enabled });
    await refreshScheduledNotifications();
  }, [updateProfile]);

  const scheduleWorkoutReminder = useCallback(async (time, name) => {
    const result = await notificationService.scheduleWorkoutReminder(time, name);
    await refreshScheduledNotifications();
    return result;
  }, []);

  const sendAchievement = useCallback(async (name, description) => {
    return notificationService.sendAchievementNotification(name, description);
  }, []);

  const sendGoalProgress = useCallback(async (goalType, current, target) => {
    return notificationService.sendGoalProgressNotification(goalType, current, target);
  }, []);

  const cancelAll = useCallback(async () => {
    await notificationService.cancelAllNotifications();
    await refreshScheduledNotifications();
  }, []);

  return {
    isInitialized,
    permissionStatus,
    scheduledNotifications,
    toggleMorningPrompt,
    toggleEveningPrompt,
    toggleWorkoutReminder,
    scheduleWorkoutReminder,
    sendAchievement,
    sendGoalProgress,
    cancelAll,
    refresh: refreshScheduledNotifications,
  };
};

export default useNotifications;


