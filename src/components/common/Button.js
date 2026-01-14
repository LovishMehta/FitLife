/**
 * FatToFit Button Component
 * Reusable button with multiple variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, spacing, borderRadius, sizes, textStyles, shadows } from '../../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles_ = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const loaderColor = variant === 'primary' || variant === 'danger'
    ? colors.text.inverse
    : colors.primary[500];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={textStyles_}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[500],
    ...shadows.md,
  },
  secondary: {
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.semantic.error,
    ...shadows.md,
  },

  // Sizes
  small: {
    height: sizes.buttonSmall,
    paddingHorizontal: spacing.base,
  },
  medium: {
    height: sizes.buttonMedium,
    paddingHorizontal: spacing.xl,
  },
  large: {
    height: sizes.buttonLarge,
    paddingHorizontal: spacing.xl2,
  },

  // Text styles
  text: {
    ...textStyles.button,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[500],
  },
  dangerText: {
    color: colors.text.primary,
  },

  smallText: {
    ...textStyles.buttonSmall,
  },
  mediumText: {
    ...textStyles.button,
  },
  largeText: {
    ...textStyles.button,
    fontSize: 18,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.muted,
  },

  // Icon positioning
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;


