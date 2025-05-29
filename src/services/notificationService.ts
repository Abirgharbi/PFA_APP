import axios from 'axios';
import { API_URL } from '@/config'; // adjust the path if needed

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error"| "follow-up";
  read: boolean;
  datefollowup?:Date;
  reportId?: string;
  createdAt: string;
}

export const createFollowUp = (patientId: string, date: string, details: string) => {
  return axios.post(`${API_URL}/notifications/followups`, { patientId, followUpDate: date, details });
};

export const getNotificationsForUser = async (token: string): Promise<Notification[]> => {
  try {
    const response = await axios.get(`${API_URL}/notifications/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
        console.log('Fetched notifications:', response);

    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};


export const markNotificationAsRead = async (notificationId: string, token: string): Promise<void> => {
  try {
    await axios.put(`${API_URL}/notifications/read/${notificationId}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

