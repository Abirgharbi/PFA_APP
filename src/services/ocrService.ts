import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';

// API URL — adjust as needed for development/production
const API_URL =
  Capacitor.getPlatform() === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.1.17:3000'; // replace with your local IP

// Interfaces for structured OCR response
export interface OCRTestResult {
  champ: string;
  valeur_and_unite: string;
  valeur?: string;
  unite?: string;
  Valeurs_usuelles?: string;
  etat?: 'Normal' | 'Anormal' | 'inconnu';

  // Accept any number of anteriorite fields dynamically
  [key: `anteriorite ${number}`]: string | undefined;
}


export interface OCRResponse {
  Edite_date: string;
  processing_time: number;
  status: string;
  patient_info: {
    name: string;
    title: string;
  };
  tables: {
    [category: string]: OCRTestResult[];
  };
}

// Upload image and retrieve OCR response
export async function uploadImageForOCR(file: File, reportType: string): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('reportType', reportType);

  // Retrieve stored auth token
  const { value: token } = await Preferences.get({ key: 'userToken' });
  if (!token) {
    throw new Error('No token found. Please log in again.');
  }

  // Send POST request to OCR endpoint
  const response = await axios.post(`${API_URL}/api/ocr`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.data?.data;
    console.log('OCR response:', data);

  // Basic validation
  if (!data || data.ocrResult.status !== 'success') {
    throw new Error('OCR processing failed or data is invalid.');
  }
  // Return structured data
  return {
    Edite_date: data.ocrResult.Edite_date,
    processing_time: data.ocrResult.processing_time,
    status: data.ocrResult.status,
    patient_info: data.ocrResult.patient_info,
    tables: data.ocrResult.tables,
  };
}