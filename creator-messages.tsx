import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { 
  Send, Image as ImageIcon, Smile, Paperclip, Phone, Video, 
  MoreVertical, ArrowLeft, Check, CheckCheck, Gift, Crown,
  Sparkles, Lock, Star
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientVerified?: boolean;
  recipientVIP?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'gift' | 'tip' | 'ppv';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    imageUrl?: string;
    giftName?: string;
    giftEmoji?: string;
    tipAmount?: number;
    ppvPrice?: number;
    ppvUnlocked?: boolean;
  };
}

interface VirtualGift {
  id: string;
  name: string;
  icon: string;
  price: number;
}

const VIRTUAL_GIFTS: VirtualGift[] = [
  { id: "heart", name: "Heart", icon: "❤️", price: 1 },
  { id: "rose", name: "Rose", icon: "🌹", price: 5 },
  { id: "fire", name: "Fire", icon: "🔥", price: 10 },
  { id: "diamond", name: "Diamond", icon: "💎", price: 50 },
  { id: "crown", name: "Crown", icon: "👑", price: 500 },
];

export default function CreatorMessages() {
  const { recipientId } = useParams<{ recipientId?: string }>();
  const [messageText, setMessageText] = useState("");
  const [showGifts, setShowGifts] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !recipientId,
  });

  const { data: recipient } = useQuery<{ id: string; username: string; avatar?: string; isVIP?: boolean; isVerified?: boolean }>({
    queryKey: ['/api/users', recipientId],
    enabled: !!recipientId,
  });

  const { data: messages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages', recipientId],
    enabled: !!recipientId,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { recipientId: string; content: string; type: string }) => 
      apiRequest('/api/messages/send', "POST", data),
    onSuccess: () => {
      refetchMessages();
      setMessageText("");
    },
  });

  const sendGiftMutation = useMutation({
    mutationFn: (data: { recipientId: string; giftId: string }) => 
      apiRequest('/api/messages/gift', "POST", data),
    onSuccess: (_, variables) => {
      const gift = VIRTUAL_GIFTS.find(g => g.id === variables.giftId);
      toast({ title: `${gift?.icon} Gift Sent!` });
      refetchMessages();
      setShowGifts(false);
    },
  });

  const sendTipMutation = useMutation({
    mutationFn: (data: { recipientId: string; amount: number }) => 
      apiRequest('/api/messages/tip', "POST", data),
    onSuccess: () => {
      toast({ title: "Tip Sent!", description: "Thank you for your support!" });
      refetchMessages();
      setShowTip(false);
      setTipAmount("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !recipientId) return;
    sendMessageMutation.mutate({
      recipientId,
      content: messageText,
      type: 'text'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  if (!recipientId) {
    return (
      <div className="min-h-screen bg-black" data-testid="messages-list">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
        </div>
        
        <div className="divide-y divide-white/5">
          {conversations?.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start a conversation with a creator!</p>
            </div>
          ) : (
            conversations?.map((conv) => (
              <motion.div
                key={conv.id}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className="p-4 flex items-center gap-3 cursor-pointer"
                onClick={() => window.location.href = `/messages/${conv.recipientId}`}
                data-testid={`conversation-${conv.id}`}
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={conv.recipientAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                      {conv.recipientName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{conv.recipientName}</span>
                    {conv.recipientVerified && (
                      <Badge className="bg-blue-500 text-white text-xs px-1">✓</Badge>
                    )}
                    {conv.recipientVIP && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate">{conv.lastMessage}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">{formatTime(conv.lastMessageTime)}</p>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-pink-500 text-white mt-1">{conv.unreadCount}</Badge>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black" data-testid="messages-chat">
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white"
          onClick={() => window.location.href = '/messages'}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={recipient?.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600">
            {recipient?.username?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{recipient?.username || 'Unknown'}</span>
            {recipient?.isVerified && (
              <Badge className="bg-blue-500 text-white text-xs px-1">✓</Badge>
            )}
            {recipient?.isVIP && (
              <Crown className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <p className="text-green-400 text-xs">Online</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-white">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('https://res.cloudinary.com/dmhcnhtng/image/upload/v1677358270/Untitled-1_copy_rpx8yb.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <AnimatePresence>
          {messages?.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                msg.senderId === recipientId ? "justify-start" : "justify-end"
              )}
            >
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                msg.senderId === recipientId 
                  ? "bg-white/10 text-white rounded-bl-sm" 
                  : "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-sm"
              )}>
                {msg.type === 'text' && (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                
                {msg.type === 'image' && msg.metadata?.imageUrl && (
                  <img 
                    src={msg.metadata.imageUrl} 
                    alt="Shared" 
                    className="max-w-full rounded-lg"
                  />
                )}
                
                {msg.type === 'gift' && (
                  <div className="text-center py-2">
                    <span className="text-4xl">{msg.metadata?.giftEmoji}</span>
                    <p className="text-xs mt-1">{msg.metadata?.giftName}</p>
                  </div>
                )}
                
                {msg.type === 'tip' && (
                  <div className="flex items-center gap-2 py-1">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold">{msg.metadata?.tipAmount} credits tip!</span>
                  </div>
                )}
                
                {msg.type === 'ppv' && (
                  <div className="relative">
                    {msg.metadata?.ppvUnlocked ? (
                      <img src={msg.metadata.imageUrl} alt="PPV" className="rounded-lg" />
                    ) : (
                      <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Unlock for {msg.metadata?.ppvPrice} credits</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] opacity-60">{formatTime(msg.timestamp)}</span>
                  {msg.senderId !== recipientId && (
                    msg.status === 'read' 
                      ? <CheckCheck className="w-3 h-3 text-blue-400" />
                      : msg.status === 'delivered'
                        ? <CheckCheck className="w-3 h-3 opacity-60" />
                        : <Check className="w-3 h-3 opacity-60" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setShowGifts(true)}
            data-testid="button-gift"
          >
            <Gift className="w-5 h-5 text-pink-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setShowTip(true)}
            data-testid="button-tip"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border-white/10 text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            data-testid="input-message"
          />
          <Button
            size="icon"
            className="bg-pink-500 hover:bg-pink-600"
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Dialog open={showGifts} onOpenChange={setShowGifts}>
        <DialogContent className="bg-black/95 border-pink-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Send a Gift</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2 p-4">
            {VIRTUAL_GIFTS.map((gift) => (
              <motion.button
                key={gift.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center p-2 rounded-lg bg-white/5 hover:bg-white/10"
                onClick={() => recipientId && sendGiftMutation.mutate({ recipientId, giftId: gift.id })}
                data-testid={`gift-${gift.id}`}
              >
                <span className="text-2xl">{gift.icon}</span>
                <span className="text-pink-400 text-xs">{gift.price}</span>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTip} onOpenChange={setShowTip}>
        <DialogContent className="bg-black/95 border-pink-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Send a Tip</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[10, 50, 100, 250, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant={tipAmount === String(amount) ? "default" : "outline"}
                  className={tipAmount === String(amount) ? "bg-pink-500" : "border-white/10 text-white"}
                  onClick={() => setTipAmount(String(amount))}
                >
                  {amount}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="Custom amount"
              className="bg-white/5 border-white/10 text-white"
              data-testid="input-tip-amount"
            />
            <Button
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500"
              disabled={!tipAmount || sendTipMutation.isPending}
              onClick={() => recipientId && sendTipMutation.mutate({ recipientId, amount: parseInt(tipAmount) })}
              data-testid="button-send-tip"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Send {tipAmount || 0} Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
