/**
 * FatToFit Offline Service
 * Handles offline data synchronization and caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = '@FatToFit:offlineQueue';
const CACHE_PREFIX = '@FatToFit:cache:';
const CACHE_TTL_KEY = '@FatToFit:cacheTTL';

// Default cache TTL in milliseconds (1 hour)
const DEFAULT_CACHE_TTL = 60 * 60 * 1000;

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.offlineQueue = [];
    this.networkListeners = [];
    this.syncInProgress = false;
    this.unsubscribe = null;
  }

  /**
   * Initialize offline service and start network monitoring
   */
  async initialize() {
    // Load offline queue
    await this.loadOfflineQueue();

    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;

      // Notify listeners
      this.networkListeners.forEach((listener) => listener(this.isOnline));

      // If coming back online, sync queued actions
      if (wasOffline && this.isOnline) {
        this.syncOfflineQueue();
      }
    });

    // Initial network check
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected && state.isInternetReachable;

    return { success: true, isOnline: this.isOnline };
  }

  /**
   * Clean up network listener
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /**
   * Check if device is online
   */
  getIsOnline() {
    return this.isOnline;
  }

  /**
   * Subscribe to network state changes
   */
  addNetworkListener(callback) {
    this.networkListeners.push(callback);
    return () => {
      this.networkListeners = this.networkListeners.filter((l) => l !== callback);
    };
  }

  /**
   * Load offline queue from storage
   */
  async loadOfflineQueue() {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * Save offline queue to storage
   */
  async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Add an action to the offline queue
   */
  async queueAction(action) {
    const queuedAction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...action,
    };

    this.offlineQueue.push(queuedAction);
    await this.saveOfflineQueue();

    return queuedAction;
  }

  /**
   * Sync offline queue when back online
   */
  async syncOfflineQueue() {
    if (this.syncInProgress || !this.isOnline || this.offlineQueue.length === 0) {
      return { success: true, synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let synced = 0;
    let failed = 0;

    const queueCopy = [...this.offlineQueue];

    for (const action of queueCopy) {
      try {
        // Execute the queued action
        await this.executeQueuedAction(action);
        
        // Remove from queue on success
        this.offlineQueue = this.offlineQueue.filter((a) => a.id !== action.id);
        synced++;
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        failed++;
        
        // Mark failed attempts
        const actionIndex = this.offlineQueue.findIndex((a) => a.id === action.id);
        if (actionIndex >= 0) {
          this.offlineQueue[actionIndex].failedAttempts = 
            (this.offlineQueue[actionIndex].failedAttempts || 0) + 1;
          
          // Remove if too many failures
          if (this.offlineQueue[actionIndex].failedAttempts >= 3) {
            this.offlineQueue.splice(actionIndex, 1);
          }
        }
      }
    }

    await this.saveOfflineQueue();
    this.syncInProgress = false;

    return { success: true, synced, failed };
  }

  /**
   * Execute a queued action
   */
  async executeQueuedAction(action) {
    // This would be implemented based on your action types
    // For example:
    switch (action.type) {
      case 'LOG_MEAL':
        // Call meal logging API
        break;
      case 'LOG_WORKOUT':
        // Call workout logging API
        break;
      case 'LOG_WEIGHT':
        // Call weight logging API
        break;
      case 'SYNC_STEPS':
        // Sync step data
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  /**
   * Get pending offline actions
   */
  getPendingActions() {
    return [...this.offlineQueue];
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue() {
    this.offlineQueue = [];
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  }

  // ==================== CACHING ====================

  /**
   * Cache data with optional TTL
   */
  async cacheData(key, data, ttlMs = DEFAULT_CACHE_TTL) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return { success: true };
    } catch (error) {
      console.error('Cache write error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cached data if not expired
   */
  async getCachedData(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) {
        return { success: false, reason: 'not_found' };
      }

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      const isExpired = now - cacheData.timestamp > cacheData.ttl;

      if (isExpired) {
        // Clean up expired cache
        await AsyncStorage.removeItem(cacheKey);
        return { success: false, reason: 'expired' };
      }

      return {
        success: true,
        data: cacheData.data,
        age: now - cacheData.timestamp,
      };
    } catch (error) {
      console.error('Cache read error:', error);
      return { success: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Invalidate specific cache
   */
  async invalidateCache(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      return { success: true, cleared: cacheKeys.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch with cache-first strategy
   */
  async fetchWithCache(key, fetchFn, options = {}) {
    const { ttl = DEFAULT_CACHE_TTL, forceRefresh = false } = options;

    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await this.getCachedData(key);
      if (cached.success) {
        return { success: true, data: cached.data, fromCache: true };
      }
    }

    // If offline, return stale cache or error
    if (!this.isOnline) {
      const staleCache = await this.getCachedData(key);
      if (staleCache.data) {
        return { success: true, data: staleCache.data, fromCache: true, stale: true };
      }
      return { success: false, error: 'Offline and no cached data available' };
    }

    // Fetch fresh data
    try {
      const data = await fetchFn();
      await this.cacheData(key, data, ttl);
      return { success: true, data, fromCache: false };
    } catch (error) {
      // Try returning stale cache on error
      const staleCache = await this.getCachedData(key);
      if (staleCache.data) {
        return { success: true, data: staleCache.data, fromCache: true, stale: true };
      }
      throw error;
    }
  }
}

export default new OfflineService();


