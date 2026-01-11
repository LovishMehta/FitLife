import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/**
 * GoalProgress Component - Circular progress ring showing goal achievement
 */
const GoalProgress = ({ steps, goal }) => {
  const percentage = Math.min((steps / goal) * 100, 100);
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getProgressColor = () => {
    if (percentage >= 100) return '#4CAF50'; // Green
    if (percentage >= 75) return '#8BC34A'; // Light green
    if (percentage >= 50) return '#FFC107'; // Amber
    if (percentage >= 25) return '#FF9800'; // Orange
    return '#FF5722'; // Red
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          stroke="#2A2A2A"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <Circle
          stroke={getProgressColor()}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        <Text style={styles.goalText}>of {goal.toLocaleString()}</Text>
        <Text style={styles.goalLabel}>daily goal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  goalText: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  goalLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default GoalProgress;

