/**
 * FatToFit Color Palette
 * A vibrant, energetic theme with deep darks and electric accents
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: '#E8FFF0',
    100: '#B8FFCE',
    200: '#7AFFAC',
    300: '#3CFF8A',
    400: '#00FF6A',
    500: '#00E85C', // Main primary
    600: '#00C74E',
    700: '#00A340',
    800: '#007F32',
    900: '#005C24',
  },

  // Secondary accent (energetic orange)
  secondary: {
    50: '#FFF4E6',
    100: '#FFE0B8',
    200: '#FFCC8A',
    300: '#FFB85C',
    400: '#FFA42E',
    500: '#FF9000', // Main secondary
    600: '#DB7C00',
    700: '#B76800',
    800: '#935400',
    900: '#6F4000',
  },

  // Accent colors
  accent: {
    cyan: '#00D9FF',
    purple: '#A855F7',
    pink: '#EC4899',
    yellow: '#FACC15',
    red: '#EF4444',
  },

  // Background colors (dark theme)
  background: {
    primary: '#0A0A0F',     // Deepest black with slight blue
    secondary: '#12121A',   // Card backgrounds
    tertiary: '#1A1A24',    // Elevated surfaces
    elevated: '#22222E',    // Modals, dropdowns
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Surface colors
  surface: {
    card: '#16161F',
    cardHover: '#1E1E28',
    input: '#1A1A24',
    inputFocused: '#22222E',
    border: '#2A2A36',
    borderLight: '#3A3A48',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    muted: '#52525B',
    inverse: '#0A0A0F',
  },

  // Semantic colors
  semantic: {
    success: '#22C55E',
    successLight: '#4ADE80',
    successBg: 'rgba(34, 197, 94, 0.15)',
    
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    
    error: '#EF4444',
    errorLight: '#F87171',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    
    info: '#3B82F6',
    infoLight: '#60A5FA',
    infoBg: 'rgba(59, 130, 246, 0.15)',
  },

  // Macro colors (for nutrition tracking)
  macros: {
    protein: '#3B82F6',    // Blue
    carbs: '#F59E0B',      // Amber
    fat: '#EC4899',        // Pink
    calories: '#00E85C',   // Primary green
    fiber: '#8B5CF6',      // Purple
    water: '#06B6D4',      // Cyan
  },

  // Workout intensity colors
  intensity: {
    rest: '#52525B',
    light: '#22C55E',
    moderate: '#F59E0B',
    hard: '#F97316',
    extreme: '#EF4444',
  },

  // Progress colors (gradient from red to green)
  progress: {
    0: '#EF4444',
    25: '#F97316',
    50: '#F59E0B',
    75: '#84CC16',
    100: '#22C55E',
  },

  // Chart colors
  chart: {
    line1: '#00E85C',
    line2: '#3B82F6',
    line3: '#A855F7',
    line4: '#EC4899',
    fill1: 'rgba(0, 232, 92, 0.2)',
    fill2: 'rgba(59, 130, 246, 0.2)',
    grid: '#2A2A36',
    axis: '#52525B',
  },

  // Gradient presets
  gradients: {
    primary: ['#00E85C', '#00C74E'],
    secondary: ['#FF9000', '#DB7C00'],
    premium: ['#A855F7', '#EC4899'],
    dark: ['#1A1A24', '#0A0A0F'],
    card: ['#1E1E28', '#16161F'],
  },

  // Transparent variants
  transparent: {
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white50: 'rgba(255, 255, 255, 0.5)',
    black10: 'rgba(0, 0, 0, 0.1)',
    black20: 'rgba(0, 0, 0, 0.2)',
    black50: 'rgba(0, 0, 0, 0.5)',
    primary10: 'rgba(0, 232, 92, 0.1)',
    primary20: 'rgba(0, 232, 92, 0.2)',
  },
};

export default colors;


