import { supabase, isSupabaseConfigured, getSession } from './supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Auth Service - MVP Implementation
 * 
 * Per MVP doc - Optional Auth Architecture:
 * - Users can use core features WITHOUT creating an account
 * - Auth only required for cloud features (backup, AI chat, push notifications)
 * - Lower friction = higher conversion
 * 
 * Flow:
 * 1. User installs app → Can use immediately (no signup)
 * 2. User wants backup/AI → Prompt for account creation
 * 
 * OPTIMIZED: Profile is auto-created by DB trigger on auth.users insert
 * The createProfile method is kept as a fallback for edge cases.
 */

const AUTH_KEYS = {
  USER_PROFILE: '@user_profile',
  LAST_SYNC: '@last_sync_timestamp',
};

class AuthService {
  /**
   * Sign up with email and password
   * @param {string} email
   * @param {string} password
   * @param {string} username - Optional display name
   * @returns {Promise<{user: object|null, error: string|null}>}
   */
  async signUp(email, password, username = null) {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Cloud features not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Note: Profile is auto-created by DB trigger (handle_new_user)
      // The trigger uses username from raw_user_meta_data set above
      // Fallback: manually create profile if trigger fails
      if (data.user) {
        // Give trigger a moment to execute, then cache profile
        setTimeout(() => {
          this.loadAndCacheProfile(data.user.id);
        }, 500);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error.message };
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object|null, error: string|null}>}
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Cloud features not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Cache profile locally
      if (data.user) {
        await this.loadAndCacheProfile(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  }

  /**
   * Sign out
   * @returns {Promise<{error: string|null}>}
   */
  async signOut() {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(AUTH_KEYS.USER_PROFILE);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  }

  /**
   * Create user profile in Supabase (FALLBACK)
   * Note: Profile is normally auto-created by DB trigger (handle_new_user)
   * This method is kept as a fallback for edge cases where trigger fails.
   * 
   * @param {string} userId
   * @param {string} username
   */
  async createProfile(userId, username) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username,
          daily_goal: 10000,
        }, {
          onConflict: 'id',
          ignoreDuplicates: true,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }

  /**
   * Load profile from Supabase and cache locally
   * Per MVP: "Load once, cache locally, background sync"
   * @param {string} userId
   */
  async loadAndCacheProfile(userId) {
    try {
      // Try to get existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      // If profile doesn't exist, create it (fallback for trigger failure)
      if (!data) {
        console.log('Profile not found, creating one...');
        const session = await getSession();
        const email = session?.user?.email || '';
        const username = email.split('@')[0] || 'User';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username,
            daily_goal: 10000,
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          // Return a local-only profile
          const localProfile = { id: userId, username, daily_goal: 10000 };
          await AsyncStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(localProfile));
          return localProfile;
        }
        
        await AsyncStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(newProfile));
        return newProfile;
      }

      // Cache locally
      await AsyncStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }

  /**
   * Get cached profile (no network call)
   * Per MVP: "App start (cached) = AsyncStorage = NO network call"
   */
  async getCachedProfile() {
    try {
      const cached = await AsyncStorage.getItem(AUTH_KEYS.USER_PROFILE);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached profile:', error);
      return null;
    }
  }

  /**
   * Get profile - tries cache first, then network
   * Per MVP: Load from cache instantly, background sync with Supabase
   */
  async getProfile() {
    // 1. Load from cache instantly
    const cached = await this.getCachedProfile();
    
    // 2. If authenticated, background sync with Supabase
    const session = await getSession();
    if (session?.user?.id) {
      // Don't await - do in background
      this.loadAndCacheProfile(session.user.id).then((freshData) => {
        if (freshData && cached && freshData.updated_at > cached.updated_at) {
          console.log('Profile updated from Supabase');
        }
      });
    }

    return cached;
  }

  /**
   * Update daily goal - local + immediate sync
   * Per MVP: "Goals change rarely → sync immediately when changed"
   * @param {number} newGoal
   */
  async updateDailyGoal(newGoal) {
    // 1. Update local cache immediately (optimistic)
    const cached = await this.getCachedProfile();
    if (cached) {
      cached.daily_goal = newGoal;
      await AsyncStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(cached));
    }

    // 2. Sync to Supabase immediately
    const session = await getSession();
    if (session?.user?.id && isSupabaseConfigured()) {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_goal: newGoal })
        .eq('id', session.user.id);

      if (error) {
        console.error('Failed to sync goal to cloud:', error);
        return { synced: false, error: error.message };
      }
      return { synced: true, error: null };
    }

    return { synced: false, error: null }; // Not authenticated, local only
  }

  /**
   * Check if user needs to sign in for a feature
   * Per MVP: Only require auth for cloud features
   * @param {string} feature - 'backup', 'ai_chat', 'push_notifications'
   */
  async requiresAuth(feature) {
    const cloudFeatures = ['backup', 'ai_chat', 'push_notifications'];
    if (!cloudFeatures.includes(feature)) {
      return false;
    }
    
    const session = await getSession();
    return session === null;
  }
}

export default new AuthService();
