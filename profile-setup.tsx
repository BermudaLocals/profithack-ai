import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, User, Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Zod schema for profile setup
const profileSetupSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .refine(val => !val.startsWith('_'), "Username cannot start with underscore")
    .refine(val => !val.endsWith('_'), "Username cannot end with underscore"),
  bio: z.string()
    .max(200, "Bio must be at most 200 characters")
    .optional(),
});

type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Get current user data
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  const checkUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/users/check-username", { username });
      return response;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ProfileSetupFormData) => {
      return await apiRequest("POST", "/api/profile-setup", data);
    },
    onSuccess: async () => {
      // Invalidate auth query to refresh user state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome to PROFITHACK AI! 🎉",
        description: "Your profile is all set. Let's start creating!",
      });
      
      // Redirect to home
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Profile Setup Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProfileSetupFormData) => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const bioLength = form.watch("bio")?.length || 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-purple-500/30 shadow-lg shadow-purple-500/10">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-display">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Customize Your Profile
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              Make your profile stand out! Choose a unique username and tell the world about yourself.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture Preview */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-slate-700">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-purple-500/30">
                    <AvatarImage src={profileImageUrl || user?.profileImageUrl || ""} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-2xl text-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-background cursor-pointer hover:bg-purple-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Profile picture from your Replit account
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-medium">@</span>
                  <Input
                    id="username"
                    data-testid="input-username"
                    placeholder="yourawesome_username"
                    {...form.register("username")}
                    onBlur={async (e) => {
                      const username = e.target.value.trim();
                      if (username && username.length >= 3) {
                        try {
                          await checkUsernameMutation.mutateAsync(username);
                        } catch (error: any) {
                          form.setError("username", { message: error.message || "Username not available" });
                        }
                      }
                    }}
                    className={cn(
                      "pl-8 bg-gradient-to-r from-purple-500/10 to-cyan-500/10",
                      "border-2 border-purple-400/40 hover:border-purple-400/60",
                      "text-foreground placeholder:text-purple-300/60",
                      "focus:border-purple-400",
                      form.formState.errors.username && "border-destructive"
                    )}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive" data-testid="error-username">
                    {form.formState.errors.username.message}
                  </p>
                )}
                {form.watch("username") && !form.formState.errors.username && form.watch("username").length >= 3 && !checkUsernameMutation.isPending && (
                  <p className="text-sm text-emerald-400 flex items-center gap-1" data-testid="text-username-available">
                    <CheckCircle2 className="w-4 h-4" />
                    Username available!
                  </p>
                )}
                {checkUsernameMutation.isPending && (
                  <p className="text-sm text-muted-foreground" data-testid="text-checking-username">
                    Checking availability...
                  </p>
                )}
                <p className="text-xs text-purple-300">
                  Choose carefully! You can only change this once every 30 days.
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                  Bio (Optional)
                </Label>
                <Textarea
                  id="bio"
                  data-testid="input-bio"
                  placeholder="Tell the world about yourself... What do you create? What are you passionate about?"
                  {...form.register("bio")}
                  rows={4}
                  className={cn(
                    "resize-none bg-gradient-to-r from-pink-500/10 to-purple-500/10",
                    "border-2 border-pink-400/40 hover:border-pink-400/60",
                    "text-foreground placeholder:text-pink-300/60",
                    "focus:border-pink-400",
                    form.formState.errors.bio && "border-destructive"
                  )}
                />
                <div className="flex justify-between items-center">
                  {form.formState.errors.bio && (
                    <p className="text-sm text-destructive" data-testid="error-bio">
                      {form.formState.errors.bio.message}
                    </p>
                  )}
                  <p className={cn(
                    "text-xs ml-auto",
                    bioLength > 200 ? "text-destructive" : "text-muted-foreground"
                  )} data-testid="text-bio-count">
                    {bioLength}/200
                  </p>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  What's Next?
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
                  <li>Explore the feed and discover amazing content</li>
                  <li>Upload your first video and start earning</li>
                  <li>Build your workspace and create AI-powered projects</li>
                  <li>Connect with creators and grow your audience</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  data-testid="button-submit"
                  disabled={!form.formState.isValid || isSubmitting || checkUsernameMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Setting up your profile...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 w-4 h-4" />
                      Complete Setup & Start Creating
                    </>
                  )}
                </Button>
                {!form.watch("username") && (
                  <p className="text-xs text-center text-muted-foreground mt-2" data-testid="text-username-required">
                    Username is required to continue
                  </p>
                )}
              </div>

              {/* Skip for Now */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-skip"
                >
                  Skip for now (you can set this up later)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
