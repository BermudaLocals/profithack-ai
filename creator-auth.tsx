import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

export default function CreatorAuth() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => 
      apiRequest('/api/auth/login', "POST", data),
    onSuccess: () => {
      window.location.href = '/feed';
    },
    onError: (error: any) => {
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid credentials", 
        variant: "destructive" 
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: { email: string; password: string; username: string }) => 
      apiRequest('/api/auth/signup', "POST", data),
    onSuccess: () => {
      toast({ title: "Account Created!", description: "Welcome to CreatorHub!" });
      window.location.href = '/feed';
    },
    onError: (error: any) => {
      toast({ 
        title: "Signup Failed", 
        description: error.message || "Could not create account", 
        variant: "destructive" 
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters", variant: "destructive" });
      return;
    }
    signupMutation.mutate({ email, password, username });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" data-testid="creator-auth">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-600/10 to-cyan-500/10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">CreatorHub</h1>
          <p className="text-gray-400">Create. Connect. Earn.</p>
        </div>

        <Card className="bg-black/50 border-white/10 backdrop-blur-xl p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full bg-white/5 p-1 rounded-lg mb-6">
              <TabsTrigger 
                value="login" 
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600"
              >
                Log In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      data-testid="input-login-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white"
                      data-testid="input-login-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Logging in..." : (
                    <>Log In <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>

                <p className="text-center text-gray-400 text-sm">
                  <a href="/forgot-password" className="text-pink-400 hover:underline">Forgot password?</a>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="yourname"
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      data-testid="input-signup-username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      data-testid="input-signup-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white"
                      data-testid="input-signup-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      data-testid="input-signup-confirm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={signupMutation.isPending}
                  data-testid="button-signup"
                >
                  {signupMutation.isPending ? "Creating account..." : (
                    <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>

                <p className="text-center text-gray-500 text-xs">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-white font-bold">Become a Creator</p>
                <p className="text-gray-400 text-sm">Earn 55% of all tips, gifts & subscriptions</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-pink-400">$60M+</p>
            <p className="text-gray-400 text-xs">Creator Earnings</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-purple-400">10M+</p>
            <p className="text-gray-400 text-xs">Active Users</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-cyan-400">55%</p>
            <p className="text-gray-400 text-xs">Creator Share</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
