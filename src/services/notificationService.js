import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import storageService from './storageService';

/**
 * Notification Service - MVP Implementation
 * 
 * Per MVP doc - Push Notifications:
 * - Morning motivation (after first activity detected, 5 AM+)
 * - Daily reminder (6 PM if goal not met)
 * - Streak reminder (8 PM if no steps logged)
 * - Weekly summary (Sunday 7 PM)
 * - Goal achieved (when steps >= daily goal)
 * 
 * Note: This is a preparatory service. Full expo-notifications
 * integration requires the package to be installed.
 */

const NOTIFICATION_KEYS = {
  MORNING_SENT_TODAY: '@morning_notification_sent',
  GOAL_ACHIEVED_TODAY: '@goal_achieved_notification_sent',
  PUSH_TOKEN: '@push_token',
  NOTIFICATIONS_ENABLED: '@notifications_enabled',
};

const MORNING_START_HOUR = 5; // 5 AM

class NotificationService {
  constructor() {
    this.morningNotificationSent = false;
    this.goalAchievedNotificationSent = false;
    this.Notifications = null;
  }

  /**
   * Initialize notification service
   * Dynamically imports expo-notifications if available
   */
  async initialize() {
    try {
      // Try to import expo-notifications
      const notifModule = await import('expo-notifications');
      this.Notifications = notifModule.default || notifModule;
      
      // Request permissions
      const { status } = await this.Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('📱 Notification permissions not granted');
        return false;
      }

      // Configure notifications
      this.Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Schedule recurring notifications
      await this.scheduleDailyReminders();
      
      console.log('📱 Notifications initialized');
      return true;
    } catch (error) {
      console.log('📱 expo-notifications not available:', error.message);
      return false;
    }
  }

  /**
   * Check if notifications are available
   */
  isAvailable() {
    return this.Notifications !== null;
  }

  /**
   * Get push token for remote notifications
   */
  async getPushToken() {
    if (!this.Notifications) return null;

    try {
      const token = await this.Notifications.getExpoPushTokenAsync();
      await AsyncStorage.setItem(NOTIFICATION_KEYS.PUSH_TOKEN, token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Check for morning notification trigger
   * Per MVP: "First activity detected after 5 AM (dynamic)"
   * 
   * @param {number} steps - Current step count
   */
  async checkMorningNotification(steps) {
    if (!this.Notifications) return;

    const now = new Date();
    const hour = now.getHours();
    const todayKey = storageService.getTodayKey();

    // Check if already sent today
    const sentToday = await AsyncStorage.getItem(NOTIFICATION_KEYS.MORNING_SENT_TODAY);
    if (sentToday === todayKey) {
      return; // Already sent today
    }

    // Reset at midnight
    if (hour === 0) {
      this.morningNotificationSent = false;
    }

    // Check for first activity after 5 AM
    if (!this.morningNotificationSent && hour >= MORNING_START_HOUR && steps > 100) {
      await this.sendMorningNotification(steps);
      this.morningNotificationSent = true;
      await AsyncStorage.setItem(NOTIFICATION_KEYS.MORNING_SENT_TODAY, todayKey);
    }
  }

  /**
   * Send morning motivation notification
   */
  async sendMorningNotification(currentSteps) {
    if (!this.Notifications) return;

    const goal = await storageService.getDailyGoal();
    const remaining = goal - currentSteps;

    await this.Notifications.scheduleNotificationAsync({
      content: {
        title: "Good morning! 🌅",
        body: `You've started moving! ${remaining.toLocaleString()} steps to reach your goal today.`,
        sound: true,
      },
      trigger: null, // Send immediately
    });

    console.log('📱 Sent morning notification');
  }

  /**
   * Check for goal achieved notification
   * Per MVP: "Goal achieved - When goal reached"
   * 
   * @param {number} steps - Current step count
   */
  async checkGoalAchievedNotification(steps) {
    if (!this.Notifications) return;

    const goal = await storageService.getDailyGoal();
    const todayKey = storageService.getTodayKey();

    // Check if already sent today
    const sentToday = await AsyncStorage.getItem(NOTIFICATION_KEYS.GOAL_ACHIEVED_TODAY);
    if (sentToday === todayKey) {
      return; // Already sent today
    }

    // Check if goal achieved
    if (steps >= goal) {
      await this.sendGoalAchievedNotification(steps, goal);
      await AsyncStorage.setItem(NOTIFICATION_KEYS.GOAL_ACHIEVED_TODAY, todayKey);
    }
  }

  /**
   * Send goal achieved notification
   */
  async sendGoalAchievedNotification(steps, goal) {
    if (!this.Notifications) return;

    await this.Notifications.scheduleNotificationAsync({
      content: {
        title: "🎉 Goal Achieved!",
        body: `Amazing! You've reached ${steps.toLocaleString()} steps today. Keep it up!`,
        sound: true,
      },
      trigger: null, // Send immediately
    });

    console.log('📱 Sent goal achieved notification');
  }

  /**
   * Schedule daily reminder notifications
   * Per MVP: Fixed time reminders at 6 PM and 8 PM
   */
  async scheduleDailyReminders() {
    if (!this.Notifications) return;

    try {
      // Cancel existing scheduled notifications
      await this.Notifications.cancelAllScheduledNotificationsAsync();

      // 6 PM - Daily reminder (if goal not met)
      await this.Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to move! 🚶",
          body: "Haven't reached your step goal yet? A short walk can make a difference!",
          sound: true,
        },
        trigger: {
          hour: 18,
          minute: 0,
          repeats: true,
        },
      });

      // 8 PM - Streak reminder
      await this.Notifications.scheduleNotificationAsync({
        content: {
          title: "Keep your streak alive! 🔥",
          body: "Don't forget to log some steps today to maintain your progress!",
          sound: true,
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });

      // Sunday 7 PM - Weekly summary
      await this.Notifications.scheduleNotificationAsync({
        content: {
          title: "Weekly Summary 📊",
          body: "Check out your progress this week! You're doing great!",
          sound: true,
        },
        trigger: {
          weekday: 1, // Sunday
          hour: 19,
          minute: 0,
          repeats: true,
        },
      });

      console.log('📱 Daily reminders scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  /**
   * Handle step update - check for notification triggers
   * Called from StepService on each step update
   */
  async onStepUpdate(steps) {
    await this.checkMorningNotification(steps);
    await this.checkGoalAchievedNotification(steps);
  }

  /**
   * Enable/disable notifications
   */
  async setEnabled(enabled) {
    await AsyncStorage.setItem(NOTIFICATION_KEYS.NOTIFICATIONS_ENABLED, enabled ? 'true' : 'false');
    
    if (!enabled && this.Notifications) {
      await this.Notifications.cancelAllScheduledNotificationsAsync();
    } else if (enabled) {
      await this.scheduleDailyReminders();
    }
  }

  /**
   * Check if notifications are enabled
   */
  async isEnabled() {
    const enabled = await AsyncStorage.getItem(NOTIFICATION_KEYS.NOTIFICATIONS_ENABLED);
    return enabled !== 'false'; // Default to true
  }
}

export default new NotificationService();
