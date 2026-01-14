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
import { LineChart } from 'react-native-chart-kit';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import storageService from '../services/storageService';

/**
 * Progress Screen - Weekly/Monthly progress view
 */
const ProgressScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [avgSteps, setAvgSteps] = useState(0);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    const data = await storageService.getLastNDays(7);
    setWeeklyData(data);
    
    if (data.length > 0) {
      const total = data.reduce((sum, day) => sum + day.steps, 0);
      const avg = Math.round(total / data.length);
      setTotalSteps(total);
      setAvgSteps(avg);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  const chartData = {
    labels: weeklyData.length > 0 ? weeklyData.map(day => day.date.substring(0, 3)) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: weeklyData.length > 0 ? weeklyData.map(day => day.steps) : [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.green,
    },
  };

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  const getDayLabels = () => {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'Day' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('Day')}
            >
              <Text style={[styles.periodText, selectedPeriod === 'Day' && styles.periodTextActive]}>
                Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'Week' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('Week')}
            >
              <Text style={[styles.periodText, selectedPeriod === 'Week' && styles.periodTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'Month' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('Month')}
            >
              <Text style={[styles.periodText, selectedPeriod === 'Month' && styles.periodTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>A</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Week Info */}
        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>{getCurrentWeekNumber()} • This Week</Text>
        </View>

        {/* Total Steps */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalSteps}>{totalSteps.toLocaleString()}</Text>
          <View style={styles.avgContainer}>
            <Text style={styles.avgText}>AVG {avgSteps.toLocaleString()}</Text>
            <Ionicons name="arrow-down" size={16} color={colors.error} style={styles.arrowIcon} />
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.dailyContainer}>
          <View style={styles.dayLabels}>
            {getDayLabels().map((label, index) => (
              <View key={index} style={styles.dayLabel}>
                <Text style={styles.dayLabelText}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.dayValues}>
            {weeklyData.slice(0, 7).map((day, index) => (
              <View key={index} style={styles.dayValue}>
                <Text style={styles.dayValueText}>{day.steps.toLocaleString()}</Text>
                <View style={styles.dayDot} />
              </View>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={24} color={colors.error} />
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={24} color={colors.error} />
            <Text style={styles.statValue}>104</Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          {weeklyData.length > 0 ? (
            <LineChart
              data={chartData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              segments={4}
            />
          ) : (
            <Text style={styles.noDataText}>Start tracking to see your progress</Text>
          )}
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
    padding: spacing.padding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerButton: {
    padding: spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusSmall,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusSmall,
  },
  periodButtonActive: {
    backgroundColor: colors.background,
  },
  periodText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  periodTextActive: {
    color: colors.green,
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
  weekInfo: {
    marginBottom: spacing.md,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  totalSteps: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  avgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avgText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  arrowIcon: {
    marginLeft: spacing.xs,
  },
  dailyContainer: {
    marginVertical: spacing.lg,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabelText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dayValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayValue: {
    flex: 1,
    alignItems: 'center',
  },
  dayValueText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: spacing.radius,
    minWidth: 100,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    marginTop: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.md,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: spacing.radius,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default ProgressScreen;



