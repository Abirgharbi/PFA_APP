import axios from 'axios';
import { API_URL } from '@/config'; // adjust the path if needed

interface AddPatientResponse {
  message: string;
}
interface verifParams {
  idoctor: string;
  token?: string;
}
export const addPatientToDoctor = async ({
  idoctor,
  token
}: verifParams): Promise<AddPatientResponse> => {
const response = await axios.post<AddPatientResponse>(
  `${API_URL}/patients/addingpatient/${idoctor}`,
  {}, // empty body (or your data if needed)
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


  return response.data;
};
export const deletePatient = async (patientId: string, token: string) => {
  console.log('Deleting patient with ID:', patientId);
  const response = await axios.delete(`${API_URL}/doctors/patients/${patientId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
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