# GDPR Compliance Implementation Guide
## Delete My Account & Export My Data Features

This document contains all code snippets needed to implement GDPR-compliant account deletion and data export features for PROFITHACK AI.

---

## PART 1: BACKEND STORAGE METHODS

### 1.1 Add to `server/storage.ts` - IStorage Interface

Add these method signatures to the `IStorage` interface (around line 30):

```typescript
// GDPR Compliance - Data Export & Account Deletion
exportUserData(userId: string): Promise<any>;
deleteUserAccount(userId: string): Promise<void>;
```

### 1.2 Add to `server/storage.ts` - PostgresStorage Class

Add these methods to the `PostgresStorage` class implementation (around line 500+):

```typescript
/**
 * GDPR: Export all user data in JSON format
 * Includes: profile, videos, projects, messages, transactions, subscriptions, etc.
 */
async exportUserData(userId: string): Promise<any> {
  const user = await this.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Gather all user data from all tables
  const [
    videos,
    projects,
    conversations,
    messages,
    sparksGiven,
    sparksReceived,
    transactions,
    subscriptions,
    follows,
    followers,
    inviteCodes,
    userInvites,
    creatorProfile,
    aiInfluencers,
    marketingBots,
    campaigns,
    socialConnections,
    userLegalAgreements,
  ] = await Promise.all([
    // Videos created by user
    db.select().from(videos).where(eq(videos.userId, userId)),
    
    // Projects created by user
    db.select().from(projects).where(eq(projects.userId, userId)),
    
    // Conversations
    db.query.conversations.findMany({
      where: or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      ),
    }),
    
    // Messages sent
    db.select().from(messages).where(eq(messages.senderId, userId)),
    
    // Sparks (gifts) given
    db.select().from(sparks).where(eq(sparks.senderId, userId)),
    
    // Sparks (gifts) received
    db.select().from(sparks).where(eq(sparks.recipientId, userId)),
    
    // Transactions
    db.select().from(transactions).where(eq(transactions.userId, userId)),
    
    // Subscriptions
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
    
    // Following
    db.select().from(follows).where(eq(follows.followerId, userId)),
    
    // Followers
    db.select().from(follows).where(eq(follows.followingId, userId)),
    
    // Invite codes created
    db.select().from(inviteCodes).where(eq(inviteCodes.creatorId, userId)),
    
    // Invites sent/received
    db.query.userInvites.findMany({
      where: or(
        eq(userInvites.inviterId, userId),
        eq(userInvites.inviteeId, userId)
      ),
    }),
    
    // Creator profile
    db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, userId),
    }),
    
    // AI Influencers created
    db.select().from(aiInfluencers).where(eq(aiInfluencers.creatorId, userId)),
    
    // Marketing bots
    db.select().from(marketingBots).where(eq(marketingBots.userId, userId)),
    
    // Marketing campaigns
    db.select().from(marketingCampaigns).where(eq(marketingCampaigns.userId, userId)),
    
    // Social media connections
    db.select().from(socialConnections).where(eq(socialConnections.userId, userId)),
    
    // Legal agreements
    db.select().from(userLegalAgreements).where(eq(userLegalAgreements.userId, userId)),
  ]);

  // Calculate total earnings
  const totalEarnings = sparksReceived.reduce(
    (sum, spark) => sum + (spark.creditValue || 0),
    0
  );

  // Calculate total spent
  const totalSpent = transactions.reduce(
    (sum, tx) => sum + (tx.amount ? parseFloat(tx.amount) : 0),
    0
  );

  // Compile complete data export
  return {
    exportMetadata: {
      exportDate: new Date().toISOString(),
      userId: user.id,
      dataFormat: "JSON",
      gdprCompliant: true,
      version: "1.0",
    },
    profile: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      website: user.website,
      links: user.links,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      profileImageUrl: user.profileImageUrl,
      subscriptionTier: user.subscriptionTier,
      credits: user.credits,
      walletBalance: user.walletBalance,
      ageVerified: user.ageVerified,
      ageRating: user.ageRating,
      isFounder: user.isFounder,
      isAdmin: user.isAdmin,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      isPrivate: user.isPrivate,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    statistics: {
      totalVideos: videos.length,
      totalProjects: projects.length,
      totalFollowers: followers.length,
      totalFollowing: follows.length,
      totalSparksGiven: sparksGiven.length,
      totalSparksReceived: sparksReceived.length,
      totalEarnings: totalEarnings,
      totalSpent: totalSpent,
      totalInvitesSent: userInvites.filter(inv => inv.inviterId === userId).length,
    },
    content: {
      videos: videos.map(v => ({
        id: v.id,
        title: v.title,
        description: v.description,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl,
        views: v.views,
        likes: v.likes,
        videoType: v.videoType,
        ageRating: v.ageRating,
        createdAt: v.createdAt,
      })),
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        language: p.language,
        files: p.files,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    },
    social: {
      following: follows.map(f => ({
        userId: f.followingId,
        followedAt: f.createdAt,
      })),
      followers: followers.map(f => ({
        userId: f.followerId,
        followedAt: f.createdAt,
      })),
      conversations: conversations.length,
      messagesSent: messages.length,
    },
    financial: {
      walletBalance: user.walletBalance,
      totalEarnings: totalEarnings,
      totalSpent: totalSpent,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        provider: t.provider,
        createdAt: t.createdAt,
      })),
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        tier: s.tier,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
        autoRenew: s.autoRenew,
      })),
      sparksReceived: sparksReceived.map(s => ({
        type: s.type,
        creditValue: s.creditValue,
        senderId: s.senderId,
        videoId: s.videoId,
        createdAt: s.createdAt,
      })),
      sparksGiven: sparksGiven.map(s => ({
        type: s.type,
        creditValue: s.creditValue,
        recipientId: s.recipientId,
        videoId: s.videoId,
        createdAt: s.createdAt,
      })),
    },
    creator: {
      profile: creatorProfile || null,
      aiInfluencers: aiInfluencers.map(ai => ({
        id: ai.id,
        name: ai.name,
        description: ai.description,
        avatarUrl: ai.avatarUrl,
        voiceId: ai.voiceId,
        subscriptionPrice: ai.subscriptionPrice,
        subscriberCount: ai.subscriberCount,
        isActive: ai.isActive,
        createdAt: ai.createdAt,
      })),
    },
    marketing: {
      bots: marketingBots.map(bot => ({
        id: bot.id,
        name: bot.name,
        type: bot.type,
        isActive: bot.isActive,
        createdAt: bot.createdAt,
      })),
      campaigns: campaigns.map(camp => ({
        id: camp.id,
        name: camp.name,
        platform: camp.platform,
        status: camp.status,
        createdAt: camp.createdAt,
      })),
    },
    invites: {
      codesCreated: inviteCodes.map(code => ({
        code: code.code,
        isUsed: code.isUsed,
        usedBy: code.usedBy,
        usedAt: code.usedAt,
        createdAt: code.createdAt,
      })),
      invitesSent: userInvites.filter(inv => inv.inviterId === userId).length,
      invitesReceived: userInvites.filter(inv => inv.inviteeId === userId).length,
    },
    legal: {
      agreements: userLegalAgreements.map(agreement => ({
        agreementType: agreement.agreementType,
        version: agreement.version,
        acceptedAt: agreement.acceptedAt,
      })),
    },
    socialConnections: socialConnections.map(conn => ({
      platform: conn.platform,
      connectedAt: conn.connectedAt,
      isActive: conn.isActive,
    })),
  };
}

/**
 * GDPR: Permanently delete user account and ALL associated data
 * This is irreversible and complies with "Right to Erasure"
 */
async deleteUserAccount(userId: string): Promise<void> {
  const user = await this.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  console.log(`🗑️ GDPR DELETION: Starting complete account deletion for user ${userId} (${user.email})`);

  try {
    // Delete in correct order to respect foreign key constraints
    // Child tables first, parent tables last

    // 1. Delete all user-generated content
    await db.delete(messages).where(eq(messages.senderId, userId));
    await db.delete(sparks).where(eq(sparks.senderId, userId));
    await db.delete(sparks).where(eq(sparks.recipientId, userId));
    await db.delete(videoViews).where(eq(videoViews.userId, userId));
    await db.delete(videoLikes).where(eq(videoLikes.userId, userId));
    await db.delete(videoComments).where(eq(videoComments.userId, userId));
    
    // 2. Delete videos and related data
    const userVideos = await db.select().from(videos).where(eq(videos.userId, userId));
    for (const video of userVideos) {
      // Delete video-related data
      await db.delete(videoViews).where(eq(videoViews.videoId, video.id));
      await db.delete(videoLikes).where(eq(videoLikes.videoId, video.id));
      await db.delete(videoComments).where(eq(videoComments.videoId, video.id));
      await db.delete(sparks).where(eq(sparks.videoId, video.id));
    }
    await db.delete(videos).where(eq(videos.userId, userId));
    
    // 3. Delete projects
    await db.delete(projects).where(eq(projects.userId, userId));
    
    // 4. Delete conversations and messages
    const userConversations = await db.query.conversations.findMany({
      where: or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      ),
    });
    for (const conv of userConversations) {
      await db.delete(messages).where(eq(messages.conversationId, conv.id));
    }
    await db.delete(conversationMembers).where(eq(conversationMembers.userId, userId));
    await db.delete(conversations).where(
      or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      )
    );
    
    // 5. Delete social connections
    await db.delete(follows).where(eq(follows.followerId, userId));
    await db.delete(follows).where(eq(follows.followingId, userId));
    await db.delete(followRequests).where(eq(followRequests.followerId, userId));
    await db.delete(followRequests).where(eq(followRequests.followingId, userId));
    
    // 6. Delete financial data
    await db.delete(transactions).where(eq(transactions.userId, userId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    await db.delete(walletTransactions).where(eq(walletTransactions.userId, userId));
    await db.delete(withdrawalRequests).where(eq(withdrawalRequests.userId, userId));
    
    // 7. Delete creator data
    await db.delete(creatorProfiles).where(eq(creatorProfiles.userId, userId));
    const userAiInfluencers = await db.select().from(aiInfluencers).where(eq(aiInfluencers.creatorId, userId));
    for (const influencer of userAiInfluencers) {
      await db.delete(aiInfluencerSubscriptions).where(eq(aiInfluencerSubscriptions.influencerId, influencer.id));
      await db.delete(aiInfluencerVideos).where(eq(aiInfluencerVideos.influencerId, influencer.id));
    }
    await db.delete(aiInfluencers).where(eq(aiInfluencers.creatorId, userId));
    
    // 8. Delete marketing data
    const userBots = await db.select().from(marketingBots).where(eq(marketingBots.userId, userId));
    for (const bot of userBots) {
      await db.delete(botActions).where(eq(botActions.botId, bot.id));
    }
    await db.delete(marketingBots).where(eq(marketingBots.userId, userId));
    
    const userCampaigns = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.userId, userId));
    for (const campaign of userCampaigns) {
      await db.delete(campaignLeads).where(eq(campaignLeads.campaignId, campaign.id));
    }
    await db.delete(marketingCampaigns).where(eq(marketingCampaigns.userId, userId));
    
    // 9. Delete invite system data
    await db.delete(userInvites).where(eq(userInvites.inviterId, userId));
    await db.delete(userInvites).where(eq(userInvites.inviteeId, userId));
    await db.delete(inviteCodes).where(eq(inviteCodes.creatorId, userId));
    
    // 10. Delete user storage, sessions, and auth data
    await db.delete(userStorage).where(eq(userStorage.userId, userId));
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(phoneVerifications).where(eq(phoneVerifications.phoneNumber, user.phoneNumber || ''));
    await db.delete(emailVerifications).where(eq(emailVerifications.email, user.email || ''));
    
    // 11. Delete support tickets and admin data
    await db.delete(supportTickets).where(eq(supportTickets.userId, userId));
    await db.delete(supportMessages).where(eq(supportMessages.userId, userId));
    await db.delete(contentFlags).where(eq(contentFlags.flaggedBy, userId));
    await db.delete(userStrikes).where(eq(userStrikes.userId, userId));
    await db.delete(adminActions).where(eq(adminActions.targetUserId, userId));
    
    // 12. Delete legal agreements
    await db.delete(userLegalAgreements).where(eq(userLegalAgreements.userId, userId));
    
    // 13. Delete social media credentials
    await db.delete(socialMediaCredentials).where(eq(socialMediaCredentials.userId, userId));
    await db.delete(socialConnections).where(eq(socialConnections.userId, userId));
    
    // 14. Delete marketplace data
    await db.delete(userPurchases).where(eq(userPurchases.userId, userId));
    await db.delete(pluginInstalls).where(eq(pluginInstalls.userId, userId));
    await db.delete(pluginReviews).where(eq(pluginReviews.userId, userId));
    
    // 15. Delete premium subscriptions
    await db.delete(premiumSubscriptions).where(eq(premiumSubscriptions.subscriberId, userId));
    await db.delete(premiumSubscriptions).where(eq(premiumSubscriptions.creatorId, userId));
    
    // 16. Delete text stories, viral content, hooks
    await db.delete(textStories).where(eq(textStories.creatorId, userId));
    await db.delete(hookAnalytics).where(eq(hookAnalytics.creatorId, userId));
    await db.delete(socialShares).where(eq(socialShares.userId, userId));
    
    // 17. Delete imported contacts
    await db.delete(importedContacts).where(eq(importedContacts.userId, userId));
    
    // 18. Finally, delete the user record itself
    await db.delete(users).where(eq(users.id, userId));
    
    console.log(`✅ GDPR DELETION: Successfully deleted all data for user ${userId}`);
  } catch (error) {
    console.error(`❌ GDPR DELETION FAILED for user ${userId}:`, error);
    throw new Error(`Failed to delete user account: ${error.message}`);
  }
}
```

