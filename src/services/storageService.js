import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service - Handles data persistence with AsyncStorage
 * Stores daily step history and user preferences
 */
class StorageService {
  constructor() {
    this.KEYS = {
      STEP_HISTORY: '@step_history',
      DAILY_GOAL: '@daily_goal',
      LAST_SAVE_DATE: '@last_save_date',
      WATER_INTAKE: '@water_intake',
      WATER_GOAL: '@water_goal',
    };
    this.DEFAULT_GOAL = 10000;
    this.DEFAULT_WATER_GOAL = 3.0; // liters
  }

  /**
   * Save today's step count
   * @param {number} steps - Step count for today
   * @returns {Promise<void>}
   */
  async saveTodaySteps(steps) {
    try {
      const today = this.getTodayKey();
      const history = await this.getStepHistory();
      
      history[today] = steps;
      
      await AsyncStorage.setItem(
        this.KEYS.STEP_HISTORY,
        JSON.stringify(history)
      );
      
      await AsyncStorage.setItem(
        this.KEYS.LAST_SAVE_DATE,
        today
      );
    } catch (error) {
      console.error('Error saving today\'s steps:', error);
    }
  }

  /**
   * Get step history for the last N days
   * @param {number} days - Number of days to retrieve (default: 7)
   * @returns {Promise<Array>} Array of {date, steps} objects
   */
  async getLastNDays(days = 7) {
    try {
      const history = await this.getStepHistory();
      const dates = this.getLastNDates(days);
      
      return dates.map(dateKey => ({
        date: this.formatDateLabel(dateKey),
        dateKey,
        steps: history[dateKey] || 0,
      }));
    } catch (error) {
      console.error('Error getting last N days:', error);
      return [];
    }
  }

  /**
   * Get all step history
   * @returns {Promise<Object>}
   */
  async getStepHistory() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.STEP_HISTORY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting step history:', error);
      return {};
    }
  }

  /**
   * Get user's daily step goal
   * @returns {Promise<number>}
   */
  async getDailyGoal() {
    try {
      const goal = await AsyncStorage.getItem(this.KEYS.DAILY_GOAL);
      return goal ? parseInt(goal, 10) : this.DEFAULT_GOAL;
    } catch (error) {
      console.error('Error getting daily goal:', error);
      return this.DEFAULT_GOAL;
    }
  }

  /**
   * Set user's daily step goal
   * @param {number} goal - New daily goal
   * @returns {Promise<void>}
   */
  async setDailyGoal(goal) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.DAILY_GOAL,
        goal.toString()
      );
    } catch (error) {
      console.error('Error setting daily goal:', error);
    }
  }

  /**
   * Get today's date key (YYYY-MM-DD format)
   * @returns {string}
   */
  getTodayKey() {
    const now = new Date();
    return this.formatDateKey(now);
  }

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date
   * @returns {string}
   */
  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format date for display (e.g., "Mon", "Tue")
   * @param {string} dateKey - YYYY-MM-DD format
   * @returns {string}
   */
  formatDateLabel(dateKey) {
    const date = new Date(dateKey + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateKey === this.formatDateKey(today)) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateKey === this.formatDateKey(yesterday)) {
      return 'Yesterday';
    }
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  /**
   * Get last N date keys
   * @param {number} n - Number of days
   * @returns {Array<string>}
   */
  getLastNDates(n) {
    const dates = [];
    const today = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(this.formatDateKey(date));
    }
    
    return dates;
  }

  /**
   * Save today's water intake
   * @param {number} amount - Water intake in liters
   * @returns {Promise<void>}
   */
  async saveWaterIntake(amount) {
    try {
      const today = this.getTodayKey();
      const waterData = await this.getWaterIntakeHistory();
      
      waterData[today] = amount;
      
      await AsyncStorage.setItem(
        this.KEYS.WATER_INTAKE,
        JSON.stringify(waterData)
      );
    } catch (error) {
      console.error('Error saving water intake:', error);
    }
  }

  /**
   * Get today's water intake
   * @returns {Promise<number>} Water intake in liters
   */
  async getWaterIntake() {
    try {
      const today = this.getTodayKey();
      const waterData = await this.getWaterIntakeHistory();
      return waterData[today] || 0;
    } catch (error) {
      console.error('Error getting water intake:', error);
      return 0;
    }
  }

  /**
   * Get all water intake history
   * @returns {Promise<Object>}
   */
  async getWaterIntakeHistory() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.WATER_INTAKE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting water intake history:', error);
      return {};
    }
  }

  /**
   * Get user's daily water goal
   * @returns {Promise<number>} Water goal in liters
   */
  async getWaterGoal() {
    try {
      const goal = await AsyncStorage.getItem(this.KEYS.WATER_GOAL);
      return goal ? parseFloat(goal) : this.DEFAULT_WATER_GOAL;
    } catch (error) {
      console.error('Error getting water goal:', error);
      return this.DEFAULT_WATER_GOAL;
    }
  }

  /**
   * Set user's daily water goal
   * @param {number} goal - New daily water goal in liters
   * @returns {Promise<void>}
   */
  async setWaterGoal(goal) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.WATER_GOAL,
        goal.toString()
      );
    } catch (error) {
      console.error('Error setting water goal:', error);
    }
  }

  /**
   * Clear all stored data (for testing/reset)
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.STEP_HISTORY,
        this.KEYS.DAILY_GOAL,
        this.KEYS.LAST_SAVE_DATE,
        this.KEYS.WATER_INTAKE,
        this.KEYS.WATER_GOAL,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export default new StorageService();

