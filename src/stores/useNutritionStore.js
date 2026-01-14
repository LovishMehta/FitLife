/**
 * FatToFit Nutrition Store
 * Manages meal tracking and nutrition data
 */

import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { formatDateKey, getTodayKey } from '../utils/helpers';

const useNutritionStore = create((set, get) => ({
  // State
  todayMeals: [],
  todayTotals: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  },
  mealTemplates: [],
  recentMeals: [],
  isLoading: false,
  error: null,

  // Targets (from user profile)
  targets: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  },

  // Fetch today's meals
  fetchTodayMeals: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });

      const today = getTodayKey();

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .eq('meal_date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate totals
      const totals = (data || []).reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (meal.protein_g || 0),
          carbs: acc.carbs + (meal.carbs_g || 0),
          fat: acc.fat + (meal.fat_g || 0),
          fiber: acc.fiber + (meal.fiber_g || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      set({
        todayMeals: data || [],
        todayTotals: totals,
        isLoading: false,
      });

      return data;
    } catch (error) {
      console.error('Fetch today meals error:', error);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  // Log a meal
  logMeal: async (userId, mealData) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: userId,
          meal_date: mealData.meal_date || getTodayKey(),
          meal_time: mealData.meal_time,
          meal_type: mealData.meal_type,
          meal_name: mealData.meal_name,
          description: mealData.description,
          calories: mealData.calories || 0,
          protein_g: mealData.protein_g || 0,
          carbs_g: mealData.carbs_g || 0,
          fat_g: mealData.fat_g || 0,
          fiber_g: mealData.fiber_g || 0,
          sugar_g: mealData.sugar_g || 0,
          serving_size: mealData.serving_size,
          servings: mealData.servings || 1,
          photo_url: mealData.photo_url,
          barcode: mealData.barcode,
          source: mealData.source || 'manual',
          ai_confidence: mealData.ai_confidence,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh today's meals
      await get().fetchTodayMeals(userId);

      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Log meal error:', error);
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // Update a meal
  updateMeal: async (userId, mealId, updates) => {
    if (!userId || !mealId) return { success: false, error: 'Missing parameters' };

    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', mealId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Refresh today's meals
      await get().fetchTodayMeals(userId);

      return { success: true, data };
    } catch (error) {
      console.error('Update meal error:', error);
      return { success: false, error };
    }
  },

  // Delete a meal
  deleteMeal: async (userId, mealId) => {
    if (!userId || !mealId) return { success: false, error: 'Missing parameters' };

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh today's meals
      await get().fetchTodayMeals(userId);

      return { success: true };
    } catch (error) {
      console.error('Delete meal error:', error);
      return { success: false, error };
    }
  },

  // Fetch meal templates (saved/favorite meals)
  fetchMealTemplates: async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('meal_templates')
        .select('*')
        .eq('user_id', userId)
        .order('use_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      set({ mealTemplates: data || [] });
      return data;
    } catch (error) {
      console.error('Fetch meal templates error:', error);
      return [];
    }
  },

  // Save meal as template
  saveMealTemplate: async (userId, mealData) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error } = await supabase
        .from('meal_templates')
        .insert({
          user_id: userId,
          meal_name: mealData.meal_name,
          meal_type: mealData.meal_type,
          calories: mealData.calories || 0,
          protein_g: mealData.protein_g || 0,
          carbs_g: mealData.carbs_g || 0,
          fat_g: mealData.fat_g || 0,
          serving_size: mealData.serving_size,
        })
        .select()
        .single();

      if (error) throw error;

      await get().fetchMealTemplates(userId);
      return { success: true, data };
    } catch (error) {
      console.error('Save meal template error:', error);
      return { success: false, error };
    }
  },

  // Log meal from template
  logFromTemplate: async (userId, templateId) => {
    if (!userId || !templateId) return { success: false, error: 'Missing parameters' };

    try {
      // Get template
      const { data: template, error: fetchError } = await supabase
        .from('meal_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Log the meal
      const result = await get().logMeal(userId, {
        meal_name: template.meal_name,
        meal_type: template.meal_type,
        calories: template.calories,
        protein_g: template.protein_g,
        carbs_g: template.carbs_g,
        fat_g: template.fat_g,
        serving_size: template.serving_size,
        source: 'template',
      });

      // Increment use count
      await supabase
        .from('meal_templates')
        .update({ use_count: (template.use_count || 0) + 1 })
        .eq('id', templateId);

      return result;
    } catch (error) {
      console.error('Log from template error:', error);
      return { success: false, error };
    }
  },

  // Fetch recent meals for suggestions
  fetchRecentMeals: async (userId, limit = 10) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('meal_name, calories, protein_g, carbs_g, fat_g, meal_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Remove duplicates by meal name
      const uniqueMeals = data?.reduce((acc, meal) => {
        if (!acc.find((m) => m.meal_name === meal.meal_name)) {
          acc.push(meal);
        }
        return acc;
      }, []);

      set({ recentMeals: uniqueMeals || [] });
      return uniqueMeals;
    } catch (error) {
      console.error('Fetch recent meals error:', error);
      return [];
    }
  },

  // Get nutrition for date range
  getNutritionHistory: async (userId, startDate, endDate) => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('summary_date, total_calories_consumed, total_protein_g, total_carbs_g, total_fat_g')
        .eq('user_id', userId)
        .gte('summary_date', startDate)
        .lte('summary_date', endDate)
        .order('summary_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get nutrition history error:', error);
      return [];
    }
  },

  // Set nutrition targets
  setTargets: (targets) => {
    set({ targets: { ...get().targets, ...targets } });
  },

  // Calculate remaining macros
  getRemainingMacros: () => {
    const { todayTotals, targets } = get();
    return {
      calories: Math.max(0, targets.calories - todayTotals.calories),
      protein: Math.max(0, targets.protein - todayTotals.protein),
      carbs: Math.max(0, targets.carbs - todayTotals.carbs),
      fat: Math.max(0, targets.fat - todayTotals.fat),
    };
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useNutritionStore;


