/**
 * FatToFit First Plan Screen
 * Generate and display the user's first workout/nutrition plan
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { calculateBMR, calculateTDEE, calculateCalorieTarget, calculateMacroTargets } from '../../utils/helpers';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '../../components/common';

const FirstPlanScreen = ({ navigation, route }) => {
  const { completeOnboarding, isLoading: isSaving } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(true);
  const [plan, setPlan] = useState(null);

  const params = route.params || {};

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    // Simulate plan generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Calculate nutrition targets
    const bmr = calculateBMR(
      params.currentWeight,
      params.height,
      params.age,
      params.gender
    );
    
    const tdee = calculateTDEE(bmr, 'moderate');
    const calorieTarget = calculateCalorieTarget(tdee, params.primaryGoal, 0.5);
    const macros = calculateMacroTargets(calorieTarget, params.primaryGoal);

    setPlan({
      calories: calorieTarget,
      macros,
      workoutsPerWeek: params.workoutFrequency || 4,
      workoutDuration: params.workoutDuration || 45,
      focusAreas: getWorkoutFocus(params.primaryGoal),
    });

    setIsGenerating(false);
  };

  const getWorkoutFocus = (goal) => {
    switch (goal) {
      case 'weight_loss':
        return ['Strength training', 'HIIT cardio', 'Core work'];
      case 'muscle_gain':
        return ['Progressive overload', 'Compound lifts', 'Muscle isolation'];
      case 'endurance':
        return ['Cardio intervals', 'Tempo runs', 'Endurance circuits'];
      default:
        return ['Full body workouts', 'Light cardio', 'Flexibility'];
    }
  };

  const handleFinish = async () => {
    // Save all onboarding data to profile
    const profileData = {
      full_name: params.fullName,
      age: params.age,
      height_cm: params.height,
      current_weight_kg: params.currentWeight,
      goal_weight_kg: params.goalWeight,
      gender: params.gender,
      fitness_experience: params.fitnessExperience,
      primary_goal: params.primaryGoal,
      target_timeline_weeks: params.targetWeeks,
      dietary_restrictions: params.dietaryRestrictions,
      equipment_available: params.equipment,
      workout_frequency_per_week: params.workoutFrequency,
      available_workout_minutes: params.workoutDuration,
      injuries_limitations: params.injuries,
      daily_calorie_target: plan?.calories,
      protein_target_g: plan?.macros?.protein,
      carbs_target_g: plan?.macros?.carbs,
      fat_target_g: plan?.macros?.fat,
      openai_api_key_encrypted: params.openaiApiKey, // Should encrypt in production
      notification_morning: params.notificationPermissionGranted,
      notification_evening: params.notificationPermissionGranted,
      notification_workout_reminder: params.notificationPermissionGranted,
    };

    const result = await completeOnboarding(profileData);
    
    if (!result.success) {
      console.error('Failed to save profile:', result.error);
    }
    // Navigation will happen automatically via auth state change
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingTitle}>Creating Your Plan...</Text>
          <Text style={styles.loadingText}>
            Analyzing your profile and generating personalized recommendations
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Progress */}
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Your Plan is Ready!</Text>
        <Text style={styles.subtitle}>
          Here's what we've prepared for you
        </Text>

        {/* Nutrition Plan */}
        <View style={styles.planCard}>
          <Text style={styles.cardTitle}>📊 Daily Nutrition Targets</Text>
          
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>Daily Calories</Text>
            <Text style={styles.calorieValue}>{plan?.calories?.toLocaleString()}</Text>
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: colors.macros.protein }]} />
              <Text style={styles.macroValue}>{plan?.macros?.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: colors.macros.carbs }]} />
              <Text style={styles.macroValue}>{plan?.macros?.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: colors.macros.fat }]} />
              <Text style={styles.macroValue}>{plan?.macros?.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Workout Plan */}
        <View style={styles.planCard}>
          <Text style={styles.cardTitle}>💪 Workout Schedule</Text>
          
          <View style={styles.workoutRow}>
            <Text style={styles.workoutLabel}>Sessions per week</Text>
            <Text style={styles.workoutValue}>{plan?.workoutsPerWeek}</Text>
          </View>
          
          <View style={styles.workoutRow}>
            <Text style={styles.workoutLabel}>Duration</Text>
            <Text style={styles.workoutValue}>{plan?.workoutDuration} min</Text>
          </View>

          <Text style={styles.focusTitle}>Focus areas:</Text>
          <View style={styles.focusList}>
            {plan?.focusAreas?.map((area, index) => (
              <View key={index} style={styles.focusTag}>
                <Text style={styles.focusText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next steps */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextTitle}>What's next?</Text>
          <Text style={styles.nextItem}>• Log your first meal to start tracking</Text>
          <Text style={styles.nextItem}>• Check out today's workout</Text>
          <Text style={styles.nextItem}>• Chat with your AI coach anytime</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Start Your Journey"
          onPress={handleFinish}
          loading={isSaving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingTitle: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  progressDotActive: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: 0,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  planCard: {
    width: '100%',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  calorieLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  calorieValue: {
    ...textStyles.h2,
    color: colors.primary[500],
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  macroValue: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  macroLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  workoutLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  workoutValue: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
  },
  focusTitle: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  focusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  focusTag: {
    backgroundColor: colors.transparent.primary20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  focusText: {
    ...textStyles.caption,
    color: colors.primary[400],
  },
  nextSteps: {
    width: '100%',
    padding: spacing.base,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
  },
  nextTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  nextItem: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.xl,
  },
});

export default FirstPlanScreen;


