import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { Mail, Loader2, CheckCircle, Ticket, Lock, User, Edit2 } from 'lucide-react';
import logoImage from '@assets/profithackai_logo_500kb_1762344195041.png';

export default function SimpleSignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editingCode, setEditingCode] = useState(false);

  // Auto-fill invite code from URL parameter (already verified on landing page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('invite');
    if (codeFromUrl) {
      console.log('Auto-filling invite code from URL:', codeFromUrl);
      setInviteCode(codeFromUrl.toUpperCase());
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 SIGNUP STARTED:", { email, username });
    
    // INVITE CODE DISABLED - Only require email, username, password
    if (!email || !username || !password) {
      console.log("❌ MISSING FIELDS");
      toast({
        title: "Missing fields",
        description: "Please enter your email, username, and password",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3) {
      console.log("❌ USERNAME TOO SHORT");
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      console.log("❌ PASSWORD TOO SHORT");
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("📤 SENDING REQUEST TO /api/auth/signup (NEW PDF-STYLE FLOW)");

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, inviteCode: inviteCode || 'OPEN_SIGNUP' }),
      });

      console.log("📥 RESPONSE STATUS:", response.status);

      const data = await response.json();
      console.log("📦 RESPONSE DATA:", data);

      if (response.ok) {
        console.log("✅ SIGNUP SUCCESS!");
        setSuccess(true);
        toast({
          title: "Success! 🎉",
          description: "Check your email to verify your account!",
        });
      } else {
        console.log("❌ SIGNUP FAILED:", data.error);
        toast({
          title: "Signup failed",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("💥 SIGNUP ERROR:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        <ParticleBackground />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border-gray-800 p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                Check Your Email!
              </h1>
              
              <p className="text-gray-300 mb-2">
                We sent a verification link to:
              </p>
              
              <p className="text-xl text-cyan-400 font-semibold mb-6">
                {email}
              </p>
              
              <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-400 mb-3">
                  📧 Check your inbox (and spam folder) for an email from PROFITHACK AI
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  ✅ Click the verification link to activate your account
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  🎟️ You'll also find your 5 invite codes in the same email!
                </p>
                <p className="text-sm text-gray-400">
                  👤 Set your username later in Account Settings
                </p>
              </div>

              {/* PWA Install Prompt */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3 text-center">
                  📱 Get the Mobile App
                </h3>
                <p className="text-sm text-gray-300 mb-4 text-center">
                  Install PROFITHACK AI on your device for faster access, offline support, and a native app experience!
                </p>
                <div className="flex justify-center">
                  <PWAInstallButton />
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <a href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                  ← Back to home
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border-gray-800 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={logoImage} 
              alt="PROFITHACK AI Logo" 
              className="w-40 h-auto mx-auto mb-4"
              data-testid="img-logo"
            />
            <p className="text-gray-400 text-sm">
              Create your account
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* INVITE CODE DISABLED - Hidden for open signup */}
            {false && (!inviteCode || editingCode) && (
              <div>
                <label className="text-sm text-gray-300 mb-2 block font-semibold">
                  Invite Code (Optional)
                </label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your invite code (optional)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="pl-12 bg-gray-800 border-gray-700 text-white text-lg h-14 font-mono uppercase w-full rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={20}
                    inputMode="text"
                    data-testid="input-invite-code"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Invite codes temporarily disabled - open signup enabled
                </p>
              </div>
            )}

            {/* INVITE CODE DISABLED - Hide verified badge */}
            {false && inviteCode && !editingCode && (
              <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-400">Code Verified!</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Using invite code: <span className="font-mono text-cyan-400">{inviteCode}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingCode(true)}
                    className="text-cyan-400 hover:text-cyan-300"
                    data-testid="button-edit-invite-code"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-300 mb-2 block font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-gray-800 border-gray-700 text-white text-lg h-14"
                  required
                  autoFocus={!!inviteCode}
                  data-testid="input-email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block font-semibold">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Choose your username (min 3 chars)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 bg-gray-800 border-gray-700 text-white text-lg h-14"
                  required
                  data-testid="input-username"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This will be your public display name on the platform
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Create a strong password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-gray-800 border-gray-700 text-white text-lg h-14"
                  required
                  data-testid="input-password"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Forgot it? Use "Forgot Password" to reset via email
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold h-14 text-lg"
              data-testid="button-signup"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <a href="/email-login" className="text-purple-400 hover:text-purple-300">
                Log in here
              </a>
            </p>
            <p className="text-sm text-gray-400">
              Forgot your password?{' '}
              <a href="/forgot-password" className="text-cyan-400 hover:text-cyan-300">
                Reset it here
              </a>
            </p>
          </div>

          {/* Back to landing */}
          <div className="mt-8 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              ← Back to home
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
