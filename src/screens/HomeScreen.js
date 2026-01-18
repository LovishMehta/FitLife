import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Constants from 'expo-constants';

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
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(10000);
  const [calories, setCalories] = useState(450);
  const [waterIntake, setWaterIntake] = useState(2.5);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stepCounterStatus, setStepCounterStatus] = useState('initializing');
  const [permissionStatus, setPermissionStatus] = useState('checking'); // 'checking', 'granted', 'denied'
  const [isExpoGo, setIsExpoGo] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const appState = useRef(AppState.currentState);
  const stepsWhenBackgrounded = useRef(0);

  useEffect(() => {
    // Check if running in Expo Go
    const expoGo = Constants.executionEnvironment === 'storeClient';
    setIsExpoGo(expoGo);
    if (expoGo) {
      console.log('📱 Running in Expo Go - permissions must be granted to Expo Go app');
    }
    
    // Initialize on mount
    initializeApp();
    
    // Check if it's a new day and reset if needed
    const checkNewDay = async () => {
      try {
        const lastSaveDate = await storageService.getStepHistory();
        const todayKey = storageService.getTodayKey();
        const lastKey = Object.keys(lastSaveDate).sort().pop();
        
        if (lastKey && lastKey !== todayKey) {
          // New day detected, reset baseline
          stepService.resetBaseline();
        }
      } catch (error) {
        console.error('Error checking new day:', error);
      }
    };
    
    checkNewDay();
    
    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Cleanup only on unmount (app close)
    return () => {
      console.log('📱 HomeScreen unmounting - cleaning up');
      subscription?.remove();
      // Only unsubscribe when component fully unmounts (app closing)
      // Keep subscription active when navigating to other screens
    };
  }, []);

  // Handle app going to background or coming to foreground
  const handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to the foreground - sync with device step count
      console.log('📱 App came to foreground - syncing step count...');
      await syncStepsAfterBackground();
    } else if (
      appState.current === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has gone to the background - save current step count
      console.log('📱 App went to background - saving step count...');
      stepsWhenBackgrounded.current = steps;
      await storageService.saveTodaySteps(steps);
      console.log(`📱 Saved ${steps} steps before going to background`);
    }
    
    appState.current = nextAppState;
  };

  // Sync step count when app returns from background
  const syncStepsAfterBackground = async () => {
    try {
      const available = await stepService.isAvailable();
      if (!available) {
        console.log('📱 Pedometer not available for sync');
        return;
      }

      // Get saved steps from storage (this is what we had when we went to background)
      const history = await storageService.getStepHistory();
      const todayKey = storageService.getTodayKey();
      const savedStepsToday = history[todayKey] || 0;
      
      console.log(`📱 App returned from background`);
      console.log(`📱 Saved steps in storage: ${savedStepsToday}`);
      
      // Reset baseline so stepService can recalculate from current device reading
      stepService.resetBaseline();
      
      // Reinitialize subscription - stepService will handle syncing with device
      // On Android: It reads cumulative steps and calculates difference
      // On iOS: It reads steps since subscription starts
      stepService.watchStepCount(async (newSteps) => {
        console.log(`📱 ✅ Synced step count after background:`, newSteps);
        setStepCounterStatus('tracking');
        setPermissionStatus('granted');
        
        if (newSteps >= 0) {
          // Use the higher value (device reading vs saved)
          // This ensures we don't lose steps taken while in background
          const finalSteps = Math.max(newSteps, savedStepsToday);
          setSteps(finalSteps);
          await storageService.saveTodaySteps(finalSteps);
          
          if (finalSteps > savedStepsToday) {
            console.log(`📱 ✅ Captured ${finalSteps - savedStepsToday} steps taken while in background`);
          }
        }
      }, savedStepsToday);
      
    } catch (error) {
      console.error('📱 Error syncing steps after background:', error);
      // Fallback: reinitialize with saved steps
      const history = await storageService.getStepHistory();
      const todayKey = storageService.getTodayKey();
      const savedStepsToday = history[todayKey] || 0;
      stepService.watchStepCount(async (newSteps) => {
        setStepCounterStatus('tracking');
        if (newSteps >= 0) {
          setSteps(newSteps);
          await storageService.saveTodaySteps(newSteps);
        }
      }, savedStepsToday);
    }
  };

  // Reinitialize when screen comes into focus to ensure pedometer is active
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 HomeScreen focused - ensuring pedometer is active...');
      // Reinitialize to ensure subscription is active
      // stepService.watchStepCount will replace any existing subscription safely
      const reinitPedometer = async () => {
        try {
          const available = await stepService.isAvailable();
          if (available) {
            const history = await storageService.getStepHistory();
            const todayKey = storageService.getTodayKey();
            const savedStepsToday = history[todayKey] || 0;
            
            // Get current steps from state or storage
            const currentStepsValue = steps || savedStepsToday;
            
            // Reinitialize subscription (will replace old one if exists)
            stepService.watchStepCount(async (newSteps) => {
              console.log(`📱 ✅ Real-time step count update:`, newSteps);
              setStepCounterStatus('tracking');
              setPermissionStatus('granted');
              if (newSteps >= 0) {
                setSteps(newSteps);
                await storageService.saveTodaySteps(newSteps);
                if (newSteps > 0) {
                  await userService.incrementActiveDays();
                }
              }
            }, currentStepsValue);
          }
        } catch (error) {
          console.error('Error reinitializing pedometer:', error);
        }
      };
      reinitPedometer();
    }, [steps])
  );

  const initializeApp = async () => {
    try {
      // Load saved goal first
      const savedGoal = await storageService.getDailyGoal();
      setGoal(savedGoal);
      
      // Clear any dummy values (8234) from storage
      const savedSteps = await storageService.getStepHistory();
      const todayKey = storageService.getTodayKey();
      if (savedSteps[todayKey] === 8234) {
        // Remove the dummy value by saving 0
        await storageService.saveTodaySteps(0);
        setSteps(0); // Reset to 0
        console.log('Cleared dummy step value (8234) from storage');
      }
      
      // Don't load from storage initially - wait for real step count
      // This prevents loading dummy/cached values
      // We'll only use storage as fallback if pedometer is unavailable

      const available = await stepService.isAvailable();
      setIsPedometerAvailable(available);

      if (available) {
        // Get saved steps for today to use as baseline
        const savedSteps = await storageService.getStepHistory();
        const todayKey = storageService.getTodayKey();
        const savedStepsToday = savedSteps[todayKey] && savedSteps[todayKey] !== 8234 ? savedSteps[todayKey] : 0;
        
        console.log(`📱 Platform: ${Platform.OS}`);
        console.log('📱 Pedometer available:', available);
        console.log('📱 Saved steps for today:', savedStepsToday);
        
        setPermissionStatus('checking');
        // Small delay to ensure UI updates before showing permission dialog
        await new Promise(resolve => setTimeout(resolve, 500));
        const permissionGranted = await stepService.requestPermissions();
        console.log('📱 Permissions granted:', permissionGranted);
        
        if (permissionGranted) {
          setPermissionStatus('granted');
          setStepCounterStatus('active');
          // Show success banner temporarily
          setShowSuccessBanner(true);
          // Hide banner after 5 seconds
          setTimeout(() => {
            setShowSuccessBanner(false);
          }, 5000);
          // Start watching step count with saved steps as baseline
          // This will give real-time updates
          console.log('📱 Starting step count watcher...');
          
          let hasReceivedUpdate = false;
          stepService.watchStepCount(async (newSteps) => {
            // newSteps will be the actual step count from the device
            hasReceivedUpdate = true;
            console.log(`📱 ✅ Real-time step count update:`, newSteps);
            setStepCounterStatus('tracking');
            
            if (newSteps >= 0) {
              setSteps(newSteps);
              await storageService.saveTodaySteps(newSteps);
              if (newSteps > 0) {
                await userService.incrementActiveDays();
              }
            }
          }, savedStepsToday);
          
          // Give it a moment to start, then check if we're getting updates
          setTimeout(() => {
            if (!hasReceivedUpdate) {
              setStepCounterStatus('waiting');
              console.log('📱 ⚠️ Step count not updating. Make sure to:');
              console.log('   1. Grant motion/fitness permissions in device settings');
              console.log('   2. Walk a few steps');
              console.log('   3. Check device has step counter sensor');
              if (Platform.OS === 'android') {
                console.log('   4. On Android, ensure ACTIVITY_RECOGNITION permission is granted');
              }
            }
          }, 5000);

          // Try to get today's steps from date range (works on iOS)
          // On Android, this will return 0, but watchStepCount will handle it
          try {
            const todaySteps = await stepService.getTodaySteps();
            console.log('Today steps from date range:', todaySteps);
            if (todaySteps > 0) {
              setSteps(todaySteps);
              await storageService.saveTodaySteps(todaySteps);
            }
          } catch (error) {
            console.log('Date range query not available (Android limitation), using watchStepCount');
          }
        } else {
          setPermissionStatus('denied');
          console.log('Permissions not granted, loading from storage');
          // Load from storage if permissions not granted, but skip dummy values
          const savedSteps = await storageService.getStepHistory();
          const todayKey = storageService.getTodayKey();
          const savedValue = savedSteps[todayKey];
          // Only use saved value if it's not the dummy number (8234)
          if (savedValue && savedValue !== 8234) {
            setSteps(savedValue);
          }
        }
      } else {
        // If pedometer not available, try to load from storage (but skip dummy values)
        const savedSteps = await storageService.getStepHistory();
        const todayKey = storageService.getTodayKey();
        const savedValue = savedSteps[todayKey];
        // Only use saved value if it's not the dummy number (8234)
        if (savedValue && savedValue !== 8234) {
          setSteps(savedValue);
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
      // Try to get today's steps from service (works on iOS)
      const todaySteps = await stepService.getTodaySteps();
      if (todaySteps > 0) {
        setSteps(todaySteps);
        await storageService.saveTodaySteps(todaySteps);
      } else {
        // If service returns 0, try to load from storage (but skip dummy values)
        const savedSteps = await storageService.getStepHistory();
        const todayKey = storageService.getTodayKey();
        const savedValue = savedSteps[todayKey];
        // Only use saved value if it's not the dummy number (8234)
        if (savedValue && savedValue > 0 && savedValue !== 8234) {
          setSteps(savedValue);
        }
      }
    } catch (error) {
      console.error('Error loading step data:', error);
      // Try to load from storage as fallback (but skip dummy values)
      try {
        const savedSteps = await storageService.getStepHistory();
        const todayKey = storageService.getTodayKey();
        const savedValue = savedSteps[todayKey];
        // Only use saved value if it's not the dummy number (8234)
        if (savedValue && savedValue !== 8234) {
          setSteps(savedValue);
        }
      } catch (storageError) {
        console.error('Error loading from storage:', storageError);
      }
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

  const handleOpenSettings = async () => {
    try {
      if (Platform.OS === 'android') {
        if (isExpoGo) {
          // For Expo Go, show instructions to open Expo Go settings
          Alert.alert(
            'Open Expo Go Settings',
            'Since you\'re using Expo Go:\n\n1. Go to Settings\n2. Apps → Manage Apps\n3. Find "Expo Go" (not FitLife)\n4. Tap Permissions\n5. Enable "Physical Activity" or "Activity Recognition"\n6. Return here and tap "Retry"',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: async () => {
                  try {
                    await Linking.openSettings();
                  } catch (e) {
                    // Settings opened
                  }
                }
              }
            ]
          );
        } else {
          // Try to open app-specific settings first (works on most Android devices)
          try {
            await Linking.openURL('app-settings:');
          } catch (e) {
            // Fallback to general settings
            await Linking.openSettings();
          }
        }
      } else {
        await Linking.openURL('app-settings:');
      }
    } catch (error) {
      Alert.alert(
        'Open Settings Manually',
        isExpoGo 
          ? 'For Poco F6 + Expo Go:\n\n1. Go to Settings\n2. Apps → Manage Apps\n3. Find "Expo Go"\n4. Tap Permissions\n5. Enable "Physical Activity"\n\nThen return to the app.'
          : 'For Poco F6:\n\n1. Go to Settings\n2. Apps → Manage Apps\n3. Find "FitLife"\n4. Tap Permissions\n5. Enable "Physical Activity" or "Activity Recognition"\n\nThen return to the app.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRetryPermission = async () => {
    setPermissionStatus('checking');
    // Show alert to guide user
    Alert.alert(
      'Permission Request',
      'A permission dialog will appear asking for "Physical Activity" or "Activity Recognition" access. Please tap "Allow" or "OK" to enable step tracking.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setPermissionStatus('denied'),
        },
        {
          text: 'Request Permission',
          onPress: async () => {
            const permissionGranted = await stepService.requestPermissions();
            if (permissionGranted) {
              setPermissionStatus('granted');
              // Show success banner temporarily
              setShowSuccessBanner(true);
              // Hide banner after 5 seconds
              setTimeout(() => {
                setShowSuccessBanner(false);
              }, 5000);
              // Reload the app to restart step tracking
              initializeApp();
            } else {
              setPermissionStatus('denied');
              Alert.alert(
                'Permission Denied',
                'Step tracking requires permission. You can enable it later in Settings.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const percentage = Math.min((steps / goal) * 100, 100);
  const size = 280;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

        {/* Permission Status Banner */}
        {permissionStatus === 'denied' && (
          <View style={styles.permissionBanner}>
            <View style={styles.permissionBannerContent}>
              <Ionicons name="warning-outline" size={20} color={colors.orange} />
              <View style={styles.permissionBannerText}>
                <Text style={styles.permissionBannerTitle}>
                  {isExpoGo ? 'Grant Permission to Expo Go' : 'Step Tracking Disabled'}
                </Text>
                <Text style={styles.permissionBannerMessage}>
                  {isExpoGo 
                    ? 'Since you\'re using Expo Go, you need to grant "Physical Activity" permission to the Expo Go app (not FitLife). Follow the steps below.'
                    : 'Enable Activity Recognition permission to track your steps in real-time.'}
                </Text>
              </View>
            </View>
            {isExpoGo && (
              <View style={styles.permissionInstructions}>
                <Text style={styles.permissionInstructionsTitle}>⚠️ Expo Go Limitation</Text>
                <Text style={styles.permissionInstructionsText}>
                  Expo Go does NOT include "Physical Activity" permission in its manifest. This permission cannot be granted to Expo Go.{'\n\n'}
                  <Text style={{ fontWeight: 'bold' }}>Solution: Create a Development Build</Text>{'\n\n'}
                  1. Install EAS CLI: npm install -g eas-cli{'\n'}
                  2. Login: eas login{'\n'}
                  3. Build: eas build --profile development --platform android{'\n'}
                  4. Install the APK on your Poco F6{'\n'}
                  5. Open the app - permission dialog will appear!
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleOpenSettings}
            >
              <Ionicons name="settings-outline" size={18} color={colors.background} style={{ marginRight: 8 }} />
              <Text style={styles.permissionButtonText}>
                {isExpoGo ? 'Open Settings (for Expo Go)' : 'Open Settings'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.permissionRetryButton}
              onPress={handleRetryPermission}
            >
              <Text style={styles.permissionRetryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {permissionStatus === 'checking' && (
          <View style={styles.permissionBanner}>
            <View style={styles.permissionBannerContent}>
              <Ionicons name="information-circle" size={20} color={colors.teal} />
              <View style={styles.permissionBannerText}>
                <Text style={styles.permissionBannerTitle}>
                  {isExpoGo ? '⚠️ Expo Go Limitation' : 'Permission Request'}
                </Text>
                <Text style={styles.permissionBannerMessage}>
                  {isExpoGo 
                    ? 'Expo Go does NOT include "Physical Activity" permission. This permission is not available in Expo Go. You need to create a development build to use step tracking.'
                    : Platform.OS === 'android' 
                      ? 'Look for a popup dialog asking for "Physical Activity" or "Activity Recognition" permission. Tap "Allow" or "OK" to enable step tracking.'
                      : 'A permission dialog should appear. Tap "Allow" to enable step tracking.'}
                </Text>
              </View>
            </View>
            {isExpoGo && (
              <View style={styles.permissionInstructions}>
                <Text style={styles.permissionInstructionsTitle}>🔧 Solution: Create Development Build</Text>
                <Text style={styles.permissionInstructionsText}>
                  Expo Go has limited permissions. To use step tracking:{'\n\n'}
                  Option 1: Create EAS Build (Recommended){'\n'}
                  1. Install: npm install -g eas-cli{'\n'}
                  2. Login: eas login{'\n'}
                  3. Build: eas build --profile development --platform android{'\n'}
                  4. Install the APK on your phone{'\n\n'}
                  Option 2: Try anyway (may work on some devices){'\n'}
                  Tap "Try Step Tracking" below - sometimes it works without explicit permission.
                </Text>
              </View>
            )}
            {!isExpoGo && (
              <View style={styles.permissionInstructions}>
                <Text style={styles.permissionInstructionsTitle}>How to accept:</Text>
                <Text style={styles.permissionInstructionsText}>
                  1. Look for a popup dialog on your screen{'\n'}
                  2. Tap "Allow", "OK", or "Grant" button{'\n'}
                  3. If no dialog appears, tap "Request Permission" below
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRetryPermission}
            >
              <Ionicons name="lock-open-outline" size={18} color={colors.background} style={{ marginRight: 8 }} />
              <Text style={styles.permissionButtonText}>
                {isExpoGo ? 'Try Step Tracking Anyway' : 'Request Permission'}
              </Text>
            </TouchableOpacity>
            {isExpoGo && (
              <TouchableOpacity
                style={styles.permissionRetryButton}
                onPress={() => {
                  Alert.alert(
                    'Create Development Build',
                    'To enable step tracking, create a development build:\n\n1. Run: npm install -g eas-cli\n2. Run: eas login\n3. Run: eas build --profile development --platform android\n4. Install the APK on your phone\n\nThis will include all required permissions.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.permissionRetryButtonText}>📱 Learn About EAS Build</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {permissionStatus === 'granted' && stepCounterStatus === 'tracking' && showSuccessBanner && (
          <View style={[styles.permissionBanner, styles.permissionBannerSuccess]}>
            <View style={styles.permissionBannerContent}>
              <Ionicons name="checkmark-circle" size={20} color={colors.green} />
              <Text style={styles.permissionBannerMessage}>
                Step tracking active - walk to see your steps update!
              </Text>
              <TouchableOpacity
                onPress={() => setShowSuccessBanner(false)}
                style={styles.dismissButton}
              >
                <Ionicons name="close" size={18} color={colors.green} />
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  permissionBanner: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
  },
  permissionBannerSuccess: {
    borderLeftColor: colors.green,
  },
  permissionBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  permissionBannerText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  permissionBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  permissionBannerMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  permissionButton: {
    backgroundColor: colors.teal,
    borderRadius: spacing.radius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  permissionButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  permissionRetryButton: {
    backgroundColor: 'transparent',
    borderRadius: spacing.radius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  permissionRetryButtonText: {
    color: colors.teal,
    fontSize: 14,
    fontWeight: '600',
  },
  permissionInstructions: {
    backgroundColor: colors.background,
    borderRadius: spacing.radius,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  permissionInstructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  permissionInstructionsText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dismissButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});

export default HomeScreen;