---

## PART 2: BACKEND API ROUTES

### 2.1 Add to `server/routes.ts` - GDPR Endpoints

Add these routes to your Express router (around line 2000+, in the authenticated routes section):

```typescript
// ============================================================
// GDPR COMPLIANCE ENDPOINTS
// ============================================================

/**
 * Export all user data (GDPR Right to Data Portability)
 * GET /api/gdpr/export
 */
app.get("/api/gdpr/export", isAuthenticatedLocal, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    console.log(`📦 GDPR DATA EXPORT: Starting export for user ${userId}`);
    
    const userData = await storage.exportUserData(userId);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="profithack-data-${userId}-${Date.now()}.json"`);
    
    console.log(`✅ GDPR DATA EXPORT: Successfully exported data for user ${userId}`);
    
    res.json(userData);
  } catch (error: any) {
    console.error("GDPR data export error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to export user data" 
    });
  }
});

/**
 * Delete user account permanently (GDPR Right to Erasure)
 * DELETE /api/gdpr/delete-account
 * Requires password confirmation for security
 */
app.delete("/api/gdpr/delete-account", isAuthenticatedLocal, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { password, confirmText } = req.body;
    
    // Security check: User must confirm deletion
    if (confirmText !== "DELETE MY ACCOUNT") {
      return res.status(400).json({ 
        error: "Please type 'DELETE MY ACCOUNT' to confirm" 
      });
    }
    
    // Verify password before deletion
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check password if user has one (email/password auth)
    if (user.passwordHash) {
      if (!password) {
        return res.status(400).json({ error: "Password required for verification" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }
    
    console.log(`🗑️ GDPR ACCOUNT DELETION: User ${userId} (${user.email}) requested account deletion`);
    
    // Perform complete account deletion
    await storage.deleteUserAccount(userId);
    
    // Destroy session
    req.logout((err) => {
      if (err) {
        console.error("Logout error after account deletion:", err);
      }
    });
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
    });
    
    console.log(`✅ GDPR ACCOUNT DELETION: Successfully deleted account ${userId}`);
    
    res.json({ 
      success: true, 
      message: "Your account has been permanently deleted. We're sorry to see you go." 
    });
  } catch (error: any) {
    console.error("GDPR account deletion error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to delete account" 
    });
  }
});

