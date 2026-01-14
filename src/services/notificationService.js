/**
 * FatToFit Notification Service
 * Handles push notifications for coaching prompts and reminders
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from '../utils/constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Initialize notifications and request permissions
   */
  async initialize() {
    try {
      // Check if physical device (notifications don't work on simulator)
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return { success: false, error: 'Must use physical device' };
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return { success: false, error: 'Permission not granted' };
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });
      this.expoPushToken = tokenData.data;

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'FatToFit',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00E85C',
        });

        await Notifications.setNotificationChannelAsync('coaching', {
          name: 'AI Coach',
          description: 'Daily coaching prompts and motivation',
          importance: Notifications.AndroidImportance.HIGH,
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          description: 'Workout and meal reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      return { success: true, token: this.expoPushToken };
    } catch (error) {
      console.error('Notification initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification({
    title,
    body,
    data = {},
    trigger,
    channelId = 'default',
  }) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger,
      });

      return { success: true, id };
    } catch (error) {
      console.error('Schedule notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule morning coaching prompt (8 AM daily)
   */
  async scheduleMorningPrompt(enabled = true) {
    // Cancel existing morning prompts
    await this.cancelNotificationsByType(NOTIFICATION_TYPES.MORNING_PROMPT);

    if (!enabled) return { success: true };

    const messages = [
      { title: "Rise and shine! 🌅", body: "Ready to crush today? Let's start with a healthy breakfast." },
      { title: "Good morning, champion! 💪", body: "Your goals are waiting. What's the plan for today?" },
      { title: "New day, new opportunities! 🚀", body: "How about we hit that step goal today?" },
      { title: "Morning motivation! ☀️", body: "Every workout counts. Even a short one makes a difference." },
      { title: "Your coach is here! 🤖", body: "Let's make today count. Check in when you're ready." },
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return this.scheduleNotification({
      title: randomMessage.title,
      body: randomMessage.body,
      data: { type: NOTIFICATION_TYPES.MORNING_PROMPT },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
      channelId: 'coaching',
    });
  }

  /**
   * Schedule evening reflection prompt (8 PM daily)
   */
  async scheduleEveningPrompt(enabled = true) {
    await this.cancelNotificationsByType(NOTIFICATION_TYPES.EVENING_REFLECTION);

    if (!enabled) return { success: true };

    const messages = [
      { title: "Time to reflect 🌙", body: "How did today go? Let's review your progress." },
      { title: "Evening check-in 📊", body: "Did you hit your goals today? Let's see how you did." },
      { title: "Day's almost done! 🎯", body: "Have you logged all your meals? Don't forget!" },
      { title: "Winding down? 😴", body: "Great job today! Rest well for tomorrow's gains." },
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return this.scheduleNotification({
      title: randomMessage.title,
      body: randomMessage.body,
      data: { type: NOTIFICATION_TYPES.EVENING_REFLECTION },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
      channelId: 'coaching',
    });
  }

  /**
   * Schedule workout reminder
   */
  async scheduleWorkoutReminder(workoutTime, workoutName) {
    // Schedule 30 minutes before workout
    const reminderTime = new Date(workoutTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30);

    if (reminderTime <= new Date()) {
      return { success: false, error: 'Time already passed' };
    }

    return this.scheduleNotification({
      title: "Workout time soon! 💪",
      body: `${workoutName} starts in 30 minutes. Get ready!`,
      data: { type: NOTIFICATION_TYPES.WORKOUT_REMINDER },
      trigger: {
        date: reminderTime,
      },
      channelId: 'reminders',
    });
  }

  /**
   * Schedule meal reminder
   */
  async scheduleMealReminder(mealType, hour) {
    const mealNames = {
      breakfast: 'breakfast',
      lunch: 'lunch',
      dinner: 'dinner',
    };

    return this.scheduleNotification({
      title: `Time for ${mealNames[mealType]}! 🍽️`,
      body: "Don't forget to log your meal to stay on track.",
      data: { type: NOTIFICATION_TYPES.MEAL_REMINDER, mealType },
      trigger: {
        hour,
        minute: 0,
        repeats: true,
      },
      channelId: 'reminders',
    });
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(achievementName, description) {
    return this.scheduleNotification({
      title: "🏆 Achievement Unlocked!",
      body: `${achievementName}: ${description}`,
      data: { type: NOTIFICATION_TYPES.ACHIEVEMENT },
      trigger: null, // Immediate
      channelId: 'default',
    });
  }

  /**
   * Send goal progress notification
   */
  async sendGoalProgressNotification(goalType, current, target) {
    const percentage = Math.round((current / target) * 100);
    
    let message;
    if (percentage >= 100) {
      message = `You crushed your ${goalType} goal! 🎉`;
    } else if (percentage >= 75) {
      message = `Almost there! ${percentage}% of your ${goalType} goal complete.`;
    } else if (percentage >= 50) {
      message = `Halfway to your ${goalType} goal! Keep it up! 💪`;
    } else {
      return { success: false, error: 'Progress too low for notification' };
    }

    return this.scheduleNotification({
      title: "Goal Progress Update 📊",
      body: message,
      data: { type: NOTIFICATION_TYPES.GOAL_PROGRESS, goalType },
      trigger: null,
      channelId: 'default',
    });
  }

  /**
   * Cancel notifications by type
   */
  async cancelNotificationsByType(type) {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduled) {
        if (notification.content.data?.type === type) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Cancel notifications error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true };
    } catch (error) {
      console.error('Cancel all notifications error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Get scheduled notifications error:', error);
      return [];
    }
  }

  /**
   * Add notification received listener
   */
  addNotificationListener(callback) {
    this.notificationListener = Notifications.addNotificationReceivedListener(callback);
    return this.notificationListener;
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addResponseListener(callback) {
    this.responseListener = Notifications.addNotificationResponseReceivedListener(callback);
    return this.responseListener;
  }

  /**
   * Remove all listeners
   */
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Get push token
   */
  getPushToken() {
    return this.expoPushToken;
  }

  /**
   * Setup all default notifications based on user preferences
   */
  async setupDefaultNotifications(preferences = {}) {
    const {
      morningPrompt = true,
      eveningPrompt = true,
      workoutReminder = true,
    } = preferences;

    await this.scheduleMorningPrompt(morningPrompt);
    await this.scheduleEveningPrompt(eveningPrompt);

    // Note: Workout reminders are scheduled individually based on workout plan

    return { success: true };
  }
}

export default new NotificationService();


