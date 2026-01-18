import { Pedometer } from 'expo-sensors';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Step Service - Handles all pedometer interactions
 * Uses device health APIs (HealthKit on iOS, step counter sensor on Android)
 */
class StepService {
  constructor() {
    this.subscription = null;
    this.baselineSteps = 0; // Track baseline for Android cumulative steps
    this.isBaselineSet = false;
  }

  /**
   * Check if the device supports step counting
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const available = await Pedometer.isAvailableAsync();
      return available;
    } catch (error) {
      console.error('Error checking pedometer availability:', error);
      return false;
    }
  }

  /**
   * Get step count for a specific time range
   * Note: Android doesn't support date range queries, only watchStepCount
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Promise<number>}
   */
  async getStepCount(start, end) {
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps || 0;
    } catch (error) {
      // Android doesn't support date range queries
      // Return 0 and let watchStepCount handle it
      if (error.message && error.message.includes('not supported on Android')) {
        console.log('Date range queries not supported on Android, using watchStepCount instead');
        return 0;
      }
      console.error('Error getting step count:', error);
      return 0;
    }
  }

  /**
   * Get today's step count (from midnight to now)
   * Note: On Android, this will return 0 and you should use watchStepCount
   * @returns {Promise<number>}
   */
  async getTodaySteps() {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      return this.getStepCount(startOfDay, now);
    } catch (error) {
      // Android limitation - return 0, use watchStepCount for real-time updates
      return 0;
    }
  }

  /**
   * Subscribe to real-time step updates
   * This works on both iOS and Android
   * On iOS: Returns steps since subscription started
   * On Android: Returns cumulative steps since device boot (we track baseline)
   * @param {Function} callback - Called with step count updates
   * @param {number} savedStepsToday - Steps already saved for today (to set baseline)
   * @returns {Object} subscription object
   */
  watchStepCount(callback, savedStepsToday = 0) {
    if (this.subscription) {
      this.subscription.remove();
    }

    // Set baseline from saved steps or first reading
    let baselineSet = false;
    let baselineSteps = 0;
    let lastReportedSteps = savedStepsToday;

    this.subscription = Pedometer.watchStepCount(result => {
      const currentSteps = result.steps || 0;
      
      if (!baselineSet) {
        // First reading - set baseline
        // On Android: currentSteps is cumulative since boot
        // On iOS: currentSteps starts from 0 when watching begins
        baselineSteps = currentSteps;
        baselineSet = true;
        this.baselineSteps = baselineSteps;
        this.isBaselineSet = true;
        
        // If we have saved steps, use that as initial value
        if (savedStepsToday > 0) {
          callback(savedStepsToday);
          lastReportedSteps = savedStepsToday;
        } else {
          callback(0);
          lastReportedSteps = 0;
        }
        return;
      }

      // Calculate steps since baseline
      const stepsSinceBaseline = Math.max(0, currentSteps - baselineSteps);
      
      // On Android, we need to add saved steps from earlier today
      // On iOS, stepsSinceBaseline is already today's steps
      const totalStepsToday = savedStepsToday > 0 
        ? savedStepsToday + stepsSinceBaseline 
        : stepsSinceBaseline;

      // Only update if steps increased (avoid going backwards)
      if (totalStepsToday >= lastReportedSteps) {
        callback(totalStepsToday);
        lastReportedSteps = totalStepsToday;
      }
    });

    return this.subscription;
  }

  /**
   * Reset baseline (useful when starting a new day)
   */
  resetBaseline() {
    this.baselineSteps = 0;
    this.isBaselineSet = false;
  }

  /**
   * Stop watching step count updates
   */
  unsubscribe() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  /**
   * Check if running in Expo Go
   * @returns {boolean}
   */
  isExpoGo() {
    return Constants.executionEnvironment === 'storeClient';
  }

  /**
   * Request necessary permissions
   * On Android 10+ (API 29+), explicitly requests ACTIVITY_RECOGNITION permission
   * On iOS, this triggers the permission dialog via watchStepCount
   * Note: Expo Go has limited permission support - user must grant permission to Expo Go app
   * @returns {Promise<boolean>} True if permission granted, false otherwise
   */
  async requestPermissions() {
    try {
      const available = await this.isAvailable();
      if (!available) {
        console.log('📱 Pedometer not available on this device');
        return false;
      }

      // Check if running in Expo Go
      const isExpoGo = this.isExpoGo();
      if (isExpoGo) {
        console.log('📱 ⚠️ Running in Expo Go - permissions must be granted to Expo Go app');
        console.log('📱 Please grant "Physical Activity" permission to Expo Go app in Settings');
      }

      // On Android 10+ (API 29+), we need to explicitly request ACTIVITY_RECOGNITION
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        console.log(`📱 Android version: ${androidVersion}`);
        
        // Android 10+ (API 29+) requires runtime permission
        if (androidVersion >= 29) {
          try {
            console.log('📱 Requesting ACTIVITY_RECOGNITION permission...');
            
            // Check if permission is already granted
            let checkResult = false;
            try {
              checkResult = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
              );
            } catch (checkError) {
              // Permission might not be available in Expo Go
              console.log('📱 ⚠️ Cannot check ACTIVITY_RECOGNITION permission - may not be available in Expo Go');
              if (this.isExpoGo()) {
                console.log('📱 ⚠️ Expo Go limitation: ACTIVITY_RECOGNITION not available');
                // Try to use pedometer anyway - sometimes it works without explicit permission
                return true; // Return true to attempt step tracking
              }
            }
            
            if (checkResult) {
              console.log('📱 ✅ Permission already granted');
              return true;
            }

            // Request permission - this will show the dialog
            let result;
            try {
              result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
                {
                  title: 'Activity Recognition Permission',
                  message: 'FitLife needs access to your step count to track your daily activity.',
                  buttonNeutral: 'Ask Me Later',
                  buttonNegative: 'Cancel',
                  buttonPositive: 'OK',
                }
              );
            } catch (requestError) {
              // Permission request failed - likely not available in Expo Go
              console.error('📱 ❌ Cannot request ACTIVITY_RECOGNITION:', requestError.message);
              if (this.isExpoGo()) {
                console.log('📱 ⚠️ Expo Go does not support ACTIVITY_RECOGNITION permission');
                console.log('📱 💡 Solution: Create a development build using EAS Build');
                // Try anyway - sometimes pedometer works without explicit permission
                return true;
              }
              return false;
            }

            if (result === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('📱 ✅ Permission granted by user');
              return true;
            } else if (result === PermissionsAndroid.RESULTS.DENIED) {
              console.log('📱 ❌ Permission denied by user');
              return false;
            } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
              console.log('📱 ❌ Permission denied permanently - user must enable in settings');
              return false;
            }
          } catch (error) {
            console.error('📱 Error requesting Android permission:', error);
            return false;
          }
        } else {
          // Android 9 and below - permission is granted automatically
          console.log('📱 Android version < 10, permission granted automatically');
          return true;
        }
      } else {
        // iOS - permissions are requested automatically when watchStepCount is called
        // But we can try to trigger it by attempting to watch
        console.log('📱 iOS - checking motion permissions...');
        try {
          // On iOS, watchStepCount will trigger the permission dialog if not granted
          // We'll test this by creating a temporary subscription
          let permissionGranted = false;
          const testSubscription = Pedometer.watchStepCount(() => {
            permissionGranted = true;
          });
          
          // Wait a moment to see if permission dialog appears
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Clean up test subscription
          if (testSubscription && testSubscription.remove) {
            testSubscription.remove();
          }
          
          // On iOS, if watchStepCount doesn't throw, permission is likely granted
          // The actual permission check happens when watchStepCount is called
          return true;
        } catch (error) {
          console.log('📱 iOS permission check:', error.message);
          // If it throws, permission might be denied, but we'll let watchStepCount handle it
          return true; // Return true to allow watchStepCount to try
        }
      }
    } catch (error) {
      console.error('📱 Error requesting permissions:', error);
      return false;
    }
  }
}

export default new StepService();