/**
 * Get account deletion preview (what will be deleted)
 * GET /api/gdpr/deletion-preview
 */
app.get("/api/gdpr/deletion-preview", isAuthenticatedLocal, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userData = await storage.exportUserData(userId);
    
    // Return summary of what will be deleted
    res.json({
      warning: "The following data will be PERMANENTLY DELETED and CANNOT BE RECOVERED:",
      statistics: userData.statistics,
      dataCategories: {
        profile: "Your account profile and personal information",
        content: `${userData.statistics.totalVideos} videos, ${userData.statistics.totalProjects} projects`,
        social: `${userData.statistics.totalFollowers} followers, ${userData.statistics.totalFollowing} following`,
        financial: `Wallet balance: $${userData.profile.walletBalance}, Transaction history`,
        messages: "All conversations and messages",
        creator: "AI influencers, marketing bots, campaigns",
        invites: "Invite codes and referral data",
      },
      irreversible: true,
      processingTime: "Immediate - deletion begins as soon as you confirm",
    });
  } catch (error: any) {
    console.error("GDPR deletion preview error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate deletion preview" 
    });
  }
});
```

---

## PART 3: FRONTEND COMPONENTS

### 3.1 Create Settings Page with GDPR Features

Create file: `client/src/pages/settings-privacy.tsx`

```typescript
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, AlertTriangle, Shield, Database, FileJson } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DeletionPreview {
  warning: string;
  statistics: any;
  dataCategories: Record<string, string>;
  irreversible: boolean;
  processingTime: string;
}

