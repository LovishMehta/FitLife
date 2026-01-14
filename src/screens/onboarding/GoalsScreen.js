/**
 * FatToFit Goals Screen
 * Set primary fitness goal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { ROUTES, GOAL_TYPES } from '../../utils/constants';
import { Button } from '../../components/common';

const GOALS = [
  {
    id: GOAL_TYPES.WEIGHT_LOSS,
    icon: '🔥',
    title: 'Lose Weight',
    description: 'Burn fat and get leaner',
  },
  {
    id: GOAL_TYPES.MUSCLE_GAIN,
    icon: '💪',
    title: 'Build Muscle',
    description: 'Gain strength and size',
  },
  {
    id: GOAL_TYPES.ENDURANCE,
    icon: '🏃',
    title: 'Improve Endurance',
    description: 'Run faster, train longer',
  },
  {
    id: GOAL_TYPES.GENERAL_HEALTH,
    icon: '❤️',
    title: 'General Health',
    description: 'Feel better overall',
  },
];

const GoalsScreen = ({ navigation, route }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [targetWeeks, setTargetWeeks] = useState('12');

  const canContinue = selectedGoal && currentWeight;

  const handleContinue = () => {
    navigation.navigate(ROUTES.FITNESS_PROFILE, {
      ...route.params,
      primaryGoal: selectedGoal,
      currentWeight: parseFloat(currentWeight),
      goalWeight: goalWeight ? parseFloat(goalWeight) : null,
      targetWeeks: parseInt(targetWeeks) || 12,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Progress */}
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What's your main goal?</Text>
        <Text style={styles.subtitle}>
          This helps us create your personalized plan
        </Text>

        {/* Goal Selection */}
        <View style={styles.goals}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoal === goal.id && styles.goalCardSelected,
              ]}
              onPress={() => setSelectedGoal(goal.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <View style={styles.goalText}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDesc}>{goal.description}</Text>
              </View>
              <View style={[
                styles.radio,
                selectedGoal === goal.id && styles.radioSelected,
              ]}>
                {selectedGoal === goal.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weight inputs */}
        <View style={styles.weightSection}>
          <Text style={styles.sectionTitle}>Your weight</Text>
          
          <View style={styles.weightInputs}>
            <View style={styles.weightField}>
              <Text style={styles.weightLabel}>Current</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.weightInput}
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>
            
            <View style={styles.weightField}>
              <Text style={styles.weightLabel}>Goal (optional)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.weightInput}
                  value={goalWeight}
                  onChangeText={setGoalWeight}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>
          </View>

          {goalWeight && currentWeight && (
            <View style={styles.timelineField}>
              <Text style={styles.weightLabel}>Target timeline</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.weightInput, { flex: 0, width: 60 }]}
                  value={targetWeeks}
                  onChangeText={setTargetWeeks}
                  placeholder="12"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="number-pad"
                />
                <Text style={styles.unit}>weeks</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          style={styles.continueButton}
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
    backgroundColor: colors.surface.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary[500],
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  goals: {
    gap: spacing.md,
    marginBottom: spacing.xl2,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.transparent.primary10,
  },
  goalIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
  },
  goalDesc: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary[500],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
  },
  weightSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  weightInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  weightField: {
    flex: 1,
  },
  timelineField: {
    marginTop: spacing.md,
  },
  weightLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    height: 48,
  },
  weightInput: {
    flex: 1,
    color: colors.text.primary,
    ...textStyles.h4,
  },
  unit: {
    ...textStyles.body,
    color: colors.text.muted,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  backText: {
    ...textStyles.button,
    color: colors.text.secondary,
  },
  continueButton: {
    flex: 1,
  },
});

export default GoalsScreen;


