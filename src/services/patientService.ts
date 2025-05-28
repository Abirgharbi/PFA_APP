import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const API_URL = Capacitor.getPlatform() === 'web'
  ? 'http://localhost:3000/api'
  : 'http://10.0.2.2:3000/api';

export const getPatientById = async (patientId: string, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};

 export const getMyPatient = async (token: string) => {
   try {
    const response = await axios.get(`${API_URL}/doctors/my-patients`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Réponse de la récupération des patients:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des patients', error);
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