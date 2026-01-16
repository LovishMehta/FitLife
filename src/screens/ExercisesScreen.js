import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import exerciseService from '../services/exerciseService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.padding * 2 - spacing.md) / 2;

/**
 * Exercises Screen - Browse exercises by body part or equipment
 */
const ExercisesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('bodyPart');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

  const loadCategories = () => {
    const cats = exerciseService.getCategories(activeTab);
    setCategories(cats);
  };

  const handleCategoryPress = (category) => {
    // For now, just show an alert - can be expanded to navigate to exercise list
    console.log('Category pressed:', category.name);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Exercises</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            Choose your workout focus
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bodyPart' && styles.tabActive]}
            onPress={() => setActiveTab('bodyPart')}
          >
            <Text style={[styles.tabText, activeTab === 'bodyPart' && styles.tabTextActive]}>
              Body Part
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'equipment' && styles.tabActive]}
            onPress={() => setActiveTab('equipment')}
          >
            <Text style={[styles.tabText, activeTab === 'equipment' && styles.tabTextActive]}>
              Equipment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Grid */}
        <View style={styles.gridContainer}>
          {filteredCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: category.color + '15' },
              ]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.color + '25' }]}>
                <Ionicons name={category.icon} size={28} color={category.color} />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.exerciseCount}>
                {category.exerciseCount} exercises
              </Text>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Start Section */}
        <View style={styles.quickStartSection}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <TouchableOpacity style={styles.quickStartCard}>
            <View style={styles.quickStartLeft}>
              <View style={styles.quickStartIcon}>
                <Ionicons name="flash" size={24} color={colors.yellow} />
              </View>
              <View style={styles.quickStartInfo}>
                <Text style={styles.quickStartTitle}>Today's Workout</Text>
                <Text style={styles.quickStartSubtitle}>Based on your goals</Text>
              </View>
            </View>
            <View style={styles.startButton}>
              <Text style={styles.startButtonText}>Start</Text>
              <Ionicons name="play" size={16} color={colors.background} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Exercises */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Popular Exercises</Text>
          {['Push-Ups', 'Squats', 'Plank', 'Lunges'].map((exercise, index) => (
            <TouchableOpacity key={index} style={styles.recentItem}>
              <View style={styles.recentLeft}>
                <View style={styles.recentIcon}>
                  <Ionicons name="fitness" size={20} color={colors.green} />
                </View>
                <Text style={styles.recentName}>{exercise}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.padding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.padding,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius,
    marginBottom: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.padding,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: spacing.radiusSmall + 4,
  },
  tabActive: {
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.green,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.padding,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: CARD_WIDTH,
    padding: spacing.md,
    borderRadius: spacing.radius,
    marginBottom: spacing.md,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  arrowContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  quickStartSection: {
    paddingHorizontal: spacing.padding,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  quickStartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: spacing.radius,
  },
  quickStartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.yellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quickStartInfo: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  quickStartSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusSmall + 4,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    marginRight: spacing.xs,
  },
  recentSection: {
    paddingHorizontal: spacing.padding,
    marginTop: spacing.xl,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: spacing.radius,
    marginBottom: spacing.sm,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recentName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});

export default ExercisesScreen;
