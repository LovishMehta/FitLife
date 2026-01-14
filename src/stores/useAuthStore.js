/**
 * FatToFit Auth Store
 * Manages authentication state with Zustand
 */

import { create } from 'zustand';
import authService from '../services/authService';
import { supabase } from '../services/supabase';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  onboardingCompleted: false,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get current session
      const { session } = await authService.getSession();

      if (session?.user) {
        // Fetch user profile
        const profile = await get().fetchProfile(session.user.id);
        
        set({
          user: session.user,
          session,
          profile,
          isAuthenticated: true,
          onboardingCompleted: profile?.onboarding_completed || false,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch user profile from database
  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is okay for new users
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Fetch profile error:', error);
      return null;
    }
  },

  // Sign up
  signUp: async (email, password, metadata = {}) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await authService.signUp(email, password, metadata);

      if (error) throw error;

      if (data?.user) {
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: !!data.session,
          onboardingCompleted: false,
          isLoading: false,
        });
      }

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await authService.signIn(email, password);

      if (error) throw error;

      if (data?.user) {
        const profile = await get().fetchProfile(data.user.id);
        
        set({
          user: data.user,
          session: data.session,
          profile,
          isAuthenticated: true,
          onboardingCompleted: profile?.onboarding_completed || false,
          isLoading: false,
        });
      }

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await authService.signOut();

      if (error) throw error;

      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        onboardingCompleted: false,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await authService.resetPassword(email);

      if (error) throw error;

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      set({
        profile: data,
        onboardingCompleted: data?.onboarding_completed || false,
        isLoading: false,
      });

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Complete onboarding
  completeOnboarding: async (profileData) => {
    try {
      const result = await get().updateProfile({
        ...profileData,
        onboarding_completed: true,
      });

      if (result.success) {
        set({ onboardingCompleted: true });
      }

      return result;
    } catch (error) {
      return { success: false, error };
    }
  },

  // Set auth state from listener
  setAuthState: (session) => {
    if (session?.user) {
      set({
        user: session.user,
        session,
        isAuthenticated: true,
      });
      // Fetch profile in background
      get().fetchProfile(session.user.id).then((profile) => {
        set({
          profile,
          onboardingCompleted: profile?.onboarding_completed || false,
        });
      });
    } else {
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        onboardingCompleted: false,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;


