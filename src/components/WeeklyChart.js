import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

/**
 * WeeklyChart Component - Shows last 7 days of step data
 */
const WeeklyChart = ({ weeklyData, goal }) => {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Weekly History</Text>
        <Text style={styles.noDataText}>No data available yet</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40; // 20px padding on each side

  const data = {
    labels: weeklyData.map(day => day.date),
    datasets: [
      {
        data: weeklyData.map(day => day.steps),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#1E1E1E',
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#2A2A2A',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 10,
    },
    barPercentage: 0.7,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly History</Text>
      <BarChart
        data={data}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero={true}
        showValuesOnTopOfBars={false}
        withInnerLines={true}
        segments={4}
      />
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(
              weeklyData.reduce((sum, day) => sum + day.steps, 0) / weeklyData.length
            ).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Avg/Day</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {weeklyData.reduce((sum, day) => sum + day.steps, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {weeklyData.filter(day => day.steps >= goal).length}
          </Text>
          <Text style={styles.statLabel}>Goals Hit</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default WeeklyChart;

