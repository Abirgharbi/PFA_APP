
import React, { useRef, useState } from 'react';
import { CameraCaptureProps } from '@/components/camera/types';
import { useCamera } from '@/hooks/use-camera';
import { useIsMobile } from '@/hooks/use-mobile';
import { CameraView } from '@/components/camera/CameraView';
import { CapturedImageView } from '@/components/camera/CapturedImageView';
import { EmptyView } from '@/components/camera/EmptyView';

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onSelectFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    videoRef,
    canvasRef,
    isCameraActive,
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
  } = useCamera();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const acceptCapturedImage = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      onCapture(file);
      
      setCapturedImage(null);
    }, 'image/jpeg', 0.95);
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
          <CameraView
            videoRef={videoRef}
            availableCameras={availableCameras}
            onCapture={captureImage}
            onSwitchCamera={switchCamera}
            onClose={toggleCamera}
          />
        )}
        
        {capturedImage && !isCameraActive && (
          <CapturedImageView 
            imageUrl={capturedImage}
            onAccept={acceptCapturedImage}
            onReject={rejectCapturedImage}
          />
        )}
        
        {!isCameraActive && !capturedImage && (
          <EmptyView
            onOpenCamera={toggleCamera}
            onUploadImage={triggerFileInput}
          />
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
