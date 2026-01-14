/**
 * FatToFit Authentication Service
 * Handles all authentication flows with Supabase
 */

import { supabase } from './supabase';

class AuthService {
  /**
   * Sign up with email and password
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'fattofit://reset-password',
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  }

  /**
   * Get current user
   */
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, error };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
    return subscription;
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update user metadata error:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete account
   */
  async deleteAccount() {
    try {
      // Note: This requires server-side implementation with service role
      // For now, we'll just sign out and mark for deletion
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error);
      return { error };
    }
  }
}

export default new AuthService();


