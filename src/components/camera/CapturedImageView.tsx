
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface CapturedImageViewProps {
  imageUrl: string;
  onAccept: () => void;
  onReject: () => void;
}

export const CapturedImageView: React.FC<CapturedImageViewProps> = ({ 
  imageUrl, 
  onAccept, 
  onReject 
}) => {
  return (
    <div className="relative w-full h-full">
      <img 
        src={imageUrl} 
        alt="Captured" 
        className="w-full h-full object-contain bg-black" 
      />
      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-black bg-opacity-50">
        <Button 
          variant="destructive" 
          size="icon" 
          className="mr-4 rounded-full"
          onClick={onReject}
        >
          <X className="h-5 w-5" />
        </Button>
        <Button 
          variant="default"
          size="icon"
          className="rounded-full bg-green-500 hover:bg-green-600"
          onClick={onAccept}
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
