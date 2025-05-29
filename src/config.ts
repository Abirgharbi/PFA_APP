// src/config.ts or src/utils/config.ts
import { Capacitor } from '@capacitor/core';

export const API_URL = Capacitor.getPlatform() === 'web'
  ? 'http://localhost:3000/api'
  : 'http://192.168.1.17:3000/api';

  export const isMobile = Capacitor.getPlatform() !== 'web';