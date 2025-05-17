// src/services/ocrService.ts
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';

// Backend URL
const API_URL =
  Capacitor.getPlatform() === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.1.17:3000'; 


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
  console.log(file)
  const { value: token } = await Preferences.get({ key: 'userToken' });

  if (!token) {
    throw new Error("No token found. Please log in again.");
  }

  const response = await axios.post(`${API_URL}/api/ocr`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const ocrResult = response.data?.data?.ocrResult;

  if (!ocrResult) {
    throw new Error("OCR result not found in response.");
  }
  
  return ocrResult as OCRResponse;
}

