
import { useState, useEffect, useRef } from 'react';
import { FacingMode } from '@/components/camera/types';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Check for available cameras when component mounts
  useEffect(() => {
    const checkCameras = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(device => device.kind === 'videoinput');
          setAvailableCameras(cameras);
          console.log("Available cameras:", cameras.length);
        }
      } catch (error) {
        console.error("Error checking cameras:", error);
      }
    };
    
    checkCameras();
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isCameraActive, facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      console.log(`Attempting to start camera with facing mode: ${facingMode}`);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setHasCameraPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      stopCamera();
    } else {
      setIsCameraActive(true);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    console.log("Switching camera to:", facingMode === 'user' ? 'environment' : 'user');
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      setCapturedImage(URL.createObjectURL(blob));
      
      stopCamera();
      setIsCameraActive(false);
    }, 'image/jpeg', 0.95);
  };

  const rejectCapturedImage = () => {
    setCapturedImage(null);
    
    if (!isCameraActive) {
      setIsCameraActive(true);
    }
  };

  return {
    videoRef,
    canvasRef,
    isCameraActive,
    facingMode,
    capturedImage,
    availableCameras,
    hasCameraPermission,
    toggleCamera,
    switchCamera,
    captureImage,
    rejectCapturedImage,
    setCapturedImage,
    setIsCameraActive,
    stopCamera
  };
}
