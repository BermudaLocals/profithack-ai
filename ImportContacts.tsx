import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Check,
  Loader2,
} from "lucide-react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiTiktok, 
  SiLinkedin, 
  SiSnapchat, 
  SiDiscord, 
  SiTelegram 
} from "react-icons/si";

type Platform = {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  comingSoon?: boolean;
};

const platforms: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: SiInstagram,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    description: "Import Instagram followers",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "bg-black",
    description: "Import TikTok followers",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: SiX,
    color: "bg-black",
    description: "Import Twitter followers",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "bg-blue-600",
    description: "Import Facebook friends",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "bg-blue-700",
    description: "Import LinkedIn connections",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: SiSnapchat,
    color: "bg-yellow-400",
    description: "Import Snapchat friends",
    comingSoon: true,
  },
  {
    id: "discord",
    name: "Discord",
    icon: SiDiscord,
    color: "bg-indigo-600",
    description: "Import Discord friends",
    comingSoon: true,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: SiTelegram,
    color: "bg-cyan-500",
    description: "Import Telegram contacts",
    comingSoon: true,
  },
];

export function ImportContacts() {
  const [isOpen, setIsOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const { toast } = useToast();

  const handleConnect = async (platform: Platform) => {
    if (platform.comingSoon) {
      toast({
        title: "Coming Soon!",
        description: `${platform.name} integration is coming soon.`,
      });
      return;
    }

    setConnecting(platform.id);

    try {
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        `/api/social/connect/${platform.id}`,
        `Connect ${platform.name}`,
        `width=${width},height=${height},left=${left},top=${top},popup=yes`
      );

      // Listen for OAuth callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === "social-connect-success") {
          setConnected((prev) => [...prev, platform.id]);
          popup?.close();
          
          toast({
            title: "Connected!",
            description: `Successfully connected ${platform.name}. Importing contacts...`,
          });

          // Trigger contact import
          fetch(`/api/social/import-contacts/${platform.id}`, {
            method: "POST",
          }).then((res) => {
            if (res.ok) {
              toast({
                title: "Contacts Imported!",
                description: `Your ${platform.name} contacts have been imported.`,
              });
            }
          });

          setConnecting(null);
        } else if (event.data.type === "social-connect-error") {
          popup?.close();
          toast({
            variant: "destructive",
            title: "Connection Failed",
            description: event.data.error || "Failed to connect. Please try again.",
          });
          setConnecting(null);
        }
      };

      window.addEventListener("message", handleMessage);

      // Check if popup was closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          setConnecting(null);
        }
      }, 1000);

    } catch (error) {
      console.error("Connection error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect. Please try again.",
      });
      setConnecting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600" data-testid="button-import-contacts">
          <Users className="w-4 h-4 mr-2" />
          Import Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Import Contacts from Social Media</DialogTitle>
          <CardDescription>
            Connect your social accounts to find friends who are already on PROFITHACK AI
          </CardDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isConnected = connected.includes(platform.id);
            const isConnecting = connecting === platform.id;

            return (
              <Card
                key={platform.id}
                className={`hover-elevate cursor-pointer ${isConnected ? "border-green-500" : ""}`}
                onClick={() => !isConnecting && handleConnect(platform)}
                data-testid={`card-platform-${platform.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${platform.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{platform.name}</h3>
                        {platform.comingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Soon
                          </Badge>
                        )}
                        {isConnected && (
                          <Badge className="bg-green-500 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {platform.description}
                      </p>
                    </div>
                    {isConnecting && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Privacy:</strong> We only access your public friends/followers list. We never post on your behalf or access private messages.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
