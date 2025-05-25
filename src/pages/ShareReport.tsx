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
  CalendarDays
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
import { Report } from '@/models/report';
import AppHeader from '@/components/AppHeader';
import { cn } from '@/lib/utils';

// Mock data pour les utilisateurs disponibles pour le partage
const mockUsers = [
  {
    _id: 'd1',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@example.com',
    profileImage: 'https://i.pravatar.cc/300?img=1'
  },
  {
    _id: 'd2',
    name: 'Dr. Michael Chen',
    email: 'doctor2@example.com',
    profileImage: 'https://i.pravatar.cc/300?img=3'
  },
  {
    _id: 'p1',
    name: 'Alex Rodriguez',
    email: 'patient@example.com',
    profileImage: 'https://i.pravatar.cc/300?img=2'
  }
];

const ShareReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [report, setReport] = useState<Report | null>(location.state?.report || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!report && id) {
      // Ici vous devriez récupérer le rapport depuis votre API
      // fetchReport(id).then(setReport).catch(handleError);
      toast.error('Report data not available');
      navigate('/archive');
    }

    // Initialiser les utilisateurs sélectionnés avec ceux qui ont déjà accès
    if (report) {
      setSelectedUsers(report.sharedWith || []);
    }
  }, [id, report, navigate]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(mockUsers.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      ));
    } else {
      setFilteredUsers(mockUsers);
    }
  }, [searchQuery]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const copyShareLink = () => {
    if (!report) return;
    
    const shareUrl = `${window.location.origin}/shared/${report._id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setLinkCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleShareByEmail = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    toast.info(`Share link would be sent to ${email}`);
    setEmail('');
  };

  const handleSaveShare = () => {
    if (!report) return;
    
    // Ici vous devriez mettre à jour le rapport via votre API
    // avec les nouveaux utilisateurs sélectionnés
    toast.success('Sharing settings saved successfully');
    navigate(`/report/${report._id}`);
  };

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
          
          {/* Card with report summary */}
          <Card className="mb-6">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-medical" />
                  <span className="truncate">{report.title}</span>
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
                    <span className="font-medium">{report.patientId}</span>
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <span>
                    <span className="text-gray-500">Created:</span>{' '}
                    <span className="font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </span>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Sharing options tabs */}
          <Tabs defaultValue="users">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="users" className="flex-1">Share with Users</TabsTrigger>
              <TabsTrigger value="link" className="flex-1">Share via Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Select Users</CardTitle>
                  <CardDescription>
                    Choose which users should have access to this report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Selected users */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-4">
                      <Label className="mb-2 block">Selected users</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                          const user = mockUsers.find(u => u._id === userId);
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
                          {searchQuery ? 'No matching users found' : 'No users available'}
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
                    disabled={selectedUsers.length === (report.sharedWith?.length || 0)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Save Changes
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
                        className={cn(
                          "gap-2",
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
                        placeholder="email@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button 
                        onClick={handleShareByEmail}
                        className="bg-medical hover:bg-medical-dark"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send
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