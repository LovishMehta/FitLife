/**
 * FatToFit Workouts Screen
 * Workout planning and logging
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
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius, shadows } from '../theme';
import { formatDisplayDate, formatNumber, capitalize } from '../utils/helpers';
import { WORKOUT_TYPES, DAYS_SHORT } from '../utils/constants';
import useAuthStore from '../stores/useAuthStore';
import useWorkoutStore from '../stores/useWorkoutStore';
import { Card, Button, Input } from '../components/common';

const WorkoutsScreen = () => {
  const { user } = useAuthStore();
  const { 
    currentPlan, 
    todayWorkout, 
    weekWorkouts,
    workoutHistory,
    isLoading,
    fetchCurrentPlan,
    fetchTodayWorkout,
    fetchWorkoutHistory,
    logWorkout,
    completeWorkout,
  } = useWorkoutStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    workout_type: 'full_body',
    workout_name: '',
    duration_minutes: '45',
    calories_burned: '',
    perceived_difficulty: 'moderate',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchCurrentPlan(user.id),
        fetchTodayWorkout(user.id),
        fetchWorkoutHistory(user.id),
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartWorkout = () => {
    if (todayWorkout?.isPlanned) {
      // Use the planned workout
      setWorkoutForm({
        workout_type: todayWorkout.type || 'full_body',
        workout_name: todayWorkout.name || '',
        duration_minutes: String(todayWorkout.duration || 45),
        calories_burned: String(todayWorkout.estimatedCalories || ''),
        perceived_difficulty: 'moderate',
      });
    }
    setModalVisible(true);
  };

  const handleLogWorkout = async () => {
    if (!workoutForm.workout_name.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    const result = await logWorkout(user.id, {
      workout_type: workoutForm.workout_type,
      workout_name: workoutForm.workout_name.trim(),
      duration_minutes: parseInt(workoutForm.duration_minutes) || 45,
      calories_burned: parseInt(workoutForm.calories_burned) || 0,
      perceived_difficulty: workoutForm.perceived_difficulty,
      completed: true,
    });

    if (result.success) {
      setModalVisible(false);
      Alert.alert('Great job! 💪', 'Workout logged successfully!');
      resetForm();
    } else {
      Alert.alert('Error', 'Failed to log workout');
    }
  };

  const resetForm = () => {
    setWorkoutForm({
      workout_type: 'full_body',
      workout_name: '',
      duration_minutes: '45',
      calories_burned: '',
      perceived_difficulty: 'moderate',
    });
  };

  const getDayOfWeek = () => {
    return DAYS_SHORT[new Date().getDay()].toLowerCase();
  };

  // Get this week's workout schedule from plan
  const weekSchedule = currentPlan?.plan_json || {};
  const completedThisWeek = weekWorkouts.filter(w => w.completed).length;

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
          <Text style={styles.title}>Workouts</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Log</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Workout Card */}
        <Card style={styles.todayCard} variant="elevated">
          <Text style={styles.todayLabel}>Today's Workout</Text>
          
          {todayWorkout ? (
            <>
              <View style={styles.todayHeader}>
                <Text style={styles.workoutTypeTag}>
                  {getWorkoutEmoji(todayWorkout.workout_type || todayWorkout.type)}
                  {' '}
                  {capitalize(todayWorkout.workout_type || todayWorkout.type || 'Workout')}
                </Text>
                {todayWorkout.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Completed</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.workoutName}>
                {todayWorkout.workout_name || todayWorkout.name || 'Training Session'}
              </Text>
              
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>⏱️</Text>
                  <Text style={styles.metaValue}>
                    {todayWorkout.duration_minutes || todayWorkout.duration || 45} min
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>🔥</Text>
                  <Text style={styles.metaValue}>
                    ~{todayWorkout.calories_burned || todayWorkout.estimatedCalories || 300} cal
                  </Text>
                </View>
              </View>

              {!todayWorkout.completed && (
                <Button
                  title="Start Workout"
                  onPress={handleStartWorkout}
                  fullWidth
                  style={styles.startButton}
                />
              )}
            </>
          ) : (
            <>
              <Text style={styles.restDayText}>😌 Rest Day</Text>
              <Text style={styles.restDayHint}>
                Take it easy! Recovery is just as important as training.
              </Text>
              <Button
                title="Log Workout Anyway"
                variant="outline"
                onPress={() => setModalVisible(true)}
                fullWidth
                style={styles.startButton}
              />
            </>
          )}
        </Card>

        {/* Week Overview */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <Card style={styles.weekCard}>
          <View style={styles.weekProgress}>
            <Text style={styles.weekProgressText}>
              {completedThisWeek} of {Object.keys(weekSchedule).filter(k => weekSchedule[k]).length || 4} workouts
            </Text>
            <View style={styles.weekProgressBar}>
              <View 
                style={[
                  styles.weekProgressFill,
                  { width: `${(completedThisWeek / 4) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.weekDays}>
            {DAYS_SHORT.map((day, index) => {
              const dayKey = day.toLowerCase();
              const hasWorkout = weekSchedule[dayKey];
              const isToday = index === new Date().getDay();
              const isCompleted = weekWorkouts.some(
                w => new Date(w.workout_date).getDay() === index && w.completed
              );

              return (
                <View 
                  key={day} 
                  style={[
                    styles.weekDay,
                    isToday && styles.weekDayToday,
                  ]}
                >
                  <Text style={[
                    styles.weekDayLabel,
                    isToday && styles.weekDayLabelToday,
                  ]}>
                    {day}
                  </Text>
                  <View style={[
                    styles.weekDayDot,
                    hasWorkout && styles.weekDayDotScheduled,
                    isCompleted && styles.weekDayDotCompleted,
                  ]}>
                    {isCompleted && <Text style={styles.weekDayCheck}>✓</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Recent Workouts */}
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {workoutHistory.length > 0 ? (
          workoutHistory.slice(0, 5).map((workout) => (
            <Card key={workout.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>
                  {formatDisplayDate(workout.workout_date, { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                <Text style={styles.historyType}>
                  {getWorkoutEmoji(workout.workout_type)} {capitalize(workout.workout_type)}
                </Text>
              </View>
              <Text style={styles.historyName}>{workout.workout_name}</Text>
              <View style={styles.historyMeta}>
                <Text style={styles.historyMetaText}>
                  {workout.duration_minutes} min
                </Text>
                <Text style={styles.historyMetaText}>•</Text>
                <Text style={styles.historyMetaText}>
                  {workout.calories_burned || 0} cal
                </Text>
                {workout.perceived_difficulty && (
                  <>
                    <Text style={styles.historyMetaText}>•</Text>
                    <Text style={styles.historyMetaText}>
                      {capitalize(workout.perceived_difficulty)}
                    </Text>
                  </>
                )}
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>No workouts logged yet</Text>
            <Text style={styles.emptyHint}>Start your first workout to see history</Text>
          </Card>
        )}
      </ScrollView>

      {/* Log Workout Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Workout</Text>
            
            {/* Workout Type */}
            <Text style={styles.inputLabel}>Workout Type</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
            >
              {Object.values(WORKOUT_TYPES).slice(0, 8).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeBtn,
                    workoutForm.workout_type === type && styles.typeBtnActive,
                  ]}
                  onPress={() => setWorkoutForm({ ...workoutForm, workout_type: type })}
                >
                  <Text style={styles.typeEmoji}>{getWorkoutEmoji(type)}</Text>
                  <Text style={[
                    styles.typeText,
                    workoutForm.workout_type === type && styles.typeTextActive,
                  ]}>
                    {capitalize(type.replace('_', ' '))}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="Workout Name"
              value={workoutForm.workout_name}
              onChangeText={(text) => setWorkoutForm({ ...workoutForm, workout_name: text })}
              placeholder="e.g., Morning Push Day"
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Input
                  label="Duration (min)"
                  value={workoutForm.duration_minutes}
                  onChangeText={(text) => setWorkoutForm({ ...workoutForm, duration_minutes: text })}
                  placeholder="45"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Calories Burned"
                  value={workoutForm.calories_burned}
                  onChangeText={(text) => setWorkoutForm({ ...workoutForm, calories_burned: text })}
                  placeholder="~300"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Difficulty */}
            <Text style={styles.inputLabel}>How did it feel?</Text>
            <View style={styles.difficultyRow}>
              {['easy', 'moderate', 'hard', 'very_hard'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.diffBtn,
                    workoutForm.perceived_difficulty === diff && styles.diffBtnActive,
                  ]}
                  onPress={() => setWorkoutForm({ ...workoutForm, perceived_difficulty: diff })}
                >
                  <Text style={styles.diffEmoji}>
                    {diff === 'easy' ? '😊' : diff === 'moderate' ? '😅' : diff === 'hard' ? '😤' : '🔥'}
                  </Text>
                  <Text style={[
                    styles.diffText,
                    workoutForm.perceived_difficulty === diff && styles.diffTextActive,
                  ]}>
                    {capitalize(diff.replace('_', ' '))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.modalButton}
              />
              <Button
                title="Log Workout"
                onPress={handleLogWorkout}
                loading={isLoading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getWorkoutEmoji = (type) => {
  const emojis = {
    push: '💪',
    pull: '🏋️',
    legs: '🦵',
    upper: '💪',
    lower: '🦵',
    full_body: '🔥',
    cardio: '🏃',
    hiit: '⚡',
    yoga: '🧘',
    stretching: '🤸',
    rest: '😴',
    custom: '✨',
  };
  return emojis[type] || '🏋️';
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
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  todayCard: {
    marginBottom: spacing.xl,
  },
  todayLabel: {
    ...textStyles.labelSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  workoutTypeTag: {
    ...textStyles.bodySmall,
    color: colors.primary[500],
    backgroundColor: colors.transparent.primary10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs2,
    borderRadius: borderRadius.sm,
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
    fontWeight: '600',
  },
  workoutName: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  metaValue: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  startButton: {
    marginTop: spacing.sm,
  },
  restDayText: {
    ...textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  restDayHint: {
    ...textStyles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  weekCard: {
    marginBottom: spacing.xl,
  },
  weekProgress: {
    marginBottom: spacing.lg,
  },
  weekProgressText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  weekProgressBar: {
    height: 6,
    backgroundColor: colors.surface.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  weekProgressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDay: {
    alignItems: 'center',
    padding: spacing.xs,
  },
  weekDayToday: {
    backgroundColor: colors.transparent.primary10,
    borderRadius: borderRadius.md,
  },
  weekDayLabel: {
    ...textStyles.tiny,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  weekDayLabelToday: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  weekDayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayDotScheduled: {
    backgroundColor: colors.surface.borderLight,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  weekDayDotCompleted: {
    backgroundColor: colors.primary[500],
    borderWidth: 0,
  },
  weekDayCheck: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyCard: {
    marginBottom: spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  historyDate: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  historyType: {
    ...textStyles.caption,
    color: colors.primary[500],
  },
  historyName: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  historyMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  historyMetaText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  emptyHint: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.xl2,
    borderTopRightRadius: borderRadius.xl2,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  typeScroll: {
    marginBottom: spacing.lg,
  },
  typeBtn: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.card,
    marginRight: spacing.sm,
    minWidth: 70,
  },
  typeBtnActive: {
    backgroundColor: colors.transparent.primary20,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  typeText: {
    ...textStyles.tiny,
    color: colors.text.secondary,
  },
  typeTextActive: {
    color: colors.primary[400],
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  diffBtn: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.card,
  },
  diffBtnActive: {
    backgroundColor: colors.transparent.primary20,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  diffEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  diffText: {
    ...textStyles.tiny,
    color: colors.text.secondary,
  },
  diffTextActive: {
    color: colors.primary[400],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default WorkoutsScreen;


