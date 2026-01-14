import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

import AICoachCard from '../components/AICoachCard';
import MetricsCard from '../components/MetricsCard';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import stepService from '../services/stepService';
import storageService from '../services/storageService';
import userService from '../services/userService';

/**
 * HomeScreen - Main dashboard matching FitLife design
 */
const HomeScreen = ({ navigation }) => {
  const [steps, setSteps] = useState(8234);
  const [goal, setGoal] = useState(10000);
  const [calories, setCalories] = useState(450);
  const [waterIntake, setWaterIntake] = useState(2.5);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeApp();
    
    return () => {
      stepService.unsubscribe();
    };
  }, []);

  const initializeApp = async () => {
    try {
      const available = await stepService.isAvailable();
      setIsPedometerAvailable(available);

      if (available) {
        const permissionGranted = await stepService.requestPermissions();
        if (permissionGranted) {
          const savedGoal = await storageService.getDailyGoal();
          setGoal(savedGoal);
          await loadStepData();
          
          stepService.watchStepCount(async (newSteps) => {
            setSteps(newSteps);
            await storageService.saveTodaySteps(newSteps);
            await userService.incrementActiveDays();
          });
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
    }
  };

  const loadStepData = async () => {
    try {
      const todaySteps = await stepService.getTodaySteps();
      setSteps(todaySteps || 8234);
      await storageService.saveTodaySteps(todaySteps || 8234);
    } catch (error) {
      console.error('Error loading step data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStepData();
    setRefreshing(false);
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat');
  };

  const percentage = Math.min((steps / goal) * 100, 100);
  const size = 280;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="leaf" size={24} color={colors.teal} />
              </View>
              <Text style={styles.logoText}>FitLife</Text>
            </View>
            <Text style={styles.progressText}>85% to 10k steps</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="people" size={20} color={colors.teal} />
          </TouchableOpacity>
        </View>

        {/* AI Coach Card */}
        <AICoachCard onPress={handleOpenChat} />

        {/* Daily Steps Goal - Circular Progress */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Your Daily Steps Goal</Text>
          <View style={styles.circularProgress}>
            <Svg width={size} height={size}>
              <Circle
                stroke={colors.border}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <Circle
                stroke={colors.teal}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View style={styles.stepsContent}>
              <View style={styles.footprintIcons}>
                <Ionicons name="footsteps" size={20} color={colors.teal} />
                <Ionicons name="footsteps" size={20} color={colors.teal} />
              </View>
              <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.stepsGoal}>of {goal.toLocaleString()} steps</Text>
            </View>
          </View>
          <Text style={styles.swipeText}>
            Swipe to log exercise <Ionicons name="arrow-forward" size={14} color={colors.green} />
          </Text>
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsRow}>
          <MetricsCard
            title="Calories Burned"
            value={calories}
            unit="kcal"
            icon="flame-outline"
          />
          <MetricsCard
            title="Water Intake"
            value={waterIntake}
            unit="L"
            icon="water-outline"
            progress={waterIntake}
            maxValue={waterGoal}
          />
        </View>

        {/* Exercise Summary */}
        <View style={styles.exerciseSummary}>
          <Text style={styles.exerciseTitle}>Exercise Summary</Text>
          <View style={styles.exerciseButtons}>
            <TouchableOpacity style={styles.exerciseButton}>
              <Ionicons name="footsteps" size={20} color={colors.teal} />
              <Text style={styles.exerciseButtonText}>Walk</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exerciseButton}>
              <Ionicons name="barbell" size={20} color={colors.teal} />
              <Text style={styles.exerciseButtonText}>Weight</Text>
            </TouchableOpacity>
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
    padding: spacing.padding,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.teal,
  },
  progressText: {
    fontSize: 12,
    color: colors.lightGreen,
    marginLeft: spacing.md + spacing.sm,
    marginTop: -spacing.xs,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.green,
    marginBottom: spacing.md,
  },
  circularProgress: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepsContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footprintIcons: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  stepsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.teal,
    marginVertical: spacing.xs,
  },
  stepsGoal: {
    fontSize: 14,
    color: colors.textLight,
  },
  swipeText: {
    fontSize: 14,
    color: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    marginVertical: spacing.md,
  },
  exerciseSummary: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.padding,
    marginTop: spacing.md,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  exerciseButtons: {
    flexDirection: 'row',
  },
  exerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radiusLarge,
    marginRight: spacing.sm,
  },
  exerciseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
});

export default HomeScreen;
