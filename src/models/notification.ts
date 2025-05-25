export interface Notification {
  _id: string; // Changed from id to _id for MongoDB
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  reportId?: string;
  createdAt: string;
  updatedAt?: string; // Added for MongoDB
}

// Helper function to get notification type color
export function getNotificationColor(type: Notification["type"]): string {
  const colors = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800"
  };
  return colors[type];
}

// Mock data - keep for development
export const mockNotifications: Notification[] = [
  {
    _id: "n1",
    userId: "p1",
    title: "Follow-up Required",
    message: "Your chest X-ray requires a follow-up in 3 months (May 12, 2025)",
    type: "warning",
    read: false,
    reportId: "r2",
    createdAt: "2025-02-12T14:30:00Z"
  },
  // ... other mock notifications
];



