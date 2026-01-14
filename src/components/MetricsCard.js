import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';

/**
 * Metrics Card Component - Displays calories or water intake
 */
const MetricsCard = ({ title, value, unit, icon, progress = 0, maxValue = 100 }) => {
  const progressPercentage = Math.min((progress / maxValue) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={colors.teal} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {unit && <Text style={styles.unit}>{unit}</Text>}
      {title === 'Water Intake' && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: spacing.radius,
    padding: spacing.padding,
    marginHorizontal: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  title: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.teal,
    marginTop: spacing.xs,
  },
  unit: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 2,
  },
});

export default MetricsCard;



