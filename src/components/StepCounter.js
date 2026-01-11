import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

/**
 * StepCounter Component - Displays today's step count with animation
 */
const StepCounter = ({ steps, isLoading }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [steps]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
          opacity: animatedValue,
        },
      ]}
    >
      <Text style={styles.label}>Steps Today</Text>
      <Text style={styles.stepCount}>{steps.toLocaleString()}</Text>
      <Text style={styles.subtitle}>Keep moving! 🚶</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepCount: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
});

export default StepCounter;

