import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

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

import { API_URL } from '@/config'; // adjust the path if needed
;

const getToken = async (): Promise<string | null> => {
  const token = await Preferences.get({ key: 'userToken' });
  return token.value;
};

export const fetchReportAnalytics = async (patientId: string): Promise<ReportAnalytics> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Token non trouvé, utilisateur non authentifié');
  }

  const response = await axios.get<ReportAnalytics>(`${API_URL}/uploads/analytics/${patientId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

export const getDoctors = async (token: string) => {
  console.log('Fetching doctors with token:', token);
  const response = await axios.get(`${API_URL}/patients/mydoctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateVisibility = async (
  reportId: string,
  isPublic: boolean,
  token: string
) => {
  const response = await axios.patch(
    `${API_URL}/uploads/${reportId}/visibility`,
    { isPublic },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const shareReportWithUsers = async (
  reportId: string,
  userIds: string[],
  token: string
) => {
  console.log('Sharing report with users:', { reportId, userIds, token });
  const response = await axios.put(
    `${API_URL}/uploads/multi/${reportId}`,
    { sharedWith:userIds },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  console.log('Response from sharing report with users:', response.data);
  return response.data;
};
