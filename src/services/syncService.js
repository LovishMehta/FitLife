import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured, getSession } from './supabaseService';
import storageService from './storageService';

/**
 * Sync Service - MVP Implementation
 * 
 * Per MVP doc - Step Sync Strategy:
 * - Device Pedometer is PRIMARY source (instant, no network)
 * - AsyncStorage for settings, chat, profile cache
 * - Supabase for multi-device sync, backup, restore
 * 
 * Sync Triggers:
 * - Every 4 hours (app active)
 * - App goes to background
 * - App returns to foreground (only if >4 hours passed)
 * - Midnight (day change)
 * - Pull to refresh (user-initiated)
 */

const SYNC_KEYS = {
  LAST_STEP_SYNC: '@last_step_sync',
  PENDING_STEP_SYNCS: '@pending_step_syncs',
};

const SYNC_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

class SyncService {
  constructor() {
    this.lastSyncTime = 0;
    this.syncInProgress = false;
  }

  /**
   * Check if sync is needed (>4 hours since last sync)
   */
  async shouldSync() {
    try {
      const lastSync = await AsyncStorage.getItem(SYNC_KEYS.LAST_STEP_SYNC);
      if (!lastSync) return true;
      
      const timeSinceLastSync = Date.now() - parseInt(lastSync, 10);
      return timeSinceLastSync >= SYNC_INTERVAL;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true;
    }
  }

  /**
   * Sync step data to Supabase
   * Per MVP: "Every 4 hours (app active) + triggers"
   * 
   * @param {boolean} force - Force sync regardless of timing
   */
  async syncSteps(force = false) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('📱 Supabase not configured - skipping sync');
      return { synced: false, reason: 'not_configured' };
    }

    // Check if user is authenticated
    const session = await getSession();
    if (!session?.user?.id) {
      console.log('📱 User not authenticated - skipping sync');
      return { synced: false, reason: 'not_authenticated' };
    }

    // Check if sync is needed (unless forced)
    if (!force && !await this.shouldSync()) {
      console.log('📱 Sync not needed yet (< 4 hours)');
      return { synced: false, reason: 'not_needed' };
    }

    // Prevent concurrent syncs
    if (this.syncInProgress) {
      console.log('📱 Sync already in progress');
      return { synced: false, reason: 'in_progress' };
    }

    this.syncInProgress = true;

    try {
      console.log('📱 Starting step sync to Supabase...');
      
      // Get step history from local storage
      const history = await storageService.getStepHistory();
      const userId = session.user.id;

      // Get last 7 days of data (per MVP: "Last 7 days step data in prompt")
      const dates = storageService.getLastNDates(7);
      const stepRecords = dates.map(dateKey => ({
        user_id: userId,
        date: dateKey,
        steps: history[dateKey] || 0,
        calories: Math.round((history[dateKey] || 0) * 0.04), // ~0.04 kcal per step
        synced_at: new Date().toISOString(),
      }));

      // Upsert step records (insert or update on conflict)
      const { error } = await supabase
        .from('step_records')
        .upsert(stepRecords, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('📱 Step sync error:', error);
        this.syncInProgress = false;
        return { synced: false, reason: 'error', error: error.message };
      }

      // Update last sync timestamp
      await AsyncStorage.setItem(SYNC_KEYS.LAST_STEP_SYNC, Date.now().toString());
      this.lastSyncTime = Date.now();

      console.log(`📱 ✅ Synced ${stepRecords.length} days of step data`);
      this.syncInProgress = false;
      return { synced: true, count: stepRecords.length };

    } catch (error) {
      console.error('📱 Step sync error:', error);
      this.syncInProgress = false;
      return { synced: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Handle app going to background
   * Per MVP: "App goes to background = YES (Sync)"
   */
  async onAppBackground() {
    console.log('📱 App going to background - syncing...');
    return await this.syncSteps(true); // Force sync
  }

  /**
   * Handle app coming to foreground
   * Per MVP: "App returns to foreground = MAYBE (Only if >4 hours passed)"
   */
  async onAppForeground() {
    console.log('📱 App coming to foreground - checking sync...');
    return await this.syncSteps(false); // Only if needed
  }

  /**
   * Handle day change (midnight)
   * Per MVP: "Midnight (day change) = YES (Finalize yesterday)"
   */
  async onDayChange() {
    console.log('📱 Day changed - syncing yesterday\'s data...');
    return await this.syncSteps(true); // Force sync
  }

  /**
   * Handle pull to refresh
   * Per MVP: "Pull to refresh = YES (User-initiated)"
   */
  async onPullToRefresh() {
    console.log('📱 Pull to refresh - syncing...');
    return await this.syncSteps(true); // Force sync
  }

  /**
   * Get step data from Supabase (for multi-device sync)
   * Per MVP: "Only fetch from Supabase for multi-device sync"
   */
  async fetchStepsFromCloud() {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'not_configured' };
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return { data: null, error: 'not_authenticated' };
    }

    try {
      const dates = storageService.getLastNDates(7);
      
      const { data, error } = await supabase
        .from('step_records')
        .select('date, steps, calories')
        .eq('user_id', session.user.id)
        .in('date', dates)
        .order('date', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Merge cloud data with local data
   * Per MVP: "Background merge with Supabase (for multi-device)"
   */
  async mergeWithCloudData() {
    const { data: cloudData, error } = await this.fetchStepsFromCloud();
    
    if (error || !cloudData) {
      console.log('📱 Could not fetch cloud data:', error);
      return false;
    }

    const localHistory = await storageService.getStepHistory();
    let merged = false;

    for (const record of cloudData) {
      const localSteps = localHistory[record.date] || 0;
      // Use higher value (could have walked more on another device)
      if (record.steps > localSteps) {
        await storageService.saveTodaySteps(record.steps);
        merged = true;
        console.log(`📱 Merged cloud data for ${record.date}: ${record.steps} steps`);
      }
    }

    return merged;
  }

  /**
   * Get last sync info
   */
  async getLastSyncInfo() {
    try {
      const lastSync = await AsyncStorage.getItem(SYNC_KEYS.LAST_STEP_SYNC);
      if (!lastSync) {
        return { lastSync: null, timeSince: null };
      }
      
      const timestamp = parseInt(lastSync, 10);
      const timeSince = Date.now() - timestamp;
      
      return {
        lastSync: new Date(timestamp).toISOString(),
        timeSince,
        timeSinceHours: Math.round(timeSince / (60 * 60 * 1000) * 10) / 10,
      };
    } catch (error) {
      return { lastSync: null, timeSince: null };
    }
  }
}

export default new SyncService();
