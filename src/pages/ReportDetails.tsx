
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Calendar, 
  User, 
  Share2, 
  Download, 
  ArrowLeft,
  Edit,
  Trash,
  Printer
} from 'lucide-react';
import { 
  Report, 
  mockReports, 
  getReportStatusColor, 
  getReportTypeLabel,
  getTestResultColor
} from '@/models/report';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import { cn } from '@/lib/utils';

const ReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [report, setReport] = useState<Report | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImage, setShowImage] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Find the report by ID
    const foundReport = mockReports.find(r => r.id === id);
    if (foundReport) {
      setReport(foundReport);
    } else {
      toast.error('Report not found');
      navigate('/archive');
    }
  }, [id, isAuthenticated, navigate]);
  
  const handleShareReport = () => {
    if (!report) return;
    navigate(`/share/${report.id}`);
  };
  
  const handleDeleteReport = () => {
    if (!report) return;
    
    // Remove the report from the mockReports array
    const index = mockReports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      mockReports.splice(index, 1);
    }
    
    toast.success('Report deleted successfully');
    navigate('/archive');
  };
  
  const handlePrintReport = () => {
    toast.info('Printing functionality is not available in this demo');
  };
  
  const handleDownloadReport = () => {
    toast.info('Download functionality is not available in this demo');
  };
  
  if (!report) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Report...</h2>
            <p className="text-gray-500">Please wait</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4 sm:mb-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareReport}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrintReport}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast.info('Edit functionality is not available in this demo')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          {/* Report header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-6 rounded-lg shadow-sm border">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold mb-2">{report.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{report.date}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>Patient: {report.patientName}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>Type: {getReportTypeLabel(report.reportType)}</span>
                </div>
              </div>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-full text-white font-medium text-sm",
              getReportStatusColor(report.status)
            )}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </div>
          </div>
          
          {/* Report content tabs */}
          <Tabs defaultValue="results">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="image" onClick={() => setShowImage(true)}>Original Image</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            {/* Results tab */}
            <TabsContent value="results">
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Test</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Unit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Normal Range</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.extractedData.testResults.map((result, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{result.name}</td>
                          <td className={cn("py-3 px-4 font-medium", getTestResultColor(result.status))}>
                            {result.value}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{result.unit || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{result.normalRange || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              result.status === 'normal' ? 'bg-green-100 text-green-800' :
                              result.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                              result.status === 'critical' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold mb-4">Diagnosis</h2>
                  <p className="text-gray-800">
                    {report.extractedData.diagnosis || 'No diagnosis information'}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                  <p className="text-gray-800">
                    {report.extractedData.recommendations || 'No recommendations provided'}
                  </p>
                  
                  {report.followUpDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                      <div className="flex items-center text-blue-800">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Follow-up appointment</span>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        Scheduled for {report.followUpDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Notes section */}
              {report.notes && (
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                  <h2 className="text-xl font-semibold mb-4">Notes</h2>
                  <p className="text-gray-800 whitespace-pre-line">{report.notes}</p>
                </div>
              )}
            </TabsContent>
            
            {/* Image tab */}
            <TabsContent value="image">
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4">Original Report Image</h2>
                
                {report.imageUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={report.imageUrl} 
                      alt="Original report" 
                      className="max-w-full rounded-md border border-gray-200 shadow-sm"
                      style={{ maxHeight: '800px' }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No image available for this report</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Details tab */}
            <TabsContent value="details">
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4">Report Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Report Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Report ID</p>
                        <p className="font-medium">{report.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Report Type</p>
                        <p className="font-medium">{getReportTypeLabel(report.reportType)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{report.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex items-center">
                          <div className={cn(
                            "w-3 h-3 rounded-full mr-2",
                            getReportStatusColor(report.status)
                          )} />
                          <p className="font-medium">
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Patient & Doctor Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Patient Name</p>
                        <p className="font-medium">{report.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Patient ID</p>
                        <p className="font-medium">{report.patientId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Doctor Name</p>
                        <p className="font-medium">{report.doctorName}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Sharing Information</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    This report has been shared with:
                  </p>
                  
                  {report.sharedWith.length > 0 ? (
                    <div className="space-y-2">
                      {report.sharedWith.map(userId => {
                        // In a real app, you would fetch the user details
                        const mockUserName = userId.startsWith('d') 
                          ? `Dr. ${userId === 'd1' ? 'Sarah Johnson' : 'Michael Chen'}`
                          : 'Patient';
                        
                        return (
                          <div 
                            key={userId}
                            className="flex items-center p-2 bg-gray-50 rounded-md"
                          >
                            <div className="w-8 h-8 rounded-full bg-medical flex items-center justify-center text-white font-medium mr-3">
                              {mockUserName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{mockUserName}</p>
                              <p className="text-xs text-gray-500">Shared on {report.createdAt.substring(0, 10)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      This report hasn't been shared with anyone yet.
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <Button 
                      onClick={handleShareReport}
                      className="bg-patient hover:bg-patient/90"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share with others
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportDetails;
