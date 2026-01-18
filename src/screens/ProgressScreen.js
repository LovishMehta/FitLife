import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import storageService from '../services/storageService';
import stepService from '../services/stepService';

const { width } = Dimensions.get('window');
const BAR_WIDTH = (width - spacing.padding * 2 - 48) / 7;
const MAX_BAR_HEIGHT = 120;

// Helper functions
const calculateCalories = (steps) => {
  // Rough estimate: 0.04 calories per step
  return Math.round(steps * 0.04);
};

const calculateStreak = (history) => {
  // Calculate consecutive days with steps > 0
  const sortedDates = Object.keys(history).sort().reverse();
  let streak = 0;
  
  for (const dateKey of sortedDates) {
    if (history[dateKey] > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return Math.max(1, streak);
};

const getDayLabel = (dateKey, index) => {
  const date = new Date(dateKey + 'T00:00:00');
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return days[date.getDay()];
};

const formatDateForDisplay = (dateKey) => {
  const date = new Date(dateKey + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateKey === storageService.getTodayKey()) {
    return 'Today';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = storageService.formatDateKey(yesterday);
  if (dateKey === yesterdayKey) {
    return 'Yesterday';
  }
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
};

/**
 * Progress Screen - Daily/Weekly/Monthly progress view with real pedometer data
 */
const ProgressScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [periodData, setPeriodData] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [avgSteps, setAvgSteps] = useState(0);
  const [streak, setStreak] = useState(1);
  const [calories, setCalories] = useState(0);
  const [periodOffset, setPeriodOffset] = useState(0); // For navigating weeks/months
  const [refreshing, setRefreshing] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0); // Today's real-time steps

  useEffect(() => {
    loadPeriodData();
  }, [selectedPeriod, periodOffset]);

  // Set up interval to refresh data from storage (HomeScreen updates storage)
  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      const history = await storageService.getStepHistory();
      const todayKey = storageService.getTodayKey();
      const savedStepsToday = history[todayKey] || 0;
      setCurrentSteps(savedStepsToday);
      await loadPeriodData();
    };
    
    loadData();
    
    // Refresh every 2 seconds to get updates from HomeScreen's pedometer
    const interval = setInterval(() => {
      loadData();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [selectedPeriod, periodOffset]);

  const loadPeriodData = async () => {
    try {
      const history = await storageService.getStepHistory();
      const todayKey = storageService.getTodayKey();
      
      let data = [];
      
      if (selectedPeriod === 'Day') {
        // Show today's data
        const todaySteps = history[todayKey] || currentSteps || 0;
        data = [{
          dateKey: todayKey,
          date: formatDateForDisplay(todayKey),
          steps: todaySteps,
          dayLabel: 'T',
        }];
      } else if (selectedPeriod === 'Week') {
        // Show last 7 days
        const dates = storageService.getLastNDates(7);
        data = dates.map((dateKey, index) => {
          const steps = dateKey === todayKey ? (currentSteps || history[dateKey] || 0) : (history[dateKey] || 0);
          return {
            dateKey,
            date: formatDateForDisplay(dateKey),
            steps,
            dayLabel: getDayLabel(dateKey, index),
          };
        });
      } else if (selectedPeriod === 'Month') {
        // Show last 30 days
        const dates = storageService.getLastNDates(30);
        data = dates.map((dateKey, index) => {
          const steps = dateKey === todayKey ? (currentSteps || history[dateKey] || 0) : (history[dateKey] || 0);
          return {
            dateKey,
            date: formatDateForDisplay(dateKey),
            steps,
            dayLabel: getDayLabel(dateKey, index),
          };
        });
      }
      
      setPeriodData(data);
      
      // Calculate totals and averages
      if (data.length > 0) {
        const total = data.reduce((sum, day) => sum + day.steps, 0);
        const avg = Math.round(total / data.length);
        const totalCalories = calculateCalories(total);
        const currentStreak = calculateStreak(history);
        
        setTotalSteps(total);
        setAvgSteps(avg);
        setCalories(totalCalories);
        setStreak(currentStreak);
      }
    } catch (error) {
      console.error('Error loading period data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPeriodData();
    setRefreshing(false);
  };

  const getMaxSteps = () => {
    if (periodData.length === 0) return 10000;
    const max = Math.max(...periodData.map(d => d.steps));
    return max > 0 ? max : 10000;
  };

  const getBarHeight = (steps) => {
    const maxSteps = getMaxSteps();
    if (maxSteps === 0) return 0;
    return (steps / maxSteps) * MAX_BAR_HEIGHT;
  };

  const isToday = (dateKey) => {
    return dateKey === storageService.getTodayKey();
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setPeriodOffset(0); // Reset offset when changing period
  };

  const handlePreviousPeriod = () => {
    setPeriodOffset(periodOffset - 1);
  };

  const handleNextPeriod = () => {
    if (periodOffset < 0) {
      setPeriodOffset(periodOffset + 1);
    }
  };

  const getPeriodTitle = () => {
    if (selectedPeriod === 'Day') {
      return 'Today';
    } else if (selectedPeriod === 'Week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (periodOffset * 7));
      return periodOffset === 0 ? 'This Week' : `Week of ${formatDateForDisplay(storageService.formatDateKey(startOfWeek))}`;
    } else if (selectedPeriod === 'Month') {
      const now = new Date();
      const month = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return periodOffset === 0 ? 'This Month' : `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
    }
    return '';
  };

  const getGoalForPeriod = () => {
    if (selectedPeriod === 'Day') {
      return 10000; // Daily goal
    } else if (selectedPeriod === 'Week') {
      return 70000; // Weekly goal (7 days * 10k)
    } else if (selectedPeriod === 'Month') {
      return 300000; // Monthly goal (30 days * 10k)
    }
    return 10000;
  };

  const getSummaryTitle = () => {
    if (selectedPeriod === 'Day') {
      return 'Daily Summary';
    } else if (selectedPeriod === 'Week') {
      return 'Weekly Summary';
    } else if (selectedPeriod === 'Month') {
      return 'Monthly Summary';
    }
    return 'Summary';
  };

  // For Month view, show aggregated data (group by week or show all days)
  const displayData = selectedPeriod === 'Month' 
    ? periodData.filter((_, index) => index % Math.ceil(30 / 7) === 0 || index === periodData.length - 1) // Show ~7 data points
    : periodData;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                onPress={() => handlePeriodChange(period)}
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

        {/* Period Navigation */}
        {(selectedPeriod === 'Week' || selectedPeriod === 'Month') && (
          <View style={styles.periodNavigation}>
            <TouchableOpacity onPress={handlePreviousPeriod} style={styles.periodNavButton}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.periodTitle}>
              {getPeriodTitle()}
            </Text>
            <TouchableOpacity 
              onPress={handleNextPeriod} 
              style={[styles.periodNavButton, periodOffset >= 0 && styles.periodNavButtonDisabled]}
              disabled={periodOffset >= 0}
            >
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={periodOffset >= 0 ? colors.border : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Total Steps */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalSteps}>{totalSteps.toLocaleString()}</Text>
          <View style={styles.avgContainer}>
            <Text style={styles.avgText}>
              {selectedPeriod === 'Day' ? 'TODAY' : `AVG ${avgSteps.toLocaleString()}`}
            </Text>
            {selectedPeriod !== 'Day' && (
              <View style={styles.trendIndicator}>
                <Ionicons 
                  name={avgSteps > 5000 ? "arrow-up" : "arrow-down"} 
                  size={14} 
                  color={avgSteps > 5000 ? colors.green : colors.error} 
                />
              </View>
            )}
          </View>
        </View>

        {/* Bar Chart */}
        {selectedPeriod !== 'Day' && (
          <View style={styles.chartContainer}>
            <View style={styles.barsContainer}>
              {displayData.map((day, index) => {
                const isTodayDay = isToday(day.dateKey);
                return (
                  <View key={day.dateKey} style={styles.barColumn}>
                    <Text style={styles.barValue}>
                      {day.steps >= 1000 ? `${(day.steps / 1000).toFixed(1)}k` : day.steps}
                    </Text>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: getBarHeight(day.steps),
                            backgroundColor: isTodayDay ? colors.green : colors.teal,
                          },
                        ]}
                      />
                    </View>
                    <View style={[styles.dayDot, isTodayDay && styles.dayDotActive]} />
                    <Text style={[styles.dayLabel, isTodayDay && styles.dayLabelActive]}>
                      {selectedPeriod === 'Month' ? day.date.split(' ')[1] : day.dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Day View - Show single day progress */}
        {selectedPeriod === 'Day' && periodData.length > 0 && (
          <View style={styles.dayViewContainer}>
            <View style={styles.dayProgressCard}>
              <Text style={styles.dayProgressLabel}>Today's Progress</Text>
              <View style={styles.dayProgressBar}>
                <View 
                  style={[
                    styles.dayProgressFill, 
                    { width: `${Math.min(100, (periodData[0].steps / getGoalForPeriod()) * 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.dayProgressText}>
                {periodData[0].steps.toLocaleString()} / {getGoalForPeriod().toLocaleString()} steps
              </Text>
            </View>
          </View>
        )}

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

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>{getSummaryTitle()}</Text>
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
                <Text style={styles.summaryLabel}>{selectedPeriod === 'Day' ? 'Goal' : 'Avg/Day'}</Text>
                <Text style={styles.summaryValue}>
                  {selectedPeriod === 'Day' 
                    ? getGoalForPeriod().toLocaleString() 
                    : avgSteps.toLocaleString()}
                </Text>
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
          <Text style={styles.sectionTitle}>
            {selectedPeriod === 'Day' ? 'Daily' : selectedPeriod === 'Week' ? 'Weekly' : 'Monthly'} Goal
          </Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{getGoalForPeriod().toLocaleString()} steps</Text>
              <Text style={styles.goalPercentage}>
                {Math.min(100, Math.round((totalSteps / getGoalForPeriod()) * 100))}%
              </Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View 
                style={[
                  styles.goalProgressFill, 
                  { width: `${Math.min(100, (totalSteps / getGoalForPeriod()) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.goalRemaining}>
              {Math.max(0, getGoalForPeriod() - totalSteps).toLocaleString()} steps remaining
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
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.padding,
    marginBottom: spacing.sm,
  },
  periodNavButton: {
    padding: spacing.sm,
  },
  periodNavButtonDisabled: {
    opacity: 0.5,
  },
  periodTitle: {
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
  dayViewContainer: {
    paddingHorizontal: spacing.padding,
    marginVertical: spacing.lg,
  },
  dayProgressCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.lg,
  },
  dayProgressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  dayProgressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  dayProgressFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 6,
  },
  dayProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