export default function SettingsPrivacy() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch deletion preview
  const { data: deletionPreview } = useQuery<DeletionPreview>({
    queryKey: ['/api/gdpr/deletion-preview'],
    enabled: showDeleteDialog,
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gdpr/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profithack-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded as a JSON file.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message,
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest('/api/gdpr/delete-account', {
        method: 'DELETE',
        body: JSON.stringify({
          password: deletePassword,
          confirmText: deleteConfirmText,
        }),
      });
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted. You will be redirected to the homepage.",
      });
      
      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        setLocation('/');
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message,
      });
    },
  });

  const handleExportData = () => {
    exportDataMutation.mutate();
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      toast({
        variant: "destructive",
        title: "Confirmation required",
        description: "Please type 'DELETE MY ACCOUNT' exactly to confirm.",
      });
      return;
    }
    
    deleteAccountMutation.mutate();
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Privacy & Data</h1>
        <p className="text-muted-foreground mt-2">
          Manage your data and privacy settings in compliance with GDPR regulations
        </p>
      </div>

      <Separator />

      {/* Export Your Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>
                Download a complete copy of all your data in JSON format
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
            <div className="flex items-start gap-2">
              <FileJson className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Your export will include:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                  <li>Profile information and account details</li>
                  <li>All videos, projects, and content you've created</li>
                  <li>Messages, comments, and social interactions</li>
                  <li>Financial data (transactions, wallet balance)</li>
                  <li>Creator data (AI influencers, marketing campaigns)</li>
                  <li>Invite codes and referral history</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleExportData}
            disabled={exportDataMutation.isPending}
            className="w-full"
            data-testid="button-export-data"
          >
            <Download className="mr-2 h-4 w-4" />
            {exportDataMutation.isPending ? "Preparing download..." : "Download My Data"}
          </Button>

          <p className="text-xs text-muted-foreground">
            This may take a few moments depending on how much data you have. The file will download automatically.
          </p>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Delete My Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Warning: This action is irreversible</p>
                <p className="text-muted-foreground mt-1">
                  Once you delete your account, there is no way to recover it. All your data will be permanently removed from our servers.
                </p>
              </div>
            </div>
          </div>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                data-testid="button-delete-account"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Confirm Account Deletion
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 pt-4">
                  <p className="font-semibold">
                    This will permanently delete ALL of the following data:
                  </p>

                  {deletionPreview && (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded bg-muted">
                          <p className="font-medium">Videos</p>
                          <p className="text-lg text-primary">{deletionPreview.statistics?.totalVideos || 0}</p>
                        </div>
                        <div className="p-3 rounded bg-muted">
                          <p className="font-medium">Projects</p>
                          <p className="text-lg text-primary">{deletionPreview.statistics?.totalProjects || 0}</p>
                        </div>
                        <div className="p-3 rounded bg-muted">
                          <p className="font-medium">Followers</p>
                          <p className="text-lg text-primary">{deletionPreview.statistics?.totalFollowers || 0}</p>
                        </div>
                        <div className="p-3 rounded bg-muted">
                          <p className="font-medium">Following</p>
                          <p className="text-lg text-primary">{deletionPreview.statistics?.totalFollowing || 0}</p>
                        </div>
                      </div>

                      {deletionPreview.dataCategories && (
                        <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                          {Object.entries(deletionPreview.dataCategories).map(([key, value]) => (
                            <li key={key}>{value}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="delete-password">Enter your password to confirm</Label>
                      <Input
                        id="delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Your password"
                        className="mt-2"
                        data-testid="input-delete-password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="delete-confirm">
                        Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="mt-2"
                        data-testid="input-delete-confirm"
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending || deleteConfirmText !== "DELETE MY ACCOUNT"}
                  className="bg-destructive hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                >
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete Forever"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* GDPR Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Your Privacy Rights (GDPR)</CardTitle>
              <CardDescription>
                Learn about your data protection rights under GDPR
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Right to Access:</strong> You can request access to your personal data at any time by exporting your data.
            </p>
            <p>
              <strong>Right to Rectification:</strong> You can update your personal information in your account settings.
            </p>
            <p>
              <strong>Right to Erasure:</strong> You can permanently delete your account and all associated data.
            </p>
            <p>
              <strong>Right to Data Portability:</strong> You can export your data in a machine-readable JSON format.
            </p>
            <p className="pt-2 border-t">
              For more information about how we process your data, please see our{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.2 Add Route to Router

Add this to `client/src/App.tsx` (in the Routes section):

```typescript
<Route path="/settings/privacy" component={SettingsPrivacy} />
```

### 3.3 Add Link to Settings Menu

Add this to your existing settings page or sidebar navigation:

```typescript
<Link href="/settings/privacy" data-testid="link-privacy-settings">
  <Shield className="mr-2 h-4 w-4" />
  Privacy & Data
</Link>
```

---

## PART 4: MISSING TABLE IMPORTS

### 4.1 Add Required Table Imports to `server/storage.ts`

At the top of `server/storage.ts`, ensure you have all necessary table imports:

```typescript
import {
  users, videos, projects, conversations, messages, sparks,
  transactions, subscriptions, inviteCodes, userInvites,
  creatorProfiles, aiInfluencers, aiInfluencerSubscriptions,
  aiInfluencerVideos, marketingBots, marketingCampaigns,
  campaignLeads, follows, followRequests, videoViews,
  videoLikes, videoComments, conversationMembers, botActions,
  userStorage, sessions, phoneVerifications, emailVerifications,
  supportTickets, supportMessages, contentFlags, userStrikes,
  adminActions, userLegalAgreements, socialMediaCredentials,
  socialConnections, userPurchases, pluginInstalls, pluginReviews,
  premiumSubscriptions, textStories, hookAnalytics, socialShares,
  importedContacts, walletTransactions, withdrawalRequests
} from "@shared/schema";
```

---

## PART 5: TESTING THE IMPLEMENTATION

### 5.1 Test Data Export

```bash
# Via curl
curl -X GET http://localhost:5000/api/gdpr/export \
  -H "Cookie: your-session-cookie" \
  --output my-data.json

# The file should download with all your data in JSON format
```

### 5.2 Test Account Deletion

1. Navigate to `/settings/privacy`
2. Click "Delete My Account"
3. Review the deletion preview (shows what will be deleted)
4. Enter your password
5. Type "DELETE MY ACCOUNT" exactly
6. Click "Delete Forever"
7. Account and all data should be permanently removed

### 5.3 Verification Queries

Run these SQL queries to verify deletion worked:

```sql
-- Check if user was deleted
SELECT * FROM users WHERE id = 'your-user-id';
-- Should return 0 rows

-- Check if videos were deleted
SELECT COUNT(*) FROM videos WHERE user_id = 'your-user-id';
-- Should return 0

-- Check if messages were deleted
SELECT COUNT(*) FROM messages WHERE sender_id = 'your-user-id';
-- Should return 0
```

---

## IMPLEMENTATION NOTES

### Security Considerations

1. **Password Verification**: Account deletion requires password confirmation to prevent unauthorized deletions
2. **Explicit Confirmation**: Users must type "DELETE MY ACCOUNT" to confirm intent
3. **Session Destruction**: User session is destroyed after account deletion
4. **Irreversible Action**: Clear warnings that deletion is permanent

### GDPR Compliance

✅ **Right to Access** - Users can view all their data via export
✅ **Right to Data Portability** - Data exported in JSON format
✅ **Right to Erasure** - Complete account deletion removes all personal data
✅ **Transparency** - Clear information about what data is collected and how it's used
✅ **User Control** - Users can export and delete their data at any time

### Performance Optimization

- Data export uses parallel queries for faster processing
- Deletion follows foreign key constraints to prevent orphaned records
- Both operations are logged for audit trails

### Error Handling

- All operations wrapped in try-catch blocks
- User-friendly error messages
- Server-side logging for debugging
- Graceful failure handling

---

## ADDITIONAL RECOMMENDATIONS

1. **Email Notification**: Send confirmation email after account deletion
2. **Cooling-Off Period**: Consider adding a 30-day grace period before permanent deletion
3. **Data Retention Policy**: Document how long deleted data is retained in backups
4. **Audit Logs**: Keep logs of all GDPR requests for compliance reporting
5. **Privacy Policy**: Update your privacy policy to include these new features

---

END OF GDPR IMPLEMENTATION GUIDE
