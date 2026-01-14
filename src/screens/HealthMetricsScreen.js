/**
 * FatToFit Health Metrics Screen
 * View health data from HealthKit and manual entries
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
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../theme';
import { formatNumber, formatDisplayDate } from '../utils/helpers';
import useAuthStore from '../stores/useAuthStore';
import useHealthStore from '../stores/useHealthStore';
import { Card, Button, ProgressRing } from '../components/common';

const HealthMetricsScreen = () => {
  const { user } = useAuthStore();
  const { 
    todayMetrics, 
    weeklyData, 
    goals, 
    isLoading,
    isSyncing,
    lastSyncTime,
    fetchTodayMetrics, 
    fetchWeeklyData,
    logWater,
    logWeight,
  } = useHealthStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [waterAmount, setWaterAmount] = useState('250');
  const [weightValue, setWeightValue] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchTodayMetrics(user.id),
        fetchWeeklyData(user.id),
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogWater = async () => {
    const amount = parseInt(waterAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid water amount');
      return;
    }

    const result = await logWater(user.id, amount);
    if (result.success) {
      setWaterModalVisible(false);
      setWaterAmount('250');
    } else {
      Alert.alert('Error', 'Failed to log water intake');
    }
  };

  const handleLogWeight = async () => {
    const weight = parseFloat(weightValue);
    if (!weight || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight');
      return;
    }

    const result = await logWeight(user.id, weight);
    if (result.success) {
      setWeightModalVisible(false);
      setWeightValue('');
      Alert.alert('Success', 'Weight logged successfully!');
    } else {
      Alert.alert('Error', 'Failed to log weight');
    }
  };

  const waterProgress = (todayMetrics.waterIntake / goals.water) * 100;
  const stepsProgress = (todayMetrics.steps / goals.steps) * 100;

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
          <Text style={styles.title}>Health Metrics</Text>
          <Text style={styles.subtitle}>{formatDisplayDate(new Date())}</Text>
        </View>

        {/* Today's Summary */}
        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.cardTitle}>Today's Summary</Text>
          
          <View style={styles.metricsGrid}>
            {/* Steps */}
            <View style={styles.metricItem}>
              <ProgressRing
                progress={stepsProgress}
                size={100}
                strokeWidth={10}
                color={colors.primary[500]}
              >
                <Text style={styles.metricEmoji}>👣</Text>
              </ProgressRing>
              <Text style={styles.metricValue}>{formatNumber(todayMetrics.steps)}</Text>
              <Text style={styles.metricLabel}>of {formatNumber(goals.steps)} steps</Text>
            </View>

            {/* Calories Burned */}
            <View style={styles.metricItem}>
              <ProgressRing
                progress={Math.min((todayMetrics.caloriesBurned / goals.calories) * 100, 100)}
                size={100}
                strokeWidth={10}
                color={colors.secondary[500]}
              >
                <Text style={styles.metricEmoji}>🔥</Text>
              </ProgressRing>
              <Text style={styles.metricValue}>{formatNumber(todayMetrics.caloriesBurned)}</Text>
              <Text style={styles.metricLabel}>calories burned</Text>
            </View>
          </View>
        </Card>

        {/* Quick Log Actions */}
        <View style={styles.quickLogSection}>
          <TouchableOpacity 
            style={styles.quickLogButton}
            onPress={() => setWaterModalVisible(true)}
          >
            <Text style={styles.quickLogIcon}>💧</Text>
            <View style={styles.quickLogInfo}>
              <Text style={styles.quickLogTitle}>Water Intake</Text>
              <Text style={styles.quickLogValue}>
                {todayMetrics.waterIntake}ml / {goals.water}ml
              </Text>
            </View>
            <View style={styles.quickLogProgress}>
              <View 
                style={[
                  styles.quickLogBar, 
                  { width: `${Math.min(waterProgress, 100)}%` }
                ]} 
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickLogButton}
            onPress={() => setWeightModalVisible(true)}
          >
            <Text style={styles.quickLogIcon}>⚖️</Text>
            <View style={styles.quickLogInfo}>
              <Text style={styles.quickLogTitle}>Log Weight</Text>
              <Text style={styles.quickLogValue}>Track your progress</Text>
            </View>
            <Text style={styles.quickLogArrow}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Metrics */}
        <Text style={styles.sectionTitle}>More Metrics</Text>
        <View style={styles.metricsRow}>
          <Card style={styles.smallMetricCard}>
            <Text style={styles.smallMetricIcon}>❤️</Text>
            <Text style={styles.smallMetricValue}>
              {todayMetrics.heartRate || '--'}
            </Text>
            <Text style={styles.smallMetricLabel}>Heart Rate</Text>
          </Card>

          <Card style={styles.smallMetricCard}>
            <Text style={styles.smallMetricIcon}>😴</Text>
            <Text style={styles.smallMetricValue}>
              {todayMetrics.sleepDuration ? `${todayMetrics.sleepDuration.toFixed(1)}h` : '--'}
            </Text>
            <Text style={styles.smallMetricLabel}>Sleep</Text>
          </Card>

          <Card style={styles.smallMetricCard}>
            <Text style={styles.smallMetricIcon}>📏</Text>
            <Text style={styles.smallMetricValue}>
              {todayMetrics.distance ? `${todayMetrics.distance.toFixed(1)}km` : '--'}
            </Text>
            <Text style={styles.smallMetricLabel}>Distance</Text>
          </Card>
        </View>

        {/* Weekly Overview */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <Card style={styles.weeklyCard}>
          <View style={styles.weekDays}>
            {weeklyData.length > 0 ? weeklyData.map((day, index) => (
              <View key={day.date} style={styles.weekDay}>
                <Text style={styles.weekDayLabel}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(day.date).getDay()]}
                </Text>
                <View 
                  style={[
                    styles.weekDayBar,
                    { 
                      height: Math.max((day.steps / goals.steps) * 60, 4),
                      backgroundColor: day.steps >= goals.steps 
                        ? colors.primary[500] 
                        : colors.surface.border,
                    }
                  ]} 
                />
                <Text style={styles.weekDaySteps}>
                  {Math.round(day.steps / 1000)}k
                </Text>
              </View>
            )) : (
              <Text style={styles.noDataText}>No data yet this week</Text>
            )}
          </View>
        </Card>

        {/* Sync Status */}
        <View style={styles.syncStatus}>
          <Text style={styles.syncText}>
            {isSyncing 
              ? '🔄 Syncing...' 
              : lastSyncTime 
                ? `Last synced: ${new Date(lastSyncTime).toLocaleTimeString()}`
                : 'Pull down to sync'}
          </Text>
        </View>
      </ScrollView>

      {/* Water Modal */}
      <Modal
        visible={waterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWaterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Water Intake</Text>
            
            <View style={styles.quickWaterButtons}>
              {[150, 250, 500, 750].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickWaterBtn,
                    waterAmount === String(amount) && styles.quickWaterBtnActive,
                  ]}
                  onPress={() => setWaterAmount(String(amount))}
                >
                  <Text style={[
                    styles.quickWaterText,
                    waterAmount === String(amount) && styles.quickWaterTextActive,
                  ]}>
                    {amount}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalInput}>
              <TextInput
                style={styles.waterInput}
                value={waterAmount}
                onChangeText={setWaterAmount}
                keyboardType="number-pad"
                placeholder="Amount"
                placeholderTextColor={colors.text.muted}
              />
              <Text style={styles.waterUnit}>ml</Text>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setWaterModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Log Water"
                onPress={handleLogWater}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Weight Modal */}
      <Modal
        visible={weightModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Weight</Text>
            
            <View style={styles.modalInput}>
              <TextInput
                style={styles.waterInput}
                value={weightValue}
                onChangeText={setWeightValue}
                keyboardType="decimal-pad"
                placeholder="Enter weight"
                placeholderTextColor={colors.text.muted}
              />
              <Text style={styles.waterUnit}>kg</Text>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setWeightModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Log Weight"
                onPress={handleLogWeight}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
  summaryCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricEmoji: {
    fontSize: 28,
  },
  metricValue: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  metricLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  quickLogSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  quickLogIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  quickLogInfo: {
    flex: 1,
  },
  quickLogTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
  },
  quickLogValue: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  quickLogProgress: {
    width: 60,
    height: 6,
    backgroundColor: colors.surface.border,
    borderRadius: 3,
  },
  quickLogBar: {
    height: '100%',
    backgroundColor: colors.macros.water,
    borderRadius: 3,
  },
  quickLogArrow: {
    ...textStyles.h2,
    color: colors.primary[500],
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  smallMetricCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  smallMetricIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  smallMetricValue: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  smallMetricLabel: {
    ...textStyles.tiny,
    color: colors.text.tertiary,
  },
  weeklyCard: {
    marginBottom: spacing.lg,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
  },
  weekDay: {
    alignItems: 'center',
    width: 36,
  },
  weekDayLabel: {
    ...textStyles.tiny,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  weekDayBar: {
    width: 24,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  weekDaySteps: {
    ...textStyles.tiny,
    color: colors.text.tertiary,
  },
  noDataText: {
    ...textStyles.body,
    color: colors.text.muted,
    textAlign: 'center',
    flex: 1,
  },
  syncStatus: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  syncText: {
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
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  quickWaterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  quickWaterBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  quickWaterBtnActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  quickWaterText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  quickWaterTextActive: {
    color: colors.text.inverse,
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  waterInput: {
    flex: 1,
    ...textStyles.h3,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  waterUnit: {
    ...textStyles.body,
    color: colors.text.muted,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default HealthMetricsScreen;


