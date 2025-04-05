
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface EmptyViewProps {
  onOpenCamera: () => void;
  onUploadImage: () => void;
}

export const EmptyView: React.FC<EmptyViewProps> = ({ 
  onOpenCamera, 
  onUploadImage 
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="text-gray-400 mb-4">
        <Camera className="h-12 w-12 mx-auto mb-2" />
        <p className="text-center">No image selected</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onOpenCamera} variant="default" className="bg-medical">
          Open Camera
        </Button>
        <Button onClick={onUploadImage} variant="outline">
          Upload Image
        </Button>
      </div>
    </div>
  );
};
