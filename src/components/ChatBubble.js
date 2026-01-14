import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';

/**
 * Chat Bubble Component
 */
const ChatBubble = ({ message, isUser, timestamp, onFeedback }) => {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.aiIcon}>
          <View style={styles.iconBackground}>
            <Text style={styles.iconText}>R</Text>
          </View>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.message, isUser ? styles.userMessage : styles.aiMessage]}>
          {message}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.timestamp}>{timestamp}</Text>
          {!isUser && onFeedback && (
            <View style={styles.feedbackButtons}>
              <TouchableOpacity onPress={() => onFeedback('like')} style={styles.feedbackButton}>
                <Ionicons name="thumbs-up-outline" size={14} color={colors.textLight} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onFeedback('dislike')} style={styles.feedbackButton}>
                <Ionicons name="thumbs-down-outline" size={14} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.padding,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  aiIcon: {
    marginRight: spacing.xs,
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  iconBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: spacing.radius,
    padding: spacing.md,
  },
  userBubble: {
    backgroundColor: colors.green,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.background,
    borderBottomLeftRadius: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessage: {
    color: colors.background,
  },
  aiMessage: {
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: 11,
    color: colors.textLight,
  },
  feedbackButtons: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
  },
  feedbackButton: {
    marginLeft: spacing.xs,
    padding: 2,
  },
});

export default ChatBubble;



