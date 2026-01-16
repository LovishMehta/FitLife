import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import storageService from '../services/storageService';

const { width } = Dimensions.get('window');
const BAR_WIDTH = (width - spacing.padding * 2 - 48) / 7;
const MAX_BAR_HEIGHT = 120;

/**
 * Progress Screen - Weekly/Monthly progress view with bar chart
 */
const ProgressScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [avgSteps, setAvgSteps] = useState(0);
  const [streak, setStreak] = useState(1);
  const [calories, setCalories] = useState(104);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadWeeklyData();
  }, [weekOffset]);

  const loadWeeklyData = async () => {
    const data = await storageService.getLastNDays(7);
    
    // Generate mock data if no real data exists
    const processedData = data.map((day, index) => {
      const mockSteps = day.steps || Math.floor(Math.random() * 8000) + 2000;
      return {
        ...day,
        steps: mockSteps,
        dayLabel: getDayLabel(index),
      };
    });
    
    setWeeklyData(processedData);
    
    if (processedData.length > 0) {
      const total = processedData.reduce((sum, day) => sum + day.steps, 0);
      const avg = Math.round(total / processedData.length);
      setTotalSteps(total);
      setAvgSteps(avg);
    }
  };

  const getDayLabel = (index) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    const dayIndex = (today - 6 + index + 7) % 7;
    return days[dayIndex];
  };

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7) + weekOffset;
  };

  const getMaxSteps = () => {
    if (weeklyData.length === 0) return 10000;
    return Math.max(...weeklyData.map(d => d.steps), 10000);
  };

  const getBarHeight = (steps) => {
    const maxSteps = getMaxSteps();
    return (steps / maxSteps) * MAX_BAR_HEIGHT;
  };

  const isToday = (index) => {
    return index === weeklyData.length - 1;
  };

  const handlePreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(weekOffset + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.periodSelector}>
            {['Day', 'Week', 'Month'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>A</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={handlePreviousWeek} style={styles.weekNavButton}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.weekTitle}>
            {getCurrentWeekNumber()} • {weekOffset === 0 ? 'This Week' : `Week ${getCurrentWeekNumber()}`}
          </Text>
          <TouchableOpacity 
            onPress={handleNextWeek} 
            style={[styles.weekNavButton, weekOffset >= 0 && styles.weekNavButtonDisabled]}
            disabled={weekOffset >= 0}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={weekOffset >= 0 ? colors.border : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Total Steps */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalSteps}>{totalSteps.toLocaleString()}</Text>
          <View style={styles.avgContainer}>
            <Text style={styles.avgText}>AVG {avgSteps.toLocaleString()}</Text>
            <View style={styles.trendIndicator}>
              <Ionicons 
                name={avgSteps > 5000 ? "arrow-up" : "arrow-down"} 
                size={14} 
                color={avgSteps > 5000 ? colors.green : colors.error} 
              />
            </View>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.barsContainer}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValue}>
                  {day.steps >= 1000 ? `${(day.steps / 1000).toFixed(1)}k` : day.steps}
                </Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: getBarHeight(day.steps),
                        backgroundColor: isToday(index) ? colors.green : colors.teal,
                      },
                    ]}
                  />
                </View>
                <View style={[styles.dayDot, isToday(index) && styles.dayDotActive]} />
                <Text style={[styles.dayLabel, isToday(index) && styles.dayLabelActive]}>
                  {day.dayLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame" size={24} color={colors.error} />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="heart" size={24} color="#E91E63" />
            </View>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>kcal Burned</Text>
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="footsteps" size={20} color={colors.teal} />
                <Text style={styles.summaryLabel}>Total Steps</Text>
                <Text style={styles.summaryValue}>{totalSteps.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="speedometer" size={20} color={colors.green} />
                <Text style={styles.summaryLabel}>Avg/Day</Text>
                <Text style={styles.summaryValue}>{avgSteps.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="location" size={20} color={colors.info} />
                <Text style={styles.summaryLabel}>Distance</Text>
                <Text style={styles.summaryValue}>{((totalSteps * 0.762) / 1000).toFixed(1)} km</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="time" size={20} color={colors.yellow} />
                <Text style={styles.summaryLabel}>Active Time</Text>
                <Text style={styles.summaryValue}>{Math.round(totalSteps / 100)} min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Goal Progress */}
        <View style={styles.goalSection}>
          <Text style={styles.sectionTitle}>Weekly Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>70,000 steps</Text>
              <Text style={styles.goalPercentage}>
                {Math.min(100, Math.round((totalSteps / 70000) * 100))}%
              </Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View 
                style={[
                  styles.goalProgressFill, 
                  { width: `${Math.min(100, (totalSteps / 70000) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.goalRemaining}>
              {Math.max(0, 70000 - totalSteps).toLocaleString()} steps remaining
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.padding,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  headerButton: {
    padding: spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusSmall + 4,
    padding: 3,
  },
  periodButton: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusSmall,
  },
  periodButtonActive: {
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  periodTextActive: {
    color: colors.green,
    fontWeight: '600',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.padding,
    marginBottom: spacing.sm,
  },
  weekNavButton: {
    padding: spacing.sm,
  },
  weekNavButtonDisabled: {
    opacity: 0.5,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
  },
  totalContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  totalSteps: {
    fontSize: 52,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  avgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  avgText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trendIndicator: {
    marginLeft: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    paddingHorizontal: spacing.padding,
    marginVertical: spacing.lg,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: MAX_BAR_HEIGHT + 60,
  },
  barColumn: {
    alignItems: 'center',
    width: BAR_WIDTH,
  },
  barValue: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  barWrapper: {
    width: BAR_WIDTH - 8,
    height: MAX_BAR_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: BAR_WIDTH - 16,
    borderRadius: 6,
    minHeight: 4,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  dayDotActive: {
    backgroundColor: colors.green,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  dayLabelActive: {
    color: colors.green,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.padding,
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: spacing.radius,
    minWidth: 130,
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summarySection: {
    paddingHorizontal: spacing.padding,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  goalSection: {
    paddingHorizontal: spacing.padding,
    marginTop: spacing.lg,
  },
  goalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.green,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 4,
  },
  goalRemaining: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default ProgressScreen;
