# PROFITHACK AI - Complete Implementation Guide

**Platform Age Requirement: 18+ ONLY**  
**No Refunds Policy: Digital product - full service until cancellation/credits run out**  
**Payout Policy: Weekly payouts with 14-day hold (paying earnings from 2 weeks prior)**  
**Battle Mode: UNLIMITED participants**

---

## 🎯 CRITICAL FRONTEND PAGES NEEDED

### **Priority 1: Core User Experience (Week 1)**

#### 1. **Home/Dashboard Page** (`client/src/pages/home.tsx`)
**Purpose:** Main landing after login with navigation to all features

**Code Pattern:**
```tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, Video, MessageSquare, DollarSign } from "lucide-react";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
        Welcome, {user?.username || "Creator"}
      </h1>
      <p className="text-muted-foreground mb-8">Your digital empire starts here</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate" data-testid="card-for-you">
          <CardHeader>
            <Sparkles className="w-8 h-8 text-primary mb-2" />
            <CardTitle>For You</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover trending content
            </p>
            <Button asChild className="w-full" data-testid="button-for-you">
              <Link href="/for-you">Explore</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-vids">
          <CardHeader>
            <Video className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Vids</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Short-form videos
            </p>
            <Button asChild className="w-full" data-testid="button-vids">
              <Link href="/vids">Watch</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-dms">
          <CardHeader>
            <MessageSquare className="w-8 h-8 text-primary mb-2" />
            <CardTitle>DMs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Message creators
            </p>
            <Button asChild className="w-full" data-testid="button-dms">
              <Link href="/dms">Chat</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-wallet">
          <CardHeader>
            <DollarSign className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {user?.credits || 0} credits
            </p>
            <Button asChild className="w-full" data-testid="button-wallet">
              <Link href="/wallet">Manage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Backend API Needed:**
```typescript
// Already exists in server/routes.ts
app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
  // Returns user data including credits
});
```

---

#### 2. **For You Feed** (`client/src/pages/for-you.tsx`)
**Purpose:** TikTok-style video feed with recommendations

**Code Pattern:**
```tsx
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Gift } from "lucide-react";

