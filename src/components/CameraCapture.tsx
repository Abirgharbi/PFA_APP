import React, { useRef, useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

const takePhoto = async () => {
  try {
    const permissions = await Camera.checkPermissions();
    if (permissions.camera !== 'granted') {
      await Camera.requestPermissions({ permissions: ['camera'] });
    }

    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64, // Get base64 string directly
      source: CameraSource.Camera,
      quality: 90,
    });

    if (photo.base64String) {
      const base64 = photo.base64String;

      // Create a Blob from the base64 string
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Create a File from the Blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      // Set preview for UI
      setPreviewUrl(`data:image/jpeg;base64,${base64}`);

      // Send file to parent handler (e.g. upload for OCR)
      onCapture(file);
    }
  } catch (error) {
    console.error('Erreur lors de la prise de photo :', error);
    alert("Impossible d'utiliser la caméra.");
  }
};



  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);

    onCapture(file);

    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Aperçu"
          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 8 }}
        />
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelection}
        className="hidden"
      />

      <button
        onClick={takePhoto}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        📷 Prendre une photo
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-gray-300 text-black px-4 py-2 rounded-lg"
      >
        🖼️ Importer une image
      </button>
    </div>
  );
};

export default CameraCapture;
