/**
 * FatToFit Tab Navigator
 * Main bottom tab navigation for the app
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, spacing, sizes } from '../theme';
import { ROUTES } from '../utils/constants';

// Screens (will be implemented)
import DashboardScreen from '../screens/DashboardScreen';
import HealthMetricsScreen from '../screens/HealthMetricsScreen';
import NutritionScreen from '../screens/NutritionScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import CoachChatScreen from '../screens/CoachChatScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();

// Tab icons using emoji (can be replaced with proper icons later)
const TabIcon = ({ name, focused }) => {
  const icons = {
    [ROUTES.DASHBOARD]: '🏠',
    [ROUTES.HEALTH_METRICS]: '❤️',
    [ROUTES.NUTRITION]: '🍎',
    [ROUTES.WORKOUTS]: '💪',
    [ROUTES.COACH_CHAT]: '🤖',
    [ROUTES.PROGRESS]: '📊',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '●'}
      </Text>
      {focused && <View style={styles.indicator} />}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name={ROUTES.DASHBOARD}
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name={ROUTES.HEALTH_METRICS}
        component={HealthMetricsScreen}
        options={{ tabBarLabel: 'Health' }}
      />
      <Tab.Screen
        name={ROUTES.NUTRITION}
        component={NutritionScreen}
        options={{ tabBarLabel: 'Nutrition' }}
      />
      <Tab.Screen
        name={ROUTES.WORKOUTS}
        component={WorkoutsScreen}
        options={{ tabBarLabel: 'Workouts' }}
      />
      <Tab.Screen
        name={ROUTES.COACH_CHAT}
        component={CoachChatScreen}
        options={{ tabBarLabel: 'Coach' }}
      />
      <Tab.Screen
        name={ROUTES.PROGRESS}
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progress' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopColor: colors.surface.border,
    borderTopWidth: 1,
    height: sizes.tabBarHeight,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
    paddingTop: spacing.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: spacing.xs2,
  },
  tabItem: {
    paddingTop: spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
});

export default TabNavigator;


