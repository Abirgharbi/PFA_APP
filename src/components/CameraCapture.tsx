
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Image, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (image: File) => void;
  onSelectFile?: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onSelectFile }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      alert('Error accessing camera. Please make sure you have granted camera permissions.');
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

  const acceptCapturedImage = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      onCapture(file);
      
      setCapturedImage(null);
    }, 'image/jpeg', 0.95);
  };

  const rejectCapturedImage = () => {
    setCapturedImage(null);
    
    if (!isCameraActive) {
      setIsCameraActive(true);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (onSelectFile) {
      onSelectFile(file);
    }
    
    e.target.value = '';
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelection}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {isCameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {capturedImage && !isCameraActive && (
          <div className="relative w-full h-full">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-contain bg-black" 
            />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-black bg-opacity-50">
              <Button 
                variant="destructive" 
                size="icon" 
                className="mr-4 rounded-full"
                onClick={rejectCapturedImage}
              >
                <X className="h-5 w-5" />
              </Button>
              <Button 
                variant="default"
                size="icon"
                className="rounded-full bg-green-500 hover:bg-green-600"
                onClick={acceptCapturedImage}
              >
                <Check className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {!isCameraActive && !capturedImage && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-gray-400 mb-4">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p className="text-center">No image selected</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={toggleCamera} variant="default" className="bg-medical">
                Open Camera
              </Button>
              <Button onClick={triggerFileInput} variant="outline">
                Upload Image
              </Button>
            </div>
          </div>
        )}
        
        {isCameraActive && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-black bg-opacity-50">
            {isMobile && availableCameras.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 text-white hover:text-white hover:bg-white/20"
                onClick={switchCamera}
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="default"
              size="icon"
              className={cn(
                "rounded-full bg-white hover:bg-gray-200",
                "h-12 w-12 flex items-center justify-center"
              )}
              onClick={captureImage}
            >
              <div className="w-10 h-10 rounded-full border-2 border-gray-700"></div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-4 text-white hover:text-white hover:bg-white/20"
              onClick={toggleCamera}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      
      {!isCameraActive && !capturedImage && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Take a photo of a medical report or upload an existing image</p>
        </div>
      )}

      {hasCameraPermission === false && (
        <div className="mt-2 text-center text-sm text-red-500">
          <p>Camera permission denied. Please check your browser settings.</p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
