import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreateConversationDialog } from "@/components/CreateConversationDialog";
import { ImportContacts } from "@/components/ImportContacts";
import type { Message, Conversation, User } from "@shared/schema";
import { Send, MessageSquare, Users, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlockButton } from "@/components/BlockButton";

// Optimistic message type
interface OptimisticMessage extends Message {
  isOptimistic?: boolean;
  tempId?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingStateRef = useRef<boolean>(false);
  const [wsReady, setWsReady] = useState(false);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await apiRequest("/api/conversations", "GET");
      return await response.json();
    },
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    queryFn: async () => {
      const response = await apiRequest(`/api/conversations/${selectedConversationId}/messages`, "GET");
      return await response.json();
    },
    enabled: !!selectedConversationId,
  });

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected");
      websocket.send(JSON.stringify({ type: "auth", userId: user.id }));
      setWsReady(true);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle new message
      if (data.type === "new_message") {
        const { conversationId, message, sender } = data;
        
        // Add message to local state immediately
        queryClient.setQueryData<Message[]>(
          ["/api/conversations", conversationId, "messages"],
          (old = []) => {
            // Remove any optimistic message with same content
            const filtered = old.filter(
              (msg) => !(msg as OptimisticMessage).isOptimistic
            );
            return [...filtered, message];
          }
        );

        // Update conversation list's last message
        queryClient.setQueryData<Conversation[]>(
          ["/api/conversations"],
          (old = []) =>
            old.map((conv) =>
              conv.id === conversationId
                ? { ...conv, lastMessage: message.content, lastMessageAt: message.createdAt }
                : conv
            )
        );
      }

      // Handle typing indicator
      if (data.type === "user_typing") {
        const { conversationId, userId, isTyping } = data;
        
        if (conversationId === selectedConversationId) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });
        }
      }

      // Handle read receipts
      if (data.type === "message_read") {
        const { conversationId, userId } = data;
        
        // Update read status in message list
        queryClient.setQueryData<Message[]>(
          ["/api/conversations", conversationId, "messages"],
          (old = []) =>
            old.map((msg) =>
              msg.senderId === user?.id ? { ...msg, isRead: true } : msg
            )
        );
      }

      // Handle errors
      if (data.type === "error") {
        console.error("WebSocket error:", data.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message,
        });
      }

      // Handle auth success
      if (data.type === "auth_success") {
        console.log("WebSocket authenticated, joined conversations:", data.conversationsJoined);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setWsReady(false);
    };

    setWs(websocket);

    return () => {
      setWsReady(false);
      websocket.close();
    };
  }, [user, toast]);

  // Join/Leave conversations when selection changes (with race condition fix)
  useEffect(() => {
    if (!ws || !wsReady) return;
    if (!selectedConversationId) return;

    // Join new conversation
    ws.send(JSON.stringify({
      type: "join_conversation",
      conversationId: selectedConversationId,
    }));

    // Mark messages as read
    ws.send(JSON.stringify({
      type: "mark_read",
      conversationId: selectedConversationId,
    }));

    // Clear typing users when switching conversations
    setTypingUsers(new Set());
    
    // Reset typing state when switching conversations
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    lastTypingStateRef.current = false;

    // Leave conversation on cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "leave_conversation",
          conversationId: selectedConversationId,
        }));
        
        // Stop typing indicator if still active
        if (lastTypingStateRef.current) {
          ws.send(JSON.stringify({
            type: "typing",
            conversationId: selectedConversationId,
            isTyping: false,
          }));
        }
      }
    };
  }, [ws, wsReady, selectedConversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Typing indicator debouncing
  const handleTyping = useCallback(() => {
    if (!ws || !selectedConversationId || ws.readyState !== WebSocket.OPEN) return;

    // Send typing=true if not already sent
    if (!lastTypingStateRef.current) {
      ws.send(JSON.stringify({
        type: "typing",
        conversationId: selectedConversationId,
        isTyping: true,
      }));
      lastTypingStateRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing=false after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN && selectedConversationId) {
        ws.send(JSON.stringify({
          type: "typing",
          conversationId: selectedConversationId,
          isTyping: false,
        }));
        lastTypingStateRef.current = false;
      }
    }, 3000);
  }, [ws, selectedConversationId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId) throw new Error("No conversation selected");
      
      // Add optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: OptimisticMessage = {
        id: tempId,
        conversationId: selectedConversationId,
        senderId: user!.id,
        receiverId: null,
        content,
        messageType: "text",
        mediaUrl: null,
        isRead: false,
        createdAt: new Date(),
        isOptimistic: true,
        tempId,
      };

      // Add to UI immediately
      queryClient.setQueryData<Message[]>(
        ["/api/conversations", selectedConversationId, "messages"],
        (old = []) => [...old, optimisticMessage]
      );

      // Send via REST API for reliability
      const response = await apiRequest(`/api/conversations/${selectedConversationId}/messages`, "POST", {
        content,
        messageType: "text",
      });
      
      return { response, tempId };
    },
    onSuccess: ({ tempId }) => {
      // Remove optimistic message - the real one will come via WebSocket
      queryClient.setQueryData<Message[]>(
        ["/api/conversations", selectedConversationId, "messages"],
        (old = []) => old.filter((msg) => (msg as OptimisticMessage).tempId !== tempId)
      );
      setMessageText("");
      
      // Stop typing indicator
      if (ws && ws.readyState === WebSocket.OPEN && selectedConversationId) {
        ws.send(JSON.stringify({
          type: "typing",
          conversationId: selectedConversationId,
          isTyping: false,
        }));
        lastTypingStateRef.current = false;
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    onError: () => {
      // Remove optimistic message on error
      queryClient.setQueryData<Message[]>(
        ["/api/conversations", selectedConversationId, "messages"],
        (old = []) => old.filter((msg) => !(msg as OptimisticMessage).isOptimistic)
      );
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;
    sendMessageMutation.mutate(messageText);
  };

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    handleTyping();
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Get typing indicator text
  const typingIndicator = typingUsers.size > 0 ? "User is typing..." : "Online";

  return (
    <div className="h-full flex bg-slate-950">
      {/* Conversations List */}
      <div className="w-80 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <div className="flex gap-2">
              <ImportContacts />
              <CreateConversationDialog />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              data-testid="input-search-conversations"
              placeholder="Search..."
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                data-testid={`conversation-${conv.id}`}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`w-full p-4 flex items-center gap-3 hover-elevate transition-colors border-b border-slate-800/50 ${
                  selectedConversationId === conv.id
                    ? "bg-slate-900 border-l-4 border-l-cyan-500"
                    : "hover:bg-slate-900/50"
                }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-purple-600 text-white">
                    {conv.isGroup ? <Users className="w-5 h-5" /> : (conv.name?.[0] || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">{conv.name || "Unnamed"}</p>
                  {conv.isGroup && (
                    <Badge variant="outline" className="text-xs">Group</Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <div className="border-b border-slate-800 p-4 bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-purple-600 text-white">
                      {selectedConversation?.isGroup ? <Users className="w-5 h-5" /> : (selectedConversation?.name?.[0] || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">{selectedConversation?.name || "Unnamed"}</p>
                    <p className="text-xs text-slate-400" data-testid="typing-indicator">
                      {typingIndicator}
                    </p>
                  </div>
                </div>
                {selectedConversation && !selectedConversation.isGroup && (
                  <BlockButton 
                    userId={(selectedConversation as any).members?.find((m: any) => m.id !== user?.id)?.id || ''}
                    variant="outline"
                    size="sm"
                    showText={false}
                  />
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  const isOptimistic = (message as OptimisticMessage).isOptimistic;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                            : "bg-slate-800 text-slate-100"
                        } ${isOptimistic ? "opacity-60" : ""}`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.createdAt && formatTime(message.createdAt)}
                          {isOptimistic && " (Sending...)"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-4 bg-slate-900">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={handleMessageInputChange}
                  placeholder="Type a message..."
                  data-testid="input-message"
                  className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
                <Button
                  type="submit"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-semibold px-6"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Select a conversation</h3>
              <p className="text-slate-400">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
