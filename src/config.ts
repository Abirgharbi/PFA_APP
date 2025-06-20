// src/config.ts or src/utils/config.ts
import { Capacitor } from '@capacitor/core';

const platform = Capacitor.getPlatform();

//4.233.146.155
let apiUrl = 'http://127.0.0.1:5000/api'; // default for web

if (platform !== 'web') {
  // If running on Android emulator (default Android Studio emulator)
  // 10.0.2.2 maps to localhost of the host machine
  apiUrl = platform === 'android'
    ? 'http://127.0.0.1:5000/api'
    : 'http://127.0.0.1:5000/api'; // replace with your local IP for real device
}

export const API_URL = apiUrl;
export const isMobile = platform !== 'web';
