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




