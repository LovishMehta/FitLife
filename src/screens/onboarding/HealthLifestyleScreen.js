/**
 * FatToFit Health & Lifestyle Screen
 * Collect dietary preferences and lifestyle info
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
import { ROUTES, DIETARY_RESTRICTIONS } from '../../utils/constants';
import { Button } from '../../components/common';

const HealthLifestyleScreen = ({ navigation, route }) => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(null);
  const [height, setHeight] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [injuries, setInjuries] = useState('');

  const canContinue = age && gender && height;

  const toggleDiet = (item) => {
    if (dietaryRestrictions.includes(item)) {
      setDietaryRestrictions(dietaryRestrictions.filter((d) => d !== item));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, item]);
    }
  };

  const handleContinue = () => {
    navigation.navigate(ROUTES.PERMISSIONS, {
      ...route.params,
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      dietaryRestrictions,
      injuries: injuries.trim() || null,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Progress */}
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>A bit more about you</Text>
        <Text style={styles.subtitle}>
          This helps us calculate your calorie needs
        </Text>

        {/* Age & Gender */}
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor={colors.text.muted}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={styles.unit}>years</Text>
            </View>
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="175"
                placeholderTextColor={colors.text.muted}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
          </View>
        </View>

        {/* Gender */}
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderRow}>
          {['male', 'female', 'other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderOption,
                gender === g && styles.genderOptionSelected,
              ]}
              onPress={() => setGender(g)}
            >
              <Text style={styles.genderIcon}>
                {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'}
              </Text>
              <Text style={[
                styles.genderText,
                gender === g && styles.genderTextSelected,
              ]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dietary Restrictions */}
        <Text style={styles.sectionTitle}>Dietary preferences (optional)</Text>
        <View style={styles.chipContainer}>
          {DIETARY_RESTRICTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                dietaryRestrictions.includes(item) && styles.chipSelected,
              ]}
              onPress={() => toggleDiet(item)}
            >
              <Text style={[
                styles.chipText,
                dietaryRestrictions.includes(item) && styles.chipTextSelected,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Injuries/Limitations */}
        <Text style={styles.sectionTitle}>Any injuries or limitations?</Text>
        <TextInput
          style={styles.textArea}
          value={injuries}
          onChangeText={setInjuries}
          placeholder="e.g., bad knee, lower back pain, shoulder injury..."
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
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
  sectionTitle: {
    ...textStyles.h5,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
  },
  label: {
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
  input: {
    flex: 1,
    color: colors.text.primary,
    ...textStyles.h4,
  },
  unit: {
    ...textStyles.body,
    color: colors.text.muted,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.transparent.primary10,
  },
  genderIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  genderText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  genderTextSelected: {
    color: colors.primary[400],
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
  textArea: {
    backgroundColor: colors.surface.input,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    color: colors.text.primary,
    ...textStyles.body,
    minHeight: 80,
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

export default HealthLifestyleScreen;