export default function ForYouFeed() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["/api/videos/feed"],
  });

  if (isLoading) {
    return <div className="text-center p-8">Loading feed...</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold p-4">For You</h1>
      
      <div className="space-y-4">
        {videos?.map((video: any) => (
          <Card key={video.id} className="overflow-hidden" data-testid={`card-video-${video.id}`}>
            {/* Video Player - use HTML5 video for now */}
            <div className="aspect-[9/16] bg-black relative">
              <video 
                src={video.videoUrl}
                className="w-full h-full object-cover"
                controls
                data-testid={`video-player-${video.id}`}
              />
            </div>

            {/* Video Info */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar data-testid={`avatar-${video.userId}`}>
                  <AvatarImage src={video.user?.avatarUrl} />
                  <AvatarFallback>{video.user?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{video.user?.username}</p>
                  <p className="text-sm text-muted-foreground">{video.views} views</p>
                </div>
              </div>

              <p className="mb-4">{video.caption}</p>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" data-testid={`button-like-${video.id}`}>
                  <Heart className="w-4 h-4 mr-1" />
                  {video.likes}
                </Button>
                <Button variant="ghost" size="sm" data-testid={`button-comment-${video.id}`}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {video.comments}
                </Button>
                <Button variant="ghost" size="sm" data-testid={`button-share-${video.id}`}>
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="default" size="sm" data-testid={`button-gift-${video.id}`}>
                  <Gift className="w-4 h-4 mr-1" />
                  Send Spark
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Backend API Needed:**
```typescript
// Add to server/routes.ts
app.get("/api/videos/feed", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get personalized feed (for now, just recent videos)
    const videos = await storage.getVideoFeed(userId, 20);
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});

// Add to server/storage.ts - IStorage interface
getVideoFeed(userId: string, limit: number): Promise<Video[]>;

// Implementation in PgStorage class
async getVideoFeed(userId: string, limit: number = 20): Promise<Video[]> {
  const feedVideos = await db
    .select({
      id: videos.id,
      userId: videos.userId,
      videoUrl: videos.videoUrl,
      thumbnailUrl: videos.thumbnailUrl,
      caption: videos.caption,
      views: videos.views,
      likes: videos.likes,
      comments: sql<number>`(SELECT COUNT(*) FROM comments WHERE video_id = ${videos.id})`,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      }
    })
    .from(videos)
    .leftJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.moderationStatus, "approved"))
    .orderBy(desc(videos.createdAt))
    .limit(limit);

  return feedVideos;
}
```

---

#### 3. **Wallet Page** (`client/src/pages/wallet.tsx`)
**Purpose:** View credits, earnings, purchase credits, request payouts

**Code Pattern:**
```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, CreditCard, Wallet as WalletIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Wallet() {
  const { toast } = useToast();
  const [purchaseAmount, setPurchaseAmount] = useState("");

  const { data: wallet } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/wallet/transactions"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (credits: number) => {
      return apiRequest("/api/wallet/purchase", {
        method: "POST",
        body: JSON.stringify({ credits }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({ title: "Credits purchased successfully!" });
      setPurchaseAmount("");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/wallet/withdraw", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({ 
        title: "Withdrawal requested", 
        description: "Your payout will be processed in 2 weeks (14-day hold period)" 
      });
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Wallet</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card data-testid="card-credits">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5" />
              Available Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="text-credits">
              {wallet?.credits || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ ${((wallet?.credits || 0) * 0.024).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-earnings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="text-earnings">
              {wallet?.totalEarnings || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ ${((wallet?.totalEarnings || 0) * 0.024).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pending Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="text-pending">
              {wallet?.pendingPayout || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Available in 14 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Credits */}
      <Card className="mb-8" data-testid="card-purchase">
        <CardHeader>
          <CardTitle>Purchase Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Number of credits"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              data-testid="input-purchase-amount"
            />
            <Button
              onClick={() => purchaseMutation.mutate(parseInt(purchaseAmount))}
              disabled={!purchaseAmount || purchaseMutation.isPending}
              data-testid="button-purchase"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Buy Credits
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            1 credit = $0.024 USD (41 credits = $1)
          </p>
        </CardContent>
      </Card>

      {/* Withdraw Button */}
      <Card className="mb-8" data-testid="card-withdraw">
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Weekly payouts with 14-day hold. Earnings from 2 weeks ago are paid out now.
            <br />
            <strong>NO REFUNDS</strong> - Digital product policy.
          </p>
          <Button
            onClick={() => withdrawMutation.mutate()}
            disabled={!wallet?.pendingPayout || withdrawMutation.isPending}
            data-testid="button-withdraw"
          >
            Request Withdrawal
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card data-testid="card-transactions">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions?.map((tx: any) => (
              <div 
                key={tx.id} 
                className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                data-testid={`transaction-${tx.id}`}
              >
                <div>
                  <p className="font-medium">{tx.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Backend APIs Needed:**
```typescript
// Add to server/routes.ts

app.get("/api/wallet", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const wallet = await storage.getUserWallet(userId);
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wallet" });
  }
});

app.get("/api/wallet/transactions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const transactions = await storage.getUserTransactions(userId, 50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

app.post("/api/wallet/purchase", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { credits } = req.body;
    
    // Create payment intent (integrate with PayPal/Crypto/etc)
    const transaction = await storage.purchaseCredits(userId, credits);
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Failed to purchase credits" });
  }
});

app.post("/api/wallet/withdraw", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Create withdrawal request with 14-day hold
    const withdrawal = await storage.requestWithdrawal(userId);
    
    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: "Failed to request withdrawal" });
  }
});
```

---

### **Priority 2: Content Creation (Week 2)**

#### 4. **Video Upload Page** (`client/src/pages/upload-video.tsx`)
**Purpose:** Upload short-form videos (Vids) or long-form (Tube)

**Code Pattern:**
```tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function UploadVideo() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [videoType, setVideoType] = useState<"short" | "long">("short");
  const [ageRating, setAgeRating] = useState<"u16" | "16plus" | "18plus">("18plus");

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("/api/videos/upload", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({ title: "Video uploaded successfully!" });
      setLocation("/vids");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({ variant: "destructive", title: "Please select a video file" });
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("caption", caption);
    formData.append("videoType", videoType);
    formData.append("ageRating", ageRating);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Upload Video</h1>

      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Video File (18+ content allowed)
              </label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                data-testid="input-video-file"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your video..."
                data-testid="input-caption"
              />
            </div>

            {/* Video Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select value={videoType} onValueChange={(v: any) => setVideoType(v)}>
                <SelectTrigger data-testid="select-video-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Vids (Short-form 9:16)</SelectItem>
                  <SelectItem value="long">Tube (Long-form)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Age Rating</label>
              <Select value={ageRating} onValueChange={(v: any) => setAgeRating(v)}>
                <SelectTrigger data-testid="select-age-rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="u16">Under 16</SelectItem>
                  <SelectItem value="16plus">16+</SelectItem>
                  <SelectItem value="18plus">18+ Adult Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={uploadMutation.isPending}
              data-testid="button-upload"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload Video"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        <strong>Platform is 18+ only.</strong> No refunds policy applies to all content.
      </p>
    </div>
  );
}
```

**Backend API Needed:**
```typescript
// Add to server/routes.ts
import multer from "multer";

const upload = multer({ dest: "uploads/" });

app.post("/api/videos/upload", isAuthenticated, upload.single("video"), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { caption, videoType, ageRating } = req.body;
    const videoFile = req.file;

    // Upload to object storage
    const videoUrl = await uploadToObjectStorage(videoFile);

    // Create video record
    const video = await storage.createVideo({
      userId,
      videoUrl,
      caption,
      videoType,
      ageRating,
      moderationStatus: "pending",
    });

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Failed to upload video" });
  }
});
```

---

### **Priority 3: Messaging & Social (Week 3)**

#### 5. **DMs/Messaging Page** (`client/src/pages/dms.tsx`)
**Purpose:** WhatsApp-style real-time messaging

**Code Pattern:**
```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Video, Phone } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function DMs() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversations list
  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  // Get messages for selected conversation
  const { data: messages } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest(`/api/conversations/${selectedConversation}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: text, messageType: "text" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation, "messages"] 
      });
      setMessageText("");
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:5000/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="h-screen flex">
      {/* Conversations List */}
      <div className="w-80 border-r">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold">Messages</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations?.map((conv: any) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`p-4 border-b cursor-pointer hover-elevate ${
                selectedConversation === conv.id ? 'bg-muted' : ''
              }`}
              data-testid={`conversation-${conv.id}`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={conv.participant?.avatarUrl} />
                  <AvatarFallback>{conv.participant?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{conv.participant?.username}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage?.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={conversations?.find((c: any) => c.id === selectedConversation)?.participant?.avatarUrl} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <p className="font-semibold">
                  {conversations?.find((c: any) => c.id === selectedConversation)?.participant?.username}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" data-testid="button-video-call">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-voice-call">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div className={`max-w-md p-3 rounded-lg ${
                    msg.isSent ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (messageText.trim()) {
                    sendMessageMutation.mutate(messageText);
                  }
                }}
                className="flex gap-2"
              >
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  data-testid="input-message"
                />
                <Button type="submit" data-testid="button-send">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 REQUIRED BACKEND IMPLEMENTATIONS

