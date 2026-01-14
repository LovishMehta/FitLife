/**
 * FatToFit Barcode Scanner Component
 * Scans barcodes to look up food nutrition info
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { Button } from '../common';
import nutritionAIService from '../../services/nutritionAIService';

const BarcodeScanner = ({ visible, onClose, onScanComplete }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isLoading) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      const result = await nutritionAIService.lookupBarcode(data);

      if (result.success) {
        onScanComplete(result.data);
        onClose();
      } else {
        Alert.alert(
          'Product Not Found',
          'This barcode was not found in our database. You can enter the nutrition info manually.',
          [
            { text: 'Try Again', onPress: () => setScanned(false) },
            { text: 'Enter Manually', onPress: onClose },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan barcode. Please try again.');
      setScanned(false);
    }

    setIsLoading(false);
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan barcodes and food labels.
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
          <Button
            title="Cancel"
            variant="ghost"
            onPress={onClose}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Scan Barcode</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Scan Frame */}
            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Looking up product...</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.hint}>
                Position the barcode within the frame
              </Text>
              {scanned && !isLoading && (
                <Button
                  title="Scan Again"
                  variant="outline"
                  onPress={() => setScanned(false)}
                  style={styles.rescanButton}
                />
              )}
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 280,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary[500],
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  loadingText: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  hint: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  rescanButton: {
    minWidth: 150,
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

export default BarcodeScanner;


