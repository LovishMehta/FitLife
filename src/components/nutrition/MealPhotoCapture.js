/**
 * FatToFit Meal Photo Capture Component
 * Capture meal photos for AI macro estimation
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { Button, Card } from '../common';
import nutritionAIService from '../../services/nutritionAIService';

const MealPhotoCapture = ({ visible, onClose, onAnalysisComplete, apiKey }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const cameraRef = useRef(null);

  const resetState = () => {
    setPhoto(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });
      setPhoto(result.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzePhoto = async () => {
    if (!photo) return;

    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'Please add your OpenAI API key in Settings to use photo analysis.',
        [{ text: 'OK', onPress: handleClose }]
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(photo, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const result = await nutritionAIService.estimateFromPhoto(base64, apiKey);

      if (result.success) {
        setAnalysisResult(result.data);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze the photo. Please try again.');
        setPhoto(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze photo');
      setPhoto(null);
    }

    setIsAnalyzing(false);
  };

  const confirmAnalysis = () => {
    if (analysisResult) {
      onAnalysisComplete({
        ...analysisResult,
        photo_url: photo, // Local URI, would need to upload to storage for persistence
      });
      handleClose();
    }
  };

  if (!permission) {
    return null;
  }

  // Show analysis result
  if (analysisResult) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Analysis Result</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.resultContainer}>
            <Image source={{ uri: photo }} style={styles.resultPhoto} />
            
            <Card style={styles.resultCard}>
              <Text style={styles.mealName}>{analysisResult.meal_name}</Text>
              
              {analysisResult.items?.length > 0 && (
                <Text style={styles.itemsList}>
                  Identified: {analysisResult.items.join(', ')}
                </Text>
              )}

              <View style={styles.macrosGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{analysisResult.calories}</Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: colors.macros.protein }]}>
                    {analysisResult.protein_g}g
                  </Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: colors.macros.carbs }]}>
                    {analysisResult.carbs_g}g
                  </Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: colors.macros.fat }]}>
                    {analysisResult.fat_g}g
                  </Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>

              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>AI Confidence:</Text>
                <View style={[
                  styles.confidenceBadge,
                  analysisResult.ai_confidence > 0.7 
                    ? styles.confidenceHigh 
                    : analysisResult.ai_confidence > 0.5 
                      ? styles.confidenceMedium 
                      : styles.confidenceLow,
                ]}>
                  <Text style={styles.confidenceText}>
                    {analysisResult.ai_confidence > 0.7 
                      ? 'High' 
                      : analysisResult.ai_confidence > 0.5 
                        ? 'Medium' 
                        : 'Low'}
                  </Text>
                </View>
              </View>

              {analysisResult.notes && (
                <Text style={styles.notes}>{analysisResult.notes}</Text>
              )}
            </Card>
          </View>

          <View style={styles.footer}>
            <Button
              title="Retake Photo"
              variant="outline"
              onPress={() => {
                setPhoto(null);
                setAnalysisResult(null);
              }}
              style={styles.footerButton}
            />
            <Button
              title="Use This"
              onPress={confirmAnalysis}
              style={styles.footerButton}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // Show photo preview
  if (photo) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Review Photo</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.previewContainer}>
            <Image source={{ uri: photo }} style={styles.preview} />
            
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.analyzingText}>Analyzing meal...</Text>
                <Text style={styles.analyzingHint}>
                  Our AI is identifying the food and estimating nutrition
                </Text>
              </View>
            )}
          </View>

          {!isAnalyzing && (
            <View style={styles.footer}>
              <Button
                title="Retake"
                variant="outline"
                onPress={() => setPhoto(null)}
                style={styles.footerButton}
              />
              <Button
                title="Analyze"
                onPress={analyzePhoto}
                style={styles.footerButton}
              />
            </View>
          )}
        </View>
      </Modal>
    );
  }

  // Show camera
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            We need camera access to take photos of your meals for AI analysis.
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
          <Button
            title="Pick from Gallery"
            variant="outline"
            onPress={pickFromGallery}
            style={styles.permissionButton}
          />
          <Button
            title="Cancel"
            variant="ghost"
            onPress={handleClose}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Take Photo</Text>
              <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
                <Text style={styles.galleryText}>🖼️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cameraHint}>
              <Text style={styles.hintText}>
                Center your meal in the frame
              </Text>
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xl3,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: colors.text.primary,
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  galleryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryText: {
    fontSize: 20,
  },
  cameraHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    ...textStyles.body,
    color: colors.text.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  cameraControls: {
    padding: spacing.xl2,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.text.primary,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.text.primary,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingText: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  analyzingHint: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  // Result screen
  resultContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  resultPhoto: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  resultCard: {
    flex: 1,
  },
  mealName: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  itemsList: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: spacing.lg,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  macroLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confidenceLabel: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs2,
    borderRadius: borderRadius.sm,
  },
  confidenceHigh: {
    backgroundColor: colors.semantic.successBg,
  },
  confidenceMedium: {
    backgroundColor: colors.semantic.warningBg,
  },
  confidenceLow: {
    backgroundColor: colors.semantic.errorBg,
  },
  confidenceText: {
    ...textStyles.tiny,
    fontWeight: '600',
  },
  notes: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  permissionTitle: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  permissionText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    marginBottom: spacing.md,
    minWidth: 200,
  },
});

export default MealPhotoCapture;


