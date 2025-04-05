
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  ArrowLeft, 
  Copy, 
  Mail, 
  Share2, 
  Check,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Report, mockReports } from '@/models/report';
import { UserRole } from '@/contexts/AuthContext';
import AppHeader from '@/components/AppHeader';

// Mock user data
const mockUsers = [
  {
    id: 'd1',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@example.com',
    role: 'doctor' as UserRole,
    specialization: 'Cardiologist',
    hospital: 'Central Hospital',
    profileImage: 'https://i.pravatar.cc/300?img=1'
  },
  {
    id: 'd2',
    name: 'Dr. Michael Chen',
    email: 'doctor2@example.com',
    role: 'doctor' as UserRole,
    specialization: 'Neurologist',
    hospital: 'Memorial Medical Center',
    profileImage: 'https://i.pravatar.cc/300?img=3'
  },
  {
    id: 'p1',
    name: 'Alex Rodriguez',
    email: 'patient@example.com',
    role: 'patient' as UserRole,
    profileImage: 'https://i.pravatar.cc/300?img=2'
  }
];

const ShareReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [report, setReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<typeof mockUsers>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Find report and filter users who don't already have access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const foundReport = mockReports.find(r => r.id === id);
    if (foundReport) {
      setReport(foundReport);
      
      // Initialize selected users from those already shared with
      setSelectedUsers([...foundReport.sharedWith]);
    } else {
      toast.error('Report not found');
      navigate('/archive');
    }
  }, [id, isAuthenticated, navigate]);
  
  // Filter users based on search query
  useEffect(() => {
    if (!report) return;
    
    // Filter out the current user and patient/doctor of the report
    const availableUsers = mockUsers.filter(u => 
      u.id !== user?.id && u.id !== report.patientId && u.id !== report.doctorId
    );
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(availableUsers.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      ));
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchQuery, report, user]);
  
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleShare = () => {
    if (!report) return;
    
    // Update the report's sharedWith list
    const updatedReport = {
      ...report,
      sharedWith: selectedUsers
    };
    
    // Update the report in the mock data
    const index = mockReports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      mockReports[index] = updatedReport;
      setReport(updatedReport);
      
      toast.success('Report shared successfully');
    }
  };
  
  const copyShareLink = () => {
    // In a real app, this would be a shareable link
    const shareUrl = `https://mediarchive.example.com/shared/${report?.id}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setLinkCopied(true);
        toast.success('Share link copied to clipboard');
        
        // Reset the copied state after 3 seconds
        setTimeout(() => setLinkCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link');
      });
  };
  
  const handleSendEmail = () => {
    // In a real app, this would send an email with the share link
    toast.success('Email invitation sent');
  };
  
  if (!report) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Report...</h2>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Report
            </Button>
            <h1 className="text-2xl font-bold mb-2">Share Medical Report</h1>
            <p className="text-gray-600">
              Share "{report.title}" with other doctors or patients
            </p>
          </div>
          
          {/* Sharing options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Report Access</CardTitle>
              <CardDescription>
                Choose how you want to share this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users">
                <TabsList className="mb-6">
                  <TabsTrigger value="users">Share with Users</TabsTrigger>
                  <TabsTrigger value="link">Share via Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users">
                  {/* Search for users */}
                  <div className="mb-6">
                    <Label className="mb-2 block">Search for users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Selected users */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-6">
                      <Label className="mb-2 block">Selected users</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                          const selectedUser = mockUsers.find(u => u.id === userId);
                          if (!selectedUser) return null;
                          
                          return (
                            <Badge 
                              key={userId} 
                              variant="secondary"
                              className="flex items-center gap-1 py-1 pl-1 pr-2"
                            >
                              <Avatar className="h-5 w-5 mr-1">
                                <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                                <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{selectedUser.name}</span>
                              <X 
                                className="h-3.5 w-3.5 ml-1 cursor-pointer" 
                                onClick={() => toggleUserSelection(userId)}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* User list */}
                  <div className="max-h-80 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      <div className="space-y-2">
                        {filteredUsers.map(user => (
                          <div 
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-md border border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={user.profileImage} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span>{user.email}</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span className="capitalize">{user.role}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant={selectedUsers.includes(user.id) ? "default" : "outline"}
                              size="sm"
                              className={selectedUsers.includes(user.id) ? "bg-medical hover:bg-medical-dark" : ""}
                              onClick={() => toggleUserSelection(user.id)}
                            >
                              {selectedUsers.includes(user.id) ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Selected
                                </>
                              ) : "Select"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-md">
                        <Search className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        {searchQuery ? (
                          <p className="text-gray-500">No users match your search</p>
                        ) : (
                          <p className="text-gray-500">No users available to share with</p>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="link">
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block">Share via link</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={`https://mediarchive.example.com/shared/${report.id}`}
                          className="flex-grow bg-gray-50"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={copyShareLink}
                        >
                          {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Anyone with the link can view this report.
                      </p>
                    </div>
                    
                    <div className="border-t pt-6">
                      <Label className="mb-2 block">Send invite via email</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter email address"
                          type="email"
                          className="flex-grow"
                        />
                        <Button 
                          onClick={handleSendEmail}
                          className="bg-medical hover:bg-medical-dark whitespace-nowrap"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invite
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        The recipient will receive an email with a link to this report.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate(`/report/${report.id}`)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-medical hover:bg-medical-dark"
                onClick={handleShare}
                disabled={selectedUsers.length === report.sharedWith.length && 
                  selectedUsers.every(id => report.sharedWith.includes(id))}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Save Sharing Settings
              </Button>
            </CardFooter>
          </Card>
          
          {/* Current access section */}
          <Card>
            <CardHeader>
              <CardTitle>Current Access</CardTitle>
              <CardDescription>
                People who already have access to this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Report owner */}
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage 
                          src={user?.id === report.doctorId ? user.profileImage : "https://i.pravatar.cc/300?img=1"} 
                          alt="Doctor"
                        />
                        <AvatarFallback>D</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {report.doctorName}
                          {user?.id === report.doctorId && " (You)"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span>Owner</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>Doctor</span>
                        </div>
                      </div>
                    </div>
                    <Badge>Owner</Badge>
                  </div>
                </div>
                
                {/* Patient */}
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage 
                          src={user?.id === report.patientId ? user.profileImage : "https://i.pravatar.cc/300?img=2"} 
                          alt="Patient"
                        />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {report.patientName}
                          {user?.id === report.patientId && " (You)"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span>Has access</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>Patient</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Patient</Badge>
                  </div>
                </div>
                
                {/* Shared with others */}
                {report.sharedWith.length > 0 && report.sharedWith.map(userId => {
                  const sharedUser = mockUsers.find(u => u.id === userId);
                  if (!sharedUser) return null;
                  
                  return (
                    <div key={userId} className="p-4 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={sharedUser.profileImage} alt={sharedUser.name} />
                            <AvatarFallback>{sharedUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {sharedUser.name}
                              {user?.id === sharedUser.id && " (You)"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>Has access</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="capitalize">{sharedUser.role}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {sharedUser.role}
                          </Badge>
                          {!selectedUsers.includes(userId) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => toggleUserSelection(userId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ShareReport;
