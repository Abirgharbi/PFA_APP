
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Upload, Share2, BarChart2, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';
import ReportCard from '@/components/ReportCard';
import { getReportsForUser, getNotificationsForUser, Report } from '@/models/report';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Preferences } from '@capacitor/preferences';

const Dashboard: React.FC = () => {
  const { user, isDoctor } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
console.log('User:', user);
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Load reports and notifications if user is authenticated
    if (user) {
      const userReports = getReportsForUser(user.id, user.role);
      setReports(userReports);
      
      const userNotifications = getNotificationsForUser(user.id);
      setNotifications(userNotifications);
    }
  }, [user, navigate]);

  const handleShare = (report: Report) => {
    navigate(`/share/${report.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome section */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
                <p className="text-gray-600 mt-1">
                  {isDoctor 
                    ? "Manage your patients' medical records and reports"
                    : "Track your medical reports and follow-ups"}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/scan')}
                  className="bg-medical hover:bg-medical-dark"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isMobile ? 'Scan Report' : 'Scan New Report'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/archive')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isMobile ? 'Archive' : 'View All Reports'}
                </Button>
              </div>
            </div>
          </section>
          
          {/* Dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - Recent Reports */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>
                      Your most recent medical reports
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/archive')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reports.slice(0, 4).map((report) => (
                        <ReportCard 
                          key={report.id} 
                          report={report} 
                          onShare={handleShare}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-4">You don't have any reports yet</p>
                      <Button
                        onClick={() => navigate('/scan')}
                        className="bg-medical hover:bg-medical-dark"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Scan Your First Report
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <QuickActionCard 
                  icon={<Upload className="h-6 w-6 text-medical" />}
                  title="Scan Report"
                  description="Digitize a new medical report"
                  onClick={() => navigate('/scan')}
                />
                <QuickActionCard 
                  icon={<FileText className="h-6 w-6 text-patient" />}
                  title="Browse Archive"
                  description="View all your medical records"
                  onClick={() => navigate('/archive')}
                />
                <QuickActionCard 
                  icon={<Share2 className="h-6 w-6 text-emerald-500" />}
                  title="Share Reports"
                  description="Share reports with others"
                  onClick={() => navigate('/archive')}
                />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                  {notifications.length > 0 ? (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className="flex p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => {
                            if (notification.reportId) {
                              navigate(`/report/${notification.reportId}`);
                            }
                          }}
                        >
                          <div 
                            className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              notification.type === 'error' ? 'bg-red-500' :
                              notification.type === 'success' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}
                          />
                          <div>
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-gray-600 text-sm">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </CardContent>
                {notifications.length > 0 && (
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => toast.info("Viewing all notifications is not implemented in this demo")}
                    >
                      View All Notifications
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              {/* Follow-up Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Follow-ups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.some(r => r.followUpDate) ? (
                    <div className="space-y-3">
                      {reports
                        .filter(r => r.followUpDate)
                        .slice(0, 3)
                        .map(report => (
                          <div 
                            key={report.id}
                            className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            onClick={() => navigate(`/report/${report.id}`)}
                          >
                            <div className="mr-3 bg-medical/10 text-medical p-2 rounded-md">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{report.title}</p>
                              <p className="text-gray-600 text-xs">Follow-up on {report.followUpDate}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No upcoming follow-ups</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-3 p-3 rounded-full bg-gray-100">
          {icon}
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
