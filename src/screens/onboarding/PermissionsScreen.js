/**
 * FatToFit Permissions Screen
 * Request health data and notification permissions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { ROUTES } from '../../utils/constants';
import { Button } from '../../components/common';

const PermissionsScreen = ({ navigation, route }) => {
  const [healthPermission, setHealthPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  const requestHealthPermission = async () => {
    // In a real app, this would request HealthKit permissions
    // For now, we'll simulate it
    Alert.alert(
      'Health Data Access',
      'FatToFit would like to access your health data to track steps, calories, heart rate, and workouts.',
      [
        { text: 'Deny', style: 'cancel' },
        { 
          text: 'Allow', 
          onPress: () => setHealthPermission(true) 
        },
      ]
    );
  };

  const requestNotificationPermission = async () => {
    // In a real app, this would request notification permissions
    Alert.alert(
      'Enable Notifications',
      'Get daily coaching prompts, workout reminders, and milestone celebrations.',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => setNotificationPermission(true) 
        },
      ]
    );
  };

  const handleContinue = () => {
    navigation.navigate(ROUTES.API_SETUP, {
      ...route.params,
      healthPermissionGranted: healthPermission,
      notificationPermissionGranted: notificationPermission,
    });
  };

  const handleSkip = () => {
    navigation.navigate(ROUTES.API_SETUP, {
      ...route.params,
      healthPermissionGranted: false,
      notificationPermissionGranted: false,
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
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Enable Permissions</Text>
        <Text style={styles.subtitle}>
          These permissions help us provide personalized coaching
        </Text>

        {/* Permission Cards */}
        <View style={styles.permissions}>
          {/* Health Data */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionIcon}>❤️</Text>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>
                  {Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'}
                </Text>
                <Text style={styles.permissionDesc}>
                  Steps, calories, heart rate, workouts
                </Text>
              </View>
            </View>
            
            {healthPermission ? (
              <View style={styles.permissionEnabled}>
                <Text style={styles.permissionEnabledText}>✓ Enabled</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestHealthPermission}
              >
                <Text style={styles.permissionButtonText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionIcon}>🔔</Text>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Notifications</Text>
                <Text style={styles.permissionDesc}>
                  Coaching prompts & reminders
                </Text>
              </View>
            </View>
            
            {notificationPermission ? (
              <View style={styles.permissionEnabled}>
                <Text style={styles.permissionEnabledText}>✓ Enabled</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestNotificationPermission}
              >
                <Text style={styles.permissionButtonText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 Your data stays private. We never share or sell your health information.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
        <Button
          title="Continue"
          onPress={handleContinue}
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
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl2,
  },
  permissions: {
    width: '100%',
    gap: spacing.md,
  },
  permissionCard: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  permissionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
  },
  permissionDesc: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  permissionButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  permissionEnabled: {
    backgroundColor: colors.semantic.successBg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  permissionEnabledText: {
    ...textStyles.buttonSmall,
    color: colors.semantic.success,
  },
  privacyNote: {
    marginTop: spacing.xl2,
    padding: spacing.base,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  privacyText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.md,
  },
  skipButton: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  skipText: {
    ...textStyles.button,
    color: colors.text.secondary,
  },
  continueButton: {
    flex: 1,
  },
});

export default PermissionsScreen;


