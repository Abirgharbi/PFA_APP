
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  Award, 
  AtSign, 
  Calendar, 
  Camera,
  Lock,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    hospital: '',
    bio: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Populate form with user data
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        specialization: user.role === 'doctor' ? 'Cardiologist' : '',
        hospital: user.role === 'doctor' ? 'Central Hospital' : '',
        bio: 'Healthcare professional with over 10 years of experience.'
      });
    }
  }, [user, isAuthenticated, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // In a real app, this would send data to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // In a real app, this would send data to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password updated successfully');
      
      // Reset the form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
      console.error(error);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Profile...</h2>
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
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-8">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Photo Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                    <CardDescription>
                      Update your profile picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className="text-2xl">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-medical text-white">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      JPG, GIF or PNG. Max size 1MB.
                    </p>
                  </CardContent>
                </Card>
                
                {/* Profile Information Form */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        
                        {user.role === 'doctor' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="specialization">Specialization</Label>
                              <Input
                                id="specialization"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="hospital">Hospital/Clinic</Label>
                              <Input
                                id="hospital"
                                name="hospital"
                                value={formData.hospital}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Tell us a bit about yourself"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-medical hover:bg-medical-dark"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-medical hover:bg-medical-dark"
                            disabled={isChangingPassword}
                          >
                            {isChangingPassword ? 'Updating...' : 'Update Password'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-medical" />
                            <span>Two-Factor Authentication</span>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>
                        <Separator />
                        <div>
                          <Label className="mb-2 block">Sessions</Label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm mb-1">Current Session</div>
                            <div className="text-xs text-gray-500">
                              Last active: Today at {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out of All Devices
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Email Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="notification-new-reports">New reports</Label>
                          <input 
                            type="checkbox" 
                            id="notification-new-reports"
                            className="toggle"
                            defaultChecked
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="notification-shared-reports">Shared with you</Label>
                          <input 
                            type="checkbox" 
                            id="notification-shared-reports"
                            className="toggle"
                            defaultChecked
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="notification-followups">Follow-up reminders</Label>
                          <input 
                            type="checkbox" 
                            id="notification-followups"
                            className="toggle"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">App Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="notification-app-new">New report notifications</Label>
                          <input 
                            type="checkbox" 
                            id="notification-app-new"
                            className="toggle"
                            defaultChecked
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="notification-app-shared">Share notifications</Label>
                          <input 
                            type="checkbox" 
                            id="notification-app-shared"
                            className="toggle"
                            defaultChecked
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="notification-app-reminders">Reminder notifications</Label>
                          <input 
                            type="checkbox" 
                            id="notification-app-reminders"
                            className="toggle"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => toast.success('Notification preferences saved')}
                    className="bg-medical hover:bg-medical-dark"
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
