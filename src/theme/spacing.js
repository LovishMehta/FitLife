/**
 * FatToFit Spacing System
 * Consistent spacing scale based on 4px grid
 */

// Base unit for spacing
const BASE_UNIT = 4;

// Spacing scale (multipliers of base unit)
export const spacing = {
  // Micro spacing
  xs2: BASE_UNIT * 0.5,  // 2
  xs: BASE_UNIT,          // 4
  
  // Small spacing
  sm: BASE_UNIT * 2,      // 8
  
  // Medium spacing
  md: BASE_UNIT * 3,      // 12
  
  // Default spacing
  base: BASE_UNIT * 4,    // 16
  
  // Large spacing
  lg: BASE_UNIT * 5,      // 20
  xl: BASE_UNIT * 6,      // 24
  
  // Extra large spacing
  xl2: BASE_UNIT * 8,     // 32
  xl3: BASE_UNIT * 10,    // 40
  xl4: BASE_UNIT * 12,    // 48
  xl5: BASE_UNIT * 16,    // 64
  xl6: BASE_UNIT * 20,    // 80
  xl7: BASE_UNIT * 24,    // 96
};

// Border radius
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xl2: 24,
  xl3: 32,
  full: 9999,
};

// Component-specific sizes
export const sizes = {
  // Button heights
  buttonSmall: 36,
  buttonMedium: 48,
  buttonLarge: 56,
  
  // Input heights
  inputSmall: 40,
  inputMedium: 48,
  inputLarge: 56,
  
  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 40,
  iconXl2: 48,
  
  // Avatar sizes
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 80,
  
  // Card sizes
  cardMinHeight: 80,
  
  // Tab bar
  tabBarHeight: 80,
  
  // Header
  headerHeight: 56,
  
  // Bottom sheet handle
  bottomSheetHandle: 4,
  
  // Progress ring sizes
  progressRingSm: 60,
  progressRingMd: 120,
  progressRingLg: 200,
};

// Layout constants
export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing.base,
  screenPaddingVertical: spacing.lg,
  
  // Card padding
  cardPadding: spacing.base,
  cardPaddingLarge: spacing.xl,
  
  // Section spacing
  sectionSpacing: spacing.xl2,
  
  // List item spacing
  listItemSpacing: spacing.sm,
  
  // Grid gaps
  gridGapSm: spacing.sm,
  gridGapMd: spacing.base,
  gridGapLg: spacing.xl,
};

// Shadow presets
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  // Colored shadows for CTAs
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  }),
};

export default {
  spacing,
  borderRadius,
  sizes,
  layout,
  shadows,
};


