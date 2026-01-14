/**
 * FatToFit Settings Screen
 * Profile management and app settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../theme';
import { formatDecimal, capitalize } from '../utils/helpers';
import useAuthStore from '../stores/useAuthStore';
import { Card, Button } from '../components/common';

const SettingsScreen = ({ navigation }) => {
  const { user, profile, signOut, updateProfile, isLoading } = useAuthStore();
  
  const [notifications, setNotifications] = useState({
    morning: profile?.notification_morning ?? true,
    evening: profile?.notification_evening ?? true,
    workout: profile?.notification_workout_reminder ?? true,
  });

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleToggleNotification = async (key) => {
    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });
    
    await updateProfile({
      [`notification_${key === 'workout' ? 'workout_reminder' : key}`]: newValue,
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('Contact Support', 'Please contact support@fattofit.app to delete your account.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.full_name || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Summary */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.current_weight_kg 
                  ? formatDecimal(profile.current_weight_kg) 
                  : '--'}
              </Text>
              <Text style={styles.statLabel}>Current (kg)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.goal_weight_kg 
                  ? formatDecimal(profile.goal_weight_kg) 
                  : '--'}
              </Text>
              <Text style={styles.statLabel}>Goal (kg)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.workout_frequency_per_week || '--'}
              </Text>
              <Text style={styles.statLabel}>Workouts/wk</Text>
            </View>
          </View>
        </Card>

        {/* Profile Details */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <Card style={styles.settingsCard}>
          <SettingsRow 
            label="Goal" 
            value={profile?.primary_goal 
              ? capitalize(profile.primary_goal.replace('_', ' ')) 
              : 'Not set'} 
          />
          <SettingsRow 
            label="Experience" 
            value={profile?.fitness_experience 
              ? capitalize(profile.fitness_experience) 
              : 'Not set'} 
          />
          <SettingsRow 
            label="Daily Calories" 
            value={profile?.daily_calorie_target 
              ? `${profile.daily_calorie_target} cal` 
              : 'Not set'} 
          />
          <SettingsRow 
            label="Protein Target" 
            value={profile?.protein_target_g 
              ? `${profile.protein_target_g}g` 
              : 'Not set'} 
            isLast 
          />
        </Card>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Morning Prompt</Text>
              <Text style={styles.settingHint}>Daily motivation at 8 AM</Text>
            </View>
            <Switch
              value={notifications.morning}
              onValueChange={() => handleToggleNotification('morning')}
              trackColor={{ false: colors.surface.border, true: colors.primary[500] }}
              thumbColor={colors.text.primary}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Evening Reflection</Text>
              <Text style={styles.settingHint}>Daily summary at 8 PM</Text>
            </View>
            <Switch
              value={notifications.evening}
              onValueChange={() => handleToggleNotification('evening')}
              trackColor={{ false: colors.surface.border, true: colors.primary[500] }}
              thumbColor={colors.text.primary}
            />
          </View>
          
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View>
              <Text style={styles.settingLabel}>Workout Reminders</Text>
              <Text style={styles.settingHint}>Before scheduled workouts</Text>
            </View>
            <Switch
              value={notifications.workout}
              onValueChange={() => handleToggleNotification('workout')}
              trackColor={{ false: colors.surface.border, true: colors.primary[500] }}
              thumbColor={colors.text.primary}
            />
          </View>
        </Card>

        {/* API Settings */}
        <Text style={styles.sectionTitle}>AI Coach</Text>
        <Card style={styles.settingsCard}>
          <SettingsRow 
            label="OpenAI API" 
            value={profile?.openai_api_key_encrypted ? 'Connected ✓' : 'Not configured'}
            valueStyle={profile?.openai_api_key_encrypted 
              ? { color: colors.semantic.success } 
              : { color: colors.semantic.warning }}
            isLast
          />
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.settingsCard}>
          <SettingsRow label="Version" value="1.0.0" />
          <SettingsRow label="Privacy Policy" value="→" />
          <SettingsRow label="Terms of Service" value="→" isLast />
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            fullWidth
            style={styles.signOutButton}
          />
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with 💪 for your fitness journey
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingsRow = ({ label, value, valueStyle, isLast }) => (
  <View style={[styles.settingsRow, !isLast && styles.settingsRowBorder]}>
    <Text style={styles.settingsLabel}>{label}</Text>
    <Text style={[styles.settingsValue, valueStyle]}>{value}</Text>
  </View>
);

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
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    ...textStyles.body,
    color: colors.primary[500],
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...textStyles.h2,
    color: colors.text.inverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  profileEmail: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  statsCard: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.tiny,
    color: colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surface.border,
  },
  sectionTitle: {
    ...textStyles.h5,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  settingsCard: {
    marginBottom: spacing.md,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  settingsLabel: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  settingsValue: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  settingHint: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  actions: {
    marginTop: spacing.xl2,
    alignItems: 'center',
  },
  signOutButton: {
    marginBottom: spacing.lg,
  },
  deleteButton: {
    padding: spacing.md,
  },
  deleteText: {
    ...textStyles.body,
    color: colors.semantic.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl2,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
});

export default SettingsScreen;


