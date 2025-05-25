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
import { Report } from '@/models/report';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import ReportCard from '@/components/ReportCard';
import { getReportsByPatientId, getPatientById } from '@/services/patientService';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
}

const PatientReports: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient and reports data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch patient data
        if (patientId && user?.token) {
          const patientData = await getPatientById(patientId, user.token);
          setPatient(patientData);

          // Fetch patient reports
          const reportsData = await getReportsByPatientId(patientId, user.token);
          setReports(reportsData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load patient data');
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, user, isAuthenticated, navigate]);

  // Filter reports based on search query
  const filteredReports = React.useMemo(() => {
    if (!searchQuery) return reports;

    const query = searchQuery.toLowerCase();
    return reports.filter(report => {
      const reportDate = new Date(report.date).toLocaleDateString().toLowerCase();
      return (
        report._id.toLowerCase().includes(query) ||
        reportDate.includes(query) ||
        report.ocrResult?.parameters?.some(param => 
          param.champ.toLowerCase().includes(query)
      ));
    });
  }, [reports, searchQuery]);

  // Determine overall report status
  const getReportStatus = (report: Report): string => {
    if (!report.ocrResult?.parameters?.length) return 'Inconnu';
    
    const hasAbnormal = report.ocrResult.parameters.some(p => p.état === 'Anormal');
    const hasUnknown = report.ocrResult.parameters.some(p => p.état === 'Intervalle inconnu');
    
    if (hasAbnormal) return 'Anormal';
    if (hasUnknown) return 'Inconnu';
    return 'Normal';
  };

  // Filter reports by status
  const getReportsByStatus = (status: string) => {
    return filteredReports.filter(report => getReportStatus(report) === status);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Patient Data...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{error}</h2>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
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
          
          {/* Patient information */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-lg shadow-sm border">
              <Avatar className="w-20 h-20">
                <AvatarImage src={patient.profileImage} alt={patient.name} />
                <AvatarFallback>
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-grow">
                <h1 className="text-2xl font-bold mb-2">{patient.name}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>DOB: {patient.dateOfBirth || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Gender: {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{patient.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 sm:col-span-2">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{patient.email}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Button 
                  className="bg-medical hover:bg-medical-dark w-full md:w-auto"
                  onClick={() => navigate(`/upload/${patient._id}`)}
                >
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
                <TabsTrigger value="all">All ({filteredReports.length})</TabsTrigger>
                <TabsTrigger value="normal">Normal ({getReportsByStatus('Normal').length})</TabsTrigger>
                <TabsTrigger value="abnormal">Abnormal ({getReportsByStatus('Anormal').length})</TabsTrigger>
                <TabsTrigger value="unknown">Unknown ({getReportsByStatus('Inconnu').length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <ReportCard 
                        key={report._id} 
                        report={report} 
                        view="grid"
                        onClick={() => navigate(`/archive/${report._id}`, { state: { report } })}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No reports found for this patient</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="normal">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {getReportsByStatus('Normal').length > 0 ? (
                    getReportsByStatus('Normal').map(report => (
                      <ReportCard
                        key={report._id}
                        report={report}
                        view="grid"
                        onClick={() => navigate(`/archive/${report._id}`, { state: { report } })}
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
                  {getReportsByStatus('Anormal').length > 0 ? (
                    getReportsByStatus('Anormal').map(report => (
                      <ReportCard
                        key={report._id}
                        report={report}
                        view="grid"
                        onClick={() => navigate(`/archive/${report._id}`, { state: { report } })}
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
              
              <TabsContent value="unknown">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {getReportsByStatus('Inconnu').length > 0 ? (
                    getReportsByStatus('Inconnu').map(report => (
                      <ReportCard
                        key={report._id}
                        report={report}
                        view="grid"
                        onClick={() => navigate(`/archive/${report._id}`, { state: { report } })}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No unknown status reports found</p>
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