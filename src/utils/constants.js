/**
 * FatToFit App Constants
 */

// App Information
export const APP_NAME = 'FatToFit';
export const APP_VERSION = '1.0.0';

// HealthKit/Health Connect Data Types
export const HEALTH_METRICS = {
  STEPS: 'steps',
  HEART_RATE: 'heart_rate',
  CALORIES_BURNED: 'calories_burned',
  ACTIVE_ENERGY: 'active_energy',
  SLEEP_DURATION: 'sleep_duration',
  SLEEP_QUALITY: 'sleep_quality',
  DISTANCE_KM: 'distance_km',
  FLIGHTS_CLIMBED: 'flights_climbed',
  RESTING_HEART_RATE: 'resting_heart_rate',
  HEART_RATE_VARIABILITY: 'heart_rate_variability',
  BLOOD_OXYGEN: 'blood_oxygen',
  WEIGHT: 'weight',
  BODY_FAT_PERCENTAGE: 'body_fat_percentage',
  WATER_INTAKE: 'water_intake',
};

// Meal Types
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
};

// Workout Types
export const WORKOUT_TYPES = {
  PUSH: 'push',
  PULL: 'pull',
  LEGS: 'legs',
  UPPER: 'upper',
  LOWER: 'lower',
  FULL_BODY: 'full_body',
  CARDIO: 'cardio',
  HIIT: 'hiit',
  YOGA: 'yoga',
  STRETCHING: 'stretching',
  REST: 'rest',
  CUSTOM: 'custom',
};

// Goal Types
export const GOAL_TYPES = {
  WEIGHT_LOSS: 'weight_loss',
  MUSCLE_GAIN: 'muscle_gain',
  ENDURANCE: 'endurance',
  GENERAL_HEALTH: 'general_health',
};

// Fitness Experience Levels
export const FITNESS_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

// Perceived Difficulty
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MODERATE: 'moderate',
  HARD: 'hard',
  VERY_HARD: 'very_hard',
};

// Default Goals
export const DEFAULT_GOALS = {
  DAILY_STEPS: 10000,
  DAILY_WATER_ML: 2500,
  SLEEP_HOURS: 8,
  WORKOUTS_PER_WEEK: 4,
};

// Macro Ratios for Different Goals (percentage of daily calories)
export const MACRO_RATIOS = {
  [GOAL_TYPES.WEIGHT_LOSS]: {
    protein: 0.35,
    carbs: 0.35,
    fat: 0.30,
  },
  [GOAL_TYPES.MUSCLE_GAIN]: {
    protein: 0.30,
    carbs: 0.45,
    fat: 0.25,
  },
  [GOAL_TYPES.ENDURANCE]: {
    protein: 0.20,
    carbs: 0.55,
    fat: 0.25,
  },
  [GOAL_TYPES.GENERAL_HEALTH]: {
    protein: 0.25,
    carbs: 0.45,
    fat: 0.30,
  },
};

// Calories per gram of macros
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
  alcohol: 7,
};

// Achievement Types
export const ACHIEVEMENTS = {
  FIRST_WORKOUT: 'first_workout',
  WORKOUT_STREAK_3: 'workout_streak_3',
  WORKOUT_STREAK_7: 'workout_streak_7',
  WORKOUT_STREAK_30: 'workout_streak_30',
  WORKOUTS_10: 'workouts_10',
  WORKOUTS_25: 'workouts_25',
  WORKOUTS_50: 'workouts_50',
  WORKOUTS_100: 'workouts_100',
  WEIGHT_LOST_5: 'weight_lost_5',
  WEIGHT_LOST_10: 'weight_lost_10',
  WEIGHT_LOST_25: 'weight_lost_25',
  WEIGHT_LOST_50: 'weight_lost_50',
  STEPS_10K: 'steps_10k',
  STEPS_STREAK_7: 'steps_streak_7',
  PERFECT_MACRO_DAY: 'perfect_macro_day',
  PERFECT_MACRO_WEEK: 'perfect_macro_week',
  WATER_GOAL_7: 'water_goal_7',
  EARLY_BIRD: 'early_bird', // Workout before 7 AM
  NIGHT_OWL: 'night_owl',   // Workout after 9 PM
};

