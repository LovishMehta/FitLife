/**
 * FatToFit Input Component
 * Reusable text input with variants and validation
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, sizes, textStyles } from '../../theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  size = 'medium', // small, medium, large
  variant = 'default', // default, filled
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const containerStyles = [
    styles.container,
    style,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    styles[`inputContainer_${variant}`],
    styles[`inputContainer_${size}`],
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    !editable && styles.inputContainerDisabled,
    multiline && styles.inputContainerMultiline,
  ];

  const inputStyles = [
    styles.input,
    styles[`input_${size}`],
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    multiline && styles.inputMultiline,
    inputStyle,
  ];

  return (
    <View style={containerStyles}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  
  label: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.input,
  },
  inputContainer_default: {
    backgroundColor: colors.surface.input,
  },
  inputContainer_filled: {
    backgroundColor: colors.background.tertiary,
  },
  inputContainer_small: {
    height: sizes.inputSmall,
  },
  inputContainer_medium: {
    height: sizes.inputMedium,
  },
  inputContainer_large: {
    height: sizes.inputLarge,
  },
  inputContainerFocused: {
    borderColor: colors.primary[500],
    backgroundColor: colors.surface.inputFocused,
  },
  inputContainerError: {
    borderColor: colors.semantic.error,
  },
  inputContainerDisabled: {
    opacity: 0.5,
    backgroundColor: colors.background.secondary,
  },
  inputContainerMultiline: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
  },
  
  input: {
    flex: 1,
    color: colors.text.primary,
    paddingHorizontal: spacing.base,
  },
  input_small: {
    ...textStyles.bodySmall,
  },
  input_medium: {
    ...textStyles.body,
  },
  input_large: {
    ...textStyles.bodyLarge,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  inputMultiline: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    textAlignVertical: 'top',
  },
  
  leftIcon: {
    paddingLeft: spacing.base,
  },
  rightIcon: {
    paddingRight: spacing.base,
  },
  
  showPasswordText: {
    color: colors.primary[500],
    ...textStyles.bodySmall,
    fontWeight: '600',
  },
  
  helperText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.semantic.error,
  },
});

export default Input;


