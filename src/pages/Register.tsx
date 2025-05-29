import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import { registerPatient, registerDoctor } from "@/services/authService"; // Import the register functions

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"doctor" | "patient">("doctor");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (role === "doctor") {
        result = await registerDoctor({ fullName: name, email, password });
      } else {
        result = await registerPatient({ fullName: name, email, password });
      }

      if (result) {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Create an account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="doctor"
                className="w-full mb-6"
                onValueChange={(v) => setRole(v as "doctor" | "patient")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="doctor">Doctor</TabsTrigger>
                  <TabsTrigger value="patient">Patient</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="doctor"
                  className="mt-4 text-center text-sm text-gray-600"
                >
                  Create an account to digitize, archive, and share medical
                  reports with your patients.
                </TabsContent>
                <TabsContent
                  value="patient"
                  className="mt-4 text-center text-sm text-gray-600"
                >
                  Create an account to receive reports from your doctors and
                  keep track of your medical history.
                </TabsContent>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Abir Gharbi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="orsowen@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-medical hover:bg-medical-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-gray-600 mt-2 w-full">
                Already have an account?{" "}
                <Link to="/login" className="text-medical hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Register;
