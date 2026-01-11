import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import StepCounter from '../components/StepCounter';
import GoalProgress from '../components/GoalProgress';
import WeeklyChart from '../components/WeeklyChart';
import stepService from '../services/stepService';
import storageService from '../services/storageService';

/**
 * HomeScreen - Main dashboard displaying step tracking data
 */
const HomeScreen = () => {
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(10000);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeApp();
    
    return () => {
      stepService.unsubscribe();
    };
  }, []);

  /**
   * Initialize the app - check permissions, load data
   */
  const initializeApp = async () => {
    try {
      // Check if pedometer is available
      const available = await stepService.isAvailable();
      setIsPedometerAvailable(available);

      if (!available) {
        Alert.alert(
          'Step Counter Not Available',
          'Your device does not support step counting or permissions were denied.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Request permissions
      const permissionGranted = await stepService.requestPermissions();
      if (!permissionGranted) {
        Alert.alert(
          'Permission Required',
          'Please enable motion & fitness permissions in your device settings to track steps.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Load user's daily goal
      const savedGoal = await storageService.getDailyGoal();
      setGoal(savedGoal);

      // Get initial step count
      await loadStepData();

      // Subscribe to real-time updates
      stepService.watchStepCount(async (newSteps) => {
        setSteps(newSteps);
        // Save steps periodically
        await storageService.saveTodaySteps(newSteps);
      });

      // Load weekly history
      await loadWeeklyData();

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize step tracking.');
      setIsLoading(false);
    }
  };

  /**
   * Load today's step count
   */
  const loadStepData = async () => {
    try {
      const todaySteps = await stepService.getTodaySteps();
      setSteps(todaySteps);
      await storageService.saveTodaySteps(todaySteps);
    } catch (error) {
      console.error('Error loading step data:', error);
    }
  };

  /**
   * Load weekly step history
   */
  const loadWeeklyData = async () => {
    try {
      const data = await storageService.getLastNDays(7);
      setWeeklyData(data);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadStepData();
    await loadWeeklyData();
    setRefreshing(false);
  };

  if (!isPedometerAvailable && !isLoading) {
    // Demo mode for web/devices without pedometer
    const demoSteps = 7842;
    const demoWeeklyData = [
      { date: 'Mon', dateKey: '2026-01-06', steps: 8234 },
      { date: 'Tue', dateKey: '2026-01-07', steps: 10521 },
      { date: 'Wed', dateKey: '2026-01-08', steps: 9876 },
      { date: 'Thu', dateKey: '2026-01-09', steps: 11234 },
      { date: 'Today', dateKey: '2026-01-10', steps: demoSteps },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Health Tracker</Text>
            <Text style={styles.headerSubtitle}>
              🌐 Demo Mode - Web Preview
            </Text>
            <Text style={styles.demoNote}>
              Install on your phone with Expo Go to track real steps!
            </Text>
          </View>

          <StepCounter steps={demoSteps} isLoading={false} />

          <GoalProgress steps={demoSteps} goal={goal} />

          <WeeklyChart weeklyData={demoWeeklyData} goal={goal} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              📱 To track real steps: Use Expo Go on your phone
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Tracker</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <StepCounter steps={steps} isLoading={isLoading} />

        <GoalProgress steps={steps} goal={goal} />

        <WeeklyChart weeklyData={weeklyData} goal={goal} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pull down to refresh • Data syncs automatically
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  demoNote: {
    fontSize: 12,
    color: '#FFC107',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default HomeScreen;

