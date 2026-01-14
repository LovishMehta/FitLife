/**
 * FatToFit Card Component
 * Reusable card container with multiple variants
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const Card = ({
  children,
  variant = 'default', // default, elevated, outlined, gradient
  onPress,
  padding = 'medium', // none, small, medium, large
  style,
  ...props
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.9}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },

  // Variants
  default: {
    backgroundColor: colors.surface.card,
  },
  elevated: {
    backgroundColor: colors.surface.card,
    ...shadows.lg,
  },
  outlined: {
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  gradient: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.surface.borderLight,
  },

  // Padding
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: spacing.sm,
  },
  padding_medium: {
    padding: spacing.base,
  },
  padding_large: {
    padding: spacing.xl,
  },
});

export default Card;


