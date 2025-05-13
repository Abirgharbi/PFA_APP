import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/AppHeader';
import { login } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor');

  const navigate = useNavigate();
  const { setPendingTwoFactorAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (result.need2FA && result.email && result.role) {
        setPendingTwoFactorAuth({ email: result.email, role: result.role });
        navigate('/verify-code');
      } else {
        toast.error('Two-factor authentication is required for all users.');
      }      
    } catch (error) {
      toast.error('Login failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (userType: 'doctor' | 'patient') => {
    if (userType === 'doctor') {
      setEmail('doctor@example.com');
      setPassword('doctor123');
      setRole('doctor');
    } else {
      setEmail('patient@example.com');
      setPassword('patient123');
      setRole('patient');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign in to our abir</CardTitle>
              <CardDescription className="text-center">Enter your email and password to sign in</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="doctor" onValueChange={(v) => setRole(v as 'doctor' | 'patient')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="doctor">Doctor</TabsTrigger>
                  <TabsTrigger value="patient">Patient</TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-medical hover:underline">Forgot password?</Link>
                  </div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-medical hover:bg-medical-dark" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-4">
                <p className="text-sm text-center text-gray-500 mb-2">Or use demo account</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setDemoCredentials('doctor')} className="text-xs">Use Doctor Demo</Button>
                  <Button variant="outline" onClick={() => setDemoCredentials('patient')} className="text-xs">Use Patient Demo</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-gray-600 mt-2 w-full">
                Don’t have an account? <Link to="/register" className="text-medical hover:underline">Sign up</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
