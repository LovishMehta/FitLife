/**
 * FatToFit Health Data Store
 * Manages health metrics and HealthKit data
 */

import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { formatDateKey, getStartOfDay, getEndOfDay, getLastNDays } from '../utils/helpers';

const useHealthStore = create((set, get) => ({
  // State
  todayMetrics: {
    steps: 0,
    caloriesBurned: 0,
    activeEnergy: 0,
    distance: 0,
    heartRate: null,
    sleepDuration: null,
    waterIntake: 0,
  },
  weeklyData: [],
  monthlyData: [],
  isLoading: false,
  isSyncing: false,
  lastSyncTime: null,
  error: null,

  // Goals
  goals: {
    steps: 10000,
    calories: 500, // Active calories goal
    water: 2500,
    sleep: 8,
  },

  // Fetch today's metrics from database
  fetchTodayMetrics: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });

      const today = formatDateKey();
      const startOfDay = getStartOfDay().toISOString();
      const endOfDay = getEndOfDay().toISOString();

      // Fetch all metrics for today
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('recorded_at', startOfDay)
        .lte('recorded_at', endOfDay);

      if (error) throw error;

      // Aggregate metrics by type
      const metrics = {
        steps: 0,
        caloriesBurned: 0,
        activeEnergy: 0,
        distance: 0,
        heartRate: null,
        sleepDuration: null,
        waterIntake: 0,
      };

      if (data) {
        data.forEach((metric) => {
          switch (metric.metric_type) {
            case 'steps':
              metrics.steps += metric.value;
              break;
            case 'calories_burned':
            case 'active_energy':
              metrics.caloriesBurned += metric.value;
              break;
            case 'distance_km':
              metrics.distance += metric.value;
              break;
            case 'heart_rate':
              // Take the latest heart rate
              metrics.heartRate = metric.value;
              break;
            case 'sleep_duration':
              metrics.sleepDuration = metric.value;
              break;
            case 'water_intake':
              metrics.waterIntake += metric.value;
              break;
          }
        });
      }

      set({ todayMetrics: metrics, isLoading: false });
      return metrics;
    } catch (error) {
      console.error('Fetch today metrics error:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Fetch weekly data for charts
  fetchWeeklyData: async (userId) => {
    if (!userId) return;

    try {
      const dates = getLastNDays(7);
      const startDate = dates[0];
      const endDate = formatDateKey();

      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .gte('summary_date', startDate)
        .lte('summary_date', endDate)
        .order('summary_date', { ascending: true });

      if (error) throw error;

      // Fill in missing days with zeros
      const weeklyData = dates.map((date) => {
        const dayData = data?.find((d) => d.summary_date === date);
        return {
          date,
          steps: dayData?.total_steps || 0,
          caloriesBurned: dayData?.total_calories_burned || 0,
          caloriesConsumed: dayData?.total_calories_consumed || 0,
          workoutCompleted: dayData?.workout_completed || false,
          sleepDuration: dayData?.sleep_duration_hours || null,
        };
      });

      set({ weeklyData });
      return weeklyData;
    } catch (error) {
      console.error('Fetch weekly data error:', error);
      set({ error: error.message });
      return [];
    }
  },

  // Log a health metric
  logMetric: async (userId, metricType, value, source = 'manual', metadata = {}) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .insert({
          user_id: userId,
          metric_type: metricType,
          value,
          source,
          recorded_at: new Date().toISOString(),
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      // Update today's metrics
      await get().fetchTodayMetrics(userId);

      return { success: true, data };
    } catch (error) {
      console.error('Log metric error:', error);
      return { success: false, error };
    }
  },

  // Log water intake
  logWater: async (userId, amountMl) => {
    return get().logMetric(userId, 'water_intake', amountMl, 'manual');
  },

  // Log weight
  logWeight: async (userId, weightKg, bodyFatPercentage = null) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      // Log to weight_history table
      const { data, error } = await supabase
        .from('weight_history')
        .insert({
          user_id: userId,
          weight_kg: weightKg,
          body_fat_percentage: bodyFatPercentage,
          recorded_at: new Date().toISOString(),
          source: 'manual',
        })
        .select()
        .single();

      if (error) throw error;

      // Also log to health_metrics for daily tracking
      await get().logMetric(userId, 'weight', weightKg, 'manual');

      // Update user profile with current weight
      await supabase
        .from('user_profiles')
        .update({ current_weight_kg: weightKg, updated_at: new Date().toISOString() })
        .eq('id', userId);

      return { success: true, data };
    } catch (error) {
      console.error('Log weight error:', error);
      return { success: false, error };
    }
  },

  // Sync data from HealthKit (placeholder - actual implementation needs native module)
  syncHealthKit: async (userId, healthKitData) => {
    if (!userId || !healthKitData) return;

    try {
      set({ isSyncing: true });

      // Batch insert metrics from HealthKit
      const metricsToInsert = [];

      if (healthKitData.steps) {
        metricsToInsert.push({
          user_id: userId,
          metric_type: 'steps',
          value: healthKitData.steps,
          source: 'healthkit',
          recorded_at: new Date().toISOString(),
        });
      }

      if (healthKitData.activeEnergy) {
        metricsToInsert.push({
          user_id: userId,
          metric_type: 'active_energy',
          value: healthKitData.activeEnergy,
          source: 'healthkit',
          recorded_at: new Date().toISOString(),
        });
      }

      if (healthKitData.heartRate) {
        metricsToInsert.push({
          user_id: userId,
          metric_type: 'heart_rate',
          value: healthKitData.heartRate,
          source: 'healthkit',
          recorded_at: new Date().toISOString(),
        });
      }

      if (metricsToInsert.length > 0) {
        const { error } = await supabase
          .from('health_metrics')
          .insert(metricsToInsert);

        if (error) throw error;
      }

      set({ lastSyncTime: new Date().toISOString(), isSyncing: false });

      // Refresh today's metrics
      await get().fetchTodayMetrics(userId);
    } catch (error) {
      console.error('Sync HealthKit error:', error);
      set({ error: error.message, isSyncing: false });
    }
  },

  // Update daily summary
  updateDailySummary: async (userId) => {
    if (!userId) return;

    try {
      const today = formatDateKey();
      const { todayMetrics } = get();

      // Fetch today's nutrition data
      const { data: mealsData } = await supabase
        .from('meals')
        .select('calories, protein_g, carbs_g, fat_g')
        .eq('user_id', userId)
        .eq('meal_date', today);

      const nutritionTotals = (mealsData || []).reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (meal.protein_g || 0),
          carbs: acc.carbs + (meal.carbs_g || 0),
          fat: acc.fat + (meal.fat_g || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Check if workout completed today
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('id, duration_minutes')
        .eq('user_id', userId)
        .eq('workout_date', today)
        .eq('completed', true);

      const workoutCompleted = (workoutData?.length || 0) > 0;
      const workoutDuration = (workoutData || []).reduce(
        (acc, w) => acc + (w.duration_minutes || 0),
        0
      );

      // Upsert daily summary
      const { error } = await supabase
        .from('daily_summaries')
        .upsert(
          {
            user_id: userId,
            summary_date: today,
            total_steps: todayMetrics.steps,
            total_calories_burned: todayMetrics.caloriesBurned,
            total_calories_consumed: nutritionTotals.calories,
            total_protein_g: nutritionTotals.protein,
            total_carbs_g: nutritionTotals.carbs,
            total_fat_g: nutritionTotals.fat,
            total_water_ml: todayMetrics.waterIntake,
            workout_completed: workoutCompleted,
            workout_duration_minutes: workoutDuration,
            sleep_duration_hours: todayMetrics.sleepDuration,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,summary_date',
          }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Update daily summary error:', error);
    }
  },

  // Set goals
  setGoals: (goals) => {
    set({ goals: { ...get().goals, ...goals } });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useHealthStore;


