import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';

/**
 * AI Coach Card Component
 */
const AICoachCard = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.teal} />
          </View>
        </View>
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>AI Coach</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>10 minutes ago</Text>
        </View>
        <TouchableOpacity style={styles.arrowButton} onPress={onPress}>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.chatButton} onPress={onPress}>
        <Ionicons name="chatbubble-outline" size={18} color={colors.background} />
        <Text style={styles.chatButtonText}>Open Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: spacing.radius,
    padding: spacing.padding,
    marginVertical: spacing.marginSmall,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lightTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
  },
  arrowButton: {
    padding: spacing.xs,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radiusSmall,
    marginTop: spacing.sm,
    minHeight: 44,
  },
  chatButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default AICoachCard;



