import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface InviteCodeEntryProps {
  onCodeComplete: (code: string) => void;
  onCodeChange?: (code: string) => void;
  disabled?: boolean;
}

export function InviteCodeEntry({ onCodeComplete, onCodeChange, disabled = false }: InviteCodeEntryProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (value: string) => {
    // Only allow alphanumeric characters, max 12
    const cleanCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    setCode(cleanCode);
    setError('');

    // Call onChange callback
    if (onCodeChange) {
      onCodeChange(cleanCode);
    }
  };

  const handleSubmit = async () => {
    if (code.length < 8) {
      setError('Invite code must be at least 8 characters');
      return;
    }

    if (code.length > 12) {
      setError('Invite code must be at most 12 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        toast({
          title: "✅ Code Verified!",
          description: "Redirecting to signup...",
        });
        onCodeComplete(code);
      } else {
        setError(data.message || 'Invalid invite code');
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: data.message || 'This invite code is invalid or already used',
        });
      }
    } catch (err) {
      setError('Failed to verify code');
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to verify code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length >= 8) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold">Enter Your Invite Code</h3>
        <p className="text-sm text-muted-foreground">
          8-12 character code from social media or a friend
        </p>
      </div>

      <div className="space-y-3">
        <Input
          type="text"
          value={code}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="ABC123XYZ"
          disabled={loading || disabled}
          data-testid="invite-code-input"
          className="text-center text-2xl font-bold uppercase tracking-wider h-16"
          style={{
            fontFamily: 'monospace',
            letterSpacing: '0.2em',
          }}
          maxLength={12}
          autoFocus
        />
        
        <p className="text-xs text-center text-muted-foreground">
          {code.length}/12 characters • Press Enter to submit
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center" data-testid="invite-code-error">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={code.length < 8 || loading || disabled}
          className="w-full"
          size="lg"
          data-testid="button-verify-code"
        >
          {loading ? 'Verifying...' : 'Verify Code & Continue'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          💡 Paste or type your code • Founder code: 144F2F7602
        </p>
      </div>
    </div>
  );
}

export default InviteCodeEntry;
