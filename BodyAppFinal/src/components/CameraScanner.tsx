import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';

const COLORS = {
  green: '#2E7D32',
  black: '#000000',
  white: '#FFFFFF',
  greenLight: '#4CAF50',
};

interface CameraScannerProps {
  onFrontPoseDetected: (landmarks: any[]) => void;
  onSidePoseDetected: (landmarks: any[]) => void;
  currentPose: 'front' | 'side';
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onFrontPoseDetected,
  onSidePoseDetected,
  currentPose,
}) => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const device = useCameraDevice(cameraType);
  const [poseDetected, setPoseDetected] = useState(false);
  const [poseQuality, setPoseQuality] = useState(0);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Simulate pose detection (TODO: Replace with real TensorFlow integration)
  useEffect(() => {
    if (!hasPermission || !device || capturing) return;

    const detectPose = setInterval(() => {
      // Simulate random pose detection quality (0-100)
      const quality = Math.floor(Math.random() * 100);
      setPoseQuality(quality);
      setPoseDetected(quality > 60);
    }, 500);

    return () => clearInterval(detectPose);
  }, [hasPermission, device, capturing]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>
        <Text style={styles.textSmall}>Please grant camera access to continue</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  const handleCapture = () => {
    if (capturing) return;
    setCapturing(true);
    
    // Simulate pose capture for now until we integrate TensorFlow properly
    const mockLandmarks = Array(33).fill(null).map(() => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      visibility: 0.9,
    }));

    setTimeout(() => {
      if (currentPose === 'front') {
        onFrontPoseDetected(mockLandmarks);
      } else {
        onSidePoseDetected(mockLandmarks);
      }
    }, 500);
  };

  const toggleCamera = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <View style={styles.overlay}>
        {/* Top instruction */}
        <View style={styles.topBar}>
          <Text style={styles.instruction}>
            {currentPose === 'front' 
              ? '📸 Face the camera' 
              : '📸 Turn 90° to your right'}
          </Text>
        </View>
        
        {/* Center status */}
        {capturing ? (
          <>
            <ActivityIndicator size="large" color={COLORS.green} style={{marginTop: 30}} />
            <Text style={styles.capturingText}>Capturing pose...</Text>
          </>
        ) : (
          <>
            <Text style={styles.readinessText}>
              {poseDetected 
                ? '✅ Ready! Press capture' 
                : poseQuality > 40
                  ? '📏 Adjust position...'
                  : '⏺ Step back, show full body'}
            </Text>
            {poseDetected && (
              <View style={styles.qualityBar}>
                <View style={[styles.qualityFill, {width: `${poseQuality}%`}]} />
              </View>
            )}
          </>
        )}
        
        {/* Camera Controls */}
        <View style={styles.controls}>
          <View style={styles.buttonRow}>
            {/* Toggle Camera Button */}
            <TouchableOpacity style={styles.button} onPress={toggleCamera}>
              <Text style={styles.buttonIcon}>🔄</Text>
              <Text style={styles.buttonLabel}>Flip</Text>
            </TouchableOpacity>
            
            {/* Capture Button */}
            <TouchableOpacity 
              style={[styles.button, styles.captureButtonContainer]}
              onPress={handleCapture}
              disabled={capturing}>
              <Text style={styles.captureButton}>📸</Text>
              <Text style={styles.buttonLabel}>Capture</Text>
            </TouchableOpacity>
            
            {/* Gallery Button - Placeholder for now */}
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={styles.buttonLabel}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  instruction: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: COLORS.green + 'EE',
    padding: 18,
    borderRadius: 15,
    textAlign: 'center',
  },
  qualityBar: {
    width: '80%',
    height: 8,
    backgroundColor: COLORS.black + 'AA',
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  qualityFill: {
    height: '100%',
    backgroundColor: COLORS.greenLight,
  },
  readinessText: {
    fontSize: 20,
    color: COLORS.white,
    marginTop: 30,
    fontWeight: '600',
    backgroundColor: COLORS.black + 'CC',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 12,
  },
  capturingText: {
    fontSize: 18,
    color: COLORS.white,
    marginTop: 20,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 36,
    backgroundColor: COLORS.green,
    borderRadius: 35,
    width: 70,
    height: 70,
    textAlign: 'center',
    lineHeight: 70,
    overflow: 'hidden',
  },
  captureButtonContainer: {
    transform: [{scale: 1.2}],
  },
  captureButton: {
    fontSize: 42,
    backgroundColor: COLORS.greenLight,
    borderRadius: 40,
    width: 80,
    height: 80,
    textAlign: 'center',
    lineHeight: 80,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  buttonLabel: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  text: {
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  textSmall: {
    fontSize: 16,
    color: COLORS.green,
    textAlign: 'center',
    marginTop: 10,
  },
});
