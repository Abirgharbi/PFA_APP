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
    console.log('Réponse de la récupération des rapports:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports', error);
    throw error;
  }
};


export const getReportById = async (reportId: string, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/uploads/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport par ID', error);
    throw error;
  }
};

// export const shareByEmail = async (reportId: string, email: string, token: string) => {
//   const response = await axios.post(
//     `${API_URL}/share-email`,
//     { reportId, email },
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
//   return response.data;
// };
export const shareByEmail = async (reportId: string, email: string, token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/share-email`,
      { reportId, email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sharing report:', error.response?.data || error.message);
    throw error;
  }
};

export const getSharedReport = async (reportId: string, email?: string) => {
  const params = email ? { email } : {};
  const response = await axios.get( `${API_URL}/shared-reports/${reportId}`, { 
    params,
    withCredentials: true
  });
  console.log('Shared report response:', response.data);
  return response.data.data;
};

export const acceptSharedReport = async (reportId: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/shared/${reportId}/accept`,
    {}, // body can be empty if not needed
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};