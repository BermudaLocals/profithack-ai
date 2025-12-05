/**
 * PROFITHACK AI - Live AI Creator Chat
 * Interactive conversation with AI influencers using their personalities
 */

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Heart,
  DollarSign,
  Video,
  Camera,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CreatorChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: {
    id: string;
    name: string;
    handle: string;
    bio: string;
    avatarUrl?: string;
    businessProfile: {
      currentMonthlyRevenue: number;
      subscriberCount: number;
    };
  };
}

export function CreatorChatModal({
  open,
  onOpenChange,
  creator,
}: CreatorChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey there! 💋 It's ${creator.name}. I'm so excited to chat with you! What brings you here today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest(`/api/onlyfans/creators/${creator.id}/chat`, {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    // Get AI response
    chatMutation.mutate(userMessage);
  };

  const quickActions = [
    { icon: Heart, label: "Send Tip", action: () => alert("Tip feature coming soon!") },
    { icon: Video, label: "Request Custom", action: () => alert("Custom content coming soon!") },
    { icon: Camera, label: "Private Show", action: () => alert("Private show coming soon!") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-black/95 backdrop-blur-lg border-pink-500/30 p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-pink-500/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-pink-500">
                <AvatarImage src={creator.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                  {creator.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
            </div>

            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-white">
                {creator.name}
              </DialogTitle>
              <p className="text-xs text-gray-400">{creator.handle}</p>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Live
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-400">
                Online
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4 py-2">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {msg.role === "assistant" && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={creator.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">
                      {creator.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={creator.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">
                    {creator.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-gray-800">
          <div className="flex items-center gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 hover:text-white transition-all hover-elevate active-elevate-2"
                  data-testid={`action-${action.label.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-pink-500/30">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Message ${creator.name}...`}
              className="flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              disabled={chatMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              data-testid="button-send-message"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            AI-powered conversation • Responses may take a few seconds
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
