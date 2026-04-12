import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';
import colors from '../theme/colors';
import spacing from '../theme/spacing';

const { width } = Dimensions.get('window');

/**
 * Water Intake Modal Component
 * Displays a water glass visualization with preset amount buttons
 */
const WaterIntakeModal = ({ visible, onClose, currentIntake, goal, onAddWater }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const waterLevelAnim = useRef(new Animated.Value(0)).current;
  const [selectedAmount, setSelectedAmount] = useState(null);

  const presetAmounts = [100, 200, 300, 500, 1000, 1200];
  const oneGlassAmount = 250; // Standard glass size in ml

  useEffect(() => {
    if (visible) {
      // Animate modal slide up
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
      
      // Set initial water level animation
      const progress = Math.min((currentIntake / goal) * 100, 100) / 100;
      Animated.timing(waterLevelAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      slideAnim.setValue(0);
      waterLevelAnim.setValue(0);
      setSelectedAmount(null);
    }
  }, [visible, currentIntake, goal]);

  const handleAddWater = (amount) => {
    setSelectedAmount(amount);
    
    // Animate water level increase
    const newIntake = currentIntake + (amount / 1000);
    const newProgress = Math.min((newIntake / goal) * 100, 100) / 100;
    
    Animated.timing(waterLevelAnim, {
      toValue: newProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
    
    // Call parent handler
    if (onAddWater) {
      onAddWater(amount);
    }
    
    // Reset selection after animation
    setTimeout(() => {
      setSelectedAmount(null);
    }, 1000);
  };

  const handleAddOneGlass = () => {
    handleAddWater(oneGlassAmount);
  };

  const handleRemoveOneGlass = () => {
    const amountToRemove = oneGlassAmount;
    const newIntake = Math.max(0, currentIntake - (amountToRemove / 1000));
    const newProgress = Math.min((newIntake / goal) * 100, 100) / 100;
    
    Animated.timing(waterLevelAnim, {
      toValue: newProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
    
    // Call parent handler to remove water
    if (onAddWater) {
      // Pass negative amount to indicate removal
      onAddWater(-amountToRemove);
    }
  };

  const progressPercentage = Math.min((currentIntake / goal) * 100, 100);
  const currentIntakeMl = Math.round(currentIntake * 1000);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const waterLevelHeight = waterLevelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 230], // Height of water in glass (from bottom to top)
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Water Glass Visualization - Ultra Realistic Glass Design */}
          <View style={styles.glassContainer}>
            {/* Add One Glass Button - Front of glass */}
            <TouchableOpacity
              style={styles.glassControlButton}
              onPress={handleAddOneGlass}
              activeOpacity={0.7}
            >
              <View style={styles.glassControlButtonContent}>
                <Ionicons name="add-circle" size={40} color={colors.teal} />
                <Text style={styles.glassControlButtonText}>+1 Glass</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.glassWrapper}>
              <Svg width={180} height={300} viewBox="0 0 180 300">
                <Defs>
                  {/* Glass gradient for realistic transparency */}
                  <LinearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" stopOpacity="0.3" />
                    <Stop offset="50%" stopColor="rgba(240, 240, 240, 0.2)" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" stopOpacity="0.25" />
                  </LinearGradient>
                  
                  {/* Glass rim gradient */}
                  <LinearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="rgba(180, 180, 180, 0.9)" />
                    <Stop offset="50%" stopColor="rgba(220, 220, 220, 0.95)" />
                    <Stop offset="100%" stopColor="rgba(180, 180, 180, 0.9)" />
                  </LinearGradient>
                  
                  {/* Glass highlight gradient */}
                  <LinearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                    <Stop offset="30%" stopColor="rgba(255, 255, 255, 0.7)" />
                    <Stop offset="70%" stopColor="rgba(255, 255, 255, 0.5)" />
                    <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                  </LinearGradient>
                </Defs>
                
                {/* Glass base shadow (behind everything) */}
                <Ellipse
                  cx="90"
                  cy="290"
                  rx="40"
                  ry="12"
                  fill="#000000"
                  opacity={0.2}
                />
                <Ellipse
                  cx="90"
                  cy="290"
                  rx="35"
                  ry="8"
                  fill="#000000"
                  opacity={0.15}
                />
                
                {/* Glass outer wall - left side */}
                <Path
                  d="M 50 35 Q 50 15 60 15 L 70 15 Q 75 15 75 20 L 75 255 Q 75 265 70 265 L 60 265 Q 50 265 50 255 Z"
                  fill="rgba(230, 230, 230, 0.25)"
                  stroke="rgba(180, 180, 180, 0.4)"
                  strokeWidth="1.5"
                />
                
                {/* Glass outer wall - right side */}
                <Path
                  d="M 105 35 Q 105 15 95 15 L 85 15 Q 80 15 80 20 L 80 255 Q 80 265 85 265 L 95 265 Q 105 265 105 255 Z"
                  fill="rgba(230, 230, 230, 0.25)"
                  stroke="rgba(180, 180, 180, 0.4)"
                  strokeWidth="1.5"
                />
                
                {/* Glass body - main structure with realistic curve */}
                <Path
                  d="M 50 35 Q 50 15 60 15 L 120 15 Q 130 15 130 35 L 130 255 Q 130 265 120 265 L 60 265 Q 50 265 50 255 Z"
                  fill="url(#glassGradient)"
                  stroke="rgba(160, 160, 160, 0.5)"
                  strokeWidth="2"
                />
                
                {/* Glass rim - thick and realistic */}
                <Path
                  d="M 60 15 L 120 15"
                  stroke="url(#rimGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <Path
                  d="M 60 15 L 120 15"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Glass rim inner shadow */}
                <Path
                  d="M 62 17 L 118 17"
                  stroke="rgba(100, 100, 100, 0.4)"
                  strokeWidth="1"
                />
                
                {/* Main glass highlight - left side (bright reflection) */}
                <Path
                  d="M 55 25 L 75 25 Q 80 25 80 30 L 80 140 Q 80 145 75 145 L 55 145 Q 50 145 50 140 Z"
                  fill="url(#highlightGradient)"
                  opacity={0.7}
                />
                
                {/* Secondary highlight - right side (softer reflection) */}
                <Path
                  d="M 105 40 L 125 40 Q 130 40 130 45 L 130 160 Q 130 165 125 165 L 105 165 Q 100 165 100 160 Z"
                  fill="rgba(255, 255, 255, 0.25)"
                  opacity={0.5}
                />
                
                {/* Glass thickness effect - inner edge highlight */}
                <Path
                  d="M 60 20 L 60 260"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                />
                <Path
                  d="M 120 20 L 120 260"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                />
                
                {/* Glass base - thick bottom */}
                <Path
                  d="M 60 255 L 120 255"
                  stroke="rgba(140, 140, 140, 0.7)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <Path
                  d="M 60 255 L 120 255"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Refraction lines - showing light bending */}
                <Path
                  d="M 65 60 L 65 240"
                  stroke="rgba(200, 200, 200, 0.25)"
                  strokeWidth="0.8"
                  strokeDasharray="3,4"
                />
                <Path
                  d="M 115 60 L 115 240"
                  stroke="rgba(200, 200, 200, 0.25)"
                  strokeWidth="0.8"
                  strokeDasharray="3,4"
                />
                
                {/* Caustic light patterns on glass */}
                <Path
                  d="M 70 80 Q 75 85 80 80 Q 85 85 90 80 Q 95 85 100 80"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1"
                  fill="none"
                  opacity={0.4}
                />
                <Path
                  d="M 70 120 Q 75 125 80 120 Q 85 125 90 120 Q 95 125 100 120"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1"
                  fill="none"
                  opacity={0.3}
                />
              </Svg>
              
              {/* Water fill - ultra realistic water with proper meniscus */}
              <Animated.View
                style={[
                  styles.waterFill,
                  {
                    height: waterLevelHeight,
                  },
                ]}
              >
                <View style={styles.waterContent}>
                  <Svg width={80} height={230} viewBox="0 0 80 230" style={styles.waterSvg}>
                    <Defs>
                      {/* Water depth gradient - darker at bottom */}
                      <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#B2EBF2" stopOpacity="0.9" />
                        <Stop offset="30%" stopColor={colors.teal} stopOpacity="0.85" />
                        <Stop offset="70%" stopColor={colors.teal} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor="#00838F" stopOpacity="0.95" />
                      </LinearGradient>
                      
                      {/* Water surface gradient - realistic meniscus */}
                      <LinearGradient id="waterSurface" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#00838F" stopOpacity="0.98" />
                        <Stop offset="15%" stopColor={colors.teal} stopOpacity="0.95" />
                        <Stop offset="50%" stopColor="#B2EBF2" stopOpacity="0.85" />
                        <Stop offset="85%" stopColor={colors.teal} stopOpacity="0.95" />
                        <Stop offset="100%" stopColor="#00838F" stopOpacity="0.98" />
                      </LinearGradient>
                      
                      {/* Water highlight gradient */}
                      <LinearGradient id="waterHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                        <Stop offset="40%" stopColor="rgba(255, 255, 255, 0.5)" />
                        <Stop offset="60%" stopColor="rgba(255, 255, 255, 0.4)" />
                        <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                      </LinearGradient>
                    </Defs>
                    
                    {/* Water body - main fill with realistic shape */}
                    <Path
                      d="M 0 230 L 0 8 Q 0 0 4 0 Q 12 1.5 20 0 Q 28 1.5 30 0 Q 35 1 40 0 Q 45 1 50 0 Q 55 1 60 0 Q 68 1.5 76 0 Q 80 0 80 8 L 80 230 Z"
                      fill="url(#waterGradient)"
                    />
                    
                    {/* Water surface - realistic meniscus (curved up at edges) */}
                    <Path
                      d="M 0 0 Q 4 -3 8 0 Q 15 1.5 20 0 Q 25 1 30 0 Q 35 1 40 0 Q 45 1 50 0 Q 55 1 60 0 Q 65 1.5 72 0 Q 76 -3 80 0"
                      fill="url(#waterSurface)"
                      stroke="#00838F"
                      strokeWidth="0.8"
                      opacity={0.95}
                    />
                    
                    {/* Meniscus edge highlights */}
                    <Path
                      d="M 0 0 Q 4 -2 8 0"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="1.5"
                      fill="none"
                      opacity={0.7}
                    />
                    <Path
                      d="M 72 0 Q 76 -2 80 0"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="1.5"
                      fill="none"
                      opacity={0.7}
                    />
                    
                    {/* Light reflection on water surface */}
                    <Path
                      d="M 15 0 Q 25 2 35 0 Q 45 2 55 0 Q 60 2 65 0"
                      fill="url(#waterHighlight)"
                      opacity={0.8}
                    />
                    
                    {/* Water depth effect - darker areas */}
                    <Path
                      d="M 0 180 L 0 230 L 80 230 L 80 180 Q 80 175 75 175 L 5 175 Q 0 175 0 180 Z"
                      fill="#006064"
                      opacity={0.3}
                    />
                    
                    {/* Water bubbles rising - various sizes */}
                    <Circle cx="25" cy="50" r="2" fill="rgba(255, 255, 255, 0.8)" opacity={0.9} />
                    <Circle cx="55" cy="70" r="1.5" fill="rgba(255, 255, 255, 0.7)" opacity={0.8} />
                    <Circle cx="20" cy="100" r="1.2" fill="rgba(255, 255, 255, 0.6)" opacity={0.7} />
                    <Circle cx="60" cy="120" r="1" fill="rgba(255, 255, 255, 0.5)" opacity={0.6} />
                    <Circle cx="15" cy="150" r="0.8" fill="rgba(255, 255, 255, 0.4)" opacity={0.5} />
                    <Circle cx="50" cy="170" r="1.3" fill="rgba(255, 255, 255, 0.5)" opacity={0.6} />
                    
                    {/* Light refraction through water - curved paths */}
                    <Path
                      d="M 30 25 Q 35 35 30 45 Q 35 55 30 65 Q 35 75 30 85"
                      stroke="rgba(255, 255, 255, 0.35)"
                      strokeWidth="1.2"
                      fill="none"
                      opacity={0.6}
                    />
                    <Path
                      d="M 50 35 Q 55 45 50 55 Q 55 65 50 75 Q 55 85 50 95"
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="1"
                      fill="none"
                      opacity={0.5}
                    />
                    
                    {/* Water surface ripples */}
                    <Path
                      d="M 10 -1 Q 20 0 30 -1 Q 40 0 50 -1 Q 60 0 70 -1"
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="0.5"
                      fill="none"
                      opacity={0.5}
                    />
                  </Svg>
                </View>
              </Animated.View>
            </View>

            {/* Remove One Glass Button - End of glass */}
            <TouchableOpacity
              style={styles.glassControlButton}
              onPress={handleRemoveOneGlass}
              activeOpacity={0.7}
            >
              <View style={styles.glassControlButtonContent}>
                <Ionicons name="remove-circle" size={40} color={colors.orange || '#FF6B6B'} />
                <Text style={[styles.glassControlButtonText, styles.glassControlButtonTextRemove]}>-1 Glass</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Current Intake Display */}
          <View style={styles.intakeDisplay}>
            <Text style={styles.intakeValue}>{currentIntakeMl.toLocaleString()}ml</Text>
            <Text style={styles.intakeSubtext}>
              Hydration • {Math.round(progressPercentage)}% of your goal
            </Text>
          </View>

          {/* Preset Amount Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonsContainer}
            style={styles.buttonsScrollView}
          >
            {presetAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.amountButtonSelected,
                ]}
                onPress={() => handleAddWater(amount)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.amountButtonTextSelected,
                  ]}
                >
                  {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.radiusLarge,
    borderTopRightRadius: spacing.radiusLarge,
    padding: spacing.paddingLarge,
    paddingBottom: spacing.xxl + 20,
    maxHeight: '80%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
    height: 300,
  },
  glassWrapper: {
    position: 'relative',
    width: 180,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
  },
  glassControlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    minWidth: 80,
  },
  glassControlButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassControlButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.teal,
    marginTop: spacing.xs,
  },
  glassControlButtonTextRemove: {
    color: colors.orange || '#FF6B6B',
  },
  waterFill: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    width: 80,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  waterContent: {
    width: 80,
    height: 230,
  },
  waterSvg: {
    width: 80,
    height: 230,
  },
  intakeDisplay: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  intakeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.teal,
    marginBottom: spacing.xs,
  },
  intakeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonsScrollView: {
    marginHorizontal: -spacing.paddingLarge,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.paddingLarge,
    paddingVertical: spacing.sm,
  },
  amountButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radius,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountButtonSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  amountButtonTextSelected: {
    color: colors.textWhite,
  },
});

export default WaterIntakeModal;

