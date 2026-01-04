import { Express, Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated?.() || req.session?.userId || (req as any).user) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  next();
}

export async function registerRoutes(app: Express) {
  
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    const userId = req.session?.userId || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/master-login", async (req: Request, res: Response) => {
    const { accessCode } = req.body;
    const masterCode = process.env.MASTER_ACCESS_CODE || "PROFITHACK2025MASTER";
    
    if (accessCode === masterCode) {
      req.session.userId = 1;
      req.session.isAdmin = true;
      res.json({ success: true, message: "Admin access granted" });
    } else {
      res.status(401).json({ error: "Invalid access code" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/videos", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const videos = await storage.getVideos(limit, offset);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/feed", async (req: Request, res: Response) => {
    try {
      const videos = await storage.getVideos(20, 0);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feed" });
    }
  });

  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    try {
      const video = await storage.getVideoById(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  app.post("/api/videos", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId || (req as any).user?.id;
      const video = await storage.createVideo({
        ...req.body,
        userId,
      });
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  app.get("/api/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId || (req as any).user?.id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:conversationId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages(parseInt(req.params.conversationId));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId || (req as any).user?.id;
      const message = await storage.createMessage({
        ...req.body,
        senderId: userId,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/wallet", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId || (req as any).user?.id;
      const user = await storage.getUser(userId);
      res.json({
        balance: user?.credits || 0,
        bonusCredits: user?.bonusCredits || 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId || (req as any).user?.id;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/paypal/create-subscription", isAuthenticated, async (req: Request, res: Response) => {
    res.json({
      subscriptionId: "MOCK-PAYPAL-" + Date.now(),
      approvalUrl: "https://sandbox.paypal.com/approve",
      status: "PENDING",
    });
  });

  app.post("/api/stripe/create-checkout-session", isAuthenticated, async (req: Request, res: Response) => {
    res.json({
      sessionId: "cs_test_" + Date.now(),
      url: "https://checkout.stripe.com/test",
      status: "created",
    });
  });

  app.post("/api/crypto/init-checkout", isAuthenticated, async (req: Request, res: Response) => {
    res.json({
      paymentId: "CRYPTO-" + Date.now(),
      payAddress: "0x1234567890abcdef",
      status: "waiting",
    });
  });

  app.post("/api/square/init-checkout", isAuthenticated, async (req: Request, res: Response) => {
    res.json({
      checkoutId: "sq_" + Date.now(),
      checkoutUrl: "https://squareup.com/checkout",
      status: "created",
    });
  });

  app.post("/api/ton/init-checkout", isAuthenticated, async (req: Request, res: Response) => {
    res.json({
      paymentId: "TON-" + Date.now(),
      walletAddress: "EQ...",
      amount: req.body.amount,
      status: "pending",
    });
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...publicUser } = user as any;
      res.json(publicUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/profile/:username", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...publicUser } = user as any;
      res.json(publicUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  console.log("✅ API routes registered (bootstrap mode)");
  console.log("   Full routes will be loaded after setup completes");
}

export { registerRoutes as default };
// --- NEW ROUTES: USER PROFILE & CREDITS ---

// Get current user's profile, including tier and credits
router.get('/user/profile', async (req, res) => {
  // Assuming you have authentication middleware that sets req.user
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const userProfile = await db.select({
      id: users.id,
      username: users.username,
      subscriptionTier: users.subscriptionTier,
      credits: users.credits,
      affiliateStatus: users.affiliateStatus,
    }).from(users).where(eq(users.id, req.user.id)).limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reset daily credits if needed
    const currentCredits = await resetDailyCreditsIfNeeded(req.user.id);
    userProfile[0].credits = currentCredits;

    res.json(userProfile[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});
// --- NEW ROUTES: AI TOOLS ---

// Generate an ad script using our AI router
router.post('/tools/generate-ad-script', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { productDescription, targetAudience, platform } = req.body;

  if (!productDescription || !targetAudience || !platform) {
    return res.status(400).json({ error: 'Missing required fields: productDescription, targetAudience, platform' });
  }

  const cost = 10; // Cost in credits for this tool

  try {
    const canAfford = await hasCredits(req.user.id, cost);
    if (!canAfford) {
      return res.status(402).json({ error: 'Insufficient credits' }); // 402 Payment Required
    }
    await deductCredits(req.user.id, cost);

    const prompt = `Generate a compelling, viral-ready ad script for the following product.
    Product: ${productDescription}
    Target Audience: ${platform} users interested in ${targetAudience}
    Platform: ${platform}
    The script should be short, punchy, and include a strong call to action.`;

    const messages = [{ role: 'user', content: prompt }];
    const response = await callAI('text_fast', messages);

    res.json({ script: response.content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate ad script' });
  }
});
// --- NEW ROUTES: ACADEMY ---

// Generate a practice question for the Google Ads Challenge
router.post('/academy/generate-question', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // We can make this cost credits if we want, but for now, let's make it free to encourage usage
    const prompt = "Generate a multiple-choice question for the Google Ads certification exam. Provide 4 options (A, B, C, D) and clearly indicate the correct answer. The question should be about Google Search Ads best practices.";
    const messages = [{ role: 'user', content: prompt }];
    const response = await callAI('text_balanced', messages);
    res.json({ question: response.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Submit a completed challenge to earn credits/rewards
router.post('/academy/complete-challenge', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { challengeId, score } = req.body; // e.g., { challengeId: 'google-ads-01', score: 95 }

  if (score >= 90) {
    const reward = 50; // Reward credits for a high score
    await addCredits(req.user.id, reward);
    // You could also update their 'affiliateStatus' to 'approved' here
    res.json({ message: 'Challenge completed! You earned 50 credits.', reward });
  } else {
    res.json({ message: 'Challenge completed. A score of 90 or higher is required to earn rewards.' });
  }
});
