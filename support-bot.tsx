import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, X, Sparkles, User, HelpCircle, AlertCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to AI bot
  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", "/api/support/chat", {
        message,
        sessionId,
        messages,
      });
    },
    onSuccess: (data: any) => {
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  // Create support ticket
  const createTicketMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/support/escalate", {
        sessionId,
        messages,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Support Ticket Created",
        description: `Ticket #${data.ticket.id.slice(0, 8)} has been created. We'll respond within 24 hours.`,
      });
      setIsOpen(false);
      setMessages([]);
      setSessionId(null);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    sendMutation.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Initial greeting when bot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "🐵 Yo! Mi name Kush, the rasta monkey support bot! 🎨\n\nMi here to help ya with PROFITHACK AI, irie? Just ask me anything bout:\n\n• Getting started (sign up, invites)\n• Credits & subscriptions\n• Features (Reels, Tube, AI Workspace)\n• Creator monetization\n• Payment methods\n• Technical stuff\n\nWhat can Kush do for ya today, mon? 🌴",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        data-testid="button-open-support-bot"
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-pink-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src="/brain-logo.png" alt="Support Bot" />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600">
                <Bot className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Kush 🐵</h3>
            <p className="text-xs text-muted-foreground">Rasta Monkey Support</p>
          </div>
        </div>
        <Button
          data-testid="button-close-support-bot"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {msg.role === "user" && (
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarFallback className="bg-accent">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {sendMutation.isPending && (
            <div className="flex gap-2 items-center text-muted-foreground">
              <Bot className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length > 2 && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <Button
            data-testid="button-escalate-to-human"
            variant="outline"
            size="sm"
            onClick={() => createTicketMutation.mutate()}
            disabled={createTicketMutation.isPending}
            className="w-full"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {createTicketMutation.isPending ? "Creating ticket..." : "Talk to a human"}
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            data-testid="input-chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sendMutation.isPending}
            className="flex-1"
          />
          <Button
            data-testid="button-send-message"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by AI • Press Enter to send
        </p>
      </div>
    </Card>
  );
}
