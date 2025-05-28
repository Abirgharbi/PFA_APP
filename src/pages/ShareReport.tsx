import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  ArrowLeft, 
  Copy, 
  Mail, 
  Share2, 
  Check,
  Search,
  X,
  User,
  Image,
  Loader2
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
import AppHeader from '@/components/AppHeader';
import { cn } from '@/lib/utils';
import { getReportById, shareByEmail } from '@/services/archiveService';
import axios from 'axios';
import { Report} from '@/models/report';

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
}

const ShareReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [report, setReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  // Load report and available users
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load report data
        const reportData = location.state?.report 
          ? location.state.report 
          : await getReportById(id!, user!.token);
        
        setReport(reportData);

        setSelectedUsers(reportData.sharedWith || []);

        // Load available users (doctors only)
        const response = await axios.get('/api/users/doctors', {
          headers: { Authorization: `Bearer ${user!.token}` }
        });

if (Array.isArray(response.data)) {
  setAvailableUsers(response.data);
  setFilteredUsers(response.data);
} else {
  console.error('Expected an array of users, got:', response.data);
  setAvailableUsers([]);
  setFilteredUsers([]);
}
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load report data');
        navigate('/archive');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user?.token) {
      loadData();
    }
  }, [id, user, navigate, location.state]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        availableUsers.filter(u => 
          u.name.toLowerCase().includes(query) || 
          u.email.toLowerCase().includes(query)
       ) );
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchQuery, availableUsers]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };
  const toggleVisibility = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/uploads/${report._id}/visibility`,
        { isPublic: !report.isPublic },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setReport(prev => ({ ...prev!, isPublic: response.data.isPublic }));
      toast.success(`Le rapport est maintenant ${response.data.isPublic ? 'public' : 'privé'}.`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visibilité :', error);
      toast.error("Échec de la mise à jour de la visibilité du rapport.");
    }
  };
const copyShareLink = () => {
  if (!report) return;
  
  const shareUrl = `${window.location.origin}/shared/${report._id}`;
  navigator.clipboard.writeText(shareUrl)
    .then(() => {
      toast.success('Lien copié !');
    })
    .catch(() => toast.error('Échec de la copie'));
};

  const handleShareByEmail = async () => {
    if (!email || !validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!report || !user?.token) return;

    try {
      setIsSharing(true);
      await shareByEmail(report._id, email, user.token);
      toast.success(`Report shared successfully with ${email}`);
      setEmail('');
    } catch (error) {
      console.error('Email share failed:', error);
      toast.error('Failed to share report by email');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveShare = async () => {
    if (!report || !user?.token) return;

    try {
      setIsSharing(true);
      await shareReportWithUsers(report._id, selectedUsers, user.token);
      toast.success('Sharing settings updated successfully');
      navigate(`/report/${report._id}`);
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to update sharing settings');
    } finally {
      setIsSharing(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
            <Button onClick={() => navigate('/archive')}>Back to Archive</Button>
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
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl font-bold mb-6">Share Medical Report</h1>
          
          {/* Report Summary Card */}
          <Card className="mb-6">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-medical" />
                  <span className="truncate">{report.title || "Medical Report"}</span>
                </div>
                <Badge variant="outline">
                  {new Date(report.date).toLocaleDateString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>
                    <span className="text-gray-500">Patient:</span>{' '}
                    <span className="font-medium">
                      {report.patientName || report.patientId}
                    </span>
                  </span>
                </div>
                {report.imageUrl && (
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-gray-500" />
                    <span>
                      <span className="text-gray-500">Image:</span>{' '}
                      <span className="font-medium truncate">
                        {report.imageUrl.split('/').pop()}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
<Card className="mb-6">
  <CardHeader>
    <CardTitle>Confidentialité du rapport</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Statut :
        <span className={`ml-2 font-semibold ${report.isPublic ? 'text-green-600' : 'text-red-600'}`}>
          {report.isPublic ? 'Public' : 'Privé'}
        </span>
      </p>
      <Button variant="outline" onClick={toggleVisibility}>
        Rendre {report.isPublic ? 'privé' : 'public'}
      </Button>
    </div>
  </CardContent>
</Card>  {/* Sharing Options Tabs */}
          <Tabs defaultValue="users">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="users" className="flex-1">Share with Users</TabsTrigger>
              <TabsTrigger value="link" className="flex-1">Share via Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Select Medical Professionals</CardTitle>
                  <CardDescription>
                    Choose doctors who should have access to this report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search doctors..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Selected users */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-4">
                      <Label className="mb-2 block">Selected doctors</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                          const user = availableUsers.find(u => u._id === userId);
                          if (!user) return null;
                          
                          return (
                            <Badge 
                              key={userId} 
                              variant="secondary"
                              className="flex items-center gap-1 py-1 pl-1 pr-2"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.profileImage} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
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

                  {/* Users list */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <div
                          key={user._id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-md border",
                            selectedUsers.includes(user._id) 
                              ? "border-medical bg-medical/10" 
                              : "border-gray-100 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={user.profileImage} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                              <div className="text-xs text-blue-500">{user.role}</div>
                            </div>
                          </div>
                          <Button
                            variant={selectedUsers.includes(user._id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleUserSelection(user._id)}
                          >
                            {selectedUsers.includes(user._id) ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Selected
                              </>
                            ) : 'Select'}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">
                          {searchQuery ? 'No matching Patient found' : 'No Patient available'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveShare}
                    disabled={isSharing || selectedUsers.length === (report.sharedWith?.length || 0)}
                  >
                    {isSharing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" />
                    )}
                    {isSharing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="link">
              <Card>
                <CardHeader>
                  <CardTitle>Share via Link</CardTitle>
                  <CardDescription>
                    Create a shareable link for this report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Shareable link</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/shared/${report._id}`}
                        className="bg-gray-50"
                      />
<Button 
  variant="outline" 
  onClick={copyShareLink}
  disabled={!report.isPublic}
  className={cn(
    "gap-2",
    !report.isPublic && "cursor-not-allowed opacity-50", // Optional visual feedback
    linkCopied ? "bg-green-500 hover:bg-green-500 text-white" : ""
  )}
>
  {linkCopied ? (
    <>
      <Check className="h-4 w-4" />
      Copied!
    </>
  ) : (
    <>
      <Copy className="h-4 w-4" />
      Copy
    </>
  )}
</Button>


                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Anyone with this link can view the report.
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Send link via email</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="doctor@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
<Button 
  onClick={handleShareByEmail}
  disabled={isSharing || !report.isPublic}
  className="bg-medical hover:bg-medical-dark"
>
  {isSharing ? (
    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  ) : (
    <Mail className="h-4 w-4 mr-2" />
  )}
  {isSharing ? 'Sending...' : 'Send'}
</Button>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ShareReport;

function shareReportWithUsers(_id: string, selectedUsers: string[], token: string) {
  throw new Error('Function not implemented.');
}
