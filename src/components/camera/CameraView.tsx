
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  availableCameras: MediaDeviceInfo[];
  onCapture: () => void;
  onSwitchCamera: () => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ 
  videoRef, 
  availableCameras,
  onCapture, 
  onSwitchCamera, 
  onClose 
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-black bg-opacity-50">
        {isMobile && availableCameras.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 text-white hover:text-white hover:bg-white/20"
            onClick={onSwitchCamera}
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
          onClick={onCapture}
        >
          <div className="w-10 h-10 rounded-full border-2 border-gray-700"></div>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-4 text-white hover:text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};