// Chat Message Roles
export const CHAT_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
};

// OpenAI Configuration
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4-turbo-preview',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  MAX_CONTEXT_MESSAGES: 10,
};

// Sync Intervals (in milliseconds)
export const SYNC_INTERVALS = {
  HEALTH_DATA: 15 * 60 * 1000,  // 15 minutes
  BACKGROUND_REFRESH: 30 * 60 * 1000, // 30 minutes
};

// Storage Keys (for AsyncStorage)
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@onboarding_completed',
  USER_PREFERENCES: '@user_preferences',
  CACHED_HEALTH_DATA: '@cached_health_data',
  LAST_SYNC_TIME: '@last_sync_time',
  NOTIFICATION_SETTINGS: '@notification_settings',
};

// Navigation Routes
export const ROUTES = {
  // Auth Stack
  AUTH: 'Auth',
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Onboarding Stack
  ONBOARDING: 'Onboarding',
  WELCOME: 'Welcome',
  GOALS: 'Goals',
  FITNESS_PROFILE: 'FitnessProfile',
  HEALTH_LIFESTYLE: 'HealthLifestyle',
  PERMISSIONS: 'Permissions',
  API_SETUP: 'APISetup',
  FIRST_PLAN: 'FirstPlan',
  
  // Main Tab Navigator
  MAIN: 'Main',
  DASHBOARD: 'Dashboard',
  HEALTH_METRICS: 'HealthMetrics',
  NUTRITION: 'Nutrition',
  WORKOUTS: 'Workouts',
  COACH_CHAT: 'CoachChat',
  PROGRESS: 'Progress',
  SETTINGS: 'Settings',
  
  // Modal Screens
  LOG_MEAL: 'LogMeal',
  LOG_WORKOUT: 'LogWorkout',
  LOG_WEIGHT: 'LogWeight',
  WORKOUT_DETAIL: 'WorkoutDetail',
  EXERCISE_DETAIL: 'ExerciseDetail',
  EDIT_PROFILE: 'EditProfile',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  MORNING_PROMPT: 'morning_prompt',
  WORKOUT_REMINDER: 'workout_reminder',
  MEAL_REMINDER: 'meal_reminder',
  EVENING_REFLECTION: 'evening_reflection',
  ACHIEVEMENT: 'achievement',
  GOAL_PROGRESS: 'goal_progress',
  COACH_TIP: 'coach_tip',
};

// Days of Week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Dietary Restrictions Options
export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Halal',
  'Kosher',
];

// Equipment Options
export const EQUIPMENT_OPTIONS = [
  'No Equipment (Bodyweight)',
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Kettlebell',
  'Pull-up Bar',
  'Bench',
  'Cable Machine',
  'Treadmill',
  'Stationary Bike',
  'Rowing Machine',
  'Yoga Mat',
  'Full Gym Access',
];

export default {
  APP_NAME,
  APP_VERSION,
  HEALTH_METRICS,
  MEAL_TYPES,
  WORKOUT_TYPES,
  GOAL_TYPES,
  FITNESS_LEVELS,
  DIFFICULTY_LEVELS,
  DEFAULT_GOALS,
  MACRO_RATIOS,
  CALORIES_PER_GRAM,
  ACHIEVEMENTS,
  CHAT_ROLES,
  OPENAI_CONFIG,
  SYNC_INTERVALS,
  STORAGE_KEYS,
  ROUTES,
  NOTIFICATION_TYPES,
  DAYS_OF_WEEK,
  DAYS_SHORT,
  DIETARY_RESTRICTIONS,
  EQUIPMENT_OPTIONS,
};


