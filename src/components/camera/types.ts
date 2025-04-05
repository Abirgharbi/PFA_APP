
export interface CameraCaptureProps {
  onCapture: (image: File) => void;
  onSelectFile?: (file: File) => void;
}

export type FacingMode = 'user' | 'environment';
