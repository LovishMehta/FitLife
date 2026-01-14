/**
 * FatToFit App Navigator
 * Root navigation controller that manages auth state and navigation
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { ROUTES } from '../utils/constants';
import useAuthStore from '../stores/useAuthStore';
import authService from '../services/authService';

// Navigators
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import TabNavigator from './TabNavigator';

// Modal Screens
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { 
    isLoading, 
    isAuthenticated, 
    onboardingCompleted, 
    initialize, 
    setAuthState 
  } = useAuthStore();
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize auth state
    initialize().then(() => setIsReady(true));

    // Subscribe to auth state changes
    const subscription = authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setAuthState(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading screen while checking auth state
  if (isLoading || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary[500],
          background: colors.background.primary,
          card: colors.background.secondary,
          text: colors.text.primary,
          border: colors.surface.border,
          notification: colors.semantic.error,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack - Not logged in
          <Stack.Screen name={ROUTES.AUTH} component={AuthNavigator} />
        ) : !onboardingCompleted ? (
          // Onboarding Stack - Logged in but not onboarded
          <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingNavigator} />
        ) : (
          // Main App Stack - Fully authenticated and onboarded
          <>
            <Stack.Screen name={ROUTES.MAIN} component={TabNavigator} />
            <Stack.Screen
              name={ROUTES.SETTINGS}
              component={SettingsScreen}
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppNavigator;


