'use client';

import { useRef, useState, useEffect } from 'react';
import { BodyScanner, PoseLandmarks } from '@/lib/bodyScanner';

interface ImageUploadCaptureProps {
  onComplete: (data: {
    frontPose: PoseLandmarks[];
    sidePose: PoseLandmarks[];
  }) => void;
  onSwitchToCamera: () => void;
}

export default function ImageUploadCapture({ onComplete, onSwitchToCamera }: ImageUploadCaptureProps) {
  const frontImageRef = useRef<HTMLInputElement>(null);
  const sideImageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<BodyScanner | null>(null);

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [frontPose, setFrontPose] = useState<PoseLandmarks[] | null>(null);
  const [sidePose, setSidePose] = useState<PoseLandmarks[] | null>(null);
  const [processing, setProcessing] = useState<'front' | 'side' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe scanner
  useEffect(() => {
    const initScanner = async () => {
      if (!canvasRef.current) return;
      
      try {
        scannerRef.current = new BodyScanner();
        await scannerRef.current.initialize(canvasRef.current, () => {});
      } catch (err) {
        console.error('Failed to initialize scanner:', err);
        setError('Failed to initialize pose detection');
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const processImage = async (imageUrl: string, type: 'front' | 'side') => {
    if (!scannerRef.current || !canvasRef.current) {
      setError('Scanner not initialized');
      return null;
    }

    setProcessing(type);
    setError(null);

    return new Promise<PoseLandmarks[] | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const canvas = canvasRef.current!;
          const ctx = canvas.getContext('2d');
          
          // Set canvas to image size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image to canvas
          ctx?.drawImage(img, 0, 0);

          // Process the image with MediaPipe
          // For now, we'll create proper 33-landmark mock data
          // (MediaPipe Pose returns 33 landmarks)
          const mockLandmarks: PoseLandmarks[] = Array(33).fill(null).map((_, i) => {
            // Create more realistic positions for key landmarks
            let x, y;
            if (i === 0) { // nose
              x = 0.5; y = 0.15;
            } else if (i >= 11 && i <= 12) { // shoulders
              x = i === 11 ? 0.4 : 0.6; y = 0.35;
            } else if (i >= 23 && i <= 24) { // hips
              x = i === 23 ? 0.45 : 0.55; y = 0.6;
            } else if (i >= 27 && i <= 28) { // ankles
              x = i === 27 ? 0.45 : 0.55; y = 0.95;
            } else {
              // Other landmarks distributed across body
              x = 0.4 + (i % 5) * 0.05;
              y = 0.2 + Math.floor(i / 5) * 0.1;
            }
            
            return {
              x,
              y,
              z: 0,
              visibility: 0.95,
            };
          });

          setProcessing(null);
          resolve(mockLandmarks);
        } catch (err) {
          console.error('Error processing image:', err);
          setError('Failed to process image');
          setProcessing(null);
          resolve(null);
        }
      };
      img.onerror = () => {
        setError('Failed to load image');
        setProcessing(null);
        resolve(null);
      };
      img.src = imageUrl;
    });
  };

  const handleFrontImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setFrontImage(url);
    
    const landmarks = await processImage(url, 'front');
    if (landmarks) {
      setFrontPose(landmarks);
    }
  };

  const handleSideImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSideImage(url);
    
    const landmarks = await processImage(url, 'side');
    if (landmarks) {
      setSidePose(landmarks);
    }
  };

  const handleAnalyze = () => {
    if (frontPose && sidePose) {
      onComplete({
        frontPose,
        sidePose,
      });
    }
  };

  const canAnalyze = frontPose && sidePose;

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.hiddenCanvas} />
      
      <div style={styles.header}>
        <h2 style={styles.title}>Upload Your Photos</h2>
        <p style={styles.subtitle}>Upload front and side pose photos for analysis</p>
      </div>

      <div style={styles.uploadGrid}>
        {/* Front Pose Upload */}
        <div style={styles.uploadCard}>
          <div style={styles.cardHeader}>
            <span style={styles.poseIcon}>📸</span>
            <h3 style={styles.cardTitle}>Front Pose</h3>
          </div>
          
          {frontImage ? (
            <div style={styles.imagePreviewContainer}>
              <img src={frontImage} alt="Front pose" style={styles.imagePreview} />
              {frontPose && <div style={styles.checkmark}>✅</div>}
              {processing === 'front' && <div style={styles.processingOverlay}>Processing...</div>}
            </div>
          ) : (
            <div 
              style={styles.uploadArea}
              onClick={() => frontImageRef.current?.click()}
            >
              <span style={styles.uploadIcon}>📤</span>
              <span style={styles.uploadText}>Click to upload</span>
              <span style={styles.uploadHint}>Stand facing the camera</span>
            </div>
          )}
          
          <input
            ref={frontImageRef}
            type="file"
            accept="image/*"
            onChange={handleFrontImageChange}
            style={styles.hiddenInput}
          />
          
          {frontImage && (
            <button 
              style={styles.changeButton}
              onClick={() => {
                setFrontImage(null);
                setFrontPose(null);
                frontImageRef.current?.click();
              }}
            >
              Change Photo
            </button>
          )}
        </div>

        {/* Side Pose Upload */}
        <div style={styles.uploadCard}>
          <div style={styles.cardHeader}>
            <span style={styles.poseIcon}>📸</span>
            <h3 style={styles.cardTitle}>Side Pose</h3>
          </div>
          
          {sideImage ? (
            <div style={styles.imagePreviewContainer}>
              <img src={sideImage} alt="Side pose" style={styles.imagePreview} />
              {sidePose && <div style={styles.checkmark}>✅</div>}
              {processing === 'side' && <div style={styles.processingOverlay}>Processing...</div>}
            </div>
          ) : (
            <div 
              style={styles.uploadArea}
              onClick={() => sideImageRef.current?.click()}
            >
              <span style={styles.uploadIcon}>📤</span>
              <span style={styles.uploadText}>Click to upload</span>
              <span style={styles.uploadHint}>Turn 90° to your right</span>
            </div>
          )}
          
          <input
            ref={sideImageRef}
            type="file"
            accept="image/*"
            onChange={handleSideImageChange}
            style={styles.hiddenInput}
          />
          
          {sideImage && (
            <button 
              style={styles.changeButton}
              onClick={() => {
                setSideImage(null);
                setSidePose(null);
                sideImageRef.current?.click();
              }}
            >
              Change Photo
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <div style={styles.actions}>
        <button
          style={{
            ...styles.analyzeButton,
            ...(canAnalyze ? {} : styles.disabledButton),
          }}
          disabled={!canAnalyze}
          onClick={handleAnalyze}
        >
          {canAnalyze ? '🔬 Analyze My Physique' : 'Upload Both Photos to Continue'}
        </button>

        <button style={styles.switchButton} onClick={onSwitchToCamera}>
          📹 Use Camera Instead
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
  },
  hiddenCanvas: {
    display: 'none',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#2E7D32',
  },
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '700px',
    width: '100%',
    marginBottom: '40px',
  },
  uploadCard: {
    backgroundColor: '#000000',
    border: '2px solid #2E7D32',
    borderRadius: '20px',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  poseIcon: {
    fontSize: '24px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: 0,
  },
  uploadArea: {
    width: '100%',
    height: '200px',
    border: '2px dashed #2E7D32',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  uploadText: {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: '5px',
  },
  uploadHint: {
    fontSize: '14px',
    color: '#2E7D32',
  },
  hiddenInput: {
    display: 'none',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    borderRadius: '15px',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '15px',
  },
  checkmark: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '32px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '50%',
    padding: '5px',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4CAF50',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  changeButton: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #2E7D32',
    borderRadius: '25px',
    color: '#2E7D32',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  error: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid #f44336',
    borderRadius: '10px',
    padding: '15px 25px',
    color: '#f44336',
    marginBottom: '20px',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    width: '100%',
    maxWidth: '400px',
  },
  analyzeButton: {
    width: '100%',
    padding: '18px 40px',
    backgroundColor: '#2E7D32',
    border: 'none',
    borderRadius: '50px',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  switchButton: {
    padding: '15px 30px',
    backgroundColor: 'transparent',
    border: '2px solid #2E7D32',
    borderRadius: '50px',
    color: '#2E7D32',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

