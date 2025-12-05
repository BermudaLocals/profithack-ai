import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ParticleBackground';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [currentToken, setCurrentToken] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    setCurrentToken(token);
    setCurrentEmail(email);

    // Verify the email using the token
    verifyEmail(token, email);
  }, [search]);

  const verifyEmail = async (token: string, email: string) => {
    setRetrying(false);
    setStatus('loading');
    
    try {
      const response = await fetch('/api/auth/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
        credentials: 'include', // Important: Include cookies for session
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setAlreadyVerified(data.alreadyVerified || false);
        setMessage(data.message || 'Your email has been verified! Taking you to your For You Page...');
        
        // CRITICAL: Invalidate auth queries so the app knows we're logged in
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        // Wait a moment for the session to be established, then redirect
        setTimeout(() => {
          // Force a full page reload to ensure session is active
          window.location.href = '/';
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Connection error. Please try again.');
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    verifyEmail(currentToken, currentEmail);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border-gray-800 p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-4">
                  Verifying your email...
                </h1>
                
                <p className="text-gray-400">
                  Please wait while we verify your account.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                  {alreadyVerified ? 'Already Verified! ✨' : 'Email Verified! 🎉'}
                </h1>
                
                <p className="text-gray-300 mb-6">
                  {message}
                </p>
                
                <div className="bg-gray-800/50 border border-green-500/20 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-400 mb-2">
                    ✅ Your account is now active
                  </p>
                  {!alreadyVerified && (
                    <p className="text-sm text-gray-400 mb-2">
                      🎟️ Check your email for your 5 invite codes
                    </p>
                  )}
                  <p className="text-sm text-gray-400">
                    🚀 Taking you to your For You Page...
                  </p>
                </div>
                
                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 h-12"
                  data-testid="button-goto-dashboard"
                >
                  Go to FYP
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
                  Verification Failed
                </h1>
                
                <p className="text-gray-300 mb-6">
                  {message}
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12"
                    data-testid="button-retry-verification"
                  >
                    {retrying ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Retry Verification
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setLocation('/email-login')}
                    variant="outline"
                    className="w-full h-12 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    data-testid="button-resend-email"
                  >
                    Request New Verification Email
                  </Button>
                  
                  <Button
                    onClick={() => setLocation('/')}
                    variant="outline"
                    className="w-full h-12"
                    data-testid="button-goto-home"
                  >
                    Go to Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
