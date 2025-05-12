// src/pages/VerifyCode.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AppHeader from '@/components/AppHeader'
import { toast } from 'sonner'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const VerifyCode: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { verifyTwoFactorCode, pendingTwoFactorAuth, generateTwoFactorCode } =
    useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!pendingTwoFactorAuth) {
      navigate('/login')
    }
  }, [pendingTwoFactorAuth, navigate])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingTwoFactorAuth) return
    if (verificationCode.length !== 6) {
      toast.error('Enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    try {
const success = await verifyTwoFactorCode(pendingTwoFactorAuth.email, verificationCode);
console.log('Verification result:', success); 
      if (success) {
        toast.success('Verification successful')
        navigate('/dashboard')
      } else {
        toast.error('Invalid code')
      }
    } catch (err) {
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingTwoFactorAuth) return
    try {
await generateTwoFactorCode(pendingTwoFactorAuth.email);
      toast.success(`Code resent to ${pendingTwoFactorAuth.email}`)
    } catch {
      toast.error('Could not resend code')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Two-Factor Verification
              </CardTitle>
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
                          <InputOTPSlot key={index} index={index} {...slot} />
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
                  <Button variant="link" type="button" onClick={handleResend}>
                    Didn't receive the code? Resend
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-gray-600 mt-2 w-full">
                For demo: check console for code
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default VerifyCode
