import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User Service - Manages user profile and activity data
 */
class UserService {
  constructor() {
    this.STORAGE_KEYS = {
      PROFILE: '@user_profile',
      ACTIVE_DAYS: '@active_days',
      DURATION: '@total_duration',
      LAST_ACTIVE_DATE: '@last_active_date',
    };
  }

  async getProfile() {
    try {
      const profile = await AsyncStorage.getItem(this.STORAGE_KEYS.PROFILE);
      return profile ? JSON.parse(profile) : {
        name: 'My Friend',
        avatar: null,
        email: null,
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { name: 'My Friend', avatar: null, email: null };
    }
  }

  async updateProfile(profile) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  async getActiveDays() {
    try {
      const days = await AsyncStorage.getItem(this.STORAGE_KEYS.ACTIVE_DAYS);
      return days ? parseInt(days, 10) : 0;
    } catch (error) {
      console.error('Error getting active days:', error);
      return 0;
    }
  }

  async incrementActiveDays() {
    try {
      const today = new Date().toDateString();
      const lastActiveDate = await AsyncStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVE_DATE);
      
      if (lastActiveDate !== today) {
        const currentDays = await this.getActiveDays();
        await AsyncStorage.setItem(this.STORAGE_KEYS.ACTIVE_DAYS, (currentDays + 1).toString());
        await AsyncStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVE_DATE, today);
      }
    } catch (error) {
      console.error('Error incrementing active days:', error);
    }
  }

  async getTotalDuration() {
    try {
      const duration = await AsyncStorage.getItem(this.STORAGE_KEYS.DURATION);
      return duration ? parseFloat(duration) : 0.0;
    } catch (error) {
      console.error('Error getting total duration:', error);
      return 0.0;
    }
  }

  async addDuration(hours) {
    try {
      const currentDuration = await this.getTotalDuration();
      await AsyncStorage.setItem(this.STORAGE_KEYS.DURATION, (currentDuration + hours).toFixed(1));
    } catch (error) {
      console.error('Error adding duration:', error);
    }
  }

  async getActivitySummary() {
    const [activeDays, duration] = await Promise.all([
      this.getActiveDays(),
      this.getTotalDuration(),
    ]);

    return {
      activeDays,
      duration: duration.toFixed(1),
    };
  }
}

export default new UserService();










