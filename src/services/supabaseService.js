import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Service - MVP Configuration
 * 
 * Per MVP doc:
 * - 24-hour access token expiry (reduces refresh calls)
 * - 30-day refresh token (user stays logged in)
 * - Session stored locally (AsyncStorage)
 * - NO network call on app open (JWT validated locally)
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage adapter for AsyncStorage (React Native)
const ExpoSecureStoreAdapter = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

// Create Supabase client with custom storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for React Native
  },
});

/**
 * Check if Supabase is configured
 * App can work without Supabase (offline mode per MVP)
 */
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== '' && supabaseAnonKey !== '';
};

/**
 * Get current session (local validation, no network call)
 * Per MVP: "App opens, valid session = NO network call (local JWT check)"
 */
export const getSession = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const session = await getSession();
  return session !== null;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user || null;
};

export default {
  supabase,
  isSupabaseConfigured,
  getSession,
  isAuthenticated,
  getCurrentUser,
};
