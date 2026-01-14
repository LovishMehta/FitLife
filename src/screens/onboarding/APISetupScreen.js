/**
 * FatToFit API Setup Screen
 * Configure OpenAI API key for AI coaching
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { ROUTES } from '../../utils/constants';
import { Button, Input } from '../../components/common';

const APISetupScreen = ({ navigation, route }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    setIsValidating(true);
    
    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        setIsValid(true);
        Alert.alert('Success!', 'Your API key is valid and working.');
      } else {
        setIsValid(false);
        Alert.alert('Invalid Key', 'Please check your API key and try again.');
      }
    } catch (error) {
      setIsValid(false);
      Alert.alert('Error', 'Could not validate API key. Check your connection.');
    }
    
    setIsValidating(false);
  };

  const handleContinue = () => {
    navigation.navigate(ROUTES.FIRST_PLAN, {
      ...route.params,
      openaiApiKey: apiKey.trim() || null,
    });
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip API Setup?',
      'AI coaching features will be limited without an API key. You can add one later in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => navigation.navigate(ROUTES.FIRST_PLAN, {
            ...route.params,
            openaiApiKey: null,
          })
        },
      ]
    );
  };

  const openOpenAI = () => {
    Linking.openURL('https://platform.openai.com/api-keys');
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
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emoji}>🤖</Text>
        <Text style={styles.title}>AI Coach Setup</Text>
        <Text style={styles.subtitle}>
          Power your personal AI coach with OpenAI GPT-4
        </Text>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Why do I need this?</Text>
          <Text style={styles.infoText}>
            FatToFit uses your own OpenAI API key to power the AI coach. This gives you:
          </Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefit}>✓ Unlimited AI coaching conversations</Text>
            <Text style={styles.benefit}>✓ Privacy - data goes directly to OpenAI</Text>
            <Text style={styles.benefit}>✓ You control your own costs</Text>
          </View>
        </View>

        {/* API Key Input */}
        <Input
          label="OpenAI API Key"
          value={apiKey}
          onChangeText={(text) => {
            setApiKey(text);
            setIsValid(null);
          }}
          placeholder="sk-..."
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          helperText={
            isValid === true 
              ? '✓ API key validated' 
              : isValid === false 
                ? 'Invalid API key' 
                : 'Paste your OpenAI API key here'
          }
        />

        {/* Validate button */}
        <Button
          title={isValidating ? 'Validating...' : 'Validate Key'}
          onPress={validateApiKey}
          variant="secondary"
          loading={isValidating}
          disabled={!apiKey.trim() || isValidating}
          style={styles.validateButton}
        />

        {/* Get API Key link */}
        <TouchableOpacity style={styles.getKeyLink} onPress={openOpenAI}>
          <Text style={styles.getKeyText}>
            Don't have an API key? Get one from OpenAI →
          </Text>
        </TouchableOpacity>

        {/* Cost info */}
        <View style={styles.costInfo}>
          <Text style={styles.costTitle}>💡 Cost estimate</Text>
          <Text style={styles.costText}>
            Typical usage costs ~$1-5/month for daily coaching conversations. GPT-4 Turbo is ~$0.01 per conversation.
          </Text>
        </View>
      </ScrollView>

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
          disabled={apiKey.trim() && !isValid}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: 0,
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
    marginBottom: spacing.xl,
  },
  infoBox: {
    width: '100%',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.xs,
  },
  benefit: {
    ...textStyles.bodySmall,
    color: colors.semantic.success,
  },
  validateButton: {
    width: '100%',
    marginTop: spacing.sm,
  },
  getKeyLink: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  getKeyText: {
    ...textStyles.body,
    color: colors.primary[500],
  },
  costInfo: {
    marginTop: spacing.xl,
    padding: spacing.base,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  costTitle: {
    ...textStyles.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  costText: {
    ...textStyles.caption,
    color: colors.text.secondary,
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

export default APISetupScreen;


