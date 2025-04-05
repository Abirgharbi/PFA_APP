
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  User, 
  ArrowLeft, 
  CalendarDays, 
  Phone, 
  Mail,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Report, mockReports } from '@/models/report';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import ReportCard from '@/components/ReportCard';

// Mock patient data
const mockPatients = [
  {
    id: 'p1',
    name: 'Alex Rodriguez',
    email: 'patient@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-07-15',
    gender: 'male',
    profileImage: 'https://i.pravatar.cc/300?img=2'
  }
];

const PatientReports: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [patient, setPatient] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Find patient by ID
    const foundPatient = mockPatients.find(p => p.id === id);
    if (foundPatient) {
      setPatient(foundPatient);
      
      // Get patient reports
      const patientReports = mockReports.filter(
        r => r.patientId === foundPatient.id && (
          r.doctorId === user?.id || r.sharedWith.includes(user?.id || '')
        )
      );
      
      setReports(patientReports);
      setFilteredReports(patientReports);
    } else {
      toast.error('Patient not found');
      navigate('/dashboard');
    }
  }, [id, user, isAuthenticated, navigate]);
  
  // Filter reports when search query changes
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredReports(reports.filter(report => 
        report.title.toLowerCase().includes(query) || 
        report.doctorName.toLowerCase().includes(query)
      ));
    } else {
      setFilteredReports(reports);
    }
  }, [reports, searchQuery]);
  
  const handleShare = (report: Report) => {
    navigate(`/share/${report.id}`);
  };
  
  if (!patient) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Patient...</h2>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {/* Patient info */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-lg shadow-sm border">
              <Avatar className="w-20 h-20">
                <AvatarImage src={patient.profileImage} alt={patient.name} />
                <AvatarFallback>{patient.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-grow">
                <h1 className="text-2xl font-bold mb-2">{patient.name}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>DOB: {patient.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Gender: {patient.gender === 'male' ? 'Male' : 'Female'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 sm:col-span-2">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{patient.email}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Button className="bg-medical hover:bg-medical-dark w-full md:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Report
                </Button>
              </div>
            </div>
          </div>
          
          {/* Reports section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold mb-2 md:mb-0">Patient Reports</h2>
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Reports</TabsTrigger>
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="abnormal">Abnormal</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onShare={handleShare}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No reports found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="normal">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredReports.filter(r => r.status === 'normal').length > 0 ? (
                    filteredReports
                      .filter(r => r.status === 'normal')
                      .map(report => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          onShare={handleShare}
                        />
                      ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No normal reports found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="abnormal">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredReports.filter(r => r.status === 'abnormal').length > 0 ? (
                    filteredReports
                      .filter(r => r.status === 'abnormal')
                      .map(report => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          onShare={handleShare}
                        />
                      ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No abnormal reports found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="critical">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredReports.filter(r => r.status === 'critical').length > 0 ? (
                    filteredReports
                      .filter(r => r.status === 'critical')
                      .map(report => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          onShare={handleShare}
                        />
                      ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No critical reports found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientReports;