### **1. Video Management APIs**
Add to `server/storage.ts`:

```typescript
// Interface additions
interface IStorage {
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideoFeed(userId: string, limit: number): Promise<Video[]>;
  getUserVideos(userId: string): Promise<Video[]>;
  updateVideoViews(videoId: string): Promise<void>;
  likeVideo(videoId: string, userId: string): Promise<void>;
  
  // Wallet operations
  getUserWallet(userId: string): Promise<Wallet>;
  getUserTransactions(userId: string, limit: number): Promise<Transaction[]>;
  purchaseCredits(userId: string, credits: number): Promise<Transaction>;
  requestWithdrawal(userId: string): Promise<Withdrawal>;
  processWeeklyPayouts(): Promise<void>; // Cron job for 14-day hold payouts
}
```

### **2. Object Storage Integration**
```typescript
// server/object-storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.PUBLIC_OBJECT_SEARCH_PATHS,
});

export async function uploadToObjectStorage(file: Express.Multer.File): Promise<string> {
  const key = `videos/${Date.now()}-${file.originalname}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  return `https://your-storage-url.com/${key}`;
}
```

### **3. WebSocket Server for Real-time Messaging**
```typescript
// server/websocket.ts
import { WebSocketServer } from "ws";

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    console.log("WebSocket client connected");

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      
      // Broadcast to relevant users
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    });
  });

  return wss;
}
```

---

## 📋 COMPLETE IMPLEMENTATION CHECKLIST

### **Week 1: Foundation**
- [ ] Home/Dashboard page
- [ ] Wallet page with purchase/withdrawal
- [ ] For You feed (basic video list)
- [ ] Video upload functionality
- [ ] Object storage integration
- [ ] Payment provider integration (PayPal/Crypto)

### **Week 2: Content & Social**
- [ ] DMs/Messaging page
- [ ] WebSocket real-time messaging
- [ ] Video playback improvements
- [ ] Spark/gift sending system
- [ ] User profiles
- [ ] Follow/unfollow system

### **Week 3: Monetization**
- [ ] Live streaming interface (Twilio Video)
- [ ] Battle mode UI (unlimited participants)
- [ ] Premium subscriptions page
- [ ] Age verification system
- [ ] Payout dashboard with 14-day hold display
- [ ] Weekly payout cron job

### **Week 4: Advanced Features**
- [ ] AI Lab workspace (Monaco editor)
- [ ] Content moderation dashboard
- [ ] Analytics/Stats page
- [ ] Plugin marketplace
- [ ] Premium username marketplace
- [ ] Mobile responsiveness

---

## 🎨 CODE STYLE REQUIREMENTS

**1. Always use Shadcn UI components:**
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

**2. Always use TanStack Query for data fetching:**
```tsx
const { data, isLoading } = useQuery({ queryKey: ["/api/endpoint"] });
```

**3. Always use data-testid attributes:**
```tsx
<Button data-testid="button-submit">Submit</Button>
```

**4. Always use Wouter for routing:**
```tsx
import { Link, useLocation } from "wouter";
```

**5. Always validate with Zod schemas:**
```tsx
import { insertVideoSchema } from "@shared/schema";
```

**6. Neon-dark theme with primary colors:**
```tsx
className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500"
```

---

## ⚠️ CRITICAL LEGAL/POLICY REMINDERS

1. **18+ Only** - Always display age requirement
2. **No Refunds** - State clearly in all subscription flows
3. **14-Day Hold** - Display in wallet/payout sections
4. **Battle Mode: Unlimited** - No participant cap
5. **Digital Product** - No refunds for credits/subscriptions

---

**Ready to start building! Use this guide as your roadmap.**
