/**
 * FatToFit Forgot Password Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles } from '../../theme';
import { isValidEmail } from '../../utils/helpers';
import useAuthStore from '../../stores/useAuthStore';
import { Button, Input } from '../../components/common';

const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword, isLoading, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    clearError();
    
    if (!validate()) return;
    
    const result = await resetPassword(email.trim().toLowerCase());
    
    if (result.success) {
      setEmailSent(true);
    } else {
      Alert.alert(
        'Error',
        result.error?.message || 'Failed to send reset email. Please try again.'
      );
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <Text style={styles.successHint}>
            Didn't receive the email? Check your spam folder or try again.
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            style={styles.backButton}
          />
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => setEmailSent(false)}
          >
            <Text style={styles.resendText}>Try a different email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backNav}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backNavText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>🔐</Text>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error}
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  backNav: {
    marginBottom: spacing.xl,
  },
  backNavText: {
    ...textStyles.body,
    color: colors.primary[500],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl3,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  form: {
    marginBottom: spacing.xl2,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  // Success state
  successContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...textStyles.h1,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  successText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailText: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  successHint: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl2,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  resendButton: {
    padding: spacing.sm,
  },
  resendText: {
    ...textStyles.body,
    color: colors.primary[500],
  },
});

export default ForgotPasswordScreen;


