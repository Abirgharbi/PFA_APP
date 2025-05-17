// src/services/ocrService.ts
import { Capacitor } from '@capacitor/core';

// Backend URL
const API_URL =
  Capacitor.getPlatform() === 'web'
    ? 'http://localhost:3000/api/auth'
    : 'http://10.0.2.2:3000/api/auth'; 'http://10.0.2.2:5000'; 


    // src/services/ocrService.ts
interface OCRTestResult {
  champ: string;
  valeur: string;
  unité: string;
  référence: string;
  état: 'Normal' | 'Anormal';
}

export interface OCRResponse {
  résultats: OCRTestResult[];
  temps: number;
  patientInfo?: {
    nom?: string;
    id?: string;
    dateNaissance?: string;
  };
}

export async function uploadImageForOCR(file: File): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/api/ocr`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de l'analyse OCR");
  }

  return await response.json();
}