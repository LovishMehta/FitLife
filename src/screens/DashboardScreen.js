/**
 * FatToFit Dashboard Screen
 * Main home screen with daily overview
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius, shadows } from '../theme';
import { ROUTES } from '../utils/constants';
import { formatDisplayDate, formatNumber, calculateProgress } from '../utils/helpers';
import useAuthStore from '../stores/useAuthStore';
import useHealthStore from '../stores/useHealthStore';
import useNutritionStore from '../stores/useNutritionStore';
import useWorkoutStore from '../stores/useWorkoutStore';
import { Card, ProgressRing } from '../components/common';

const DashboardScreen = ({ navigation }) => {
  const { user, profile } = useAuthStore();
  const { todayMetrics, goals, fetchTodayMetrics } = useHealthStore();
  const { todayTotals, targets, fetchTodayMeals } = useNutritionStore();
  const { todayWorkout, fetchTodayWorkout, fetchCurrentPlan } = useWorkoutStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchTodayMetrics(user.id),
        fetchTodayMeals(user.id),
        fetchCurrentPlan(user.id),
        fetchTodayWorkout(user.id),
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calorieBalance = (targets.calories || 2000) - (todayTotals.calories || 0);
  const stepsProgress = calculateProgress(todayMetrics.steps, goals.steps);
  const caloriesProgress = calculateProgress(todayTotals.calories, targets.calories);
  const proteinProgress = calculateProgress(todayTotals.protein, targets.protein);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
            </Text>
            <Text style={styles.date}>{formatDisplayDate(new Date())}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Score Card */}
        <Card style={styles.scoreCard} variant="elevated">
          <Text style={styles.scoreTitle}>Today's Progress</Text>
          
          <View style={styles.scoreGrid}>
            {/* Steps */}
            <View style={styles.scoreItem}>
              <ProgressRing
                progress={stepsProgress}
                size={80}
                strokeWidth={8}
                color={colors.primary[500]}
                showPercentage={false}
              >
                <Text style={styles.scoreEmoji}>👣</Text>
              </ProgressRing>
              <Text style={styles.scoreValue}>{formatNumber(todayMetrics.steps)}</Text>
              <Text style={styles.scoreLabel}>Steps</Text>
            </View>

            {/* Calories */}
            <View style={styles.scoreItem}>
              <ProgressRing
                progress={caloriesProgress}
                size={80}
                strokeWidth={8}
                color={colors.macros.calories}
                showPercentage={false}
              >
                <Text style={styles.scoreEmoji}>🔥</Text>
              </ProgressRing>
              <Text style={styles.scoreValue}>{formatNumber(todayTotals.calories)}</Text>
              <Text style={styles.scoreLabel}>Calories</Text>
            </View>

            {/* Protein */}
            <View style={styles.scoreItem}>
              <ProgressRing
                progress={proteinProgress}
                size={80}
                strokeWidth={8}
                color={colors.macros.protein}
                showPercentage={false}
              >
                <Text style={styles.scoreEmoji}>🥩</Text>
              </ProgressRing>
              <Text style={styles.scoreValue}>{Math.round(todayTotals.protein)}g</Text>
              <Text style={styles.scoreLabel}>Protein</Text>
            </View>
          </View>

          {/* Calorie Balance */}
          <View style={styles.balanceBar}>
            <Text style={styles.balanceText}>
              {calorieBalance > 0 
                ? `${formatNumber(calorieBalance)} cal remaining` 
                : `${formatNumber(Math.abs(calorieBalance))} cal over`}
            </Text>
          </View>
        </Card>

        {/* AI Coach Card */}
        <TouchableOpacity 
          style={styles.coachCard}
          onPress={() => navigation.navigate(ROUTES.COACH_CHAT)}
          activeOpacity={0.9}
        >
          <View style={styles.coachContent}>
            <Text style={styles.coachIcon}>🤖</Text>
            <View style={styles.coachText}>
              <Text style={styles.coachTitle}>AI Coach</Text>
              <Text style={styles.coachMessage}>
                {getCoachMessage(todayWorkout, todayTotals, todayMetrics)}
              </Text>
            </View>
          </View>
          <Text style={styles.coachArrow}>→</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate(ROUTES.NUTRITION)}
          >
            <Text style={styles.actionIcon}>🍎</Text>
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate(ROUTES.WORKOUTS)}
          >
            <Text style={styles.actionIcon}>💪</Text>
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate(ROUTES.HEALTH_METRICS)}
          >
            <Text style={styles.actionIcon}>💧</Text>
            <Text style={styles.actionText}>Log Water</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Workout */}
        {todayWorkout && (
          <>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            <Card 
              style={styles.workoutCard}
              onPress={() => navigation.navigate(ROUTES.WORKOUTS)}
            >
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutType}>
                  {todayWorkout.workout_type || todayWorkout.type || 'Workout'}
                </Text>
                {todayWorkout.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Done</Text>
                  </View>
                )}
              </View>
              <Text style={styles.workoutName}>
                {todayWorkout.workout_name || todayWorkout.name || 'Training Session'}
              </Text>
              <View style={styles.workoutMeta}>
                <Text style={styles.workoutMetaText}>
                  🕐 {todayWorkout.duration_minutes || todayWorkout.duration || 45} min
                </Text>
                <Text style={styles.workoutMetaText}>
                  🔥 ~{todayWorkout.calories_burned || 300} cal
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Activity Feed</Text>
        <Card style={styles.activityCard}>
          {todayTotals.calories > 0 && (
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>🍽️</Text>
              <Text style={styles.activityText}>
                Logged {formatNumber(todayTotals.calories)} calories today
              </Text>
            </View>
          )}
          {todayMetrics.steps > 0 && (
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>👣</Text>
              <Text style={styles.activityText}>
                {formatNumber(todayMetrics.steps)} steps • {stepsProgress.toFixed(0)}% of goal
              </Text>
            </View>
          )}
          {todayMetrics.waterIntake > 0 && (
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>💧</Text>
              <Text style={styles.activityText}>
                {todayMetrics.waterIntake}ml water intake
              </Text>
            </View>
          )}
          {todayTotals.calories === 0 && todayMetrics.steps === 0 && (
            <Text style={styles.noActivity}>
              Start tracking to see your activity here!
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getCoachMessage = (workout, nutrition, health) => {
  if (workout?.completed) {
    return 'Great job on your workout today! How are you feeling?';
  }
  if (nutrition.calories === 0) {
    return "Ready to crush today? Let's start by logging breakfast!";
  }
  if (health.steps > 5000) {
    return "You're moving great today! Keep up the momentum.";
  }
  return "I'm here to help. Tap to chat about your fitness journey!";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  date: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scoreCard: {
    marginBottom: spacing.lg,
  },
  scoreTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  scoreGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreEmoji: {
    fontSize: 24,
  },
  scoreValue: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  scoreLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  balanceBar: {
    marginTop: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  balanceText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.transparent.primary10,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  coachContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  coachText: {
    flex: 1,
  },
  coachTitle: {
    ...textStyles.bodyBold,
    color: colors.primary[400],
  },
  coachMessage: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  coachArrow: {
    ...textStyles.h3,
    color: colors.primary[500],
  },
  sectionTitle: {
    ...textStyles.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  workoutCard: {
    marginBottom: spacing.xl,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  workoutType: {
    ...textStyles.labelSmall,
    color: colors.primary[500],
  },
  completedBadge: {
    backgroundColor: colors.semantic.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs2,
    borderRadius: borderRadius.sm,
  },
  completedText: {
    ...textStyles.tiny,
    color: colors.semantic.success,
  },
  workoutName: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  workoutMetaText: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  activityCard: {
    marginBottom: spacing.xl,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  activityText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  noActivity: {
    ...textStyles.body,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default DashboardScreen;


