// src/config.ts or src/utils/config.ts
import { Capacitor } from '@capacitor/core';

const platform = Capacitor.getPlatform();

let apiUrl = 'http://localhost:5000/api'; // default for web

if (platform !== 'web') {
  // If running on Android emulator (default Android Studio emulator)
  // 10.0.2.2 maps to localhost of the host machine
  apiUrl = platform === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://192.168.1.17:5000/api'; // replace with your local IP for real device
}

export const API_URL = apiUrl;
export const isMobile = platform !== 'web';
