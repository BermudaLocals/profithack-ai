import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Users, Languages } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/users", user?.id],
    enabled: !!user?.id,
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (isPrivate: boolean) => {
      return apiRequest("PATCH", `/api/users/${user?.id}/privacy`, { isPrivate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Privacy settings updated",
        description: "Your account privacy has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: async (preferredLanguage: string) => {
      return apiRequest("PATCH", `/api/users/${user?.id}/language`, { preferredLanguage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Language preference updated",
        description: "Content will now be translated to your preferred language.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update language preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: supportedLanguages } = useQuery({
    queryKey: ["/api/translate/languages"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Privacy & Security</CardTitle>
          </div>
          <CardDescription>
            Control who can see your content and interact with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-start gap-3 flex-1">
              <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor="private-account" className="text-base font-medium">
                  Private Account
                </Label>
                <p className="text-sm text-muted-foreground">
                  When your account is private, only approved followers can see your posts, videos, and stories.
                  New followers must send a request that you can accept or decline.
                </p>
              </div>
            </div>
            <Switch
              id="private-account"
              data-testid="switch-private-account"
              checked={(userData as any)?.isPrivate || false}
              onCheckedChange={(checked) => updatePrivacyMutation.mutate(checked)}
              disabled={updatePrivacyMutation.isPending}
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-base font-medium">How Private Accounts Work</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Only approved followers can view your content</li>
                  <li>Your profile picture and bio remain visible to everyone</li>
                  <li>People must request to follow you (you can approve/decline)</li>
                  <li>Your videos won't appear in public feeds or search results</li>
                  <li>You can still follow others and comment on public content</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            <CardTitle>Language Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose your preferred language for automatic content translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="preferred-language" className="text-base font-medium">
              Preferred Language
            </Label>
            <Select
              value={(userData as any)?.preferredLanguage || "en"}
              onValueChange={(value) => updateLanguageMutation.mutate(value)}
              disabled={updateLanguageMutation.isPending}
            >
              <SelectTrigger id="preferred-language" data-testid="select-preferred-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages?.languages && Object.entries(supportedLanguages.languages).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Content in other languages will be automatically translated to your preferred language.
              You can always toggle back to see the original text.
            </p>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-start gap-3">
              <Languages className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-base font-medium">How Translation Works</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Content is automatically translated to your preferred language</li>
                  <li>High-quality AI translation powered by DeepL and Google</li>
                  <li>Video captions can be translated in real-time (coming soon)</li>
                  <li>Click "See Original" to view content in its original language</li>
                  <li>Translations are cached for faster loading</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Cards Can Be Added Here */}
    </div>
  );
}
