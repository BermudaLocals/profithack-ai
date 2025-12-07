import {
  users,
  projects,
  videos,
  videoLikes,
  videoComments,
  videoViews,
  virtualGifts,
  sparkCatalog,
  messages,
  transactions,
  subscriptions,
  contentFlags,
  userStrikes,
  plugins,
  pluginInstalls,
  pluginReviews,
  pluginTransactions,
  aiInfluencers,
  aiInfluencerVideos,
  aiInfluencerSubscriptions,
  inviteCodes,
  userInvites,
  premiumUsernames,
  usernamePurchases,
  callSessions,
  callParticipants,
  conversations,
  conversationMembers,
  userLegalAgreements,
  premiumSubscriptions,
  privateSessions,
  privateSessionViewers,
  toyControlEvents,
  creatorProfiles,
  twilioVideoRooms,
  twilioRoomParticipants,
  emailVerifications,
  phoneVerifications,
  follows,
  followRequests,
  sessions,
  marketingBots,
  marketingCampaigns,
  campaignLeads,
  socialConnections,
  withdrawalRequests,
  userPurchases,
  supportTickets,
  supportMessages,
  adminActions,
  socialMediaCredentials,
  textStories,
  hookAnalytics,
  socialShares,
  importedContacts,
  userStorage,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Video,
  type InsertVideo,
  type VideoLike,
  type VideoComment,
  type InsertVideoComment,
  type VirtualGift,
  type InsertVirtualGift,
  type Message,
  type InsertMessage,
  type Transaction,
  type InsertTransaction,
  type Subscription,
  type InsertSubscription,
  type ContentFlag,
  type InsertContentFlag,
  type UserStrike,
  type InsertUserStrike,
  type Plugin,
  type InsertPlugin,
  type PluginInstall,
  type InsertPluginInstall,
  type PluginReview,
  type InsertPluginReview,
  type PluginTransaction,
  type InsertPluginTransaction,
  type AIInfluencer,
  type InsertAIInfluencer,
  type AIInfluencerVideo,
  type InsertAIInfluencerVideo,
  type AIInfluencerSubscription,
  type InsertAIInfluencerSubscription,
  type InviteCode,
  type InsertInviteCode,
  type UserInvite,
  type InsertUserInvite,
  type PremiumUsername,
  type InsertPremiumUsername,
  type UsernamePurchase,
  type InsertUsernamePurchase,
  type CallSession,
  type InsertCallSession,
  type CallParticipant,
  type InsertCallParticipant,
  type Conversation,
  type InsertConversation,
  type UserLegalAgreement,
  type InsertUserLegalAgreement,
  type PremiumSubscription,
  type InsertPremiumSubscription,
  type PrivateSession,
  type InsertPrivateSession,
  type PrivateSessionViewer,
  type InsertPrivateSessionViewer,
  type ToyControlEvent,
  type InsertToyControlEvent,
  type CreatorProfile,
  type TwilioVideoRoom,
  type InsertTwilioVideoRoom,
  type TwilioRoomParticipant,
  type InsertTwilioRoomParticipant,
  type PhoneVerification,
  type BlockedUser,
  type InsertBlockedUser,
  blockedUsers,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, inArray, gt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  updateUserCredits(userId: string, amount: number): Promise<void>;
  updateUserCoins(userId: string, amount: number): Promise<void>;
  updateUserSubscription(
    userId: string,
    tier: "explorer" | "creator" | "innovator"
  ): Promise<void>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Video operations
  getVideos(filters?: {
    ageRating?: "u16" | "16plus" | "18plus";
    userId?: string;
    videoType?: "short" | "long";
  }): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  
  // Video engagement operations (atomic counter updates)
  // These methods update both detail tables and denormalized counters in a transaction
  toggleVideoLike(videoId: string, userId: string): Promise<{ liked: boolean }>;
  addVideoComment(videoId: string, userId: string, content: string, parentCommentId?: string): Promise<void>;
  trackVideoView(videoId: string, userId: string, watchDuration: number): Promise<void>;

  // Vids (Reels) operations
  getReelsFeed(userId: string, limit?: number, offset?: number): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | null>;
  updateVideoStatus(videoId: string, status: "pending" | "processing" | "ready" | "failed"): Promise<void>;
  incrementViewCount(videoId: string): Promise<void>;
  likeVideo(userId: string, videoId: string): Promise<void>;
  unlikeVideo(userId: string, videoId: string): Promise<void>;
  getUserVideoLike(userId: string, videoId: string): Promise<VideoLike | null>;
  createVideoComment(data: InsertVideoComment): Promise<VideoComment>;
  getVideoComments(videoId: string, limit?: number, offset?: number): Promise<VideoComment[]>;

  // Spark operations
  sendSpark(spark: InsertVirtualGift): Promise<VirtualGift>;
  getSparksForVideo(videoId: string): Promise<VirtualGift[]>;
  getSparksSent(userId: string): Promise<VirtualGift[]>;
  getSparksReceived(userId: string): Promise<VirtualGift[]>;

  // Message operations
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: string): Promise<Transaction[]>;

  // Moderation operations
  flagContent(flag: InsertContentFlag): Promise<ContentFlag>;
  getContentFlags(status?: string): Promise<ContentFlag[]>;
  updateFlagStatus(
    id: string,
    status: "approved" | "rejected",
    reviewedBy: string
  ): Promise<void>;
  addUserStrike(strike: InsertUserStrike): Promise<UserStrike>;
  getUserStrikes(userId: string): Promise<UserStrike[]>;
  getStrikeById(strikeId: string): Promise<UserStrike | undefined>;
  updateStrikeAppeal(
    strikeId: string,
    appeal: {
      appealStatus?: "pending" | "approved" | "rejected";
      appealReason?: string;
      appealReviewedBy?: string;
      appealReviewedAt?: Date;
    }
  ): Promise<void>;

  // User blocking operations (Instagram/TikTok-style)
  blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void>;
  unblockUser(blockerId: string, blockedId: string): Promise<void>;
  isUserBlocked(blockerId: string, blockedId: string): Promise<boolean>;
  getBlockedUsers(userId: string): Promise<string[]>;
  getBlockingUsers(userId: string): Promise<string[]>;

  // Plugin operations
  getPlugins(filters?: { type?: string; status?: string; authorId?: string }): Promise<Plugin[]>;
  getPlugin(id: string): Promise<Plugin | undefined>;
  createPlugin(plugin: InsertPlugin): Promise<Plugin>;
  updatePlugin(id: string, plugin: Partial<InsertPlugin>): Promise<Plugin>;
  deletePlugin(id: string): Promise<void>;
  installPlugin(install: InsertPluginInstall): Promise<PluginInstall>;
  getPluginInstalls(userId: string): Promise<PluginInstall[]>;
  uninstallPlugin(userId: string, pluginId: string): Promise<void>;
  createPluginReview(review: InsertPluginReview): Promise<PluginReview>;
  getPluginReviews(pluginId: string): Promise<PluginReview[]>;
  createPluginTransaction(transaction: InsertPluginTransaction): Promise<PluginTransaction>;

  // AI Influencer operations
  getAIInfluencers(filters?: { creatorId?: string; contentType?: string; isPublic?: boolean }): Promise<AIInfluencer[]>;
  getAIInfluencer(id: string): Promise<AIInfluencer | undefined>;
  createAIInfluencer(influencer: InsertAIInfluencer): Promise<AIInfluencer>;
  updateAIInfluencer(id: string, influencer: Partial<InsertAIInfluencer>): Promise<AIInfluencer>;
  deleteAIInfluencer(id: string): Promise<void>;
  getAIInfluencerVideos(influencerId: string): Promise<AIInfluencerVideo[]>;
  createAIInfluencerVideo(video: InsertAIInfluencerVideo): Promise<AIInfluencerVideo>;
  updateAIInfluencerVideo(id: string, video: Partial<InsertAIInfluencerVideo>): Promise<AIInfluencerVideo>;
  subscribeToInfluencer(subscription: InsertAIInfluencerSubscription): Promise<AIInfluencerSubscription>;
  getInfluencerSubscriptions(userId: string): Promise<AIInfluencerSubscription[]>;
  unsubscribeFromInfluencer(userId: string, influencerId: string): Promise<void>;

  // Invite Code operations
  createInviteCodes(userId: string, count: number): Promise<InviteCode[]>;
  getUserInviteCodes(userId: string): Promise<InviteCode[]>;
  validateInviteCode(code: string): Promise<InviteCode | undefined>;
  useInviteCode(code: string, userId: string): Promise<void>;
  getUserInvites(userId: string): Promise<UserInvite[]>;
  getInviteStats(userId: string): Promise<{ totalInvites: number; usedCodes: number; unusedCodes: number; bonusCreditsEarned: number }>;
  getAvailableInviteCode(): Promise<InviteCode | undefined>;
  
  // Platform Statistics
  getTotalUsers(): Promise<number>;
  getTotalVideos(): Promise<number>;
  getActiveCreators(): Promise<number>;

  // Premium Username Marketplace operations
  getPremiumUsernames(filters?: { tier?: string; status?: string; search?: string }): Promise<any[]>;
  getPremiumUsername(id: string): Promise<any | undefined>;
  getPremiumUsernameByName(username: string): Promise<any | undefined>;
  purchaseUsername(userId: string, usernameId: string): Promise<any>;
  placeBid(usernameId: string, userId: string, bidAmount: number): Promise<any>;

  // Conversation operations
  getUserConversations(userId: string): Promise<any[]>;
  createConversation(conversation: { creatorId: string; name?: string; isGroup: boolean; participantIds: string[] }): Promise<any>;
  getConversationMessages(conversationId: string): Promise<any[]>;
  sendConversationMessage(message: { conversationId: string; senderId: string; content: string; messageType: string }): Promise<any>;
  getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversation>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  getConversationMembers(conversationId: string): Promise<User[]>;

  // WebRTC Call operations
  createCallSession(call: any): Promise<any>;
  addCallParticipant(participant: any): Promise<any>;
  answerCall(callId: string, userId: string): Promise<any>;
  endCall(callId: string): Promise<any>;
  getCallHistory(userId: string): Promise<any[]>;

  // Legal Agreement operations
  createUserLegalAgreement(agreement: InsertUserLegalAgreement): Promise<UserLegalAgreement>;

  // Premium Model Subscriptions
  subscribeToPremiumModel(subscriberId: string, creatorId: string, tier: "basic" | "vip" | "innerCircle", amountCents: number): Promise<PremiumSubscription>;
  getPremiumModels(): Promise<User[]>;
  getMyPremiumSubscriptions(subscriberId: string): Promise<PremiumSubscription[]>;

  // Private Sessions
  startPrivateSession(modelId: string, creditsPerMinute: number): Promise<PrivateSession>;
  joinPrivateSession(sessionId: string, viewerId: string): Promise<PrivateSessionViewer>;
  endPrivateSession(sessionId: string, modelId: string): Promise<void>;
  getActivePrivateSession(modelId: string): Promise<PrivateSession | null>;

  // Toy Control
  sendSparkWithToyControl(viewerId: string, modelId: string, sparkType: "glow" | "blaze" | "stardust" | "rocket" | "galaxy" | "supernova" | "infinity" | "royalty" | "godmode" | "pinkSand" | "seaGlass" | "longtail" | "coralReef" | "lighthouse" | "gombey" | "moonGate" | "islandParadise" | "bermudaTriangle" | "heart" | "rose" | "loveWave" | "bouquet" | "cupid" | "loveStorm" | "diamondRing" | "loveBomb" | "dollar" | "gold" | "sportsCar" | "yacht" | "jet" | "mansion" | "island" | "empire" | "butterfly" | "sunflower" | "dolphin" | "eagle" | "peacock" | "phoenix" | "dragon" | "unicorn" | "confetti" | "fireworks" | "spotlight" | "aura" | "portal" | "starfall" | "aurora" | "godRay" | "controller" | "trophy" | "headset" | "arcade" | "victory" | "champion" | "legendary" | "esports" | "gamerGod" | "worldChamp" | "music" | "microphone" | "guitar" | "vinyl" | "dj" | "concert" | "rockstar" | "superstar" | "legend" | "hallOfFame" | "coffee" | "pizza" | "burger" | "sushi" | "champagne" | "cake" | "feast" | "caviar" | "truffle" | "goldSteak" | "soccer" | "basketball" | "medal" | "podium" | "goldMedal" | "stadium" | "mvp" | "goat" | "olympian" | "worldRecord" | "throne" | "castle" | "scepter" | "jewels" | "galaxyCrown" | "immortal" | "titan" | "deity" | "cosmos" | "universe", intensity: number, durationSeconds: number): Promise<ToyControlEvent>;

  // Twilio Video operations
  createTwilioRoom(data: InsertTwilioVideoRoom): Promise<TwilioVideoRoom>;
  getTwilioRoom(id: string): Promise<TwilioVideoRoom | undefined>;
  addTwilioParticipant(data: InsertTwilioRoomParticipant): Promise<TwilioRoomParticipant>;
  endTwilioRoom(id: string): Promise<void>;
  getActiveTwilioRooms(): Promise<TwilioVideoRoom[]>;
  removeTwilioParticipant(roomId: string, userId: string): Promise<void>;

  // Phone Verification operations
  createPhoneVerification(phoneNumber: string, code: string): Promise<void>;
  getPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification | null>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | null>;
  updateUserPhoneNumber(userId: string, phoneNumber: string): Promise<void>;

  // Email Verification operations
  createEmailVerification(email: string, code: string): Promise<void>;
  getEmailVerification(email: string, code: string): Promise<{ email: string; code: string; createdAt: Date } | null>;
  deleteEmailVerification(email: string): Promise<void>;

  // Support Bot & FAQ operations (Kush the Rasta Monkey)
  searchFAQs(query: string): Promise<any[]>;
  saveBotSession(session: any): Promise<void>;
  incrementFAQSearch(faqId: string): Promise<void>;
  createSupportTicket(ticket: any): Promise<any>;
  markSessionEscalated(sessionId: string, ticketId: string): Promise<void>;

  // GDPR Compliance - Data Export & Account Deletion
  exportUserData(userId: string): Promise<any>;
  deleteUserAccount(userId: string): Promise<void>;

  // TikTok Live Battle operations
  createBattle(battle: any): Promise<any>;
  getBattle(battleId: number): Promise<any | undefined>;
  getActiveBattles(): Promise<any[]>;
  updateBattleScore(battleId: number, isCreator: boolean, points: number, multiplier: number): Promise<void>;
  endBattle(battleId: number): Promise<any>;
  getBattleRankings(limit?: number): Promise<any[]>;
  getUserGifterLevel(userId: string): Promise<number>;
  updateUserGifterLevel(userId: string, increment: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchPattern = `%${query.toLowerCase()}%`;
    const results = await db
      .select()
      .from(users)
      .where(
        or(
          sql`LOWER(${users.email}) LIKE ${searchPattern}`,
          sql`LOWER(${users.firstName}) LIKE ${searchPattern}`,
          sql`LOWER(${users.lastName}) LIKE ${searchPattern}`
        )
      )
      .limit(20);
    return results;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async updateUserCredits(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ credits: sql`${users.credits} + ${amount}` })
      .where(eq(users.id, userId));
  }

  async updateUserCoins(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ coins: sql`${users.coins} + ${amount}` })
      .where(eq(users.id, userId));
  }

  async updateUserSubscription(
    userId: string,
    tier: "explorer" | "creator" | "innovator"
  ): Promise<void> {
    await db
      .update(users)
      .set({ subscriptionTier: tier })
      .where(eq(users.id, userId));
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(
    id: string,
    project: Partial<InsertProject>
  ): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Video operations
  async getVideos(filters?: {
    ageRating?: "u16" | "16plus" | "18plus";
    userId?: string;
    videoType?: "short" | "long";
  }): Promise<Video[]> {
    let query = db.select().from(videos);

    const conditions = [];
    if (filters?.ageRating) {
      conditions.push(eq(videos.ageRating, filters.ageRating));
    }
    if (filters?.userId) {
      conditions.push(eq(videos.userId, filters.userId));
    }
    if (filters?.videoType) {
      conditions.push(eq(videos.videoType, filters.videoType));
    }
    conditions.push(eq(videos.moderationStatus, "approved"));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(videos.createdAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video> {
    const [updated] = await db
      .update(videos)
      .set(video)
      .where(eq(videos.id, id))
      .returning();
    return updated;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Video engagement operations with atomic counter updates
  async toggleVideoLike(videoId: string, userId: string): Promise<{ liked: boolean }> {
    // Check if like exists
    const [existingLike] = await db
      .select()
      .from(videoLikes)
      .where(and(eq(videoLikes.videoId, videoId), eq(videoLikes.userId, userId)));

    if (existingLike) {
      // Unlike: delete like and decrement counter atomically
      await db.transaction(async (tx) => {
        await tx.delete(videoLikes).where(eq(videoLikes.id, existingLike.id));
        await tx
          .update(videos)
          .set({ likeCount: sql`${videos.likeCount} - 1` })
          .where(eq(videos.id, videoId));
      });
      return { liked: false };
    } else {
      // Like: insert like and increment counter atomically
      await db.transaction(async (tx) => {
        await tx.insert(videoLikes).values({ videoId, userId });
        await tx
          .update(videos)
          .set({ likeCount: sql`${videos.likeCount} + 1` })
          .where(eq(videos.id, videoId));
      });
      return { liked: true };
    }
  }

  async addVideoComment(
    videoId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ): Promise<void> {
    // Insert comment and increment counter atomically
    await db.transaction(async (tx) => {
      await tx.insert(videoComments).values({
        videoId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
      });
      await tx
        .update(videos)
        .set({ commentCount: sql`${videos.commentCount} + 1` })
        .where(eq(videos.id, videoId));
    });
  }

  async trackVideoView(
    videoId: string,
    userId: string,
    watchDuration: number
  ): Promise<void> {
    // Insert view and increment counter atomically only on first view
    // Use onConflictDoNothing to detect if this is a new view
    await db.transaction(async (tx) => {
      // Try to insert the view - if it already exists, do nothing
      const result = await tx
        .insert(videoViews)
        .values({ videoId, userId, watchDuration })
        .onConflictDoNothing({
          target: [videoViews.videoId, videoViews.userId],
        })
        .returning();
      
      // Only increment counter if a new row was inserted
      if (result.length > 0) {
        await tx
          .update(videos)
          .set({ viewCount: sql`${videos.viewCount} + 1` })
          .where(eq(videos.id, videoId));
      }
      
      // If view already existed, optionally update watch duration (separate update)
      if (result.length === 0) {
        await tx
          .update(videoViews)
          .set({ watchDuration: sql`${videoViews.watchDuration} + ${watchDuration}` })
          .where(and(
            eq(videoViews.videoId, videoId),
            eq(videoViews.userId, userId)
          ));
      }
    });
  }

  // Vids (Reels) operations
  async getReelsFeed(userId: string, limit: number = 20, offset: number = 0): Promise<Video[]> {
    // Get user to check age verification status
    const user = await this.getUser(userId);
    if (!user) {
      return [];
    }

    // Build age-gating filter
    // Age-verified (18+): can see all content
    // Unverified: can see u16 and 16plus content
    const ageRatingFilter = user.ageVerified 
      ? undefined // Age-verified (18+): can see all content
      : inArray(videos.ageRating, ["u16", "16plus"]); // Unverified: can see u16 and 16plus

    // Query videos with user data
    const conditions = [
      eq(videos.isPublic, true),
      eq(videos.moderationStatus, "approved"),
    ];
    
    if (ageRatingFilter) {
      conditions.push(ageRatingFilter);
    }

    const results = await db
      .select({
        id: videos.id,
        userId: videos.userId,
        title: videos.title,
        description: videos.description,
        videoUrl: videos.videoUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
        videoType: videos.videoType,
        quality: videos.quality,
        hashtags: videos.hashtags,
        category: videos.category,
        isPublic: videos.isPublic,
        isPremium: videos.isPremium,
        requiredTier: videos.requiredTier,
        ageRating: videos.ageRating,
        viewCount: videos.viewCount,
        totalWatchTime: videos.totalWatchTime,
        likeCount: videos.likeCount,
        commentCount: videos.commentCount,
        sparkCount: videos.sparkCount,
        moderationStatus: videos.moderationStatus,
        createdAt: videos.createdAt,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  async getVideoById(id: string): Promise<Video | null> {
    const results = await db
      .select({
        id: videos.id,
        userId: videos.userId,
        title: videos.title,
        description: videos.description,
        videoUrl: videos.videoUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
        videoType: videos.videoType,
        quality: videos.quality,
        hashtags: videos.hashtags,
        category: videos.category,
        isPublic: videos.isPublic,
        isPremium: videos.isPremium,
        requiredTier: videos.requiredTier,
        ageRating: videos.ageRating,
        viewCount: videos.viewCount,
        totalWatchTime: videos.totalWatchTime,
        likeCount: videos.likeCount,
        commentCount: videos.commentCount,
        sparkCount: videos.sparkCount,
        moderationStatus: videos.moderationStatus,
        createdAt: videos.createdAt,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.id, id))
      .limit(1);

    return results[0] as Video || null;
  }

  async updateVideoStatus(videoId: string, status: "pending" | "processing" | "ready" | "failed"): Promise<void> {
    await db
      .update(videos)
      .set({ moderationStatus: status as any })
      .where(eq(videos.id, videoId));
  }

  async incrementViewCount(videoId: string): Promise<void> {
    // Check video exists
    const video = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1);
    if (video.length === 0) {
      throw new Error("Video not found");
    }

    await db
      .update(videos)
      .set({ viewCount: sql`${videos.viewCount} + 1` })
      .where(eq(videos.id, videoId));
  }

  async likeVideo(userId: string, videoId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Check video exists
      const video = await tx.select().from(videos).where(eq(videos.id, videoId)).limit(1);
      if (video.length === 0) {
        throw new Error("Video not found");
      }
      
      // 2. Check for duplicate like
      const existing = await tx.select().from(videoLikes)
        .where(and(eq(videoLikes.videoId, videoId), eq(videoLikes.userId, userId)))
        .limit(1);
      
      if (existing.length > 0) {
        return; // Already liked, do nothing
      }
      
      // 3. Insert like + increment counter atomically
      await tx.insert(videoLikes).values({ videoId, userId });
      await tx.update(videos).set({ likeCount: sql`${videos.likeCount} + 1` })
        .where(eq(videos.id, videoId));
    });
  }

  async unlikeVideo(userId: string, videoId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Check video exists
      const video = await tx.select().from(videos).where(eq(videos.id, videoId)).limit(1);
      if (video.length === 0) {
        throw new Error("Video not found");
      }
      
      // 2. Delete like only if it exists
      const result = await tx.delete(videoLikes)
        .where(and(eq(videoLikes.videoId, videoId), eq(videoLikes.userId, userId)))
        .returning();
      
      // 3. Only decrement counter if like was actually deleted
      if (result.length > 0) {
        await tx.update(videos).set({ likeCount: sql`${videos.likeCount} - 1` })
          .where(eq(videos.id, videoId));
      }
    });
  }

  async getUserVideoLike(userId: string, videoId: string): Promise<VideoLike | null> {
    const [like] = await db
      .select()
      .from(videoLikes)
      .where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)))
      .limit(1);
    return like || null;
  }

  async createVideoComment(data: InsertVideoComment): Promise<VideoComment> {
    const [comment] = await db.transaction(async (tx) => {
      // 1. Check video exists
      const video = await tx.select().from(videos).where(eq(videos.id, data.videoId)).limit(1);
      if (video.length === 0) {
        throw new Error("Video not found");
      }

      // 2. Insert comment and increment counter atomically
      const [newComment] = await tx.insert(videoComments).values(data).returning();
      await tx
        .update(videos)
        .set({ commentCount: sql`${videos.commentCount} + 1` })
        .where(eq(videos.id, data.videoId));
      return [newComment];
    });
    return comment;
  }

  async getVideoComments(videoId: string, limit: number = 50, offset: number = 0): Promise<VideoComment[]> {
    const results = await db
      .select({
        id: videoComments.id,
        videoId: videoComments.videoId,
        userId: videoComments.userId,
        content: videoComments.content,
        parentCommentId: videoComments.parentCommentId,
        likeCount: videoComments.likeCount,
        createdAt: videoComments.createdAt,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(videoComments)
      .innerJoin(users, eq(videoComments.userId, users.id))
      .where(eq(videoComments.videoId, videoId))
      .orderBy(desc(videoComments.createdAt))
      .limit(limit)
      .offset(offset);

    return results as VideoComment[];
  }

  // Spark operations
  async sendSpark(spark: InsertVirtualGift): Promise<VirtualGift> {
    const [newSpark] = await db.insert(virtualGifts).values(spark).returning();
    return newSpark;
  }

  async getSparksForVideo(videoId: string): Promise<VirtualGift[]> {
    return await db
      .select()
      .from(virtualGifts)
      .where(eq(sparks.videoId, videoId))
      .orderBy(desc(sparks.createdAt));
  }

  async getSparksSent(userId: string): Promise<VirtualGift[]> {
    return await db
      .select()
      .from(virtualGifts)
      .where(eq(sparks.senderId, userId))
      .orderBy(desc(sparks.createdAt));
  }

  async getSparksReceived(userId: string): Promise<VirtualGift[]> {
    return await db
      .select()
      .from(virtualGifts)
      .where(eq(sparks.receiverId, userId))
      .orderBy(desc(sparks.createdAt));
  }

  // Message operations
  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId1),
            eq(messages.receiverId, userId2)
          ),
          and(
            eq(messages.senderId, userId2),
            eq(messages.receiverId, userId1)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Transaction operations
  async createTransaction(
    transaction: InsertTransaction
  ): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Moderation operations
  async flagContent(flag: InsertContentFlag): Promise<ContentFlag> {
    const [newFlag] = await db.insert(contentFlags).values(flag).returning();
    return newFlag;
  }

  async getContentFlags(status?: string): Promise<ContentFlag[]> {
    let query = db.select().from(contentFlags);

    if (status) {
      query = query.where(
        eq(contentFlags.status, status as any)
      ) as any;
    }

    return await query.orderBy(desc(contentFlags.createdAt));
  }

  async updateFlagStatus(
    id: string,
    status: "approved" | "rejected",
    reviewedBy: string
  ): Promise<void> {
    await db
      .update(contentFlags)
      .set({
        status: status as any,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(contentFlags.id, id));
  }

  async addUserStrike(strike: InsertUserStrike): Promise<UserStrike> {
    const [newStrike] = await db.insert(userStrikes).values(strike).returning();

    await db
      .update(users)
      .set({ strikeCount: sql`${users.strikeCount} + 1` })
      .where(eq(users.id, strike.userId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, strike.userId));
    if (user && user.strikeCount >= 3) {
      await db
        .update(users)
        .set({ isBanned: true })
        .where(eq(users.id, strike.userId));
    }

    return newStrike;
  }

  async getUserStrikes(userId: string): Promise<UserStrike[]> {
    return await db
      .select()
      .from(userStrikes)
      .where(eq(userStrikes.userId, userId))
      .orderBy(desc(userStrikes.createdAt));
  }

  async getStrikeById(strikeId: string): Promise<UserStrike | undefined> {
    const [strike] = await db
      .select()
      .from(userStrikes)
      .where(eq(userStrikes.id, strikeId));
    return strike;
  }

  async updateStrikeAppeal(
    strikeId: string,
    appeal: {
      appealStatus?: "pending" | "approved" | "rejected";
      appealReason?: string;
      appealReviewedBy?: string;
      appealReviewedAt?: Date;
    }
  ): Promise<void> {
    await db
      .update(userStrikes)
      .set(appeal)
      .where(eq(userStrikes.id, strikeId));
  }

  // User blocking operations (Instagram/TikTok-style)
  async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void> {
    // Check if already blocked
    const existing = await db
      .select()
      .from(blockedUsers)
      .where(and(
        eq(blockedUsers.blockerId, blockerId),
        eq(blockedUsers.blockedId, blockedId)
      ));
    
    if (existing.length === 0) {
      await db.insert(blockedUsers).values({
        blockerId,
        blockedId,
        reason,
      });
    }
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await db
      .delete(blockedUsers)
      .where(and(
        eq(blockedUsers.blockerId, blockerId),
        eq(blockedUsers.blockedId, blockedId)
      ));
  }

  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(blockedUsers)
      .where(and(
        eq(blockedUsers.blockerId, blockerId),
        eq(blockedUsers.blockedId, blockedId)
      ));
    return !!block;
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const blocks = await db
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, userId));
    return blocks.map(b => b.blockedId);
  }

  async getBlockingUsers(userId: string): Promise<string[]> {
    const blocks = await db
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockedId, userId));
    return blocks.map(b => b.blockerId);
  }

  // Plugin operations
  async getPlugins(filters?: { type?: string; status?: string; authorId?: string }): Promise<Plugin[]> {
    let query = db.select().from(plugins);

    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(plugins.type, filters.type as any));
    }
    if (filters?.status) {
      conditions.push(eq(plugins.status, filters.status as any));
    }
    if (filters?.authorId) {
      conditions.push(eq(plugins.authorId, filters.authorId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(plugins.createdAt));
  }

  async getPlugin(id: string): Promise<Plugin | undefined> {
    const [plugin] = await db.select().from(plugins).where(eq(plugins.id, id));
    return plugin;
  }

  async createPlugin(plugin: InsertPlugin): Promise<Plugin> {
    const [newPlugin] = await db.insert(plugins).values(plugin).returning();
    return newPlugin;
  }

  async updatePlugin(id: string, plugin: Partial<InsertPlugin>): Promise<Plugin> {
    const [updated] = await db
      .update(plugins)
      .set({ ...plugin, updatedAt: new Date() })
      .where(eq(plugins.id, id))
      .returning();
    return updated;
  }

  async deletePlugin(id: string): Promise<void> {
    await db.delete(plugins).where(eq(plugins.id, id));
  }

  async installPlugin(install: InsertPluginInstall): Promise<PluginInstall> {
    const [newInstall] = await db.insert(pluginInstalls).values(install).returning();
    
    // Increment download count
    await db
      .update(plugins)
      .set({ downloads: sql`${plugins.downloads} + 1` })
      .where(eq(plugins.id, install.pluginId));
    
    return newInstall;
  }

  async getPluginInstalls(userId: string): Promise<PluginInstall[]> {
    return await db
      .select()
      .from(pluginInstalls)
      .where(eq(pluginInstalls.userId, userId))
      .orderBy(desc(pluginInstalls.installedAt));
  }

  async uninstallPlugin(userId: string, pluginId: string): Promise<void> {
    await db
      .delete(pluginInstalls)
      .where(
        and(
          eq(pluginInstalls.userId, userId),
          eq(pluginInstalls.pluginId, pluginId)
        )
      );
  }

  async createPluginReview(review: InsertPluginReview): Promise<PluginReview> {
    const [newReview] = await db.insert(pluginReviews).values(review).returning();
    
    // Recalculate plugin rating
    const reviews = await db
      .select()
      .from(pluginReviews)
      .where(eq(pluginReviews.pluginId, review.pluginId));
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await db
      .update(plugins)
      .set({
        rating: avgRating.toFixed(2),
        reviewCount: reviews.length,
      })
      .where(eq(plugins.id, review.pluginId));
    
    return newReview;
  }

  async getPluginReviews(pluginId: string): Promise<PluginReview[]> {
    return await db
      .select()
      .from(pluginReviews)
      .where(eq(pluginReviews.pluginId, pluginId))
      .orderBy(desc(pluginReviews.createdAt));
  }

  async createPluginTransaction(transaction: InsertPluginTransaction): Promise<PluginTransaction> {
    const [newTransaction] = await db
      .insert(pluginTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // AI Influencer operations
  async getAIInfluencers(filters?: { creatorId?: string; contentType?: string; isPublic?: boolean }): Promise<AIInfluencer[]> {
    let query = db.select().from(aiInfluencers);

    const conditions = [];
    if (filters?.creatorId) {
      conditions.push(eq(aiInfluencers.creatorId, filters.creatorId));
    }
    if (filters?.contentType) {
      conditions.push(eq(aiInfluencers.contentType, filters.contentType as any));
    }
    if (filters?.isPublic !== undefined) {
      conditions.push(eq(aiInfluencers.isPublic, filters.isPublic));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(aiInfluencers.createdAt));
  }

  async getAIInfluencer(id: string): Promise<AIInfluencer | undefined> {
    const [influencer] = await db.select().from(aiInfluencers).where(eq(aiInfluencers.id, id));
    return influencer;
  }

  async createAIInfluencer(influencer: InsertAIInfluencer): Promise<AIInfluencer> {
    const [newInfluencer] = await db.insert(aiInfluencers).values(influencer).returning();
    return newInfluencer;
  }

  async updateAIInfluencer(id: string, influencer: Partial<InsertAIInfluencer>): Promise<AIInfluencer> {
    const [updated] = await db
      .update(aiInfluencers)
      .set({ ...influencer, updatedAt: new Date() })
      .where(eq(aiInfluencers.id, id))
      .returning();
    return updated;
  }

  async deleteAIInfluencer(id: string): Promise<void> {
    await db.delete(aiInfluencers).where(eq(aiInfluencers.id, id));
  }

  async getAIInfluencerVideos(influencerId: string): Promise<AIInfluencerVideo[]> {
    return await db
      .select()
      .from(aiInfluencerVideos)
      .where(eq(aiInfluencerVideos.influencerId, influencerId))
      .orderBy(desc(aiInfluencerVideos.createdAt));
  }

  async createAIInfluencerVideo(video: InsertAIInfluencerVideo): Promise<AIInfluencerVideo> {
    const [newVideo] = await db.insert(aiInfluencerVideos).values(video).returning();
    
    // Increment video count
    await db
      .update(aiInfluencers)
      .set({ videoCount: sql`${aiInfluencers.videoCount} + 1` })
      .where(eq(aiInfluencers.id, video.influencerId));
    
    return newVideo;
  }

  async updateAIInfluencerVideo(id: string, video: Partial<InsertAIInfluencerVideo>): Promise<AIInfluencerVideo> {
    const [updated] = await db
      .update(aiInfluencerVideos)
      .set(video)
      .where(eq(aiInfluencerVideos.id, id))
      .returning();
    return updated;
  }

  async subscribeToInfluencer(subscription: InsertAIInfluencerSubscription): Promise<AIInfluencerSubscription> {
    const [newSubscription] = await db
      .insert(aiInfluencerSubscriptions)
      .values(subscription)
      .returning();
    
    // Increment subscriber count
    await db
      .update(aiInfluencers)
      .set({ subscriberCount: sql`${aiInfluencers.subscriberCount} + 1` })
      .where(eq(aiInfluencers.id, subscription.influencerId));
    
    return newSubscription;
  }

  async getInfluencerSubscriptions(userId: string): Promise<AIInfluencerSubscription[]> {
    return await db
      .select()
      .from(aiInfluencerSubscriptions)
      .where(eq(aiInfluencerSubscriptions.userId, userId))
      .orderBy(desc(aiInfluencerSubscriptions.createdAt));
  }

  async unsubscribeFromInfluencer(userId: string, influencerId: string): Promise<void> {
    await db
      .update(aiInfluencerSubscriptions)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(aiInfluencerSubscriptions.userId, userId),
          eq(aiInfluencerSubscriptions.influencerId, influencerId)
        )
      );
    
    // Decrement subscriber count
    await db
      .update(aiInfluencers)
      .set({ subscriberCount: sql`${aiInfluencers.subscriberCount} - 1` })
      .where(eq(aiInfluencers.id, influencerId));
  }

  // Invite Code operations
  async createInviteCodes(userId: string, count: number): Promise<InviteCode[]> {
    const codes: InviteCode[] = [];
    for (let i = 0; i < count; i++) {
      const code = this.generateInviteCode();
      const [newCode] = await db
        .insert(inviteCodes)
        .values({
          code,
          creatorId: userId,
          isUsed: false,
        })
        .returning();
      codes.push(newCode);
    }
    return codes;
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // Generate codes between 8-12 characters
    const length = 8 + Math.floor(Math.random() * 5); // Random length from 8-12
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getUserInviteCodes(userId: string): Promise<InviteCode[]> {
    return await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.creatorId, userId))
      .orderBy(desc(inviteCodes.createdAt));
  }

  async validateInviteCode(code: string): Promise<InviteCode | undefined> {
    const [inviteCode] = await db
      .select()
      .from(inviteCodes)
      .where(and(eq(inviteCodes.code, code), eq(inviteCodes.isUsed, false)));
    return inviteCode;
  }

  async useInviteCode(code: string, userId: string): Promise<void> {
    // Use transaction with pessimistic locking to prevent race conditions
    await db.transaction(async (tx) => {
      // PESSIMISTIC LOCK: Lock the row for update to prevent concurrent access
      const [inviteCode] = await tx
        .select()
        .from(inviteCodes)
        .where(and(eq(inviteCodes.code, code), eq(inviteCodes.isUsed, false)))
        .for('update'); // <-- CRITICAL: Pessimistic lock prevents race conditions

      if (!inviteCode) {
        throw new Error("Invalid or already used invite code");
      }

      // CRITICAL: Prevent self-redemption exploit
      if (inviteCode.creatorId === userId) {
        throw new Error("You cannot use your own invite code");
      }

      // Check if user has already redeemed any invite code
      const [existingInvite] = await tx
        .select()
        .from(userInvites)
        .where(eq(userInvites.inviteeId, userId))
        .limit(1);

      if (existingInvite) {
        throw new Error("You have already used an invite code");
      }

      // Mark code as used
      await tx
        .update(inviteCodes)
        .set({
          isUsed: true,
          usedBy: userId,
          usedAt: new Date(),
        })
        .where(eq(inviteCodes.id, inviteCode.id));

      // Create invite tracking record
      const [invite] = await tx
        .insert(userInvites)
        .values({
          inviterId: inviteCode.creatorId,
          inviteeId: userId,
          inviteCodeId: inviteCode.id,
          bonusCreditsAwarded: 100,
        })
        .returning();

      // Award bonus credits to inviter
      await tx
        .update(users)
        .set({ 
          bonusCredits: sql`${users.bonusCredits} + ${invite.bonusCreditsAwarded}` 
        })
        .where(eq(users.id, inviteCode.creatorId));
    });
  }

  async getUserInvites(userId: string): Promise<UserInvite[]> {
    return await db
      .select()
      .from(userInvites)
      .where(eq(userInvites.inviterId, userId))
      .orderBy(desc(userInvites.createdAt));
  }

  async getInviteStats(userId: string): Promise<{
    totalInvites: number;
    usedCodes: number;
    unusedCodes: number;
    bonusCreditsEarned: number;
  }> {
    // Get all codes for user
    const userCodes = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.creatorId, userId));

    const usedCodes = userCodes.filter((c) => c.isUsed).length;
    const unusedCodes = userCodes.filter((c) => !c.isUsed).length;

    // Get all invites
    const invites = await db
      .select()
      .from(userInvites)
      .where(eq(userInvites.inviterId, userId));

    const bonusCreditsEarned = invites.reduce(
      (sum, invite) => sum + invite.bonusCreditsAwarded,
      0
    );

    return {
      totalInvites: invites.length,
      usedCodes,
      unusedCodes,
      bonusCreditsEarned,
    };
  }

  async getAvailableInviteCode(): Promise<InviteCode | undefined> {
    const [code] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.isUsed, false))
      .orderBy(desc(inviteCodes.createdAt))
      .limit(1);
    return code;
  }

  // Platform Statistics
  async getTotalUsers(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users);
    return result[0]?.count || 0;
  }

  async getTotalVideos(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(videos);
    return result[0]?.count || 0;
  }

  async getActiveCreators(): Promise<number> {
    // Active creators are users who have posted at least one video
    const result = await db
      .selectDistinct({ userId: videos.userId })
      .from(videos);
    return result.length;
  }

  // updateUser implementation
  async updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Premium Username Marketplace operations
  async getPremiumUsernames(filters?: { tier?: string; status?: string; search?: string }): Promise<PremiumUsername[]> {
    let query = db.select().from(premiumUsernames).$dynamic();
    
    const conditions = [];
    if (filters?.tier) {
      conditions.push(eq(premiumUsernames.tier, filters.tier as any));
    }
    if (filters?.status) {
      conditions.push(eq(premiumUsernames.status, filters.status as any));
    }
    if (filters?.search) {
      conditions.push(sql`${premiumUsernames.username} ILIKE ${'%' + filters.search + '%'}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(premiumUsernames.createdAt));
  }

  async getPremiumUsername(id: string): Promise<PremiumUsername | undefined> {
    const [username] = await db
      .select()
      .from(premiumUsernames)
      .where(eq(premiumUsernames.id, id));
    return username;
  }

  async getPremiumUsernameByName(username: string): Promise<PremiumUsername | undefined> {
    const [result] = await db
      .select()
      .from(premiumUsernames)
      .where(eq(premiumUsernames.username, username));
    return result;
  }

  async purchaseUsername(userId: string, usernameId: string): Promise<UsernamePurchase> {
    return await db.transaction(async (tx) => {
      // Get username details
      const [username] = await tx
        .select()
        .from(premiumUsernames)
        .where(eq(premiumUsernames.id, usernameId));
      
      if (!username) throw new Error("Username not found");
      if (username.status !== "available") throw new Error("Username not available");
      
      // Get user
      const [user] = await tx.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error("User not found");
      
      // Check credits
      const finalPrice = username.currentBidCredits || username.priceCredits;
      if (user.credits < finalPrice) {
        throw new Error("Insufficient credits");
      }
      
      // Deduct credits
      await tx
        .update(users)
        .set({ credits: user.credits - finalPrice })
        .where(eq(users.id, userId));
      
      // Mark username as purchased
      await tx
        .update(premiumUsernames)
        .set({ status: "purchased", ownerId: userId, purchasedAt: new Date() })
        .where(eq(premiumUsernames.id, usernameId));
      
      // Create purchase record
      const [purchase] = await tx
        .insert(usernamePurchases)
        .values({
          usernameId,
          buyerId: userId,
          priceCredits: finalPrice,
          paymentProvider: "payoneer", // Default payment provider
        })
        .returning();
      
      // Update user's username
      await tx
        .update(users)
        .set({ username: username.username })
        .where(eq(users.id, userId));
      
      return purchase;
    });
  }

  async placeBid(usernameId: string, userId: string, bidAmount: number): Promise<PremiumUsername> {
    return await db.transaction(async (tx) => {
      const [username] = await tx
        .select()
        .from(premiumUsernames)
        .where(eq(premiumUsernames.id, usernameId));
      
      if (!username) throw new Error("Username not found");
      if (username.status !== "auction") throw new Error("Not an auction");
      if (username.auctionEndDate && username.auctionEndDate < new Date()) {
        throw new Error("Auction expired");
      }
      
      // Verify bid is higher than current bid or starting price
      const currentBid = username.currentBidCredits || username.priceCredits;
      if (bidAmount <= currentBid) {
        throw new Error("Bid must be higher than current bid");
      }
      
      // Update username with new bid
      const [updated] = await tx
        .update(premiumUsernames)
        .set({
          currentBidCredits: bidAmount,
          currentBidderId: userId,
        })
        .where(eq(premiumUsernames.id, usernameId))
        .returning();
      
      return updated;
    });
  }

  // Conversation operations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Get all conversation IDs user is part of
    const memberRecords = await db
      .select()
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, userId));
    
    if (memberRecords.length === 0) return [];
    
    const conversationIds = memberRecords.map(m => m.conversationId);
    
    // Get full conversation details
    return await db
      .select()
      .from(conversations)
      .where(sql`${conversations.id} = ANY(${conversationIds})`)
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: { creatorId: string; name?: string; isGroup: boolean; participantIds: string[] }): Promise<Conversation> {
    return await db.transaction(async (tx) => {
      // Create conversation
      const [newConversation] = await tx
        .insert(conversations)
        .values({
          creatorId: conversation.creatorId,
          name: conversation.name,
          isGroup: conversation.isGroup,
        })
        .returning();
      
      // Add all participants as members
      const allParticipants = [conversation.creatorId, ...conversation.participantIds];
      const uniqueParticipants = Array.from(new Set(allParticipants));
      
      await tx.insert(conversationMembers).values(
        uniqueParticipants.map(userId => ({
          conversationId: newConversation.id,
          userId,
        }))
      );
      
      return newConversation;
    });
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async sendConversationMessage(message: { conversationId: string; senderId: string; content: string; messageType: string }): Promise<Message> {
    return await db.transaction(async (tx) => {
      // Insert message
      const [newMessage] = await tx
        .insert(messages)
        .values({
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType as any,
        })
        .returning();
      
      // Update conversation's updatedAt
      await tx
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, message.conversationId));
      
      return newMessage;
    });
  }

  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    // Find existing 1:1 conversation between these two users
    const existingConversations = await db
      .select({
        conversation: conversations,
      })
      .from(conversations)
      .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
      .where(
        and(
          eq(conversations.isGroup, false),
          eq(conversationMembers.userId, userId1)
        )
      );

    // Check if any of these conversations also has userId2 as a member
    for (const conv of existingConversations) {
      const members = await db
        .select()
        .from(conversationMembers)
        .where(eq(conversationMembers.conversationId, conv.conversation.id));
      
      const memberIds = members.map(m => m.userId);
      if (memberIds.includes(userId2) && memberIds.length === 2) {
        return conv.conversation;
      }
    }

    // No existing conversation found, create new one
    return await this.createConversation({
      creatorId: userId1,
      isGroup: false,
      participantIds: [userId2],
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Mark all messages in this conversation as read where user is NOT the sender
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${userId}`,
          eq(messages.isRead, false)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    // Get all conversation IDs user is part of
    const memberRecords = await db
      .select()
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, userId));
    
    if (memberRecords.length === 0) return 0;
    
    const conversationIds = memberRecords.map(m => m.conversationId);
    
    // Count unread messages in these conversations where user is NOT the sender
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(
        and(
          sql`${messages.conversationId} = ANY(${conversationIds})`,
          sql`${messages.senderId} != ${userId}`,
          eq(messages.isRead, false)
        )
      );
    
    return result[0]?.count || 0;
  }

  async getConversationMembers(conversationId: string): Promise<User[]> {
    // Join conversationMembers with users to get full user data
    const result = await db
      .select({
        user: users,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(eq(conversationMembers.conversationId, conversationId));
    
    return result.map(r => r.user);
  }

  // WebRTC Call operations
  async createCallSession(call: InsertCallSession): Promise<CallSession> {
    return await db.transaction(async (tx) => {
      // Create call session
      const [session] = await tx
        .insert(callSessions)
        .values(call)
        .returning();
      
      // Add initiator as participant
      await tx.insert(callParticipants).values({
        callId: session.id,
        userId: call.initiatorId,
        wasAnswered: true,
      });
      
      return session;
    });
  }

  async addCallParticipant(participant: InsertCallParticipant): Promise<CallParticipant> {
    const [newParticipant] = await db
      .insert(callParticipants)
      .values(participant)
      .returning();
    return newParticipant;
  }

  async answerCall(callId: string, userId: string): Promise<CallSession> {
    return await db.transaction(async (tx) => {
      // Update call status to active
      const [session] = await tx
        .update(callSessions)
        .set({ status: "active", startedAt: new Date() })
        .where(eq(callSessions.id, callId))
        .returning();
      
      // Mark participant as answered
      await tx
        .update(callParticipants)
        .set({ wasAnswered: true, joinedAt: new Date() })
        .where(and(
          eq(callParticipants.callId, callId),
          eq(callParticipants.userId, userId)
        ));
      
      return session;
    });
  }

  async endCall(callId: string): Promise<CallSession> {
    return await db.transaction(async (tx) => {
      const [session] = await tx.select().from(callSessions).where(eq(callSessions.id, callId));
      if (!session) throw new Error("Call not found");
      
      const endedAt = new Date();
      const duration = session.startedAt 
        ? Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000)
        : 0;
      
      // Update call status
      const [updated] = await tx
        .update(callSessions)
        .set({ status: "ended", endedAt, duration })
        .where(eq(callSessions.id, callId))
        .returning();
      
      // Mark all participants as left
      await tx
        .update(callParticipants)
        .set({ leftAt: endedAt })
        .where(and(
          eq(callParticipants.callId, callId),
          sql`${callParticipants.leftAt} IS NULL`
        ));
      
      return updated;
    });
  }

  async getCallHistory(userId: string): Promise<CallSession[]> {
    // Get all calls where user was a participant
    const participantRecords = await db
      .select()
      .from(callParticipants)
      .where(eq(callParticipants.userId, userId));
    
    if (participantRecords.length === 0) return [];
    
    const callIds = participantRecords.map(p => p.callId);
    
    return await db
      .select()
      .from(callSessions)
      .where(sql`${callSessions.id} = ANY(${callIds})`)
      .orderBy(desc(callSessions.createdAt));
  }

  // Legal Agreement operations
  async createUserLegalAgreement(agreement: InsertUserLegalAgreement): Promise<UserLegalAgreement> {
    const [newAgreement] = await db
      .insert(userLegalAgreements)
      .values(agreement)
      .returning();
    return newAgreement;
  }

  // Premium Model Subscriptions
  async subscribeToPremiumModel(
    subscriberId: string,
    creatorId: string,
    tier: "basic" | "vip" | "innerCircle",
    amountCents: number
  ): Promise<PremiumSubscription> {
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

    const [subscription] = await db
      .insert(premiumSubscriptions)
      .values({
        subscriberId,
        creatorId,
        tier,
        amountCents,
        status: "active",
        nextBillingDate,
      })
      .returning();
    return subscription;
  }

  async getPremiumModels(): Promise<User[]> {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        bio: users.bio,
        dateOfBirth: users.dateOfBirth,
        subscriptionTier: users.subscriptionTier,
        credits: users.credits,
        walletBalance: users.walletBalance,
        ageVerified: users.ageVerified,
        ageRating: users.ageRating,
        isAdmin: users.isAdmin,
        isBanned: users.isBanned,
        strikeCount: users.strikeCount,
        followerCount: users.followerCount,
        followingCount: users.followingCount,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        paypalCustomerId: users.paypalCustomerId,
        paypalSubscriptionId: users.paypalSubscriptionId,
        phoneNumber: users.phoneNumber,
        phoneVerified: users.phoneVerified,
        isPrivate: users.isPrivate,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
      .where(eq(creatorProfiles.isPremiumCreator, true));
    return results;
  }

  async getMyPremiumSubscriptions(subscriberId: string): Promise<PremiumSubscription[]> {
    return await db
      .select()
      .from(premiumSubscriptions)
      .where(eq(premiumSubscriptions.subscriberId, subscriberId))
      .orderBy(desc(premiumSubscriptions.createdAt));
  }

  // Private Sessions
  async startPrivateSession(modelId: string, creditsPerMinute: number): Promise<PrivateSession> {
    const [session] = await db
      .insert(privateSessions)
      .values({
        modelId,
        creditsPerMinute,
        status: "active",
        startedAt: new Date(),
      })
      .returning();
    return session;
  }

  async joinPrivateSession(sessionId: string, viewerId: string): Promise<PrivateSessionViewer> {
    const [viewer] = await db
      .insert(privateSessionViewers)
      .values({
        sessionId,
        viewerId,
        joinedAt: new Date(),
      })
      .returning();
    return viewer;
  }

  async endPrivateSession(sessionId: string, modelId: string): Promise<void> {
    await db
      .update(privateSessions)
      .set({
        status: "ended",
        endedAt: new Date(),
      })
      .where(
        and(
          eq(privateSessions.id, sessionId),
          eq(privateSessions.modelId, modelId)
        )
      );
  }

  async getActivePrivateSession(modelId: string): Promise<PrivateSession | null> {
    const [session] = await db
      .select()
      .from(privateSessions)
      .where(
        and(
          eq(privateSessions.modelId, modelId),
          eq(privateSessions.status, "active")
        )
      )
      .limit(1);
    return session || null;
  }

  // Toy Control
  async sendSparkWithToyControl(
    viewerId: string,
    modelId: string,
    sparkType: "glow" | "blaze" | "stardust" | "rocket" | "galaxy" | "supernova" | "infinity" | "royalty" | "godmode" | "pinkSand" | "seaGlass" | "longtail" | "coralReef" | "lighthouse" | "gombey" | "moonGate" | "islandParadise" | "bermudaTriangle" | "heart" | "rose" | "loveWave" | "bouquet" | "cupid" | "loveStorm" | "diamondRing" | "loveBomb" | "dollar" | "gold" | "sportsCar" | "yacht" | "jet" | "mansion" | "island" | "empire" | "butterfly" | "sunflower" | "dolphin" | "eagle" | "peacock" | "phoenix" | "dragon" | "unicorn" | "confetti" | "fireworks" | "spotlight" | "aura" | "portal" | "starfall" | "aurora" | "godRay" | "controller" | "trophy" | "headset" | "arcade" | "victory" | "champion" | "legendary" | "esports" | "gamerGod" | "worldChamp" | "music" | "microphone" | "guitar" | "vinyl" | "dj" | "concert" | "rockstar" | "superstar" | "legend" | "hallOfFame" | "coffee" | "pizza" | "burger" | "sushi" | "champagne" | "cake" | "feast" | "caviar" | "truffle" | "goldSteak" | "soccer" | "basketball" | "medal" | "podium" | "goldMedal" | "stadium" | "mvp" | "goat" | "olympian" | "worldRecord" | "throne" | "castle" | "scepter" | "jewels" | "galaxyCrown" | "immortal" | "titan" | "deity" | "cosmos" | "universe",
    intensity: number,
    durationSeconds: number
  ): Promise<ToyControlEvent> {
    return await db.transaction(async (tx) => {
      // Calculate credit cost
      const creditsSpent = intensity * durationSeconds; // Simple calculation

      // Insert toy control event
      const [event] = await tx
        .insert(toyControlEvents)
        .values({
          viewerId,
          modelId,
          sparkType,
          intensity,
          durationSeconds,
          creditsSpent,
        })
        .returning();

      // Deduct credits from viewer
      await tx
        .update(users)
        .set({ credits: sql`${users.credits} - ${creditsSpent}` })
        .where(eq(users.id, viewerId));

      return event;
    });
  }

  // Twilio Video operations
  async createTwilioRoom(data: InsertTwilioVideoRoom): Promise<TwilioVideoRoom> {
    const [room] = await db
      .insert(twilioVideoRooms)
      .values(data)
      .returning();
    return room;
  }

  async getTwilioRoom(id: string): Promise<TwilioVideoRoom | undefined> {
    const [room] = await db
      .select()
      .from(twilioVideoRooms)
      .where(eq(twilioVideoRooms.id, id));
    return room;
  }

  async addTwilioParticipant(data: InsertTwilioRoomParticipant): Promise<TwilioRoomParticipant> {
    const [participant] = await db
      .insert(twilioRoomParticipants)
      .values(data)
      .returning();
    return participant;
  }

  async endTwilioRoom(id: string): Promise<void> {
    const [room] = await db
      .select()
      .from(twilioVideoRooms)
      .where(eq(twilioVideoRooms.id, id));

    if (!room) {
      throw new Error("Room not found");
    }

    const endedAt = new Date();
    const duration = room.startedAt 
      ? Math.floor((endedAt.getTime() - room.startedAt.getTime()) / 1000)
      : 0;

    await db
      .update(twilioVideoRooms)
      .set({
        status: "ended",
        endedAt,
        duration,
      })
      .where(eq(twilioVideoRooms.id, id));
  }

  async getActiveTwilioRooms(): Promise<TwilioVideoRoom[]> {
    return await db
      .select()
      .from(twilioVideoRooms)
      .where(eq(twilioVideoRooms.status, "active"))
      .orderBy(desc(twilioVideoRooms.createdAt));
  }

  async removeTwilioParticipant(roomId: string, userId: string): Promise<void> {
    const endedAt = new Date();
    
    const [participant] = await db
      .select()
      .from(twilioRoomParticipants)
      .where(
        and(
          eq(twilioRoomParticipants.roomId, roomId),
          eq(twilioRoomParticipants.userId, userId)
        )
      )
      .limit(1);

    if (!participant) {
      throw new Error("Participant not found");
    }

    const totalDuration = participant.joinedAt
      ? Math.floor((endedAt.getTime() - participant.joinedAt.getTime()) / 1000)
      : 0;

    await db
      .update(twilioRoomParticipants)
      .set({
        leftAt: endedAt,
        totalDuration,
      })
      .where(eq(twilioRoomParticipants.id, participant.id));
  }

  // Phone Verification operations
  async createPhoneVerification(phoneNumber: string, code: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await db.insert(phoneVerifications).values({
      phoneNumber,
      code,
      expiresAt,
      verified: false,
    });
  }

  async getPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification | null> {
    const [result] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.phoneNumber, phoneNumber),
          eq(phoneVerifications.code, code),
          eq(phoneVerifications.verified, false),
          gt(phoneVerifications.expiresAt, new Date())
        )
      )
      .limit(1);
    return result || null;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);
    return user || null;
  }

  async updateUserPhoneNumber(userId: string, phoneNumber: string): Promise<void> {
    await db
      .update(users)
      .set({ phoneNumber, phoneVerified: true })
      .where(eq(users.id, userId));
  }

  // Email Verification operations
  async createEmailVerification(email: string, code: string): Promise<void> {
    await db.insert(emailVerifications).values({
      email: email.toLowerCase(),
      code,
    });
  }

  async getEmailVerification(email: string, code: string): Promise<{ email: string; code: string; createdAt: Date } | null> {
    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, email.toLowerCase()));
    
    if (!verification) return null;
    
    // Check if expired (10 minutes)
    const now = new Date();
    const createdAt = verification.createdAt || new Date();
    const age = (now.getTime() - createdAt.getTime()) / 1000 / 60;
    
    if (age > 10) {
      await db.delete(emailVerifications).where(eq(emailVerifications.email, email.toLowerCase()));
      return null;
    }
    
    // Check if code matches
    if (verification.code !== code) {
      return null;
    }
    
    return {
      email: verification.email,
      code: verification.code,
      createdAt,
    };
  }

  async deleteEmailVerification(email: string): Promise<void> {
    await db.delete(emailVerifications).where(eq(emailVerifications.email, email.toLowerCase()));
  }

  // ============================================================================
  // KUSH THE RASTA MONKEY - Support Bot Operations 🐵
  // ============================================================================

  async searchFAQs(query: string): Promise<any[]> {
    // Simple keyword search in FAQs
    try {
      const searchPattern = `%${query.toLowerCase()}%`;
      const results = await db.execute(sql`
        SELECT * FROM faqs 
        WHERE is_published = true 
        AND (LOWER(question) LIKE ${searchPattern} OR LOWER(answer) LIKE ${searchPattern})
        LIMIT 3
      `);
      return results.rows || [];
    } catch (error) {
      console.error("searchFAQs error:", error);
      return [];
    }
  }

  async saveBotSession(session: any): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO bot_chat_sessions (user_id, messages, message_count, resolved, escalated_to_ticket)
        VALUES (${session.userId}, ${JSON.stringify(session.messages)}, ${session.messageCount}, ${session.resolved}, ${session.escalatedToTicket})
      `);
    } catch (error) {
      console.error("saveBotSession error:", error);
    }
  }

  async incrementFAQSearch(faqId: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE faqs SET search_count = search_count + 1 WHERE id = ${faqId}
      `);
    } catch (error) {
      console.error("incrementFAQSearch error:", error);
    }
  }

  async createSupportTicket(ticket: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO support_tickets (user_id, subject, category, priority, status, bot_conversation, bot_escalation_reason)
        VALUES (${ticket.userId}, ${ticket.subject}, ${ticket.category}, ${ticket.priority}, ${ticket.status}, ${JSON.stringify(ticket.botConversation || [])}, ${ticket.botEscalationReason})
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error("createSupportTicket error:", error);
      throw error;
    }
  }

  async markSessionEscalated(sessionId: string, ticketId: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE bot_chat_sessions 
        SET escalated_to_ticket = true, ticket_id = ${ticketId}
        WHERE id = ${sessionId}
      `);
    } catch (error) {
      console.error("markSessionEscalated error:", error);
    }
  }

  // ============================================================================
  // GDPR COMPLIANCE - Data Export & Account Deletion
  // ============================================================================

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
      userVideos,
      userProjects,
      userConversations,
      userMessages,
      sparksGiven,
      sparksReceived,
      userTransactions,
      userSubscriptions,
      userFollows,
      userFollowers,
      userInviteCodes,
      userInvitesData,
      userCreatorProfile,
      userAiInfluencers,
      userMarketingBots,
      userCampaigns,
      userSocialConnections,
      userLegalAgreementsData,
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
      db.select().from(virtualGifts).where(eq(sparks.senderId, userId)),
      
      // Sparks (gifts) received
      db.select().from(virtualGifts).where(eq(sparks.recipientId, userId)),
      
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
    const totalSpent = userTransactions.reduce(
      (sum, tx) => sum + (tx.amount ? parseFloat(tx.amount.toString()) : 0),
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
        totalVideos: userVideos.length,
        totalProjects: userProjects.length,
        totalFollowers: userFollowers.length,
        totalFollowing: userFollows.length,
        totalSparksGiven: sparksGiven.length,
        totalSparksReceived: sparksReceived.length,
        totalEarnings: totalEarnings,
        totalSpent: totalSpent,
        totalInvitesSent: userInvitesData.filter(inv => inv.inviterId === userId).length,
      },
      content: {
        videos: userVideos.map(v => ({
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
        projects: userProjects.map(p => ({
          id: p.id,
          name: p.name,
          language: p.language,
          files: p.files,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      },
      social: {
        following: userFollows.map(f => ({
          userId: f.followingId,
          followedAt: f.createdAt,
        })),
        followers: userFollowers.map(f => ({
          userId: f.followerId,
          followedAt: f.createdAt,
        })),
        conversations: userConversations.length,
        messagesSent: userMessages.length,
      },
      financial: {
        walletBalance: user.walletBalance,
        totalEarnings: totalEarnings,
        totalSpent: totalSpent,
        transactions: userTransactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          status: t.status,
          description: t.description,
          provider: t.provider,
          createdAt: t.createdAt,
        })),
        subscriptions: userSubscriptions.map(s => ({
          id: s.id,
          tier: s.tier,
          status: s.status,
          currentPeriodStart: s.currentPeriodStart,
          currentPeriodEnd: s.currentPeriodEnd,
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
        profile: userCreatorProfile || null,
        aiInfluencers: userAiInfluencers.map(ai => ({
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
        bots: userMarketingBots.map(bot => ({
          id: bot.id,
          name: bot.name,
          type: bot.type,
          isActive: bot.isActive,
          createdAt: bot.createdAt,
        })),
        campaigns: userCampaigns.map(camp => ({
          id: camp.id,
          name: camp.name,
          platform: camp.platform,
          status: camp.status,
          createdAt: camp.createdAt,
        })),
      },
      invites: {
        codesCreated: userInviteCodes.map(code => ({
          code: code.code,
          isUsed: code.isUsed,
          usedBy: code.usedBy,
          usedAt: code.usedAt,
          createdAt: code.createdAt,
        })),
        invitesSent: userInvitesData.filter(inv => inv.inviterId === userId).length,
        invitesReceived: userInvitesData.filter(inv => inv.inviteeId === userId).length,
      },
      legal: {
        agreements: userLegalAgreementsData.map(agreement => ({
          agreementType: agreement.agreementType,
          version: agreement.version,
          acceptedAt: agreement.acceptedAt,
        })),
      },
      socialConnections: userSocialConnections.map(conn => ({
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
      await db.delete(virtualGifts).where(eq(sparks.senderId, userId));
      await db.delete(virtualGifts).where(eq(sparks.recipientId, userId));
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
        await db.delete(virtualGifts).where(eq(sparks.videoId, video.id));
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
      await db.delete(followRequests).where(eq(followRequests.requesterId, userId));
      await db.delete(followRequests).where(eq(followRequests.targetId, userId));
      
      // 6. Delete financial data
      await db.delete(transactions).where(eq(transactions.userId, userId));
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
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
      if (user.phoneNumber) {
        await db.delete(phoneVerifications).where(eq(phoneVerifications.phoneNumber, user.phoneNumber));
      }
      if (user.email) {
        await db.delete(emailVerifications).where(eq(emailVerifications.email, user.email));
      }
      
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
      
      // 18. Delete call sessions and participants
      await db.delete(callParticipants).where(eq(callParticipants.userId, userId));
      await db.delete(callSessions).where(eq(callSessions.hostId, userId));
      
      // 19. Delete private sessions
      await db.delete(privateSessionViewers).where(eq(privateSessionViewers.viewerId, userId));
      await db.delete(privateSessions).where(eq(privateSessions.modelId, userId));
      
      // 20. Delete Twilio video room data
      const userTwilioRooms = await db.select().from(twilioVideoRooms).where(eq(twilioVideoRooms.hostId, userId));
      for (const room of userTwilioRooms) {
        await db.delete(twilioRoomParticipants).where(eq(twilioRoomParticipants.roomId, room.id));
      }
      await db.delete(twilioVideoRooms).where(eq(twilioVideoRooms.hostId, userId));
      await db.delete(twilioRoomParticipants).where(eq(twilioRoomParticipants.userId, userId));
      
      // 21. Delete username purchases and premium usernames
      await db.delete(usernamePurchases).where(eq(usernamePurchases.buyerId, userId));
      
      // 22. Delete plugin transactions
      await db.delete(pluginTransactions).where(eq(pluginTransactions.userId, userId));
      
      // 23. Delete toy control events
      await db.delete(toyControlEvents).where(eq(toyControlEvents.viewerId, userId));
      await db.delete(toyControlEvents).where(eq(toyControlEvents.modelId, userId));
      
      // 24. Finally, delete the user record itself
      await db.delete(users).where(eq(users.id, userId));
      
      console.log(`✅ GDPR DELETION: Successfully deleted all data for user ${userId}`);
    } catch (error: any) {
      console.error(`❌ GDPR DELETION FAILED for user ${userId}:`, error);
      throw new Error(`Failed to delete user account: ${error.message}`);
    }
  }

  // TikTok Live Battle operations
  async createBattle(battle: any): Promise<any> {
    const [newBattle] = await db.insert(battleChallenges).values({
      challengerId: battle.creatorId,
      challengedId: battle.opponentId,
      title: "TikTok Live Battle",
      battleType: "solo",
      expiresAt: new Date(Date.now() + 3600000),
    }).returning();
    return newBattle;
  }

  async getBattle(battleId: number): Promise<any | undefined> {
    const [battle] = await db.select().from(battleChallenges).where(eq(battleChallenges.id, String(battleId)));
    return battle;
  }

  async getActiveBattles(): Promise<any[]> {
    return await db.select().from(battleChallenges).where(eq(battleChallenges.status, "accepted")).limit(10);
  }

  async updateBattleScore(battleId: number, isCreator: boolean, points: number, multiplier: number): Promise<void> {
    await db.update(battleSpeedMultipliers).set({
      multiplier: String(multiplier),
      updatedAt: new Date(),
    }).where(eq(battleSpeedMultipliers.battleId, String(battleId)));
  }

  async endBattle(battleId: number): Promise<any> {
    await db.update(battleChallenges).set({
      status: "expired",
    }).where(eq(battleChallenges.id, String(battleId)));
    return { fragments: Math.random() > 0.5 ? 25 : -10 };
  }

  async getBattleRankings(limit: number = 10): Promise<any[]> {
    return await db.select().from(dailyRankings).orderBy(desc(dailyRankings.diamondsEarned)).limit(limit);
  }

  async getUserGifterLevel(userId: string): Promise<number> {
    const [level] = await db.select().from(gifterLevels).where(eq(gifterLevels.userId, userId));
    return level?.currentLevel || 1;
  }

  async updateUserGifterLevel(userId: string, increment: number): Promise<void> {
    const [existing] = await db.select().from(gifterLevels).where(eq(gifterLevels.userId, userId));
    if (existing) {
      await db.update(gifterLevels).set({ currentLevel: existing.currentLevel + increment }).where(eq(gifterLevels.userId, userId));
    } else {
      await db.insert(gifterLevels).values({ userId, currentLevel: 1 });
    }
  }

  // CRM Integration Methods (placeholder until tables are created)
  async createCrmConnection(data: any) {
    return { id: 'temp', ...data };
  }

  async getCrmConnectionsByUser(userId: string) {
    return [];
  }

  async deleteCrmConnection(connectionId: string, userId: string) {
    return;
  }
}

export const storage = new DatabaseStorage();
