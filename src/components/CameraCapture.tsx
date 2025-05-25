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
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 90,
      });

      if (photo.base64String) {
        const base64 = photo.base64String;

        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        setPreviewUrl(`data:image/jpeg;base64,${base64}`);
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
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow-xl rounded-xl flex flex-col items-center space-y-4">
      <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Aperçu"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">Aucun aperçu disponible</span>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelection}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
        <button
          onClick={takePhoto}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          📷 Prendre une photo
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg transition"
        >
          🖼️ Importer une image
        </button>
      </div>

      {previewUrl && (
        <button
          onClick={() => setPreviewUrl(null)}
          className="text-sm text-red-500 hover:underline mt-2"
        >
          ❌ Supprimer l'image
        </button>
      )}
    </div>
  );
};

export default CameraCapture;
