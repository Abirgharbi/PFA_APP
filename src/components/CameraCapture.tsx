import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      const perms = await Camera.checkPermissions();
      setHasCameraPermission(perms.camera === 'granted');
    };
    checkPermissions();
  }, []);

  const takePhoto = async () => {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const request = await Camera.requestPermissions({ permissions: ['camera'] });
        if (request.camera !== 'granted') {
          setHasCameraPermission(false);
          alert("Permission caméra refusée.");
          return;
        }
      }

      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 90,
      });

      if (photo.base64String) {
        const byteCharacters = atob(photo.base64String);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

        setPreviewUrl(`data:image/jpeg;base64,${photo.base64String}`);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelection}
        />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Aperçu"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Aucun aperçu disponible
          </div>
        )}
      </div>

      {!previewUrl && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full justify-center max-w-md">
          <button
            onClick={takePhoto}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
             Prendre une photo
          </button>
          <button
            onClick={triggerFileInput}
            className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg transition"
          >
             Importer une image
          </button>
        </div>
      )}

      {previewUrl && (
        <button
          onClick={() => setPreviewUrl(null)}
          className="mt-3 text-sm text-red-500 hover:underline"
        >
          ❌ Supprimer l'image
        </button>
      )}

      {hasCameraPermission === false && (
        <div className="mt-2 text-center text-sm text-red-500">
          <p>Permission caméra refusée. Vérifiez les paramètres de votre navigateur ou appareil.</p>
        </div>
      )}

      {!previewUrl && (
        <div className="mt-4 text-center text-sm text-gray-500 max-w-md">
          <p>📄 Prenez une photo d'un rapport médical ou importez une image existante</p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
