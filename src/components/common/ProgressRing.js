/**
 * FatToFit Progress Ring Component
 * Circular progress indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, textStyles, sizes } from '../../theme';

const ProgressRing = ({
  progress = 0, // 0-100
  size = 'medium', // small, medium, large, or number
  strokeWidth,
  color = colors.primary[500],
  backgroundColor = colors.surface.border,
  showPercentage = true,
  label,
  labelStyle,
  children,
  style,
}) => {
  // Determine size
  let ringSize;
  if (typeof size === 'number') {
    ringSize = size;
  } else {
    ringSize = sizes[`progressRing${size.charAt(0).toUpperCase() + size.slice(1)}`] || sizes.progressRingMd;
  }

  const stroke = strokeWidth || ringSize * 0.1;
  const radius = (ringSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Get progress color based on percentage
  const getProgressColor = () => {
    if (typeof color === 'function') {
      return color(clampedProgress);
    }
    return color;
  };

  return (
    <View style={[styles.container, { width: ringSize, height: ringSize }, style]}>
      <Svg width={ringSize} height={ringSize}>
        {/* Background circle */}
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          strokeWidth={stroke}
        />
        
        {/* Progress circle */}
        <Circle
          stroke={getProgressColor()}
          fill="none"
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
        />
      </Svg>
      
      <View style={styles.content}>
        {children || (
          <>
            {showPercentage && (
              <Text style={[
                styles.percentageText,
                size === 'small' && styles.percentageTextSmall,
                size === 'large' && styles.percentageTextLarge,
              ]}>
                {Math.round(clampedProgress)}%
              </Text>
            )}
            {label && (
              <Text style={[styles.labelText, labelStyle]}>{label}</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  percentageTextSmall: {
    ...textStyles.h5,
  },
  percentageTextLarge: {
    ...textStyles.displaySmall,
  },
  labelText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export default ProgressRing;


