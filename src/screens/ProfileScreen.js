import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import ProfileHeader from '../components/ProfileHeader';
import SettingsListItem from '../components/SettingsListItem';
import premiumService from '../services/premiumService';

/**
 * Profile Screen
 */
const ProfileScreen = ({ navigation }) => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    const premium = await premiumService.isPremium();
    setIsPremium(premium);
  };

  const handleBackupRestore = () => {
    Alert.alert(
      'Backup & Restore',
      'Sign in and synchronize your data',
      [{ text: 'OK' }]
    );
  };

  const handleGoPremium = async () => {
    const newStatus = await premiumService.togglePremium();
    setIsPremium(newStatus);
    Alert.alert(
      newStatus ? 'Premium Activated' : 'Premium Deactivated',
      newStatus ? 'You now have access to all premium features!' : 'Premium features disabled.',
      [{ text: 'OK' }]
    );
  };

  const handleSettingPress = (setting) => {
    Alert.alert(setting, 'This feature is coming soon!', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ProfileHeader />

        {/* Backup & Restore Button */}
        <TouchableOpacity style={styles.backupButton} onPress={handleBackupRestore}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.background} />
          <Text style={styles.backupButtonText}>Backup & Restore</Text>
        </TouchableOpacity>
        <Text style={styles.backupSubtext}>Sign in and synchronize your data</Text>

        {/* Go Premium Button */}
        <TouchableOpacity style={styles.premiumButton} onPress={handleGoPremium}>
          <Ionicons name="diamond" size={24} color={colors.background} />
          <Text style={styles.premiumButtonText}>Go Premium</Text>
        </TouchableOpacity>

        {/* Settings List */}
        <View style={styles.settingsContainer}>
          <SettingsListItem
            icon="person-outline"
            title="My Profile"
            onPress={() => handleSettingPress('My Profile')}
          />
          <SettingsListItem
            icon="barbell-outline"
            title="Workout settings"
            description="Voice & Coach & Timer, etc."
            onPress={() => handleSettingPress('Workout settings')}
          />
          <SettingsListItem
            icon="language-outline"
            title="Language"
            onPress={() => handleSettingPress('Language')}
          />
          <SettingsListItem
            icon="notifications-outline"
            title="Reminder"
            onPress={() => handleSettingPress('Reminder')}
          />
          <SettingsListItem
            icon="grid-outline"
            title="Widgets"
            onPress={() => handleSettingPress('Widgets')}
          />
          <SettingsListItem
            icon="checkmark-square-outline"
            title="Remove ads"
            onPress={() => handleSettingPress('Remove ads')}
          />
          <SettingsListItem
            icon="share-social-outline"
            title="Share with friends"
            onPress={() => handleSettingPress('Share with friends')}
          />
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
    paddingBottom: spacing.xl,
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.padding,
    borderRadius: spacing.radius,
    marginHorizontal: spacing.padding,
    marginTop: spacing.lg,
    minHeight: 50,
  },
  backupButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  backupSubtext: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yellow,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.padding,
    borderRadius: spacing.radius,
    marginHorizontal: spacing.padding,
    marginBottom: spacing.lg,
    minHeight: 50,
  },
  premiumButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  settingsContainer: {
    backgroundColor: colors.background,
    marginTop: spacing.md,
  },
});

export default ProfileScreen;



