/**
 * FatToFit Utility Helper Functions
 */

import { CALORIES_PER_GRAM, MACRO_RATIOS } from './constants';

// ============================================
// DATE & TIME HELPERS
// ============================================

/**
 * Format date as YYYY-MM-DD
 */
export const formatDateKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date key
 */
export const getTodayKey = () => formatDateKey(new Date());

/**
 * Format date for display
 */
export const formatDisplayDate = (date, options = {}) => {
  const d = new Date(date);
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return d.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format time for display (HH:MM AM/PM)
 */
export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDisplayDate(date, { month: 'short', day: 'numeric' });
};

/**
 * Get start of day
 */
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 */
export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of week (Monday)
 */
export const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get array of last N days
 */
export const getLastNDays = (n = 7) => {
  const days = [];
  const today = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(formatDateKey(date));
  }
  
  return days;
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  return formatDateKey(date) === formatDateKey(new Date());
};

/**
 * Check if date is yesterday
 */
export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateKey(date) === formatDateKey(yesterday);
};

// ============================================
// NUMBER FORMATTING HELPERS
// ============================================

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};

/**
 * Format decimal to fixed places
 */
export const formatDecimal = (num, places = 1) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(places);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, total, decimals = 0) => {
  if (!total || total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Clamp a number between min and max
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

// ============================================
// HEALTH & FITNESS CALCULATIONS
// ============================================

/**
 * Calculate BMI
 */
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'warning' };
  if (bmi < 25) return { label: 'Normal', color: 'success' };
  if (bmi < 30) return { label: 'Overweight', color: 'warning' };
  return { label: 'Obese', color: 'error' };
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor
 */
export const calculateBMR = (weightKg, heightCm, age, gender) => {
  if (!weightKg || !heightCm || !age) return null;
  
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  }
  
  // Default to average
  return Math.round(base - 78);
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export const calculateTDEE = (bmr, activityLevel = 'moderate') => {
  if (!bmr) return null;
  
  const multipliers = {
    sedentary: 1.2,      // Little to no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9,    // Very hard exercise, physical job
  };
  
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
};

/**
 * Calculate daily calorie target for weight loss/gain
 */
export const calculateCalorieTarget = (tdee, goal, weeklyChangeKg = 0.5) => {
  if (!tdee) return null;
  
  // 1 kg of fat ≈ 7700 calories
  const dailyDeficit = (weeklyChangeKg * 7700) / 7;
  
  switch (goal) {
    case 'weight_loss':
      return Math.round(tdee - dailyDeficit);
    case 'muscle_gain':
      return Math.round(tdee + (dailyDeficit * 0.5)); // Smaller surplus for lean gains
    default:
      return Math.round(tdee);
  }
};

/**
 * Calculate macro targets from calorie goal
 */
export const calculateMacroTargets = (calorieTarget, goal = 'general_health') => {
  if (!calorieTarget) return null;
  
  const ratios = MACRO_RATIOS[goal] || MACRO_RATIOS.general_health;
  
  return {
    protein: Math.round((calorieTarget * ratios.protein) / CALORIES_PER_GRAM.protein),
    carbs: Math.round((calorieTarget * ratios.carbs) / CALORIES_PER_GRAM.carbs),
    fat: Math.round((calorieTarget * ratios.fat) / CALORIES_PER_GRAM.fat),
  };
};

/**
 * Calculate calories from macros
 */
export const calculateCaloriesFromMacros = (protein, carbs, fat) => {
  return (
    (protein || 0) * CALORIES_PER_GRAM.protein +
    (carbs || 0) * CALORIES_PER_GRAM.carbs +
    (fat || 0) * CALORIES_PER_GRAM.fat
  );
};

/**
 * Calculate weekly weight loss needed to reach goal
 */
export const calculateWeeklyTarget = (currentWeight, goalWeight, weeks) => {
  if (!currentWeight || !goalWeight || !weeks) return null;
  return (currentWeight - goalWeight) / weeks;
};

/**
 * Estimate calories burned from steps
 */
export const estimateCaloriesFromSteps = (steps, weightKg = 70) => {
  // Rough estimate: 0.04 calories per step per kg of body weight
  return Math.round(steps * 0.04 * (weightKg / 70));
};

// ============================================
// PROGRESS HELPERS
// ============================================

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current, goal) => {
  if (!goal || goal === 0) return 0;
  return clamp((current / goal) * 100, 0, 100);
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (percentage, colors) => {
  if (percentage >= 100) return colors.progress[100];
  if (percentage >= 75) return colors.progress[75];
  if (percentage >= 50) return colors.progress[50];
  if (percentage >= 25) return colors.progress[25];
  return colors.progress[0];
};

/**
 * Calculate streak days
 */
export const calculateStreak = (dates, targetKey = 'completed') => {
  if (!dates || dates.length === 0) return 0;
  
  const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const date of sortedDates) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate - d) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
};

// ============================================
// STRING HELPERS
// ============================================

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert snake_case to Title Case
 */
export const snakeToTitle = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUppercase && hasLowercase && hasNumber,
    errors: {
      minLength: !minLength ? 'Password must be at least 8 characters' : null,
      hasUppercase: !hasUppercase ? 'Include at least one uppercase letter' : null,
      hasLowercase: !hasLowercase ? 'Include at least one lowercase letter' : null,
      hasNumber: !hasNumber ? 'Include at least one number' : null,
    },
  };
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// ============================================
// ARRAY HELPERS
// ============================================

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sum array values by key
 */
export const sumBy = (array, key) => {
  return array.reduce((sum, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    return sum + (value || 0);
  }, 0);
};

/**
 * Average array values by key
 */
export const averageBy = (array, key) => {
  if (!array.length) return 0;
  return sumBy(array, key) / array.length;
};

export default {
  formatDateKey,
  getTodayKey,
  formatDisplayDate,
  formatTime,
  getRelativeTime,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getLastNDays,
  isToday,
  isYesterday,
  formatNumber,
  formatDecimal,
  formatPercentage,
  clamp,
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacroTargets,
  calculateCaloriesFromMacros,
  calculateWeeklyTarget,
  estimateCaloriesFromSteps,
  calculateProgress,
  getProgressColor,
  calculateStreak,
  capitalize,
  snakeToTitle,
  truncate,
  generateId,
  isValidEmail,
  validatePassword,
  isEmpty,
  groupBy,
  sumBy,
  averageBy,
};


