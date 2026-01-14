/**
 * FatToFit Sign Up Screen
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
import { ROUTES } from '../../utils/constants';
import { isValidEmail, validatePassword } from '../../utils/helpers';
import useAuthStore from '../../stores/useAuthStore';
import { Button, Input } from '../../components/common';

const SignUpScreen = ({ navigation }) => {
  const { signUp, isLoading, clearError } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    const passwordValidation = validatePassword(password);
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      const firstError = Object.values(passwordValidation.errors).find(e => e);
      newErrors.password = firstError;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    clearError();
    
    if (!validate()) return;
    
    const result = await signUp(
      email.trim().toLowerCase(),
      password,
      { full_name: fullName.trim() }
    );
    
    if (result.success) {
      // User will be redirected automatically by auth state change
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sign Up Failed',
        result.error?.message || 'Please try again.'
      );
    }
  };

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>💪</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your transformation journey today
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: null });
              }}
              placeholder="John Doe"
              autoComplete="name"
              error={errors.fullName}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              placeholder="Create a strong password"
              secureTextEntry
              autoComplete="password-new"
              error={errors.password}
              helperText="Min 8 chars with uppercase, lowercase, and number"
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="password-new"
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              fullWidth
              style={styles.signupButton}
            />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl2,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  signupButton: {
    marginTop: spacing.lg,
  },
  terms: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  termsLink: {
    color: colors.primary[500],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  footerLink: {
    ...textStyles.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
});

export default SignUpScreen;


