
import React, { useRef, useState, useEffect } from 'react';
import { Camera, FlipCamera, Image, X, Check } from 'lucide-react';
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

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Start camera when the component mounts or the facing mode changes
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
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
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
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image file
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      // Create a File from the blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Set the captured image preview
      setCapturedImage(URL.createObjectURL(blob));
      
      // Stop the camera
      stopCamera();
      setIsCameraActive(false);
      
    }, 'image/jpeg', 0.95);
  };

  const acceptCapturedImage = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      // Create a File from the blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Pass the file to the parent component
      onCapture(file);
      
      // Reset state
      setCapturedImage(null);
    }, 'image/jpeg', 0.95);
  };

  const rejectCapturedImage = () => {
    setCapturedImage(null);
    
    // Restart camera if needed
    if (!isCameraActive) {
      setIsCameraActive(true);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (onSelectFile) {
      onSelectFile(file);
    }
    
    // Reset input value to allow selecting the same file again
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
        {/* Hidden elements */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelection}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Video feed when camera is active */}
        {isCameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Captured image preview */}
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
        
        {/* Empty state when no camera and no image */}
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
        
        {/* Camera controls */}
        {isCameraActive && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-black bg-opacity-50">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 text-white hover:text-white hover:bg-white/20"
                onClick={switchCamera}
              >
                <FlipCamera className="h-5 w-5" />
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
    </div>
  );
};

export default CameraCapture;
