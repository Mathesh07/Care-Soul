import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    // Get email from location state or localStorage
    const storedEmail = location.state?.email || localStorage.getItem('pendingEmail');
    if (!storedEmail) {
      navigate('/register');
      return;
    }
    setEmail(storedEmail);
  }, [location, navigate]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setSuccess('');
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await authService.verifyOtp(email, otp);
      
      if (response.success || response.token) {
        setSuccess('Email verified successfully! Redirecting to login...');
        localStorage.removeItem('pendingEmail');
        
        // Store the token and user
        const token = response.token || response.data?.token;
        const user = response.user || response.data?.user;
        
        if (token && user) {
          login(token, user);
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setTimeout(() => navigate('/login'), 1500);
        }
      } else {
        setSuccess('');
        setError(response.message || 'Failed to verify OTP');
      }
    } catch (err: any) {
      setSuccess('');
      setError(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Call resendOtp endpoint - no password needed
      const response = await authService.resendOtp(email);
      
      if (response.success !== false && response.message) {
        setSuccess('OTP resent to your email');
        setResendCountdown(60);
      } else {
        setSuccess('');
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setSuccess('');
      setError(err.response?.data?.message || 'Error resending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We sent a 6-digit code to <br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-primary/10 border border-primary/20 text-foreground px-4 py-3 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-2xl tracking-widest font-mono"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !otp || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={resendCountdown > 0 || loading}
              onClick={handleResendOtp}
            >
              {resendCountdown > 0 
                ? `Resend OTP in ${resendCountdown}s` 
                : 'Resend OTP'}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => navigate('/register')}
            disabled={loading}
          >
            Back to Register
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;
