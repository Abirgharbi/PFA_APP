import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

import { useAuth } from "@/contexts/AuthContext";
import { Check, Search, X, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { cn } from "@/lib/utils";

import { deletePatient, getMyPatient } from "@/services/patientService";
import { sendInvitationByEmail } from "@/services/invitationService";
import { Capacitor } from "@capacitor/core";
import { isMobile } from "@/config";

interface User {
  _id: string;
  fullName: string;
  email: string;
}
interface PatientSelectionProps {
  onSelectPatient: (id: string) => void;
}

const PatientPage: React.FC<PatientSelectionProps> = ({ onSelectPatient }) => {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const report = { _id: id, isPublic: true };
  const url =
    Capacitor.getPlatform() === "web"
      ? `${window.location.origin}/addingpatient/`
      : `myapp://addingpatient/`;
  // Replace this with real report data or prop
  const handleDeletePatient = async (patientId: string) => {
    try {
      await deletePatient(patientId, user.token);
      toast.success("Patient deleted");
      setAvailableUsers((prev) => prev.filter((p) => p._id !== patientId));
      setFilteredUsers((prev) => prev.filter((p) => p._id !== patientId));
      setSelectedUsers((prev) => prev.filter((id) => id !== patientId));
      if (onSelectPatient) onSelectPatient("");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete patient");
    }
  };
  const handleShareByEmail = async (email: string) => {
    setIsSharing(true);
    try {
      await sendInvitationByEmail({ patientemail: email, token: user.token });
      toast.success("Link sent successfully");
    } catch (err) {
      toast.error("Failed to send link");
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  // Load report and available users
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load available doctors
        const response = await getMyPatient(user.token);
        if (Array.isArray(response)) {
          const doctors = response.map((doctor) => ({
            _id: doctor._id,
            fullName: doctor.fullName,
            email: doctor.email,
          }));

          setAvailableUsers(doctors);
          setFilteredUsers(doctors);
        } else {
          console.error("Expected an array of users, got:", response.data);
          setAvailableUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load report data");
        navigate("/archive");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, location.state]);
  useEffect(() => {
    if (!user || !user.token) {
      navigate("/"); // Redirect to home if not authenticated
    }
  }, [user, navigate]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        availableUsers.filter(
          (u) =>
            u.fullName.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchQuery, availableUsers]);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      // Si l'utilisateur est déjà sélectionné, on le désélectionne
      setSelectedUsers([]);
      onSelectPatient(""); // On informe le parent qu'aucun patient n'est sélectionné
    } else {
      // Sinon, on sélectionne le nouvel utilisateur (en remplaçant toute sélection précédente)
      setSelectedUsers([userId]);
      onSelectPatient(userId); // Appel à la fonction parente
    }
  };

  const getAvatarFallback = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
    ];
    const color = colors[initials.charCodeAt(0) % colors.length];
    return (
      <div
        className={`${color} flex items-center justify-center h-full w-full text-white`}
      >
        {initials}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }
  if (isMobile) {
    return (
      <div className="flex flex-col ">
        <div className="max-w-3xl w-full mx-auto ">
          <Tabs defaultValue="users" className="w-full">
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Patient</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                      aria-label="Add Patient"
                    >
                      +
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {isModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
                        <div className="p-6 border-b flex justify-between items-center">
                          <h2 className="text-lg font-semibold">Add Patient</h2>
                          <Button
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="p-6 space-y-4">
                          {/* Shareable link section */}
                          <div>
                            <Label className="mb-2 block">Shareable link</Label>
                            <div className="flex gap-2"></div>
                          </div>

                          {/* QR Code Section */}
                          <div className="flex flex-col items-center gap-2">
                            <Label>QR Code</Label>
                            <QRCodeCanvas
                              value={`${url}${user._id}`}
                              size={128}
                            />
                          </div>

                          {/* Email sharing section */}
                          <div className="border-t pt-4">
                            <Label className="mb-2 block">
                              Send invitation via email
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="patient@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                              <Button
                                onClick={() => handleShareByEmail(email)}
                                disabled={isSharing || !report.isPublic}
                                className="bg-medical hover:bg-medical-dark"
                              >
                                {isSharing ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4 mr-2" />
                                )}
                                {isSharing ? "Sending..." : "Send"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {/* Users list */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const isSelected = selectedUsers.includes(user._id);
                        return (
                          <div
                            key={user._id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-md border cursor-pointer",
                              isSelected
                                ? "border-medical bg-medical/10"
                                : "border-gray-100 hover:bg-gray-50"
                            )}
                            onClick={() => toggleUserSelection(user._id)}
                          >
                            <div className="flex items-center">
                              <Avatar className="h-9 w-9 mr-3">
                                <AvatarFallback>
                                  {getAvatarFallback(user.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {user.fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent toggle when clicking delete
                                  handleDeletePatient(user._id);
                                }}
                                className="p-1"
                                aria-label="Delete patient"
                              >
                                <X className="h-4 w-4 text-gray-600 hover:text-red-600" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No matching patient found"
                            : "No patients available"}
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
  }
  return (
    <div className="flex flex-col ">
      <div className="max-w-3xl w-full mx-auto ">
        <Tabs defaultValue="users" className="w-full">
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Select Patient</CardTitle>
                  <CardDescription>
                    Choose patient to follow his evolution
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                  Add Patient
                </Button>
              </CardHeader>

              <CardContent>
                {isModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
                      <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Add Patient</h2>
                        <Button
                          variant="ghost"
                          onClick={() => setIsModalOpen(false)}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="p-6 space-y-4">
                        {/* Shareable link section */}
                        <div>
                          <Label className="mb-2 block">Shareable link</Label>
                          <div className="flex gap-2"></div>
                        </div>

                        {/* QR Code Section */}
                        <div className="flex flex-col items-center gap-2">
                          <Label>QR Code</Label>
                          <QRCodeCanvas
                            value={`${url}${user._id}`}
                            size={128}
                          />
                        </div>

                        {/* Email sharing section */}
                        <div className="border-t pt-4">
                          <Label className="mb-2 block">
                            Send invitation via email
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="patient@example.com"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                              onClick={() => handleShareByEmail(email)}
                              disabled={isSharing || !report.isPublic}
                              className="bg-medical hover:bg-medical-dark"
                            >
                              {isSharing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4 mr-2" />
                              )}
                              {isSharing ? "Sending..." : "Send"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                      {selectedUsers.map((userId) => {
                        const user = availableUsers.find(
                          (u) => u._id === userId
                        );
                        if (!user) return null;

                        return (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="flex items-center gap-1 py-1 pl-1 pr-2"
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarFallback>
                                {getAvatarFallback(user.fullName)}
                              </AvatarFallback>
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
                    filteredUsers.map((user) => (
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
                            <AvatarFallback>
                              {getAvatarFallback(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={
                              selectedUsers.includes(user._id)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleUserSelection(user._id)}
                          >
                            {selectedUsers.includes(user._id) ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePatient(user._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {searchQuery
                          ? "No matching patient found"
                          : "No patients available"}
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
