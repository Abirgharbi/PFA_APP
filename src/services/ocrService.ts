// src/services/ocrService.ts
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';

// Backend URL
const API_URL =
  Capacitor.getPlatform() === 'web'
    ? 'http://localhost:3000'
    : 'http://10.0.2.2:3000'; 'http://10.0.2.2:5000'; 


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

  // Get token from Capacitor Preferences
  const { value: token } = await Preferences.get({ key: 'userToken' });

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await axios.post(`${API_URL}/api/ocr`, {
    method: 'POST',
    headers,
    body: formData,
  });
  console.log("Response from OCR API:", response);
  return response.data as OCRResponse;
}
