import React, { useState } from 'react';
import { useNavigate } from 'wouter'; // or your router's hook
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Crown } from 'lucide-react';

export default function FoundersLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterCode, setMasterCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/local/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, masterCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, redirect to main app
        navigate('/');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-md border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Founders' Gate</CardTitle>
          <CardDescription>
            Enter your credentials and the master key to access your kingdom.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
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
              <Label htmlFor="masterCode" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Master Code
              </Label>
              <Input
                id="masterCode"
                type="password"
                placeholder="Enter the founders' master code"
                value={masterCode}
                onChange={(e) => setMasterCode(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Accessing...' : 'Enter Kingdom'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
