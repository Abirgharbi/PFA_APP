import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface ReportStat {
  champ: string;
  valeur: number;
  unité:string;
  date: string;
}

export interface ReportAnalytics {
  totalrapport: number;
  rapports: { date: string; number: number }[];
  resulte: ReportStat[];
}

const API_URL = Capacitor.getPlatform() === 'web'
  ? 'http://localhost:3000/api'
  : 'http://10.0.2.2:3000/api';

const getToken = async (): Promise<string | null> => {
  const token = await Preferences.get({ key: 'userToken' });
  return token.value;
};

export const fetchReportAnalytics = async (): Promise<ReportAnalytics> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Token non trouvé, utilisateur non authentifié');
  }

  const response = await axios.get<ReportAnalytics>(`${API_URL}/uploads/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};
