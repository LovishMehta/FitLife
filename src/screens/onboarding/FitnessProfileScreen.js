/**
 * FatToFit Fitness Profile Screen
 * Collect fitness experience and workout preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { ROUTES, FITNESS_LEVELS, EQUIPMENT_OPTIONS } from '../../utils/constants';
import { Button } from '../../components/common';

const EXPERIENCE_LEVELS = [
  {
    id: FITNESS_LEVELS.BEGINNER,
    icon: '🌱',
    title: 'Beginner',
    description: 'New to fitness or returning after a long break',
  },
  {
    id: FITNESS_LEVELS.INTERMEDIATE,
    icon: '💪',
    title: 'Intermediate',
    description: 'Been training for 1-2 years consistently',
  },
  {
    id: FITNESS_LEVELS.ADVANCED,
    icon: '🏆',
    title: 'Advanced',
    description: '3+ years of consistent training',
  },
];

const WORKOUT_FREQUENCIES = [
  { id: 2, label: '2 days', desc: 'Minimal' },
  { id: 3, label: '3 days', desc: 'Moderate' },
  { id: 4, label: '4 days', desc: 'Regular' },
  { id: 5, label: '5 days', desc: 'Active' },
  { id: 6, label: '6+ days', desc: 'Intense' },
];

const WORKOUT_DURATIONS = [
  { id: 20, label: '20 min' },
  { id: 30, label: '30 min' },
  { id: 45, label: '45 min' },
  { id: 60, label: '60 min' },
  { id: 90, label: '90 min' },
];

const FitnessProfileScreen = ({ navigation, route }) => {
  const [experience, setExperience] = useState(null);
  const [frequency, setFrequency] = useState(4);
  const [duration, setDuration] = useState(45);
  const [equipment, setEquipment] = useState([]);

  const canContinue = experience;

  const toggleEquipment = (item) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleContinue = () => {
    navigation.navigate(ROUTES.HEALTH_LIFESTYLE, {
      ...route.params,
      fitnessExperience: experience,
      workoutFrequency: frequency,
      workoutDuration: duration,
      equipment: equipment,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Progress */}
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
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
        {/* Experience Level */}
        <Text style={styles.title}>Your fitness experience</Text>
        <View style={styles.section}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                experience === level.id && styles.optionCardSelected,
              ]}
              onPress={() => setExperience(level.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>{level.icon}</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{level.title}</Text>
                <Text style={styles.optionDesc}>{level.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workout Frequency */}
        <Text style={styles.sectionTitle}>How often can you work out?</Text>
        <View style={styles.pillContainer}>
          {WORKOUT_FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.pill,
                frequency === f.id && styles.pillSelected,
              ]}
              onPress={() => setFrequency(f.id)}
            >
              <Text style={[
                styles.pillText,
                frequency === f.id && styles.pillTextSelected,
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workout Duration */}
        <Text style={styles.sectionTitle}>Available time per workout?</Text>
        <View style={styles.pillContainer}>
          {WORKOUT_DURATIONS.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[
                styles.pill,
                duration === d.id && styles.pillSelected,
              ]}
              onPress={() => setDuration(d.id)}
            >
              <Text style={[
                styles.pillText,
                duration === d.id && styles.pillTextSelected,
              ]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Equipment */}
        <Text style={styles.sectionTitle}>Available equipment (optional)</Text>
        <View style={styles.chipContainer}>
          {EQUIPMENT_OPTIONS.slice(0, 8).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                equipment.includes(item) && styles.chipSelected,
              ]}
              onPress={() => toggleEquipment(item)}
            >
              <Text style={[
                styles.chipText,
                equipment.includes(item) && styles.chipTextSelected,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
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
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.transparent.primary10,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
  },
  optionDesc: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  pillSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pillText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  pillTextSelected: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  chipSelected: {
    backgroundColor: colors.transparent.primary20,
    borderColor: colors.primary[500],
  },
  chipText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.primary[400],
    fontWeight: '600',
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

export default FitnessProfileScreen;


