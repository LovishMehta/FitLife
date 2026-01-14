/**
 * FatToFit Nutrition Screen
 * Meal tracking and macro management
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
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../theme';
import { formatNumber, calculateProgress } from '../utils/helpers';
import { MEAL_TYPES } from '../utils/constants';
import useAuthStore from '../stores/useAuthStore';
import useNutritionStore from '../stores/useNutritionStore';
import { Card, Button, Input, ProgressRing } from '../components/common';

const NutritionScreen = () => {
  const { user } = useAuthStore();
  const { 
    todayMeals, 
    todayTotals, 
    targets, 
    mealTemplates,
    isLoading,
    fetchTodayMeals, 
    fetchMealTemplates,
    logMeal,
    deleteMeal,
    getRemainingMacros,
  } = useNutritionStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [mealForm, setMealForm] = useState({
    meal_name: '',
    meal_type: 'snack',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchTodayMeals(user.id),
        fetchMealTemplates(user.id),
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogMeal = async () => {
    if (!mealForm.meal_name.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    const result = await logMeal(user.id, {
      meal_name: mealForm.meal_name.trim(),
      meal_type: mealForm.meal_type,
      calories: parseInt(mealForm.calories) || 0,
      protein_g: parseFloat(mealForm.protein_g) || 0,
      carbs_g: parseFloat(mealForm.carbs_g) || 0,
      fat_g: parseFloat(mealForm.fat_g) || 0,
    });

    if (result.success) {
      setModalVisible(false);
      resetForm();
    } else {
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const handleDeleteMeal = (mealId, mealName) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${mealName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMeal(user.id, mealId),
        },
      ]
    );
  };

  const resetForm = () => {
    setMealForm({
      meal_name: '',
      meal_type: 'snack',
      calories: '',
      protein_g: '',
      carbs_g: '',
      fat_g: '',
    });
  };

  const remaining = getRemainingMacros();
  const caloriesProgress = calculateProgress(todayTotals.calories, targets.calories);
  const proteinProgress = calculateProgress(todayTotals.protein, targets.protein);
  const carbsProgress = calculateProgress(todayTotals.carbs, targets.carbs);
  const fatProgress = calculateProgress(todayTotals.fat, targets.fat);

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
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Log Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Calories Overview */}
        <Card style={styles.caloriesCard} variant="elevated">
          <View style={styles.caloriesHeader}>
            <View>
              <Text style={styles.caloriesConsumed}>
                {formatNumber(todayTotals.calories)}
              </Text>
              <Text style={styles.caloriesLabel}>consumed</Text>
            </View>
            
            <ProgressRing
              progress={caloriesProgress}
              size={100}
              strokeWidth={10}
              color={caloriesProgress > 100 ? colors.semantic.error : colors.macros.calories}
            />
            
            <View style={styles.caloriesRight}>
              <Text style={styles.caloriesRemaining}>
                {formatNumber(remaining.calories)}
              </Text>
              <Text style={styles.caloriesLabel}>remaining</Text>
            </View>
          </View>
          
          <View style={styles.caloriesBar}>
            <View style={styles.caloriesBarTrack}>
              <View 
                style={[
                  styles.caloriesBarFill,
                  { width: `${Math.min(caloriesProgress, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.caloriesGoal}>
              Goal: {formatNumber(targets.calories)} cal
            </Text>
          </View>
        </Card>

        {/* Macros */}
        <View style={styles.macrosRow}>
          {/* Protein */}
          <Card style={styles.macroCard}>
            <View style={[styles.macroIndicator, { backgroundColor: colors.macros.protein }]} />
            <Text style={styles.macroValue}>{Math.round(todayTotals.protein)}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
            <View style={styles.macroProgress}>
              <View 
                style={[
                  styles.macroBar,
                  { 
                    width: `${Math.min(proteinProgress, 100)}%`,
                    backgroundColor: colors.macros.protein,
                  }
                ]} 
              />
            </View>
            <Text style={styles.macroGoal}>{targets.protein}g goal</Text>
          </Card>

          {/* Carbs */}
          <Card style={styles.macroCard}>
            <View style={[styles.macroIndicator, { backgroundColor: colors.macros.carbs }]} />
            <Text style={styles.macroValue}>{Math.round(todayTotals.carbs)}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
            <View style={styles.macroProgress}>
              <View 
                style={[
                  styles.macroBar,
                  { 
                    width: `${Math.min(carbsProgress, 100)}%`,
                    backgroundColor: colors.macros.carbs,
                  }
                ]} 
              />
            </View>
            <Text style={styles.macroGoal}>{targets.carbs}g goal</Text>
          </Card>

          {/* Fat */}
          <Card style={styles.macroCard}>
            <View style={[styles.macroIndicator, { backgroundColor: colors.macros.fat }]} />
            <Text style={styles.macroValue}>{Math.round(todayTotals.fat)}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
            <View style={styles.macroProgress}>
              <View 
                style={[
                  styles.macroBar,
                  { 
                    width: `${Math.min(fatProgress, 100)}%`,
                    backgroundColor: colors.macros.fat,
                  }
                ]} 
              />
            </View>
            <Text style={styles.macroGoal}>{targets.fat}g goal</Text>
          </Card>
        </View>

        {/* Meal Timeline */}
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {todayMeals.length > 0 ? (
          todayMeals.map((meal) => (
            <TouchableOpacity 
              key={meal.id}
              style={styles.mealCard}
              onLongPress={() => handleDeleteMeal(meal.id, meal.meal_name)}
            >
              <View style={styles.mealIcon}>
                <Text style={styles.mealEmoji}>
                  {getMealEmoji(meal.meal_type)}
                </Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.meal_name}</Text>
                <Text style={styles.mealMacros}>
                  P: {meal.protein_g}g • C: {meal.carbs_g}g • F: {meal.fat_g}g
                </Text>
              </View>
              <Text style={styles.mealCalories}>{meal.calories} cal</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No meals logged today</Text>
            <Text style={styles.emptyHint}>Tap "+ Log Meal" to get started</Text>
          </Card>
        )}

        {/* Quick Add Templates */}
        {mealTemplates.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.templatesScroll}
            >
              {mealTemplates.slice(0, 5).map((template) => (
                <TouchableOpacity 
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => {
                    setMealForm({
                      meal_name: template.meal_name,
                      meal_type: template.meal_type || 'snack',
                      calories: String(template.calories),
                      protein_g: String(template.protein_g),
                      carbs_g: String(template.carbs_g),
                      fat_g: String(template.fat_g),
                    });
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.templateName}>{template.meal_name}</Text>
                  <Text style={styles.templateCal}>{template.calories} cal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Meal</Text>
            
            {/* Meal Type Selector */}
            <View style={styles.mealTypeRow}>
              {Object.values(MEAL_TYPES).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeBtn,
                    mealForm.meal_type === type && styles.mealTypeBtnActive,
                  ]}
                  onPress={() => setMealForm({ ...mealForm, meal_type: type })}
                >
                  <Text style={styles.mealTypeEmoji}>{getMealEmoji(type)}</Text>
                  <Text style={[
                    styles.mealTypeText,
                    mealForm.meal_type === type && styles.mealTypeTextActive,
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Meal Name"
              value={mealForm.meal_name}
              onChangeText={(text) => setMealForm({ ...mealForm, meal_name: text })}
              placeholder="e.g., Chicken Salad"
            />

            <View style={styles.macroInputRow}>
              <View style={styles.macroInput}>
                <Input
                  label="Calories"
                  value={mealForm.calories}
                  onChangeText={(text) => setMealForm({ ...mealForm, calories: text })}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.macroInput}>
                <Input
                  label="Protein (g)"
                  value={mealForm.protein_g}
                  onChangeText={(text) => setMealForm({ ...mealForm, protein_g: text })}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.macroInputRow}>
              <View style={styles.macroInput}>
                <Input
                  label="Carbs (g)"
                  value={mealForm.carbs_g}
                  onChangeText={(text) => setMealForm({ ...mealForm, carbs_g: text })}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.macroInput}>
                <Input
                  label="Fat (g)"
                  value={mealForm.fat_g}
                  onChangeText={(text) => setMealForm({ ...mealForm, fat_g: text })}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
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
                title="Log Meal"
                onPress={handleLogMeal}
                loading={isLoading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const getMealEmoji = (type) => {
  switch (type) {
    case 'breakfast': return '🍳';
    case 'lunch': return '🥗';
    case 'dinner': return '🍽️';
    case 'snack': return '🍎';
    default: return '🍴';
  }
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
  caloriesCard: {
    marginBottom: spacing.lg,
  },
  caloriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  caloriesConsumed: {
    ...textStyles.displaySmall,
    color: colors.text.primary,
  },
  caloriesRemaining: {
    ...textStyles.h2,
    color: colors.primary[500],
    textAlign: 'right',
  },
  caloriesRight: {
    alignItems: 'flex-end',
  },
  caloriesLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  caloriesBar: {
    alignItems: 'center',
  },
  caloriesBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  caloriesBarFill: {
    height: '100%',
    backgroundColor: colors.macros.calories,
    borderRadius: 4,
  },
  caloriesGoal: {
    ...textStyles.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  macroIndicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  macroValue: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  macroLabel: {
    ...textStyles.tiny,
    color: colors.text.tertiary,
  },
  macroProgress: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surface.border,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 2,
  },
  macroGoal: {
    ...textStyles.tiny,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  mealIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mealEmoji: {
    fontSize: 22,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
  },
  mealMacros: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  mealCalories: {
    ...textStyles.h5,
    color: colors.primary[500],
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
  templatesScroll: {
    marginBottom: spacing.xl,
  },
  templateCard: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    minWidth: 100,
  },
  templateName: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
  },
  templateCal: {
    ...textStyles.caption,
    color: colors.text.tertiary,
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
  mealTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  mealTypeBtn: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.card,
    minWidth: 70,
  },
  mealTypeBtnActive: {
    backgroundColor: colors.transparent.primary20,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  mealTypeEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  mealTypeText: {
    ...textStyles.tiny,
    color: colors.text.secondary,
  },
  mealTypeTextActive: {
    color: colors.primary[400],
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default NutritionScreen;


