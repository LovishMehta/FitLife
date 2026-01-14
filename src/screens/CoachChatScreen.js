/**
 * FatToFit AI Coach Chat Screen
 * Conversational AI coaching interface
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, textStyles, borderRadius } from '../theme';
import { getRelativeTime } from '../utils/helpers';
import useAuthStore from '../stores/useAuthStore';
import useChatStore from '../stores/useChatStore';
import useHealthStore from '../stores/useHealthStore';
import useNutritionStore from '../stores/useNutritionStore';
import { Card } from '../components/common';

const CoachChatScreen = () => {
  const { user, profile } = useAuthStore();
  const { 
    messages, 
    isSending, 
    isLoading,
    fetchMessages, 
    sendMessage,
    sendMessageDirect,
    getSuggestedPrompts,
  } = useChatStore();
  const { todayMetrics, goals } = useHealthStore();
  const { todayTotals, targets } = useNutritionStore();
  
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchMessages(user.id);
    }
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const buildContext = () => {
    return {
      profile: {
        full_name: profile?.full_name,
        age: profile?.age,
        gender: profile?.gender,
        current_weight_kg: profile?.current_weight_kg,
        goal_weight_kg: profile?.goal_weight_kg,
        primary_goal: profile?.primary_goal,
        fitness_experience: profile?.fitness_experience,
        dietary_restrictions: profile?.dietary_restrictions,
        injuries_limitations: profile?.injuries_limitations,
      },
      todayStats: {
        steps: todayMetrics.steps,
        stepGoal: goals.steps,
        caloriesConsumed: todayTotals.calories,
        calorieGoal: targets.calories,
        caloriesBurned: todayMetrics.caloriesBurned,
        protein: todayTotals.protein,
        proteinGoal: targets.protein,
        water: todayMetrics.waterIntake,
        waterGoal: goals.water,
      },
    };
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const message = inputText.trim();
    setInputText('');

    const context = buildContext();
    
    // Try edge function first, fall back to direct API call
    if (profile?.openai_api_key_encrypted) {
      await sendMessageDirect(user.id, message, context, profile.openai_api_key_encrypted);
    } else {
      await sendMessage(user.id, message, context);
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInputText(prompt);
  };

  const suggestedPrompts = getSuggestedPrompts(buildContext());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.coachName}>FitBuddy</Text>
            <Text style={styles.coachStatus}>AI Coach • Always here to help</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary[500]} size="large" />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeEmoji}>👋</Text>
              <Text style={styles.welcomeTitle}>Hey there!</Text>
              <Text style={styles.welcomeText}>
                I'm FitBuddy, your personal AI coach. I'm here to help you reach your fitness goals with personalized advice, workout tips, and nutrition guidance.
              </Text>
              <Text style={styles.welcomeHint}>
                Ask me anything about fitness, nutrition, or your progress!
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => (
              <View
                key={msg.id || index}
                style={[
                  styles.messageRow,
                  msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
                ]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.assistantAvatar}>
                    <Text style={styles.avatarEmoji}>🤖</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.role === 'user' ? styles.userText : styles.assistantText,
                    ]}
                  >
                    {msg.message}
                  </Text>
                  <Text style={styles.messageTime}>
                    {getRelativeTime(msg.created_at)}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* Typing indicator */}
          {isSending && (
            <View style={styles.typingContainer}>
              <View style={styles.assistantAvatar}>
                <Text style={styles.avatarEmoji}>🤖</Text>
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Prompts */}
        {messages.length < 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsScroll}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestedPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestedPrompt(prompt)}
              >
                <Text style={styles.suggestionText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your coach..."
            placeholderTextColor={colors.text.muted}
            multiline
            maxLength={1000}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Text style={styles.sendIcon}>
              {isSending ? '⏳' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.transparent.primary20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  coachEmoji: {
    fontSize: 28,
  },
  coachName: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  coachStatus: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl3,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl2,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  welcomeText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  welcomeHint: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.transparent.primary20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: borderRadius.xs,
  },
  assistantBubble: {
    backgroundColor: colors.surface.card,
    borderBottomLeftRadius: borderRadius.xs,
  },
  messageText: {
    ...textStyles.body,
  },
  userText: {
    color: colors.text.inverse,
  },
  assistantText: {
    color: colors.text.primary,
  },
  messageTime: {
    ...textStyles.tiny,
    color: colors.text.muted,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  typingBubble: {
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.xs,
  },
  typingDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  suggestionsScroll: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
  suggestionsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surface.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginRight: spacing.sm,
  },
  suggestionText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
    backgroundColor: colors.background.secondary,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface.input,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    ...textStyles.body,
    maxHeight: 120,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surface.border,
  },
  sendIcon: {
    fontSize: 20,
    color: colors.text.inverse,
  },
});

export default CoachChatScreen;


