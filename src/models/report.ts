export interface OCRResultItem {
  champ: string;
  valeur?: string;
  unité?: string;
  etat?: string;
  Valeurs_usuelles?: string;
}


export interface OCRResult {
  Edite_date: string;
  processing_time: number;
  tables: Record<string, OCRResultItem[]>;
}

export interface Report {
  _id: string;
  title?: string;
  patientId: string;
  doctorId?: string | "doctor";
  doctorName?: string;
  patientName?: string;
  imageUrl: string;
  reportType?: ReportType;
  sharedWith?: string[];
  status?: string;
  ocrResult: OCRResult;
  date: string;
  isPublic:Boolean;
  __v?: number;
  followUpDate?: string;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}



export type ReportType = 'blood_test' | 'imaging' | 'physical_exam' | 'pathology' | 'other';

export const ReportTypes: ReportType[] = [
  'blood_test',
  'imaging',
  'physical_exam',
  'pathology',
  'other'
];

export type ReportStatus = 
  | "normal" 
  | "abnormal" 
  | "critical" 
  | "pending";

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

export function getReportStatusColor(état: string): string {
  const colors: Record<string, string> = {
    "Normal": "bg-green-500",
    "Anormal": "bg-yellow-500",
    "Intervalle inconnu": "bg-blue-500",
    "Critical": "bg-red-500"
  };
  return colors[état] || "bg-gray-500";
}

export function getTestResultColor(état?: string): string {
  if (!état) return "text-gray-600";
  
  const colors = {
    "Normal": "text-green-600",
    "Anormal": "text-yellow-600",
    "Intervalle inconnu": "text-blue-600",
    "Critical": "text-red-600"
  };
  
  return colors[état] || "text-gray-600";
}

//--------------------------------------------------//


export interface TestResult {
  name: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status?: "normal" | "abnormal" | "critical";
} 
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

export interface Patient1 {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  profileImage?: string;
}

export interface Doctor1 {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  hospital?: string;
  profileImage?: string;
}

export interface Report1 {
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

export const mockReports: Report1[] = [
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
