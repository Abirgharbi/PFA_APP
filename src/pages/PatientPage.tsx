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

import axios from 'axios';
import { getMyPatient } from '@/services/patientService';

interface User {
  _id: string;
  fullName: string;
  email: string;
}
interface PatientSelectionProps {
  onSelectPatient: (id: string) => void;
}

const PatientPage : React.FC<PatientSelectionProps> = ({ onSelectPatient }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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

        // Load available doctors
        const response = await getMyPatient(user.token);
        console.log("hello"+response);
        if (Array.isArray(response)) {
          const doctors = response.map(doctor => ({
            _id: doctor._id,
            fullName: doctor.fullName,
            email: doctor.email,
          }));
      
          setAvailableUsers(doctors);
          setFilteredUsers(doctors);
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

    loadData();
  }, [navigate, location.state]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        availableUsers.filter(u => 
          u.fullName.toLowerCase().includes(query) || 
          u.email.toLowerCase().includes(query)
      ));
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchQuery, availableUsers]);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      // Si l'utilisateur est déjà sélectionné, on le désélectionne
      setSelectedUsers([]);
      onSelectPatient(''); // On informe le parent qu'aucun patient n'est sélectionné
    } else {
      // Sinon, on sélectionne le nouvel utilisateur (en remplaçant toute sélection précédente)
      setSelectedUsers([userId]);
      onSelectPatient(userId); // Appel à la fonction parente
    }
  };

  const getAvatarFallback = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    return (
      <div className={`${color} flex items-center justify-center h-full w-full text-white`}>
        {initials}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-3xl w-full mx-auto">
        <Tabs defaultValue="users" className="w-full">
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
                <CardDescription>
                  Choose patient to follow his evolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Selected users */}
                {selectedUsers.length > 0 && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Selected patient</Label>
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
                              <AvatarFallback>{getAvatarFallback(user.fullName)}</AvatarFallback>
                            </Avatar>
                            <span>{user.fullName}</span>
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
                            <AvatarFallback>{getAvatarFallback(user.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
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
                        {searchQuery ? 'No matching patient found' : 'No patients available'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientPage;