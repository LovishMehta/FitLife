/**
 * FatToFit Onboarding Navigator
 * Multi-step onboarding flow
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { ROUTES } from '../utils/constants';

// Onboarding Screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import FitnessProfileScreen from '../screens/onboarding/FitnessProfileScreen';
import HealthLifestyleScreen from '../screens/onboarding/HealthLifestyleScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';
import APISetupScreen from '../screens/onboarding/APISetupScreen';
import FirstPlanScreen from '../screens/onboarding/FirstPlanScreen';

const Stack = createNativeStackNavigator();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen name={ROUTES.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={ROUTES.GOALS} component={GoalsScreen} />
      <Stack.Screen name={ROUTES.FITNESS_PROFILE} component={FitnessProfileScreen} />
      <Stack.Screen name={ROUTES.HEALTH_LIFESTYLE} component={HealthLifestyleScreen} />
      <Stack.Screen name={ROUTES.PERMISSIONS} component={PermissionsScreen} />
      <Stack.Screen name={ROUTES.API_SETUP} component={APISetupScreen} />
      <Stack.Screen name={ROUTES.FIRST_PLAN} component={FirstPlanScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;


