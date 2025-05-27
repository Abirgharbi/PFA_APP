import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const API_URL = Capacitor.getPlatform() === 'web'
  ? 'http://localhost:3000/api'
  : 'http://10.0.2.2:3000/api';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  reportId?: string;
  createdAt: string;
}

export const getNotificationsForUser = async (userId: string, token: string): Promise<Notification[]> => {
  try {
    const response = await axios.get(`${API_URL}/notifications/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};


export const markNotificationAsRead = async (notificationId: string, token: string): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mock data for development
export const mockNotifications: Notification[] = [
  {
    _id: "n1",
    userId: "p1",
    title: "Follow-up Required",
    message: "Your chest X-ray requires a follow-up",
    type: "warning",
    read: false,
    reportId: "r2",
    createdAt: "2025-02-12T14:30:00Z"
  },
  // Add more mock notifications as needed
];