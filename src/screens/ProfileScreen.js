import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import ProfileHeader from '../components/ProfileHeader';
import SettingsListItem from '../components/SettingsListItem';
import storageService from '../services/storageService';
import authService from '../services/authService';
import { isSupabaseConfigured, getSession } from '../services/supabaseService';

/**
 * Settings Screen - MVP Version
 * Simplified per MVP requirements: No premium features
 */
const ProfileScreen = ({ navigation }) => {
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState('10000');
  
  // Auth state
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSettings();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const session = await getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const loadSettings = async () => {
    const goal = await storageService.getDailyGoal();
    setDailyGoal(goal);
    setTempGoal(goal.toString());
  };

  const handleBackupRestore = () => {
    if (!isSupabaseConfigured()) {
      Alert.alert(
        'Not Configured',
        'Cloud sync is not configured. Please check your environment settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (user) {
      // Already signed in
      Alert.alert(
        'Signed In',
        `You are signed in as ${user.email}`,
        [
          { text: 'OK' },
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: handleSignOut 
          }
        ]
      );
      return;
    }
    
    setIsAuthModalVisible(true);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const { user: newUser, error } = await authService.signUp(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error);
      return;
    }

    setUser(newUser);
    setIsAuthModalVisible(false);
    setEmail('');
    setPassword('');
    Alert.alert('Success!', 'Account created successfully! Your data will now sync to the cloud.');
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    const { user: signedInUser, error } = await authService.signIn(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Sign In Failed', error);
      return;
    }

    setUser(signedInUser);
    setIsAuthModalVisible(false);
    setEmail('');
    setPassword('');
    Alert.alert('Welcome Back!', 'You are now signed in.');
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    Alert.alert('Signed Out', 'You have been signed out.');
  };

  const handleGoalPress = () => {
    setTempGoal(dailyGoal.toString());
    setIsGoalModalVisible(true);
  };

  const handleSaveGoal = async () => {
    const newGoal = parseInt(tempGoal, 10);
    if (isNaN(newGoal) || newGoal < 1000 || newGoal > 100000) {
      Alert.alert('Invalid Goal', 'Please enter a goal between 1,000 and 100,000 steps.');
      return;
    }
    
    // Save locally
    await storageService.setDailyGoal(newGoal);
    setDailyGoal(newGoal);
    setIsGoalModalVisible(false);
    
    // Sync to Supabase if signed in
    if (user) {
      const { synced, error } = await authService.updateDailyGoal(newGoal);
      if (synced) {
        Alert.alert('Goal Updated', `Your new daily goal is ${newGoal.toLocaleString()} steps!\n\n☁️ Synced to cloud`);
      } else if (error) {
        Alert.alert('Goal Updated', `Your new daily goal is ${newGoal.toLocaleString()} steps!\n\n⚠️ Cloud sync failed: ${error}`);
      } else {
        Alert.alert('Goal Updated', `Your new daily goal is ${newGoal.toLocaleString()} steps!`);
      }
    } else {
      Alert.alert('Goal Updated', `Your new daily goal is ${newGoal.toLocaleString()} steps!`);
    }
  };

  const handleReminderPress = () => {
    Alert.alert(
      'Reminders',
      'Push notifications will be available soon!\n\nYou\'ll receive:\n• Morning motivation\n• Daily goal reminders\n• Streak alerts',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your step history and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            Alert.alert('Data Deleted', 'All your data has been deleted.');
            setDailyGoal(10000);
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'FitLife Health Tracker\n\nWe collect:\n• Step count data (stored on device)\n• Chat messages (for AI coaching)\n\nYour data is:\n• Stored locally on your device\n• Only synced to cloud if you sign in\n• Never sold to third parties\n\nYou can delete your data anytime in Settings.',
      [{ text: 'OK' }]
    );
  };

  const handleSettingPress = (setting) => {
    Alert.alert(setting, 'This feature is coming soon!', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ProfileHeader />

        {/* Backup & Sync Button */}
        <TouchableOpacity style={styles.backupButton} onPress={handleBackupRestore}>
          <Ionicons 
            name={user ? "checkmark-circle-outline" : "cloud-upload-outline"} 
            size={24} 
            color={colors.background} 
          />
          <Text style={styles.backupButtonText}>
            {user ? `Signed in as ${user.email}` : 'Sign In & Sync'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.backupSubtext}>
          {user ? 'Your data is syncing to the cloud' : 'Create an account to backup your data'}
        </Text>

        {/* Settings List */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <SettingsListItem
            icon="flag-outline"
            title="Daily Step Goal"
            description={`${dailyGoal.toLocaleString()} steps`}
            onPress={handleGoalPress}
          />
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsListItem
            icon="person-outline"
            title="My Profile"
            onPress={() => handleSettingPress('My Profile')}
          />
          <SettingsListItem
            icon="notifications-outline"
            title="Reminders"
            description="Daily motivation & goal alerts"
            onPress={handleReminderPress}
          />
          <SettingsListItem
            icon="language-outline"
            title="Language"
            onPress={() => handleSettingPress('Language')}
          />
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <SettingsListItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <SettingsListItem
            icon="trash-outline"
            title="Delete My Data"
            description="Remove all stored data"
            onPress={handleDeleteData}
            danger
          />
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingsListItem
            icon="share-social-outline"
            title="Share with friends"
            onPress={() => handleSettingPress('Share with friends')}
          />
          <SettingsListItem
            icon="information-circle-outline"
            title="App Version"
            description="1.0.0 (MVP)"
            onPress={() => {}}
          />
        </View>
      </ScrollView>

      {/* Goal Setting Modal */}
      <Modal
        visible={isGoalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Step Goal</Text>
            <Text style={styles.modalSubtitle}>
              How many steps do you want to walk each day?
            </Text>
            
            <TextInput
              style={styles.goalInput}
              value={tempGoal}
              onChangeText={setTempGoal}
              keyboardType="number-pad"
              placeholder="10000"
              placeholderTextColor={colors.textLight}
              selectTextOnFocus
            />
            
            <View style={styles.quickGoals}>
              {[5000, 7500, 10000, 12500, 15000].map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.quickGoalButton,
                    parseInt(tempGoal, 10) === goal && styles.quickGoalButtonActive,
                  ]}
                  onPress={() => setTempGoal(goal.toString())}
                >
                  <Text
                    style={[
                      styles.quickGoalText,
                      parseInt(tempGoal, 10) === goal && styles.quickGoalTextActive,
                    ]}
                  >
                    {(goal / 1000).toFixed(goal % 1000 === 0 ? 0 : 1)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsGoalModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveGoal}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Auth Modal */}
      <Modal
        visible={isAuthModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAuthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isSignUp 
                ? 'Sign up to backup your data to the cloud' 
                : 'Sign in to access your data'}
            </Text>
            
            <TextInput
              style={styles.authInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={styles.authInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.authButton, isLoading && styles.authButtonDisabled]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchAuthButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchAuthText}>
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeAuthButton}
              onPress={() => {
                setIsAuthModalVisible(false);
                setEmail('');
                setPassword('');
              }}
            >
              <Text style={styles.closeAuthText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: spacing.padding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    marginBottom: spacing.lg,
  },
  settingsContainer: {
    backgroundColor: colors.background,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.padding,
    paddingVertical: spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.padding,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: spacing.radius,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  goalInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.md,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  quickGoals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  quickGoalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radiusSmall,
    backgroundColor: colors.cardBackground,
  },
  quickGoalButtonActive: {
    backgroundColor: colors.green,
  },
  quickGoalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickGoalTextActive: {
    color: colors.background,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    borderRadius: spacing.radius,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    borderRadius: spacing.radius,
    backgroundColor: colors.green,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  // Auth Modal styles
  authInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  authButton: {
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  switchAuthButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: 14,
    color: colors.green,
  },
  closeAuthButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  closeAuthText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
