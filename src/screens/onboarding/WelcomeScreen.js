/**
 * FatToFit Welcome Screen
 * First onboarding screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles } from '../../theme';
import { ROUTES } from '../../utils/constants';
import { Button } from '../../components/common';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Progress indicator */}
      <View style={styles.progress}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>Welcome to FatToFit</Text>
        <Text style={styles.subtitle}>
          Your AI-powered personal trainer, nutritionist, and accountability partner — all in one app.
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤖</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>AI Coach</Text>
              <Text style={styles.featureDesc}>24/7 personalized guidance</Text>
            </View>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Smart Tracking</Text>
              <Text style={styles.featureDesc}>Automatic health data sync</Text>
            </View>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏋️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Custom Workouts</Text>
              <Text style={styles.featureDesc}>Plans that adapt to you</Text>
            </View>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🍎</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Nutrition Tracking</Text>
              <Text style={styles.featureDesc}>Easy meal logging & insights</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Let's Get Started"
          onPress={() => navigation.navigate(ROUTES.GOALS)}
          fullWidth
        />
        <Text style={styles.footerText}>
          This will only take a few minutes
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl2,
  },
  features: {
    width: '100%',
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    padding: spacing.base,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
  },
  featureDesc: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  footer: {
    paddingTop: spacing.xl,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default WelcomeScreen;


