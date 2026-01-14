import { Platform } from 'react-native';

/**
 * FatToFit Typography System
 * Using system fonts with careful weight and size hierarchy
 */

// Font families - using system fonts for best native feel
const fontFamily = {
  // Primary font family
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Monospace for numbers/stats
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Font weights
const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Font sizes with corresponding line heights
const fontSize = {
  // Display sizes (for big hero numbers)
  display1: 72,
  display2: 56,
  display3: 48,
  
  // Headings
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  
  // Body text
  bodyLarge: 18,
  body: 16,
  bodySmall: 14,
  
  // Small text
  caption: 12,
  tiny: 10,
  
  // Labels
  label: 14,
  labelSmall: 12,
  
  // Buttons
  button: 16,
  buttonSmall: 14,
};

// Line heights (relative to font size)
const lineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Letter spacing
const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// Pre-composed text styles
export const textStyles = {
  // Display styles (for big numbers like step count)
  displayLarge: {
    fontSize: fontSize.display1,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.display1 * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontSize: fontSize.display2,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.display2 * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  displaySmall: {
    fontSize: fontSize.display3,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.display3 * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },

  // Heading styles
  h1: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.h1 * lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.h2 * lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.h3 * lineHeight.snug,
  },
  h4: {
    fontSize: fontSize.h4,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.h4 * lineHeight.snug,
  },
  h5: {
    fontSize: fontSize.h5,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.h5 * lineHeight.normal,
  },
  h6: {
    fontSize: fontSize.h6,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.h6 * lineHeight.normal,
  },

  // Body styles
  bodyLarge: {
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.bodyLarge * lineHeight.relaxed,
  },
  body: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.body * lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.bodySmall * lineHeight.relaxed,
  },
  bodyBold: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.body * lineHeight.relaxed,
  },

  // Caption and small text
  caption: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.caption * lineHeight.normal,
  },
  captionBold: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.caption * lineHeight.normal,
  },
  tiny: {
    fontSize: fontSize.tiny,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.tiny * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },

  // Labels
  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.label * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontSize: fontSize.labelSmall,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.labelSmall * lineHeight.normal,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
  },

  // Button text
  button: {
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.button * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: fontSize.buttonSmall,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.buttonSmall * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },

  // Numeric displays (for stats)
  stat: {
    fontSize: fontSize.display3,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.display3 * lineHeight.tight,
    fontFamily: fontFamily.mono,
  },
  statMedium: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.h1 * lineHeight.tight,
    fontFamily: fontFamily.mono,
  },
  statSmall: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.h3 * lineHeight.tight,
    fontFamily: fontFamily.mono,
  },
};

export const typography = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
};

export default typography;


