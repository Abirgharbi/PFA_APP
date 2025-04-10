
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/AppHeader';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyCode: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { verifyTwoFactorCode, pendingTwoFactorAuth, generateTwoFactorCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no pending 2FA, redirect to login
    if (!pendingTwoFactorAuth) {
      navigate('/login');
    }
  }, [pendingTwoFactorAuth, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pendingTwoFactorAuth) {
      toast.error('No verification pending');
      return;
    }
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await verifyTwoFactorCode(pendingTwoFactorAuth.userId, verificationCode);
      
      if (success) {
        toast.success('Verification successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Verification failed');
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingTwoFactorAuth) return;
    
    try {
      await generateTwoFactorCode(pendingTwoFactorAuth.userId);
      toast.success(`A new verification code has been sent to ${pendingTwoFactorAuth.email}`);
    } catch (error) {
      toast.error('Failed to resend code');
      console.error('Error resending code:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Two-Factor Verification</CardTitle>
              <CardDescription className="text-center">
                Enter the 6-digit code sent to {pendingTwoFactorAuth?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center my-6">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                    render={({ slots }) => (
                      <InputOTPGroup className="gap-2">
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} index={index} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-medical hover:bg-medical-dark" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
                
                <div className="text-center">
                  <Button variant="link" type="button" onClick={handleResendCode}>
                    Didn't receive the code? Resend
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-gray-600 mt-2 w-full">
                For demo purposes, the code appears in the browser console.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VerifyCode;
