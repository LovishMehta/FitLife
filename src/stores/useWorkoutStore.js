/**
 * FatToFit Workout Store
 * Manages workout plans and workout logging
 */

import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { formatDateKey, getTodayKey, getStartOfWeek } from '../utils/helpers';
import { DAYS_SHORT } from '../utils/constants';

const useWorkoutStore = create((set, get) => ({
  // State
  currentPlan: null,
  todayWorkout: null,
  weekWorkouts: [],
  workoutHistory: [],
  isLoading: false,
  error: null,

  // Fetch current active workout plan
  fetchCurrentPlan: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });

      const weekStart = formatDateKey(getStartOfWeek());

      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('week_start_date', weekStart)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      set({ currentPlan: data || null, isLoading: false });

      // Also fetch this week's workouts
      if (data) {
        await get().fetchWeekWorkouts(userId);
      }

      return data;
    } catch (error) {
      console.error('Fetch current plan error:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Fetch today's scheduled workout
  fetchTodayWorkout: async (userId) => {
    if (!userId) return;

    try {
      const today = getTodayKey();

      // First check if there's a logged workout for today
      const { data: loggedWorkout, error: logError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('workout_date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      if (logError) throw logError;

      if (loggedWorkout?.length > 0) {
        set({ todayWorkout: loggedWorkout[0] });
        return loggedWorkout[0];
      }

      // If no logged workout, check the plan
      const { currentPlan } = get();
      if (currentPlan?.plan_json) {
        const dayOfWeek = new Date().getDay();
        const dayName = DAYS_SHORT[dayOfWeek].toLowerCase();
        const plannedWorkout = currentPlan.plan_json[dayName];

        if (plannedWorkout) {
          set({
            todayWorkout: {
              ...plannedWorkout,
              isPlanned: true,
              completed: false,
            },
          });
          return plannedWorkout;
        }
      }

      set({ todayWorkout: null });
      return null;
    } catch (error) {
      console.error('Fetch today workout error:', error);
      return null;
    }
  },

  // Fetch this week's workouts
  fetchWeekWorkouts: async (userId) => {
    if (!userId) return;

    try {
      const weekStart = formatDateKey(getStartOfWeek());
      const today = getTodayKey();

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('workout_date', weekStart)
        .lte('workout_date', today)
        .order('workout_date', { ascending: true });

      if (error) throw error;

      set({ weekWorkouts: data || [] });
      return data;
    } catch (error) {
      console.error('Fetch week workouts error:', error);
      return [];
    }
  },

  // Fetch workout history
  fetchWorkoutHistory: async (userId, limit = 30) => {
    if (!userId) return;

    try {
      set({ isLoading: true });

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      set({ workoutHistory: data || [], isLoading: false });
      return data;
    } catch (error) {
      console.error('Fetch workout history error:', error);
      set({ isLoading: false });
      return [];
    }
  },

  // Log a workout
  logWorkout: async (userId, workoutData) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          plan_id: workoutData.plan_id,
          workout_date: workoutData.workout_date || getTodayKey(),
          workout_type: workoutData.workout_type,
          workout_name: workoutData.workout_name,
          duration_minutes: workoutData.duration_minutes,
          exercises: workoutData.exercises || [],
          calories_burned: workoutData.calories_burned,
          avg_heart_rate: workoutData.avg_heart_rate,
          max_heart_rate: workoutData.max_heart_rate,
          perceived_difficulty: workoutData.perceived_difficulty,
          perceived_effort: workoutData.perceived_effort,
          completed: workoutData.completed ?? true,
          notes: workoutData.notes,
          mood_before: workoutData.mood_before,
          mood_after: workoutData.mood_after,
          source: workoutData.source || 'manual',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await get().fetchTodayWorkout(userId);
      await get().fetchWeekWorkouts(userId);

      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Log workout error:', error);
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Update a workout
  updateWorkout: async (userId, workoutId, updates) => {
    if (!userId || !workoutId) return { success: false, error: 'Missing parameters' };

    try {
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', workoutId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await get().fetchTodayWorkout(userId);
      await get().fetchWeekWorkouts(userId);

      return { success: true, data };
    } catch (error) {
      console.error('Update workout error:', error);
      return { success: false, error };
    }
  },

  // Mark workout as complete
  completeWorkout: async (userId, workoutId, completionData = {}) => {
    return get().updateWorkout(userId, workoutId, {
      completed: true,
      ...completionData,
    });
  },

  // Create a new workout plan
  createPlan: async (userId, planData) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      set({ isLoading: true, error: null });

      // Deactivate current plan
      await supabase
        .from('workout_plans')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Create new plan
      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          user_id: userId,
          week_start_date: planData.week_start_date || formatDateKey(getStartOfWeek()),
          plan_name: planData.plan_name,
          plan_json: planData.plan_json,
          goal_focus: planData.goal_focus,
          difficulty_level: planData.difficulty_level,
          is_active: true,
          generated_by: planData.generated_by || 'manual',
        })
        .select()
        .single();

      if (error) throw error;

      set({ currentPlan: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Create plan error:', error);
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Get workout stats
  getWorkoutStats: async (userId, days = 30) => {
    if (!userId) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('workout_date', formatDateKey(startDate));

      if (error) throw error;

      const totalWorkouts = data?.length || 0;
      const totalMinutes = data?.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) || 0;
      const totalCalories = data?.reduce((acc, w) => acc + (w.calories_burned || 0), 0) || 0;

      // Group by workout type
      const byType = data?.reduce((acc, w) => {
        acc[w.workout_type] = (acc[w.workout_type] || 0) + 1;
        return acc;
      }, {});

      return {
        totalWorkouts,
        totalMinutes,
        totalCalories,
        avgDuration: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0,
        byType,
      };
    } catch (error) {
      console.error('Get workout stats error:', error);
      return null;
    }
  },

  // Calculate streak
  getWorkoutStreak: async (userId) => {
    if (!userId) return 0;

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('workout_date')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('workout_date', { ascending: false })
        .limit(60);

      if (error) throw error;

      if (!data || data.length === 0) return 0;

      // Calculate consecutive days with workouts
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const workoutDates = new Set(data.map((w) => w.workout_date));

      // Check if worked out today or yesterday to start streak
      const today = formatDateKey(currentDate);
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = formatDateKey(yesterday);

      if (!workoutDates.has(today) && !workoutDates.has(yesterdayKey)) {
        return 0;
      }

      // Count consecutive days
      for (let i = 0; i < 60; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = formatDateKey(checkDate);

        if (workoutDates.has(dateKey)) {
          streak++;
        } else if (i > 0) {
          // Allow one rest day between workouts
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Get workout streak error:', error);
      return 0;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useWorkoutStore;


