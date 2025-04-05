
import { ExtractedData, Report, ReportType, ReportStatus, TestResult } from "../models/report";

// This is a mock OCR service. In a real application, this would call a real OCR API
// like Google's Vision API, AWS Textract, or Azure's Computer Vision

// Function to simulate OCR processing with a delay
export async function processImage(imageFile: File | string): Promise<string> {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // If it's a file, we'd upload and process it
      // If it's already a URL string, we'd just process it
      
      // For demo purposes, return a placeholder URL if a File was provided
      // or just return the original URL if a string was provided
      if (typeof imageFile !== 'string') {
        // In a real app, we'd upload the file and get a URL
        const mockUploadedUrl = "https://i.imgur.com/LcFBSiy.jpg";
        resolve(mockUploadedUrl);
      } else {
        resolve(imageFile);
      }
    }, 1500); // Simulated 1.5 second processing time
  });
}

// Function to simulate extracting data from an image
export async function extractDataFromImage(
  imageUrl: string, 
  reportType: ReportType
): Promise<ExtractedData> {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // In a real app, we'd use an actual OCR service here
      // For now, return mock data based on report type
      let mockData: ExtractedData;
      
      // Default patient info that would be extracted
      const patientInfo = {
        name: "Alex Rodriguez",
        id: "P10042",
        dateOfBirth: "1985-07-15",
        gender: "male"
      };
      
      // Generate different mock data based on report type
      switch(reportType) {
        case "blood_test":
          mockData = {
            patientInfo,
            testResults: [
              createTestResult("Hemoglobin", "14.2", "g/dL", "13.5-17.5", "normal"),
              createTestResult("White Blood Cell Count", "7.8", "x10^9/L", "4.5-11.0", "normal"),
              createTestResult("Platelets", "250", "x10^9/L", "150-450", "normal"),
              createTestResult("Glucose", "105", "mg/dL", "70-99", "abnormal"),
              createTestResult("Cholesterol", "195", "mg/dL", "<200", "normal")
            ],
            diagnosis: "Slightly elevated glucose levels, otherwise normal",
            recommendations: "Monitor glucose levels. Consider dietary changes."
          };
          break;
          
        case "imaging":
          mockData = {
            patientInfo,
            testResults: [
              {
                name: "Lung Fields",
                value: "Clear, no abnormalities detected",
                status: "normal"
              },
              {
                name: "Heart Size",
                value: "Normal",
                status: "normal"
              },
              {
                name: "Bony Structures",
                value: "No fractures or abnormalities",
                status: "normal"
              }
            ],
            diagnosis: "Normal chest X-ray",
            recommendations: "No follow-up needed"
          };
          break;
          
        case "physical_exam":
          mockData = {
            patientInfo,
            testResults: [
              {
                name: "Blood Pressure",
                value: "132/85",
                normalRange: "<120/80",
                status: "abnormal"
              },
              {
                name: "Heart Rate",
                value: "72",
                unit: "bpm",
                normalRange: "60-100",
                status: "normal"
              },
              {
                name: "Weight",
                value: "78",
                unit: "kg",
                status: "normal"
              }
            ],
            diagnosis: "Mildly elevated blood pressure",
            recommendations: "Monitor blood pressure. Return for follow-up in 3 months."
          };
          break;
          
        default:
          mockData = {
            patientInfo,
            testResults: [
              {
                name: "Result 1",
                value: "Normal",
                status: "normal"
              },
              {
                name: "Result 2",
                value: "Normal",
                status: "normal"
              }
            ],
            diagnosis: "All tests normal",
            recommendations: "No further action needed"
          };
      }
      
      resolve(mockData);
    }, 2000); // Simulated 2 second processing time
  });
}

// Helper function to create a test result object
function createTestResult(
  name: string, 
  value: string, 
  unit?: string, 
  normalRange?: string, 
  status?: "normal" | "abnormal" | "critical"
): TestResult {
  return { name, value, unit, normalRange, status };
}

// Function to determine the overall report status based on the test results
export function determineReportStatus(testResults: TestResult[]): ReportStatus {
  const hasCritical = testResults.some(test => test.status === "critical");
  const hasAbnormal = testResults.some(test => test.status === "abnormal");
  
  if (hasCritical) return "critical";
  if (hasAbnormal) return "abnormal";
  return "normal";
}

// Function to create a new report from extracted data
export function createReportFromExtractedData(
  imageUrl: string,
  extractedData: ExtractedData,
  reportType: ReportType,
  doctorId: string,
  doctorName: string,
  patientId: string,
  patientName: string,
  title?: string
): Report {
  const now = new Date().toISOString();
  const status = determineReportStatus(extractedData.testResults);
  
  return {
    id: `r${Date.now().toString()}`,
    title: title || `${patientName}'s ${reportType.replace('_', ' ')} Report`,
    patientId,
    patientName,
    doctorId,
    doctorName,
    date: now.substring(0, 10), // YYYY-MM-DD format
    reportType,
    imageUrl,
    status,
    sharedWith: [],
    extractedData,
    notes: "",
    createdAt: now,
    updatedAt: now
  };
}
