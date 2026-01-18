import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import userService from '../services/userService';

/**
 * Profile Header Component
 */
const ProfileHeader = () => {
  const [profile, setProfile] = useState({ name: 'My Friend' });
  const [activitySummary, setActivitySummary] = useState({ activeDays: 0, duration: '0.0' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [profileData, summary] = await Promise.all([
      userService.getProfile(),
      userService.getActivitySummary(),
    ]);
    setProfile(profileData);
    setActivitySummary(summary);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.lightGreen} />
        </View>
      </View>
      <Text style={styles.welcomeText}>Welcome, {profile.name}!</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activitySummary.activeDays}</Text>
          <Text style={styles.statLabel}>Active Days</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activitySummary.duration}</Text>
          <Text style={styles.statLabel}>Duration (h)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.padding,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.green,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
});

export default ProfileHeader;







