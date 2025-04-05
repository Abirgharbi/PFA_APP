
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, File, FileText, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportType, mockReports } from '@/models/report';
import { processImage, extractDataFromImage, createReportFromExtractedData } from '@/services/ocrService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import CameraCapture from '@/components/CameraCapture';

const ScanReport: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'capture' | 'review'>('capture');
  const [reportType, setReportType] = useState<ReportType>('blood_test');
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const handleCapture = async (capturedImage: File) => {
    setImage(capturedImage);
    // Create a URL for the captured image
    const url = URL.createObjectURL(capturedImage);
    setImageUrl(url);
    
    // Move to review tab
    setActiveTab('review');
    
    // Start processing the image
    setIsProcessing(true);
    try {
      // Process the image (this is a mock function that simulates OCR)
      const processedImageUrl = await processImage(capturedImage);
      
      // Extract data from the image
      const data = await extractDataFromImage(processedImageUrl, reportType);
      
      // Set the extracted data
      setExtractedData(data);
      
      // Pre-fill form fields with extracted data
      if (data.patientInfo) {
        setPatientName(data.patientInfo.name || '');
        setPatientId(data.patientInfo.id || '');
      }
      
      // Auto-generate a title based on report type
      setTitle(`${data.patientInfo?.name || 'Patient'}'s ${reportType.replace('_', ' ')} Report`);
      
      toast.success('Report processed successfully');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFile = (file: File) => {
    handleCapture(file);
  };
  
  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would upload the image and create the report in the database
      // Here we're just simulating this process
      
      // Process the image if not already processed
      if (!imageUrl) {
        toast.error('No image selected');
        return;
      }
      
      // Create a new report object
      const newReport = createReportFromExtractedData(
        imageUrl,
        extractedData,
        reportType,
        user.id,
        user.name,
        patientId || 'p1', // Default to p1 for demo
        patientName || extractedData?.patientInfo?.name || 'Unknown Patient',
        title
      );
      
      // Add notes if provided
      if (notes) {
        newReport.notes = notes;
      }
      
      // Add the new report to the mock reports
      mockReports.unshift(newReport);
      
      toast.success('Report saved successfully');
      
      // Navigate to the report details page
      navigate(`/report/${newReport.id}`);
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scan Medical Report</CardTitle>
              <CardDescription>
                Capture or upload a medical report to extract information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'capture' | 'review')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="capture">Capture</TabsTrigger>
                  <TabsTrigger value="review" disabled={!imageUrl}>Review</TabsTrigger>
                </TabsList>
                
                <TabsContent value="capture" className="pt-4">
                  <div className="mb-6">
                    <Label htmlFor="reportType" className="mb-2 block">Report Type</Label>
                    <Select 
                      value={reportType} 
                      onValueChange={(value) => setReportType(value as ReportType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood_test">Blood Test</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="physical_exam">Physical Examination</SelectItem>
                        <SelectItem value="pathology">Pathology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-6">
                    <Label className="mb-2 block">Capture Report Image</Label>
                    <CameraCapture 
                      onCapture={handleCapture} 
                      onSelectFile={handleSelectFile}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="review" className="pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block">Captured Image</Label>
                      <div className="relative border rounded-lg overflow-hidden mb-4">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt="Captured report" 
                            className="w-full h-auto"
                          />
                        ) : (
                          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('capture')}
                        className="w-full mb-4"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Recapture
                      </Button>
                      
                      {isProcessing ? (
                        <div className="flex flex-col items-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Loader2 className="h-8 w-8 text-medical animate-spin mb-2" />
                          <p className="text-sm text-gray-600">Processing report...</p>
                          <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                        </div>
                      ) : extractedData ? (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center mb-2">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium">Processing complete</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Report information extracted successfully
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="font-medium">Processing failed</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Please try recapturing the image
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Report Information</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Report Title</Label>
                          <Input 
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter report title"
                            disabled={isProcessing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="patientName">Patient Name</Label>
                          <Input 
                            id="patientName"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="Enter patient name"
                            disabled={isProcessing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="patientId">Patient ID (Optional)</Label>
                          <Input 
                            id="patientId"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            placeholder="Enter patient ID"
                            disabled={isProcessing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Textarea 
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes about this report"
                            rows={3}
                            disabled={isProcessing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-medical hover:bg-medical-dark"
                onClick={handleSubmit}
                disabled={isProcessing || isSubmitting || !extractedData}
              >
                {isSubmitting ? 'Saving...' : 'Save Report'}
              </Button>
            </CardFooter>
          </Card>
          
          {extractedData && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
                <CardDescription>
                  Information extracted from the report using OCR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Patient Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{extractedData.patientInfo?.name || 'Not detected'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">ID</p>
                          <p className="font-medium">{extractedData.patientInfo?.id || 'Not detected'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">{extractedData.patientInfo?.dateOfBirth || 'Not detected'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="font-medium">{extractedData.patientInfo?.gender || 'Not detected'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Test Results */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Test</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Value</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Unit</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Normal Range</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractedData.testResults?.map((result: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="py-2 px-3">{result.name}</td>
                              <td className="py-2 px-3 font-medium">{result.value}</td>
                              <td className="py-2 px-3 text-gray-600">{result.unit || '-'}</td>
                              <td className="py-2 px-3 text-gray-600">{result.normalRange || '-'}</td>
                              <td className="py-2 px-3">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  result.status === 'normal' ? 'bg-green-100 text-green-800' :
                                  result.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                                  result.status === 'critical' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {result.status ? (
                                    result.status.charAt(0).toUpperCase() + result.status.slice(1)
                                  ) : 'Not specified'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Diagnosis & Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Diagnosis</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>{extractedData.diagnosis || 'No diagnosis information extracted'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>{extractedData.recommendations || 'No recommendations extracted'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanReport;
