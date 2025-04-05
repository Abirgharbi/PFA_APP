
import { User, UserRole } from "../contexts/AuthContext";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  profileImage?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  hospital?: string;
  profileImage?: string;
}

export interface Report {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  reportType: ReportType;
  imageUrl?: string; // Original scan image
  status: ReportStatus;
  sharedWith: string[]; // Array of user IDs
  extractedData: ExtractedData;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportType = 
  | "blood_test" 
  | "imaging" 
  | "physical_exam" 
  | "pathology" 
  | "other";

export type ReportStatus = 
  | "normal" 
  | "abnormal" 
  | "critical" 
  | "pending";

export interface ExtractedData {
  patientInfo: {
    name?: string;
    id?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  testResults: TestResult[];
  diagnosis?: string;
  recommendations?: string;
}

export interface TestResult {
  name: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status?: "normal" | "abnormal" | "critical";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  reportId?: string;
  createdAt: string;
}

// Helper function to get report type display name
export function getReportTypeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    blood_test: "Blood Test",
    imaging: "Imaging",
    physical_exam: "Physical Examination",
    pathology: "Pathology",
    other: "Other Report"
  };
  return labels[type] || "Unknown";
}

// Helper function to get report status colors
export function getReportStatusColor(status: ReportStatus): string {
  const colors: Record<ReportStatus, string> = {
    normal: "bg-green-500",
    abnormal: "bg-yellow-500",
    critical: "bg-red-500",
    pending: "bg-blue-500"
  };
  return colors[status] || "bg-gray-500";
}

// Helper to get test result status color
export function getTestResultColor(status?: "normal" | "abnormal" | "critical"): string {
  if (!status) return "text-gray-600";
  
  const colors = {
    normal: "text-green-600",
    abnormal: "text-yellow-600",
    critical: "text-red-600"
  };
  
  return colors[status];
}

// Mock data
export const mockReports: Report[] = [
  {
    id: "r1",
    title: "Annual Blood Test Results",
    patientId: "p1",
    patientName: "Alex Rodriguez",
    doctorId: "d1",
    doctorName: "Dr. Sarah Johnson",
    date: "2025-03-25",
    reportType: "blood_test",
    imageUrl: "https://i.imgur.com/LcFBSiy.jpg",
    status: "normal",
    sharedWith: ["d2"],
    extractedData: {
      patientInfo: {
        name: "Alex Rodriguez",
        id: "P10042",
        dateOfBirth: "1985-07-15",
        gender: "male"
      },
      testResults: [
        {
          name: "Hemoglobin",
          value: "14.5",
          unit: "g/dL",
          normalRange: "13.5-17.5",
          status: "normal"
        },
        {
          name: "White Blood Cell Count",
          value: "7.5",
          unit: "x10^9/L",
          normalRange: "4.5-11.0",
          status: "normal"
        },
        {
          name: "Platelets",
          value: "250",
          unit: "x10^9/L",
          normalRange: "150-450",
          status: "normal"
        },
        {
          name: "Cholesterol",
          value: "195",
          unit: "mg/dL",
          normalRange: "<200",
          status: "normal"
        }
      ],
      diagnosis: "All values within normal range",
      recommendations: "Continue with current health regimen. Follow up in 1 year."
    },
    followUpDate: "2026-03-25",
    notes: "Patient is in good health. No concerns at this time.",
    createdAt: "2025-03-25T10:30:00Z",
    updatedAt: "2025-03-25T10:30:00Z"
  },
  {
    id: "r2",
    title: "Chest X-Ray Report",
    patientId: "p1",
    patientName: "Alex Rodriguez",
    doctorId: "d2",
    doctorName: "Dr. Michael Chen",
    date: "2025-02-12",
    reportType: "imaging",
    imageUrl: "https://i.imgur.com/MIwAhnW.jpg",
    status: "abnormal",
    sharedWith: ["d1"],
    extractedData: {
      patientInfo: {
        name: "Alex Rodriguez",
        id: "P10042",
        dateOfBirth: "1985-07-15",
        gender: "male"
      },
      testResults: [
        {
          name: "Lung Fields",
          value: "Small opacity in right lower lobe",
          status: "abnormal"
        },
        {
          name: "Heart Size",
          value: "Normal",
          status: "normal"
        },
        {
          name: "Bony Structures",
          value: "Normal",
          status: "normal"
        }
      ],
      diagnosis: "Small opacity in right lower lobe, possibly inflammatory",
      recommendations: "Follow up in 3 months with repeat X-ray. Consider CT scan if symptoms persist."
    },
    followUpDate: "2025-05-12",
    notes: "Patient reports occasional cough. No fever or other symptoms.",
    createdAt: "2025-02-12T14:15:00Z",
    updatedAt: "2025-02-12T14:15:00Z"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    userId: "p1",
    title: "Follow-up Required",
    message: "Your chest X-ray requires a follow-up in 3 months (May 12, 2025)",
    type: "warning",
    read: false,
    reportId: "r2",
    createdAt: "2025-02-12T14:30:00Z"
  },
  {
    id: "n2",
    userId: "p1",
    title: "Annual Check-up Due",
    message: "Your annual blood test is due next month",
    type: "info",
    read: true,
    createdAt: "2025-03-01T09:00:00Z"
  },
  {
    id: "n3",
    userId: "d1",
    title: "Report Shared",
    message: "Dr. Michael Chen shared a chest X-ray report with you",
    type: "info",
    read: false,
    reportId: "r2",
    createdAt: "2025-02-12T14:20:00Z"
  }
];

// Function to get reports for a user
export function getReportsForUser(userId: string, role: UserRole): Report[] {
  if (role === "doctor") {
    return mockReports.filter(report => report.doctorId === userId || report.sharedWith.includes(userId));
  } else {
    return mockReports.filter(report => report.patientId === userId);
  }
}

// Function to get notifications for a user
export function getNotificationsForUser(userId: string): Notification[] {
  return mockNotifications.filter(notification => notification.userId === userId);
}
