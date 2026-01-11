import { Pedometer } from 'expo-sensors';

/**
 * Step Service - Handles all pedometer interactions
 * Uses device health APIs (HealthKit on iOS, step counter sensor on Android)
 */
class StepService {
  constructor() {
    this.subscription = null;
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
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Promise<number>}
   */
  async getStepCount(start, end) {
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps || 0;
    } catch (error) {
      console.error('Error getting step count:', error);
      return 0;
    }
  }

  /**
   * Get today's step count (from midnight to now)
   * @returns {Promise<number>}
   */
  async getTodaySteps() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    return this.getStepCount(startOfDay, now);
  }

  /**
   * Subscribe to real-time step updates
   * @param {Function} callback - Called with step count updates
   * @returns {Object} subscription object
   */
  watchStepCount(callback) {
    if (this.subscription) {
      this.subscription.remove();
    }

    this.subscription = Pedometer.watchStepCount(result => {
      callback(result.steps || 0);
    });

    return this.subscription;
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
   * Request necessary permissions (mainly for iOS)
   * @returns {Promise<boolean>}
   */
  async requestPermissions() {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return false;
      }
      
      // Try to get a step count to trigger permission request
      await this.getTodaySteps();
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }
}

export default new StepService();

