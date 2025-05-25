import { Capacitor } from '@capacitor/core';
import axios from 'axios';

const API_URL =
  Capacitor.getPlatform() === 'web'
    ? 'http://localhost:3000/api'
    : 'http://10.0.2.2:3000/api';

export const getReportsForUser = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/uploads/reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports', error);
    throw error;
  }
};
export const getReportsByPatientId = async (patientId: string, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/reports/patient/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    throw error;
  }
};
