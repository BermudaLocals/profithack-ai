import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, Send, Sparkles, Crown, Zap, Image, Code, FileText, Mic, Plus, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AI_CAPABILITIES = [
  { icon: Code, label: "Code", description: "Write & debug code" },
  { icon: Image, label: "Image", description: "Generate images" },
  { icon: FileText, label: "Write", description: "Create content" },
  { icon: Zap, label: "Analyze", description: "Data analysis" },
];

const QUICK_PROMPTS = [
  "Write a viral TikTok script",
  "Create a marketing strategy",
  "Generate content ideas",
  "Write a catchy bio",
  "Analyze my engagement",
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("/api/ai/chat", "POST", { message });
      return response;
    },
    onSuccess: (data: any) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || "I'm here to help! What would you like to create today?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: () => {
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm your AI assistant powered by advanced language models. I can help you with:\n\n• Writing viral content and scripts\n• Generating marketing strategies\n• Creating engaging captions\n• Analyzing trends and data\n• Coding and technical help\n\nWhat would you like to work on?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    chatMutation.mutate(input.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-screen bg-black" data-testid="ai-chat">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold">AI Assistant</h1>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-400 text-xs">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Pro
          </Badge>
          <Button size="icon" variant="ghost" className="text-gray-400">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Productivity Hub</h2>
              <p className="text-gray-400 mb-6 max-w-sm">
                Your personal AI assistant for content creation, coding, and growth strategies
              </p>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {AI_CAPABILITIES.map((cap) => (
                  <Card
                    key={cap.label}
                    className="p-3 bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <cap.icon className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <p className="text-white text-xs font-medium">{cap.label}</p>
                  </Card>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-gray-300 border-gray-700 hover:bg-white/10"
                    onClick={() => handleQuickPrompt(prompt)}
                    data-testid={`quick-prompt-${prompt.substring(0, 10)}`}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8">
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-white/10 text-white"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-700 text-white text-xs">You</AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </Avatar>
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-black/80 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <Button size="icon" variant="ghost" className="text-gray-400 shrink-0">
            <Plus className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="min-h-[44px] max-h-[120px] resize-none bg-white/10 border-white/20 text-white placeholder:text-gray-500 pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              data-testid="input-message"
            />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shrink-0"
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-2">
          AI may produce inaccurate information
        </p>
      </div>
    </div>
  );
}
