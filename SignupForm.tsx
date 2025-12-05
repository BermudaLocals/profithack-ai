import { useState } from 'react';
import { InviteCodeEntry } from './InviteCodeEntry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSignupSuccess?: () => void;
}

export function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [step, setStep] = useState<'invite' | 'details'>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleCodeComplete = (code: string) => {
    setInviteCode(code);
    setStep('details');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Username validation
    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast({
          title: "📧 Check Your Email!",
          description: data.message,
        });
        setTimeout(() => {
          if (onSignupSuccess) {
            onSignupSuccess();
          }
        }, 3000);
      } else {
        setErrors({ form: data.error || 'Signup failed' });
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: data.error,
        });
      }
    } catch (err) {
      setErrors({ form: 'An error occurred during signup' });
      toast({
        variant: "destructive",
        title: "Error",
        description: 'An error occurred during signup',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center p-8">
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Account Created Successfully!</h2>
          <p className="text-muted-foreground">
            Check your email for a confirmation link and your 5 invite codes.
          </p>
          <p className="text-sm text-primary">
            You can now sign in with your credentials after verifying your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {step === 'invite' ? (
        <InviteCodeEntry onCodeComplete={handleCodeComplete} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="signup-details-form">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">Create Your Account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to complete signup
            </p>
          </div>

          {errors.form && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm" data-testid="form-error">
              {errors.form}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={loading}
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-sm text-destructive" data-testid="error-email">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="your_username"
                disabled={loading}
                data-testid="input-username"
              />
              {errors.username && (
                <p className="text-sm text-destructive" data-testid="error-username">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                data-testid="input-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive" data-testid="error-password">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                • At least 8 characters • 1 uppercase letter • 1 number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                data-testid="input-confirm-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive" data-testid="error-confirm-password">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
            data-testid="button-signup-submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep('invite')}
            disabled={loading}
            data-testid="button-back-to-code"
          >
            ← Back to Invite Code
          </Button>
        </form>
      )}
    </div>
  );
}

export default SignupForm;
