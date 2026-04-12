import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Premium Service - Manages premium status (mock implementation)
 */
class PremiumService {
  constructor() {
    this.STORAGE_KEY = '@premium_status';
  }

  async isPremium() {
    try {
      const status = await AsyncStorage.getItem(this.STORAGE_KEY);
      return status === 'true';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  async setPremium(isPremium) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, isPremium.toString());
    } catch (error) {
      console.error('Error setting premium status:', error);
    }
  }

  async togglePremium() {
    const currentStatus = await this.isPremium();
    const newStatus = !currentStatus;
    await this.setPremium(newStatus);
    return newStatus;
  }

  async isFeatureAvailable(featureName) {
    const premium = await this.isPremium();
    
    const premiumFeatures = [
      'remove_ads',
      'advanced_analytics',
      'export_data',
      'custom_goals',
    ];

    if (premiumFeatures.includes(featureName)) {
      return premium;
    }

    return true;
  }
}

export default new PremiumService();










