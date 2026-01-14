/**
 * FatToFit Progress Screen
 * Long-term tracking and analytics
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, textStyles, borderRadius } from '../theme';
import { formatNumber, formatDecimal, getLastNDays } from '../utils/helpers';
import useAuthStore from '../stores/useAuthStore';
import useHealthStore from '../stores/useHealthStore';
import useWorkoutStore from '../stores/useWorkoutStore';
import { supabase } from '../services/supabase';
import { Card, ProgressRing } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');

const ProgressScreen = () => {
  const { user, profile } = useAuthStore();
  const { weeklyData, fetchWeeklyData } = useHealthStore();
  const { getWorkoutStats, getWorkoutStreak } = useWorkoutStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [weightHistory, setWeightHistory] = useState([]);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchWeeklyData(user.id),
        fetchWeightHistory(),
        fetchWorkoutStats(),
        fetchAchievements(),
      ]);
    }
  };

  const fetchWeightHistory = async () => {
    try {
      const { data } = await supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true })
        .limit(30);
      
      setWeightHistory(data || []);
    } catch (error) {
      console.error('Error fetching weight history:', error);
    }
  };

  const fetchWorkoutStats = async () => {
    const stats = await getWorkoutStats(user.id, 30);
    const currentStreak = await getWorkoutStreak(user.id);
    setWorkoutStats(stats);
    setStreak(currentStreak);
  };

  const fetchAchievements = async () => {
    try {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(10);
      
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate weight progress
  const startWeight = profile?.current_weight_kg || weightHistory[0]?.weight_kg;
  const currentWeight = weightHistory.length > 0 
    ? weightHistory[weightHistory.length - 1].weight_kg 
    : profile?.current_weight_kg;
  const goalWeight = profile?.goal_weight_kg;
  const weightLost = startWeight && currentWeight ? startWeight - currentWeight : 0;
  const weightProgress = startWeight && goalWeight 
    ? ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100 
    : 0;

  // Prepare chart data
  const stepsChartData = {
    labels: weeklyData.slice(-7).map(d => d.date.slice(5)),
    datasets: [{
      data: weeklyData.slice(-7).map(d => d.steps || 0),
    }],
  };

  const weightChartData = weightHistory.length > 1 ? {
    labels: weightHistory.slice(-7).map(w => 
      new Date(w.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      data: weightHistory.slice(-7).map(w => w.weight_kg),
    }],
  } : null;

  const chartConfig = {
    backgroundColor: colors.surface.card,
    backgroundGradientFrom: colors.surface.card,
    backgroundGradientTo: colors.surface.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 232, 92, ${opacity})`,
    labelColor: () => colors.text.tertiary,
    propsForLabels: {
      fontSize: 10,
    },
    propsForBackgroundLines: {
      stroke: colors.surface.border,
      strokeDasharray: '',
    },
  };

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
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Your fitness journey</Text>
        </View>

        {/* Weight Progress */}
        <Card style={styles.weightCard} variant="elevated">
          <Text style={styles.cardTitle}>Weight Progress</Text>
          
          <View style={styles.weightStats}>
            <View style={styles.weightStat}>
              <Text style={styles.weightLabel}>Start</Text>
              <Text style={styles.weightValue}>
                {startWeight ? `${formatDecimal(startWeight)} kg` : '--'}
              </Text>
            </View>
            
            <ProgressRing
              progress={Math.min(Math.max(weightProgress, 0), 100)}
              size={100}
              strokeWidth={10}
              color={weightProgress >= 0 ? colors.primary[500] : colors.semantic.warning}
            />
            
            <View style={styles.weightStat}>
              <Text style={styles.weightLabel}>Goal</Text>
              <Text style={styles.weightValue}>
                {goalWeight ? `${formatDecimal(goalWeight)} kg` : '--'}
              </Text>
            </View>
          </View>

          <View style={styles.weightSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {currentWeight ? formatDecimal(currentWeight) : '--'}
              </Text>
              <Text style={styles.summaryLabel}>Current (kg)</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[
                styles.summaryValue,
                weightLost > 0 && styles.summaryValuePositive,
                weightLost < 0 && styles.summaryValueNegative,
              ]}>
                {weightLost > 0 ? '-' : '+'}{formatDecimal(Math.abs(weightLost))}
              </Text>
              <Text style={styles.summaryLabel}>Lost (kg)</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {goalWeight && currentWeight 
                  ? formatDecimal(currentWeight - goalWeight) 
                  : '--'}
              </Text>
              <Text style={styles.summaryLabel}>To Go (kg)</Text>
            </View>
          </View>

          {weightChartData && (
            <LineChart
              data={weightChartData}
              width={screenWidth - spacing.xl * 2 - spacing.lg * 2}
              height={150}
              chartConfig={{
                ...chartConfig,
                decimalPlaces: 1,
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          )}
        </Card>

        {/* Workout Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Workout Stats (30 days)</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏋️</Text>
              <Text style={styles.statValue}>
                {workoutStats?.totalWorkouts || 0}
              </Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>
                {workoutStats?.totalMinutes || 0}
              </Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>
                {formatNumber(workoutStats?.totalCalories || 0)}
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </Card>

        {/* Steps Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Weekly Steps</Text>
          {weeklyData.length > 0 ? (
            <LineChart
              data={stepsChartData}
              width={screenWidth - spacing.xl * 2 - spacing.lg * 2}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
            />
          ) : (
            <Text style={styles.noDataText}>No step data yet</Text>
          )}
        </Card>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>
                  {getAchievementIcon(achievement.achievement_type)}
                </Text>
                <Text style={styles.achievementName}>
                  {achievement.achievement_name}
                </Text>
                <Text style={styles.achievementDate}>
                  {new Date(achievement.achieved_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Card style={styles.emptyAchievements}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>
              Keep going! Your first achievement is coming soon.
            </Text>
          </Card>
        )}

        {/* Motivational Quote */}
        <Card style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>💪</Text>
          <Text style={styles.quoteText}>
            "The only bad workout is the one that didn't happen."
          </Text>
          <Text style={styles.quoteAuthor}>— Keep pushing!</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const getAchievementIcon = (type) => {
  const icons = {
    first_workout: '🎯',
    workout_streak_3: '🔥',
    workout_streak_7: '🔥',
    workout_streak_30: '🌟',
    workouts_10: '💪',
    workouts_25: '🏆',
    workouts_50: '👑',
    weight_lost_5: '⚖️',
    weight_lost_10: '🎉',
    steps_10k: '👣',
    perfect_macro_day: '🥗',
  };
  return icons[type] || '⭐';
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
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  weightCard: {
    marginBottom: spacing.lg,
  },
  weightStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  weightStat: {
    alignItems: 'center',
  },
  weightLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  weightValue: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  weightSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  summaryValuePositive: {
    color: colors.semantic.success,
  },
  summaryValueNegative: {
    color: colors.semantic.error,
  },
  summaryLabel: {
    ...textStyles.tiny,
    color: colors.text.tertiary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surface.border,
  },
  chart: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  statValue: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.tiny,
    color: colors.text.tertiary,
  },
  chartCard: {
    marginBottom: spacing.xl,
  },
  noDataText: {
    ...textStyles.body,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  achievementsScroll: {
    marginBottom: spacing.xl,
  },
  achievementCard: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginRight: spacing.md,
    alignItems: 'center',
    minWidth: 100,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  achievementName: {
    ...textStyles.caption,
    color: colors.text.primary,
    textAlign: 'center',
  },
  achievementDate: {
    ...textStyles.tiny,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  emptyAchievements: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  quoteCard: {
    alignItems: 'center',
    backgroundColor: colors.transparent.primary10,
    borderWidth: 1,
    borderColor: colors.primary[800],
    marginBottom: spacing.xl,
  },
  quoteIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  quoteText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  quoteAuthor: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
});

export default ProgressScreen;


