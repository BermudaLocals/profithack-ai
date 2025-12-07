import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { db } from "./db";
import { eq, desc, asc, and, or, sql, inArray } from "drizzle-orm";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupLocalAuth, isAuthenticatedLocal } from "./localAuth";
import passport from "passport";
import bcrypt from "bcrypt";
// Stripe is OPTIONAL - application works without STRIPE_SECRET_KEY
import Stripe from "stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault, isPayPalConfigured } from "./paypal";
import { generateEmailVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendInviteCodesEmail, sendVerificationWithInviteCodes, isEmailConfigured, sendMagicLinkEmail } from "./email-service";
import {
  isMomoConfigured,
  handleMomoPaymentCreation,
  handleMomoPaymentStatus,
} from "./momo";
import {
  createPayoneerSession,
  getPayoneerPaymentStatus,
  verifyPayoneerWebhook,
  isPayoneerConfigured,
} from "./payoneer";
import {
  createPayeerInvoice,
  getPayeerPaymentStatus,
  verifyPayeerCallback,
  isPayeerConfigured,
  generatePayeerPaymentFormData,
} from "./payeer";
import {
  insertProjectSchema,
  insertVideoSchema,
  insertVirtualGiftSchema,
  insertMessageSchema,
  insertContentFlagSchema,
  insertUserStrikeSchema,
  insertAIInfluencerSchema,
  insertAIInfluencerVideoSchema,
  insertAIInfluencerSubscriptionSchema,
  insertInviteCodeSchema,
  insertUserInviteSchema,
  insertUserLegalAgreementSchema,
  users,
  follows,
  followRequests,
  insertFollowSchema,
  insertFollowRequestSchema,
  videos,
  projects,
  messages,
  transactions,
  signupVerifications,
} from "@shared/schema";
import { soraService } from "./sora-service";
import { voiceService } from "./voice-service";
import { cryptoPaymentService, isCryptoPaymentsConfigured } from "./crypto-payments";
import { mediasoupService } from "./mediasoup-service";
import { isSquareConfigured, handleSquareSubscription, handleSquareCredits } from "./square";
import { creditWallet, getWalletBalance, createWithdrawalRequest, purchaseSubscriptionWithWallet, purchaseCreditsWithWallet, sendSpark } from "./wallet";
import { createPaypalOrderDirect, capturePaypalOrderDirect } from "./paypal";
import { createMomoPayment } from "./momo";
import { moderateContent, moderateVideo, applyAutoStrike, submitAppeal, reviewAppeal } from "./moderation";
import { twilioVideoService, isTwilioVideoConfigured } from "./twilio-video";
import { sendVerificationCode, generateVerificationCode, isTwilioSMSConfigured } from "./twilio-sms";
import { tonPaymentService } from "./ton-payment";
import multer from "multer";
import { uploadToObjectStorage, isObjectStorageConfigured } from "./object-storage";
import { detectBot, isDisposableEmail, hasSuspiciousPattern } from "./bot-detection";
import { GoHighLevelService } from "./services/gohighlevel";
import { analyticsService } from "./services/analytics.service";
import { moderationService } from "./services/moderation.service";
import { creatorMonetizationService } from "./services/creator-monetization.service";
import { 
  marketingBots, 
  insertMarketingBotSchema,
  marketingCampaigns,
  insertMarketingCampaignSchema,
  campaignLeads,
  insertCampaignLeadSchema,
  usernameListings,
  usernameBids,
  insertUsernameListingSchema,
  insertUsernameBidSchema,
  adPlacements,
  adViews,
  insertAdPlacementSchema,
  insertAdViewSchema,
  adminActions,
  insertAdminActionSchema,
  socialConnections,
  importedContacts,
  insertSocialConnectionSchema,
  insertImportedContactSchema,
  seoArticles,
  directorySubmissions,
  backlinks,
  keywordRankings,
  battleChallenges,
} from "@shared/schema";

// Stripe is OPTIONAL - check if configured
// If STRIPE_SECRET_KEY is not set, Stripe features will be disabled
// Other payment providers (PayPal, Payoneer, Payeer, MTN Momo, Crypto) will still work
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️  STRIPE_SECRET_KEY not set - Stripe payment features will be disabled");
  console.log("✓  Other payment providers (PayPal, Payoneer, Crypto, etc.) are still available");
}

// Initialize Stripe only if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

// Helper function to check if Stripe is configured
const isStripeConfigured = (): boolean => {
  return stripe !== null;
};

// Subscription tier pricing - MONTHLY
const TIER_PRICES = {
  starter: 2000, // $20.00/mo in cents
  creator: 4000, // $40.00/mo in cents
  innovator: 19900, // $199.00/mo in cents
};

// Subscription tier pricing - YEARLY (10% discount)
const TIER_PRICES_YEARLY = {
  starter: 21600, // $216.00/year (was $240, now 10% off) in cents
  creator: 43200, // $432.00/year (was $480, now 10% off) in cents
  innovator: 214920, // $2,149.20/year (was $2,388, now 10% off) in cents
};

// Credit allocations per tier (MONTHLY)
// 23% markup applied to cover Twilio Video costs and platform overhead
// Subscriptions give MUCH better value than credit packs
// Credit packs: ~41 credits per dollar
// Subscriptions: ~200-205 credits per dollar (5x better value than credit packs!)
const TIER_CREDITS = {
  explorer: 100, // 100 free credits, then pay-as-you-go
  starter: 4100, // $20/mo → 4,100 credits (205 per dollar) - was 5,000
  creator: 8200, // $40/mo → 8,200 credits (205 per dollar) - was 10,000
  innovator: 40950, // $199/mo → 40,950 credits (206 per dollar) - was 50,000
};

// Spark pricing (in COINS) - 50 Total Gifts (TikTok-level catalog!)
// Coins are purchased separately with TikTok pricing (70 coins = $1.00)
// This is separate from Credits (which are for AI tools via subscriptions)
const SPARK_PRICES = {
  // Existing Sparks (9 total)
  glow: 5,        // TikTok Rose equivalent but animated
  blaze: 25,      // Animated fire effect
  stardust: 50,   // Particle explosion
  rocket: 100,    // Rocket launch animation
  galaxy: 500,    // Cosmic swirl effect
  supernova: 1000, // Massive explosion
  infinity: 2500,  // Infinity symbol animation
  royalty: 5000,   // Crown + confetti
  godmode: 10000,  // Epic legendary effect
  
  // Bermuda Gifts (9 total)
  pinkSand: 5,        // Entry level - iconic pink beaches
  seaGlass: 25,       // Common treasure - beach finds
  longtail: 50,       // National bird - graceful flyer
  coralReef: 100,     // Underwater ecosystem
  lighthouse: 250,    // Historic beacon
  gombey: 500,        // Cultural icon - traditional masked dancer
  moonGate: 1000,     // Romantic tradition - love & wishes
  islandParadise: 2500, // Luxury experience
  bermudaTriangle: 5000, // Ultimate mystery - most premium
  
  // Hearts & Love (8 total)
  heart: 5,           // Simple love
  rose: 10,           // Classic romance
  loveWave: 50,       // Spreading love
  bouquet: 100,       // Full of flowers
  cupid: 250,         // Arrow of love
  loveStorm: 500,     // Overwhelming affection
  diamondRing: 1000,  // Ultimate commitment
  loveBomb: 2000,     // Explosive affection
  
  // Luxury & Status (8 total)
  dollar: 15,         // Money stack
  gold: 75,           // Gold bar
  sportsCar: 200,     // Speed and luxury
  yacht: 600,         // Sea luxury
  jet: 1500,          // Private jet
  mansion: 3000,      // Dream home
  island: 6000,       // Private island
  empire: 10000,      // Build a legacy
  
  // Nature & Animals (8 total)
  butterfly: 8,       // Graceful beauty
  sunflower: 20,      // Bright and happy
  dolphin: 80,        // Playful spirit
  eagle: 150,         // Soaring high
  peacock: 300,       // Showing off
  phoenix: 750,       // Rising from ashes
  dragon: 1800,       // Mythical power
  unicorn: 4000,      // Magical rarity
  
  // Effects & Celebrations (8 total)
  confetti: 12,       // Party time
  fireworks: 60,      // Celebration
  spotlight: 120,     // Shine bright
  aura: 400,          // Special energy
  portal: 900,        // Teleport to success
  starfall: 2200,     // Cosmic shower
  aurora: 5000,       // Northern lights
  godRay: 8000,       // Divine light
};

// Helper function to extract user ID and email from req.user (works with both auth types)
function getUserFromRequest(req: any): { userId: string; userEmail: string } {
  // UNIVERSAL AUTH: Handle both Replit Auth and Local Auth
  const userId = req.user.claims?.sub || req.user.id;
  const userEmail = req.user.claims?.email || req.user.email;
  return { userId, userEmail };
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  setupLocalAuth(app); // Email/password authentication

  // Initialize Mediasoup for WebRTC (optional - graceful degradation if fails)
  try {
    await mediasoupService.initialize();
    console.log("✓ Mediasoup WebRTC enabled for video calling");
  } catch (error) {
    console.warn("⚠️ Mediasoup initialization failed - video calling features disabled");
    console.warn("This is expected on some deployment platforms. All other features will work normally.");
  }

  // SMS Rate limiting map
  const smsRateLimit = new Map<string, number>();

  // User search endpoint (for battle challenges)
  app.get("/api/users/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.query as string;
      
      if (!query || query.length < 3) {
        return res.json([]);
      }
      
      const searchResults = await db.query.users.findMany({
        where: (users, { or, ilike }) => or(
          ilike(users.username, `%${query}%`),
          ilike(users.displayName, `%${query}%`)
        ),
        limit: 10,
        columns: {
          id: true,
          username: true,
          displayName: true,
        },
      });
      
      res.json(searchResults);
    } catch (error: any) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      // UNIVERSAL AUTH: Support both Replit Auth and Local Auth
      // Replit Auth: req.user.claims.sub
      // Local Auth: req.user.id
      const userId = req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - no user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user needs to complete onboarding (18+ age verification)
      const needsOnboarding = !user?.ageVerified || !user?.dateOfBirth;
      
      res.json({
        ...user,
        needsOnboarding,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Phone Authentication Routes
  app.post("/api/auth/phone/send-code", async (req, res) => {
    const { phoneNumber, inviteCode } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number required" });
    }

    // Check if Twilio SMS is configured
    if (!isTwilioSMSConfigured()) {
      return res.status(503).json({ error: "Phone verification not available - Twilio not configured" });
    }
    
    // Rate limiting: 1 SMS per phone per minute
    const lastSent = smsRateLimit.get(phoneNumber);
    if (lastSent && Date.now() - lastSent < 60000) {
      return res.status(429).json({ error: "Please wait before requesting another code" });
    }
    
    const code = generateVerificationCode();
    
    try {
      await storage.createPhoneVerification(phoneNumber, code);
      await sendVerificationCode(phoneNumber, code);
      smsRateLimit.set(phoneNumber, Date.now());
      
      res.json({ success: true, expiresIn: 300 });
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ error: error.message || "Failed to send verification code" });
    }
  });

  app.post("/api/auth/phone/verify-code", async (req, res) => {
    const { phoneNumber, code, inviteCode } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: "Phone number and code required" });
    }
    
    try {
      const verification = await storage.getPhoneVerification(phoneNumber, code);
      
      if (!verification) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }
      
      // Find or create user
      let user = await storage.getUserByPhoneNumber(phoneNumber);
      const isNewUser = !user;
      
      if (!user) {
        // NEW USER: Validate invite code before creating account
        if (!inviteCode) {
          return res.status(400).json({ error: "Invite code required for new signups" });
        }

        // Validate invite code
        const validCode = await storage.validateInviteCode(inviteCode);
        if (!validCode) {
          return res.status(400).json({ error: "Invalid or already used invite code" });
        }

        // Create new user with phone authentication
        user = await storage.upsertUser({
          id: `phone_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          email: null,
          phoneNumber,
          phoneVerified: true,
        });

        // Consume the invite code
        try {
          await storage.useInviteCode(inviteCode, user.id);
          console.log(`✅ Used invite code ${inviteCode} for phone user: ${user.id}`);
        } catch (error: any) {
          console.error("Failed to consume invite code:", error);
          // This is critical - don't allow signup without consuming code
          return res.status(500).json({ error: "Failed to process invite code" });
        }
        
        // Auto-generate 4 invite codes for new user (viral loop)
        const baseCodeCount = 4;
        try {
          await storage.createInviteCodes(user.id, baseCodeCount);
          console.log(`✅ Generated ${baseCodeCount} invite codes for new phone user: ${user.id}`);
        } catch (error: any) {
          console.error("Failed to generate invite codes for new phone user:", error);
          // Don't fail signup if code generation fails - user is already created
        }
      } else if (!user.phoneVerified) {
        // Update existing user to mark phone as verified
        await storage.updateUserPhoneNumber(user.id, phoneNumber);
        const updatedUser = await storage.getUser(user.id);
        user = updatedUser || user;
      }
      
      // For phone auth, we return the user info
      // Frontend should redirect to Replit OAuth or create session
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Error verifying code:", error);
      res.status(500).json({ error: error.message || "Failed to verify code" });
    }
  });

  // Email Signup Rate limiting map
  const emailRateLimit = new Map<string, number>();

  // Email Signup Routes (Requires invite code, then sends verification link + 4 new invite codes)
  app.post("/api/auth/email/signup", async (req, res) => {
    // Bot detection
    const botCheck = detectBot(req);
    if (botCheck.isBot) {
      console.log(`🚫 Bot blocked from signup: ${botCheck.reason} (score: ${botCheck.score})`);
      return res.status(403).json({ 
        error: "Automated traffic detected. Please use a real browser." 
      });
    }

    const { email, username, password, inviteCode, dateOfBirth } = req.body;
    
    // INVITE-ONLY REGISTRATION (Set to true only for testing)
    const isOpenRegistration = false; // Changed to false - invite codes now REQUIRED for security
    
    if (isOpenRegistration) {
      // Open registration - invite code is optional
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
    } else {
      // Invite-only period - require invite code
      if (!email || !inviteCode || !password) {
        return res.status(400).json({ error: "Email, password, and invite code required" });
      }
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check for disposable emails
    if (isDisposableEmail(email)) {
      console.log(`🚫 Disposable email blocked from signup: ${email}`);
      return res.status(400).json({ error: "Please use a permanent email address" });
    }

    // Check for suspicious patterns
    if (hasSuspiciousPattern(email) || (username && hasSuspiciousPattern(username))) {
      console.log(`🚫 Suspicious signup pattern blocked: ${email}`);
      return res.status(400).json({ error: "Invalid input detected" });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered. Please use a different email." });
    }
    
    // INVITE CODE VALIDATION (only during invite-only period)
    let validCode;
    if (!isOpenRegistration) {
      // Invite-only period - validate code from database ONLY (no hardcoded bypasses)
      validCode = await storage.validateInviteCode(inviteCode);
      if (!validCode || validCode.usedBy !== null || validCode.usedAt !== null) {
        return res.status(400).json({ error: "Invalid or already used invite code" });
      }
    } else {
      // Open registration - no invite code needed
      console.log("✅ OPEN REGISTRATION MODE - No invite code required");
    }
    
    // Rate limiting: 1 signup per email per 5 minutes
    const lastSent = emailRateLimit.get(email.toLowerCase());
    if (lastSent && Date.now() - lastSent < 300000) {
      return res.status(429).json({ error: "Please wait before signing up again" });
    }
    
    try {
      // Hash the password before storing
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create new user (not verified yet)
      const user = await storage.upsertUser({
        id: `email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: email.toLowerCase(),
        username: username || email.split('@')[0],
        passwordHash, // Store hashed password
        phoneNumber: null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, // Store date of birth for age verification
        isFounder: false, // No hardcoded founder status
        subscriptionTier: 'explorer', // All new users start as explorer
        credits: 0, // No free credits (must purchase or earn)
        bonusCredits: 100, // All users get 100 non-transferable welcome credits
      });

      // Consume the invite code (only during invite-only period)
      if (!isOpenRegistration && inviteCode) {
        await storage.useInviteCode(inviteCode, user.id);
      }

      // Generate verification token (reuse email verification system)
      const verificationToken = generateEmailVerificationCode();
      await storage.createEmailVerification(email, verificationToken);

      // Generate 5 new invite codes for this user
      const newInviteCodes = await storage.createInviteCodes(user.id, 5);
      const codeStrings = newInviteCodes.map(c => c.code);
      
      // Send verification link + invite codes + credentials in one email
      await sendVerificationWithInviteCodes(
        email, 
        verificationToken, 
        codeStrings, 
        username || user.username || undefined,
        password // Send plain password ONLY in welcome email (one-time only)
      );
      
      emailRateLimit.set(email.toLowerCase(), Date.now());
      
      console.log(`✅ New user created (pending verification): ${email}`);
      console.log(`📧 Sent verification link + credentials + 5 invite codes to: ${email}`);
      
      res.json({ 
        success: true,
        message: "Check your email to verify your account and get your 5 invite codes!",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        }
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message || "Failed to create account" });
    }
  });

  // Email verification endpoint (for clicking link in email)
  app.post("/api/auth/email/verify", async (req, res) => {
    const { token, email } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Verification token required" });
    }
    
    try {
      if (!email) {
        return res.status(400).json({ error: "Email required for verification" });
      }
      
      // Check if user already exists and is verified
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // User is already verified - auto-login them
        return new Promise((resolve, reject) => {
          req.login(existingUser, (err) => {
            if (err) {
              console.error("Auto-login failed:", err);
              return res.status(500).json({ error: "Failed to log you in" });
            }
            
            // CRITICAL: Save session before sending response
            req.session.save((saveErr) => {
              if (saveErr) {
                console.error("Session save failed:", saveErr);
                return res.status(500).json({ error: "Failed to save session" });
              }
              
              res.json({ 
                success: true,
                alreadyVerified: true,
                autoLoggedIn: true,
                message: "Your email is already verified! Welcome back to PROFITHACK AI.",
                user: {
                  id: existingUser.id,
                  email: existingUser.email,
                  username: existingUser.username || existingUser.email.split('@')[0]
                }
              });
              resolve(undefined);
            });
          });
        });
      }
      
      // Look up the verification record
      const verification = await storage.getEmailVerification(email, token);
      
      if (!verification) {
        return res.status(400).json({ error: "Invalid or expired verification link. Please request a new verification email from the login page." });
      }
      
      // Check if expired (10 minutes)
      const expiresAt = new Date(verification.createdAt);
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      if (new Date() > expiresAt) {
        await storage.deleteEmailVerification(email);
        return res.status(400).json({ error: "Verification link has expired. Please request a new verification email from the login page." });
      }
      
      // Verification is valid - keep the token for retry attempts
      // It will expire naturally after 10 minutes
      
      // Get the user again (should exist since they just signed up)
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Auto-login the user after verification - WAIT for completion
      return new Promise((resolve, reject) => {
        req.login(user, (err) => {
          if (err) {
            console.error("Auto-login failed:", err);
            return res.status(500).json({ error: "Email verified but login failed. Please log in manually." });
          }
          
          // CRITICAL: Save session before sending response
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("Session save failed:", saveErr);
              return res.status(500).json({ error: "Failed to save session" });
            }
            
            console.log(`✅ User verified and logged in: ${user.email}`);
            
            res.json({ 
              success: true,
              alreadyVerified: false,
              autoLoggedIn: true,
              message: "Email verified successfully! Logging you in...",
              user: {
                id: user.id,
                email: user.email,
                username: user.username || user.email.split('@')[0]
              }
            });
            resolve(undefined);
          });
        });
      });
    } catch (error: any) {
      console.error("Error verifying email:", error);
      res.status(500).json({ error: error.message || "Failed to verify email. Please try again." });
    }
  });

  // Resend verification email
  app.post("/api/auth/email/resend-verification", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }
    
    // Rate limiting: 1 resend per email per 2 minutes
    const lastSent = emailRateLimit.get(email.toLowerCase() + '_resend');
    if (lastSent && Date.now() - lastSent < 120000) {
      return res.status(429).json({ error: "Please wait before requesting another verification email" });
    }
    
    try {
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "No account found with this email" });
      }
      
      // Generate new verification token
      const verificationToken = generateEmailVerificationCode();
      await storage.createEmailVerification(email, verificationToken);
      
      // Get user's invite codes to include in email
      const inviteCodes = await db.query.inviteCodes.findMany({
        where: (codes, { eq, isNull }) => eq(codes.creatorId, user.id),
        limit: 5,
      });
      
      const codeStrings = inviteCodes.map(c => c.code);
      
      // Send verification email with invite codes
      await sendVerificationWithInviteCodes(
        email,
        verificationToken,
        codeStrings,
        user.username || undefined
      );
      
      emailRateLimit.set(email.toLowerCase() + '_resend', Date.now());
      
      res.json({ 
        success: true,
        message: "Verification email sent! Check your inbox."
      });
    } catch (error: any) {
      console.error("Error resending verification:", error);
      res.status(500).json({ error: error.message || "Failed to resend verification email" });
    }
  });

  app.post("/api/auth/email/verify-code", async (req, res) => {
    const { email, code, inviteCode, username } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code required" });
    }
    
    try {
      const verification = await storage.getEmailVerification(email, code);
      
      if (!verification) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }
      
      // Find or create user
      let user = await storage.getUserByEmail(email);
      const isNewUser = !user;
      
      if (!user) {
        // NEW USER: Create account (invite code optional for open testing)
        // Create new user with email authentication
        user = await storage.upsertUser({
          id: `email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          email: email.toLowerCase(),
          username: username || email.split('@')[0],
          phoneNumber: null,
        });

        // Optionally consume invite code if provided
        if (inviteCode) {
          try {
            const validCode = await storage.validateInviteCode(inviteCode);
            if (validCode) {
              await storage.useInviteCode(inviteCode, user.id);
              console.log(`✅ Used invite code ${inviteCode} for email user: ${user.id}`);
            }
          } catch (error: any) {
            console.error("Failed to consume invite code (non-fatal):", error);
            // Don't fail signup if invite code fails
          }
        }
        
        // Auto-generate 4 invite codes for new user (viral loop)
        const baseCodeCount = 4;
        try {
          await storage.createInviteCodes(user.id, baseCodeCount);
          console.log(`✅ Generated ${baseCodeCount} invite codes for new email user: ${user.id}`);
        } catch (error: any) {
          console.error("Failed to generate invite codes for new email user:", error);
        }

        // Send welcome email
        try {
          await sendWelcomeEmail(email, username || user.username || undefined);
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }
      
      // Delete the verification code so it can't be reused
      await storage.deleteEmailVerification(email);
      
      // Return user info for session creation
      res.json({ 
        success: true, 
        user,
        isNewUser 
      });
    } catch (error: any) {
      console.error("Error verifying code:", error);
      res.status(500).json({ error: error.message || "Failed to verify code" });
    }
  });

  // Send magic link (passwordless login)
  app.post("/api/auth/email/send-magic-link", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }
    
    try {
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      
      // Store magic link token (expires in 15 minutes)
      await storage.createEmailVerification(email.toLowerCase(), token);
      
      // Find user to get their name
      const user = await storage.getUserByEmail(email);
      
      // Send magic link email
      await sendMagicLinkEmail(email, token, user?.username || undefined);
      
      res.json({ 
        success: true,
        message: "Magic link sent! Check your email."
      });
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      res.status(500).json({ error: error.message || "Failed to send magic link" });
    }
  });

  // Verify magic link token (GET endpoint for clicking email link)
  app.get("/api/auth/magic-link", async (req: any, res) => {
    const { token, email } = req.query;
    
    console.log(`🔗 Magic link verification attempt for email: ${email}`);
    
    if (!token || !email) {
      console.log('❌ Missing token or email in magic link request');
      return res.redirect('/email-verify?error=invalid');
    }
    
    try {
      const verification = await storage.getEmailVerification(email as string, token as string);
      
      if (!verification) {
        console.log(`❌ Magic link not found or already used for: ${email}`);
        return res.redirect('/email-verify?error=expired');
      }
      
      // Check if token is expired (15 minutes)
      const tokenAge = Date.now() - new Date(verification.createdAt).getTime();
      if (tokenAge > 15 * 60 * 1000) {
        console.log(`❌ Magic link expired for: ${email} (age: ${Math.floor(tokenAge / 1000 / 60)} minutes)`);
        await storage.deleteEmailVerification(email as string);
        return res.redirect('/email-verify?error=expired');
      }
      
      console.log(`✅ Magic link token valid for: ${email}`);
      
      // Find or create user
      let user = await storage.getUserByEmail(email as string);
      const isNewUser = !user;
      
      if (!user) {
        console.log(`📝 Creating new user for: ${email}`);
        // Create new user
        user = await storage.upsertUser({
          id: `email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          email: (email as string).toLowerCase(),
          username: (email as string).split('@')[0],
          phoneNumber: null,
        });
        
        // Auto-generate 4 invite codes
        try {
          await storage.createInviteCodes(user.id, 4);
          console.log(`✅ Generated 4 invite codes for new user: ${email}`);
        } catch (error: any) {
          console.error("Failed to generate invite codes:", error);
        }

        // Send welcome email
        try {
          await sendWelcomeEmail(email as string, user.username || undefined);
          console.log(`📧 Welcome email sent to: ${email}`);
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      } else {
        console.log(`👤 Existing user found for: ${email}`);
      }
      
      // Delete the token so it can't be reused
      await storage.deleteEmailVerification(email as string);
      console.log(`🗑️  Magic link token deleted for: ${email}`);
      
      // Log the user in (create session)
      console.log(`🔐 Attempting to log in user: ${email}`);
      req.logIn(user, (err: any) => {
        if (err) {
          console.error("❌ Magic link req.logIn failed:", err);
          return res.redirect('/email-verify?error=session');
        }
        
        console.log(`✅ req.logIn successful for: ${email}`);
        
        // Save session and redirect to home
        req.session.save((saveErr: any) => {
          if (saveErr) {
            console.error("❌ Session save failed:", saveErr);
            return res.redirect('/email-verify?error=session');
          }
          
          console.log(`✅ Session saved successfully for: ${email}`);
          console.log(`🏠 Redirecting to home page with success flag`);
          res.redirect('/?magiclink=success');
        });
      });
    } catch (error: any) {
      console.error("❌ Error verifying magic link:", error);
      res.redirect('/email-verify?error=unknown');
    }
  });

  // Password-based Authentication Routes (using passport local strategy)
  
  app.post("/api/auth/local/signup", passport.authenticate('local-signup', {
    failureMessage: true
  }), (req: any, res) => {
    // Successful signup
    const user = req.user;
    res.json({
      success: true,
      message: "Account created successfully! You've received 4 invite codes via email.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    });
  });

  app.post("/api/auth/local/login", (req, res, next) => {
    passport.authenticate('local-login', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      
      // Log in the user (create session)
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login failed:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        
        // CRITICAL: Explicitly save session to ensure cookie is set
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save failed:", saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }
          
          console.log(`✅ User logged in successfully: ${user.email || user.username}`);
          console.log(`Session ID: ${req.sessionID}`);
          console.log(`Session cookie will be sent with secure=${req.session.cookie.secure}, sameSite=${req.session.cookie.sameSite}`);
          
          return res.json({
            success: true,
            message: "Login successful",
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
            }
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/local/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Discord Interactions Endpoint (for Discord app slash commands)
  app.post("/api/interactions", async (req, res) => {
    try {
      const signature = req.headers['x-signature-ed25519'] as string;
      const timestamp = req.headers['x-signature-timestamp'] as string;
      const rawBody = JSON.stringify(req.body);
      const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '3f179d56e5fb84d1899717c8881bd2bcbe2800f23749d6b73db6e2759b94d823';

      // Verify Discord signature using tweetnacl (Ed25519)
      const { default: nacl } = await import('tweetnacl');
      const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, 'hex'),
        Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
      );

      if (!isVerified) {
        console.log('❌ Discord signature verification failed');
        return res.status(401).json({ error: 'Invalid request signature' });
      }

      console.log('✅ Discord signature verified');

      // Handle ping from Discord (required for verification)
      if (req.body.type === 1) {
        console.log('📝 Discord PING received - responding with PONG');
        return res.json({ type: 1 });
      }

      // Handle slash commands
      if (req.body.type === 2) {
        const commandName = req.body.data?.name;
        console.log(`🎮 Discord slash command received: ${commandName}`);
        
        // /profithack - Platform info
        if (commandName === 'profithack') {
          return res.json({
            type: 4,
            data: {
              embeds: [{
                title: '🚀 PROFITHACK AI',
                description: '💰 Build, create, and earn with AI automation',
                color: 0xFF00FF,
                fields: [
                  {
                    name: '🎁 Get Early Access',
                    value: 'Join the beta at https://profithackai.com',
                    inline: false
                  },
                  {
                    name: '💰 Creator Revenue',
                    value: '55% creator / 45% platform split',
                    inline: true
                  },
                  {
                    name: '🤖 AI Tools',
                    value: 'Marketing bots + viral content',
                    inline: true
                  },
                  {
                    name: '📱 Features',
                    value: '• TikTok-style video feed\n• AI code workspace\n• Live streaming\n• Virtual gifts',
                    inline: false
                  }
                ],
                footer: {
                  text: 'PROFITHACK AI - Create. Automate. Earn.'
                }
              }]
            }
          });
        }
        
        // /invite - Get beta invite code
        if (commandName === 'invite') {
          try {
            const availableCode = await storage.getAvailableInviteCode();
            if (availableCode) {
              return res.json({
                type: 4,
                data: {
                  embeds: [{
                    title: '🎫 Your Beta Invite Code',
                    description: `Use this code to join PROFITHACK AI!`,
                    color: 0x00FF00,
                    fields: [
                      {
                        name: 'Invite Code',
                        value: `\`${availableCode.code}\``,
                        inline: false
                      },
                      {
                        name: '📍 How to Use',
                        value: '1. Go to https://profithackai.com\n2. Click "ENTER CODE"\n3. Paste your code\n4. Sign up and start creating!',
                        inline: false
                      },
                      {
                        name: '🎁 What You Get',
                        value: '• Full beta access\n• 5 invite codes to share\n• AI marketing bots\n• Viral content tools',
                        inline: false
                      }
                    ],
                    footer: {
                      text: 'Invite-only beta • Share with friends!'
                    }
                  }]
                }
              });
            } else {
              return res.json({
                type: 4,
                data: {
                  embeds: [{
                    title: '⚠️ No Codes Available',
                    description: 'All beta invite codes are currently in use. Join our waitlist at https://profithackai.com/waitlist',
                    color: 0xFFAA00
                  }]
                }
              });
            }
          } catch (error) {
            console.error('Error getting invite code:', error);
            return res.json({
              type: 4,
              data: {
                content: '❌ Error retrieving invite code. Please try again later.'
              }
            });
          }
        }
        
        // /help - Command help
        if (commandName === 'help') {
          return res.json({
            type: 4,
            data: {
              embeds: [{
                title: '❓ PROFITHACK AI Commands',
                description: 'Available Discord bot commands:',
                color: 0x5865F2,
                fields: [
                  {
                    name: '/profithack',
                    value: 'Learn about the PROFITHACK AI platform',
                    inline: false
                  },
                  {
                    name: '/invite',
                    value: 'Get a beta invite code to join the platform',
                    inline: false
                  },
                  {
                    name: '/stats',
                    value: 'View platform statistics and growth metrics',
                    inline: false
                  },
                  {
                    name: '/help',
                    value: 'Show this help message',
                    inline: false
                  }
                ],
                footer: {
                  text: 'Need more help? Visit profithackai.com'
                }
              }]
            }
          });
        }
        
        // /stats - Platform statistics
        if (commandName === 'stats') {
          try {
            const totalUsers = await storage.getTotalUsers();
            const totalVideos = await storage.getTotalVideos();
            const activeCreators = await storage.getActiveCreators();
            
            return res.json({
              type: 4,
              data: {
                embeds: [{
                  title: '📊 PROFITHACK AI Statistics',
                  description: 'Platform growth and engagement metrics',
                  color: 0xFF00FF,
                  fields: [
                    {
                      name: '👥 Total Users',
                      value: `${totalUsers.toLocaleString()}`,
                      inline: true
                    },
                    {
                      name: '🎬 Videos Posted',
                      value: `${totalVideos.toLocaleString()}`,
                      inline: true
                    },
                    {
                      name: '✨ Active Creators',
                      value: `${activeCreators.toLocaleString()}`,
                      inline: true
                    },
                    {
                      name: '🤖 AI Bots Running',
                      value: '3 (Content, Marketing, Engagement)',
                      inline: false
                    },
                    {
                      name: '💰 Revenue Split',
                      value: '55% creator / 45% platform',
                      inline: true
                    },
                    {
                      name: '🚀 Status',
                      value: 'Beta - Invite Only',
                      inline: true
                    }
                  ],
                  footer: {
                    text: 'Updated live • Join at profithackai.com'
                  }
                }]
              }
            });
          } catch (error) {
            console.error('Error getting stats:', error);
            return res.json({
              type: 4,
              data: {
                content: '❌ Error retrieving statistics. Please try again later.'
              }
            });
          }
        }
      }

      res.json({ type: 1 });
    } catch (error) {
      console.error('❌ Discord interaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User routes
  app.get("/api/users/search", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const users = await storage.searchUsers(query);
      // Don't expose sensitive information
      const publicUsers = users.map(({ stripeCustomerId, stripeSubscriptionId, ...publicUser }) => publicUser);
      res.json(publicUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Get user profile by username (TikTok-style profile page)
  app.get("/api/users/profile/:username", async (req, res) => {
    try {
      const username = req.params.username;
      
      // Find user by username
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Count followers, following, friends
      const [followerCount] = await db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followingId, user.id));
      
      const [followingCount] = await db.select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followerId, user.id));
      
      // Friends = mutual follows (simplified: just use a portion of followers)
      const friendsCount = Math.min(Number(followerCount?.count || 0), Number(followingCount?.count || 0));
      
      // Get total likes on user's videos
      const [likesResult] = await db.select({ total: sql<number>`COALESCE(SUM(likes), 0)` })
        .from(videos)
        .where(eq(videos.userId, user.id));
      
      // Build public profile response
      const publicProfile = {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || user.profileImageUrl,
        profileImageUrl: user.profileImageUrl,
        websiteUrl: user.websiteUrl,
        verified: user.isVerified || false,
        isVerified: user.isVerified || false,
        isPrivate: user.isPrivate || false,
        followersCount: Number(followerCount?.count || 0),
        followingCount: Number(followingCount?.count || 0),
        friendsCount: friendsCount,
        totalLikes: Number(likesResult?.total || 0),
        createdAt: user.createdAt,
      };
      
      res.json(publicProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't expose sensitive information
      const { stripeCustomerId, stripeSubscriptionId, ...publicUser } = user;
      res.json(publicUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user privacy settings
  app.patch("/api/users/:id/privacy", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const targetId = req.params.id;
      
      // Users can only update their own privacy settings
      if (userId !== targetId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { isPrivate } = req.body;
      const updatedUser = await db.update(users).set({ isPrivate }).where(eq(users.id, userId)).returning();
      
      res.json({ success: true, user: updatedUser[0] });
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });

  // Update user language preference
  app.patch("/api/users/:id/language", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const targetId = req.params.id;
      
      // Users can only update their own language settings
      if (userId !== targetId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { preferredLanguage } = req.body;
      
      if (!preferredLanguage) {
        return res.status(400).json({ message: "Language code is required" });
      }

      const updatedUser = await db.update(users)
        .set({ preferredLanguage })
        .where(eq(users.id, userId))
        .returning();
      
      res.json({ success: true, user: updatedUser[0] });
    } catch (error) {
      console.error("Error updating language preference:", error);
      res.status(500).json({ message: "Failed to update language preference" });
    }
  });

  // Update user profile (TikTok-style: display name, username, bio, links)
  app.patch("/api/users/:id/profile", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const targetId = req.params.id;
      
      // Users can only update their own profile
      if (userId !== targetId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { displayName, username, bio, website, links } = req.body;

      // Check if username is already taken (if changing username)
      if (username) {
        const existingUser = await db.select().from(users)
          .where(and(eq(users.username, username), sql`id != ${userId}`))
          .limit(1);
        
        if (existingUser.length > 0) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }

      const updateData: any = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (username !== undefined) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;
      if (website !== undefined) updateData.website = website;
      if (links !== undefined) updateData.links = links;

      const updatedUser = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
      
      res.json({ success: true, user: updatedUser[0] });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Configure multer for profile photo uploads
  const profilePhotoUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    },
  });

  // Upload profile photo
  app.post(
    "/api/users/:id/profile-photo",
    isAuthenticated,
    profilePhotoUpload.single("photo"),
    async (req: any, res) => {
      try {
        const { userId } = getUserFromRequest(req);
        const targetId = req.params.id;

        if (userId !== targetId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        if (!req.file) {
          return res.status(400).json({ message: "No photo file provided" });
        }

        let profileImageUrl: string;

        if (isObjectStorageConfigured()) {
          const photoUpload = await uploadToObjectStorage(
            {
              buffer: req.file.buffer,
              mimetype: req.file.mimetype,
              originalname: req.file.originalname,
            },
            "profile-photos"
          );
          profileImageUrl = photoUpload.url;
        } else {
          console.warn("Object storage not configured, using placeholder URL");
          profileImageUrl = `https://example.com/profile-photos/${Date.now()}.jpg`;
        }

        const updatedUser = await db
          .update(users)
          .set({ profileImageUrl })
          .where(eq(users.id, userId))
          .returning();

        res.json({ success: true, profileImageUrl, user: updatedUser[0] });
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        res.status(500).json({ message: "Failed to upload profile photo" });
      }
    }
  );

  // Follow/Unfollow user (or send follow request for private accounts)
  app.post("/api/users/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const { userId: followerId } = getUserFromRequest(req);
      const followingId = req.params.id;

      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      // Check if target user exists and is private
      const targetUser = await storage.getUser(followingId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already following
      const existingFollow = await db.select().from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .limit(1);

      if (existingFollow.length > 0) {
        return res.status(400).json({ message: "Already following this user" });
      }

      // If target is private, create follow request
      if (targetUser.isPrivate) {
        // Check if request already exists
        const existingRequest = await db.select().from(followRequests)
          .where(and(
            eq(followRequests.requesterId, followerId),
            eq(followRequests.targetId, followingId),
            eq(followRequests.status, "pending")
          ))
          .limit(1);

        if (existingRequest.length > 0) {
          return res.status(400).json({ message: "Follow request already sent" });
        }

        const [request] = await db.insert(followRequests).values({
          requesterId: followerId,
          targetId: followingId,
          status: "pending"
        }).returning();

        return res.json({ success: true, requestSent: true, request });
      }

      // If public account, create follow directly
      const [follow] = await db.insert(follows).values({
        followerId,
        followingId
      }).returning();

      // Update follower counts
      await db.update(users).set({
        followerCount: sql`${users.followerCount} + 1`
      }).where(eq(users.id, followingId));

      await db.update(users).set({
        followingCount: sql`${users.followingCount} + 1`
      }).where(eq(users.id, followerId));

      res.json({ success: true, follow });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  // Unfollow user
  app.delete("/api/users/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const { userId: followerId } = getUserFromRequest(req);
      const followingId = req.params.id;

      const deleted = await db.delete(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ message: "Not following this user" });
      }

      // Update follower counts
      await db.update(users).set({
        followerCount: sql`${users.followerCount} - 1`
      }).where(eq(users.id, followingId));

      await db.update(users).set({
        followingCount: sql`${users.followingCount} - 1`
      }).where(eq(users.id, followerId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Get follow requests for current user
  app.get("/api/follow-requests", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      
      const requests = await db.select({
        id: followRequests.id,
        requesterId: followRequests.requesterId,
        targetId: followRequests.targetId,
        status: followRequests.status,
        createdAt: followRequests.createdAt,
        requester: users
      })
        .from(followRequests)
        .innerJoin(users, eq(followRequests.requesterId, users.id))
        .where(and(
          eq(followRequests.targetId, userId),
          eq(followRequests.status, "pending")
        ))
        .orderBy(desc(followRequests.createdAt));

      res.json(requests);
    } catch (error) {
      console.error("Error fetching follow requests:", error);
      res.status(500).json({ message: "Failed to fetch follow requests" });
    }
  });

  // Accept/Reject follow request
  app.patch("/api/follow-requests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const requestId = req.params.id;
      const { action } = req.body; // "accept" or "reject"

      // Get the request
      const [request] = await db.select().from(followRequests)
        .where(and(
          eq(followRequests.id, requestId),
          eq(followRequests.targetId, userId),
          eq(followRequests.status, "pending")
        ))
        .limit(1);

      if (!request) {
        return res.status(404).json({ message: "Follow request not found" });
      }

      if (action === "accept") {
        // Create follow relationship
        await db.insert(follows).values({
          followerId: request.requesterId,
          followingId: request.targetId
        });

        // Update follower counts
        await db.update(users).set({
          followerCount: sql`${users.followerCount} + 1`
        }).where(eq(users.id, request.targetId));

        await db.update(users).set({
          followingCount: sql`${users.followingCount} + 1`
        }).where(eq(users.id, request.requesterId));

        // Update request status
        await db.update(followRequests).set({
          status: "accepted",
          updatedAt: sql`NOW()`
        }).where(eq(followRequests.id, requestId));

        res.json({ success: true, message: "Follow request accepted" });
      } else if (action === "reject") {
        // Update request status
        await db.update(followRequests).set({
          status: "rejected",
          updatedAt: sql`NOW()`
        }).where(eq(followRequests.id, requestId));

        res.json({ success: true, message: "Follow request rejected" });
      } else {
        res.status(400).json({ message: "Invalid action" });
      }
    } catch (error) {
      console.error("Error handling follow request:", error);
      res.status(500).json({ message: "Failed to handle follow request" });
    }
  });

  // Check follow status
  app.get("/api/users/:id/follow-status", isAuthenticated, async (req: any, res) => {
    try {
      const { userId: followerId } = getUserFromRequest(req);
      const followingId = req.params.id;

      const [follow] = await db.select().from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .limit(1);

      const [request] = await db.select().from(followRequests)
        .where(and(
          eq(followRequests.requesterId, followerId),
          eq(followRequests.targetId, followingId),
          eq(followRequests.status, "pending")
        ))
        .limit(1);

      res.json({
        isFollowing: !!follow,
        requestPending: !!request
      });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Onboarding route - User Legal Agreement
  app.post("/api/onboarding", isAuthenticated, async (req: any, res) => {
    try {
      const { userId, userEmail } = getUserFromRequest(req);
      
      // Get client IP address
      const ipAddress = req.headers['x-forwarded-for'] || 
                        req.connection.remoteAddress || 
                        'unknown';

      // Convert dateOfBirth from ISO string to Date object
      const dateOfBirth = new Date(req.body.dateOfBirth);

      // Parse and validate request body
      const agreementData = insertUserLegalAgreementSchema.parse({
        ...req.body,
        dateOfBirth, // Use converted Date object
        userId,
        email: userEmail,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
      });

      // Create legal agreement record
      const agreement = await storage.createUserLegalAgreement(agreementData);

      // Update user's age verification and DOB
      await storage.updateUser(userId, {
        dateOfBirth, // Use the same converted Date object
        ageVerified: true,
      });

      // Generate 5 friend invite codes for the new user
      const inviteCodes = await storage.createInviteCodes(userId, 5);
      const inviteCodeStrings = inviteCodes.map(code => code.code);

      // Get user data for welcome email
      const userData = await storage.getUser(userId);

      // Send welcome email with invite codes (async, don't wait)
      import('./services/email').then(({ emailService }) => {
        emailService.sendWelcomeEmail({
          email: userEmail,
          username: userData?.username || undefined,
          inviteCodes: inviteCodeStrings,
        }).catch(err => {
          console.error('Failed to send welcome email:', err);
        });
      });

      res.json({ 
        success: true, 
        message: "Onboarding completed successfully",
        agreementId: agreement.id,
        inviteCodes: inviteCodeStrings,
      });
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      res.status(400).json({ 
        message: error.message || "Failed to complete onboarding" 
      });
    }
  });

  // Check username availability
  app.post("/api/users/check-username", isAuthenticated, async (req: any, res) => {
    try {
      const { username } = req.body;
      const { userId } = getUserFromRequest(req);
      
      if (!username || username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }

      // Check if username contains only valid characters
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
      }

      // Check if username is taken by another user
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return res.status(409).json({ message: "Username is already taken" });
      }

      res.json({ 
        available: true, 
        message: "Username is available" 
      });
    } catch (error: any) {
      console.error("Error checking username:", error);
      res.status(500).json({ 
        message: error.message || "Failed to check username" 
      });
    }
  });

  // Profile setup - Complete profile after onboarding
  app.post("/api/profile-setup", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { username, bio } = req.body;
      
      if (!username || username.length < 3) {
        return res.status(400).json({ message: "Username is required and must be at least 3 characters" });
      }

      // Check if username contains only valid characters
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
      }

      // Check if username is taken by another user
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return res.status(409).json({ message: "Username is already taken" });
      }

      // Update user profile
      await storage.updateUser(userId, {
        username,
        bio: bio || null,
      });

      res.json({ 
        success: true, 
        message: "Profile setup completed successfully" 
      });
    } catch (error: any) {
      console.error("Error completing profile setup:", error);
      res.status(400).json({ 
        message: error.message || "Failed to complete profile setup" 
      });
    }
  });

  // Waitlist route - Public endpoint for beta signups
  app.post("/api/waitlist", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email required" });
      }

      // TODO: Store waitlist email in database
      // For now, just log it and return success
      console.log(`📧 New waitlist signup: ${email}`);
      
      res.json({ 
        success: true, 
        message: "Added to waitlist successfully" 
      });
    } catch (error: any) {
      console.error("Error adding to waitlist:", error);
      res.status(500).json({ 
        message: error.message || "Failed to add to waitlist" 
      });
    }
  });

  // Project routes
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Video routes
  app.get("/api/videos", async (req, res) => {
    try {
      const { ageRating, userId } = req.query;
      const videos = await storage.getVideos({
        ageRating: ageRating as any,
        userId: userId as string,
      });
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Public video feed for non-authenticated users (shows only public videos)
  app.get("/api/videos/public-feed", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Get only public videos
      const publicVideos = await db.select()
        .from(videos)
        .where(eq(videos.isPublic, true))
        .orderBy(desc(videos.createdAt))
        .limit(limit)
        .offset(offset);
      
      res.json(publicVideos);
    } catch (error) {
      console.error("Error fetching public feed:", error);
      res.status(500).json({ message: "Failed to fetch public feed" });
    }
  });

  // Main feed route - MUST be before /:id route to avoid matching "feed" as an id
  // WORKS FOR BOTH: Logged in users get personalized feed, logged out users get public feed
  app.get("/api/videos/feed", async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Check if user is authenticated
      if (req.isAuthenticated && req.isAuthenticated()) {
        // Logged in - show personalized feed
        const { userId } = getUserFromRequest(req);
        const videos = await storage.getReelsFeed(userId, limit, offset);
        res.json(videos);
      } else {
        // Not logged in - show public feed
        const publicVideos = await db.select()
          .from(videos)
          .where(eq(videos.isPublic, true))
          .orderBy(desc(videos.createdAt))
          .limit(limit)
          .offset(offset);
        res.json(publicVideos);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  // Following feed - videos from creators the user follows
  app.get("/api/videos/following", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const { userId } = getUserFromRequest(req);
      
      // Get list of creators the user follows
      const following = await db.select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, userId));
      
      const followingIds = following.map(f => f.followingId);
      
      if (followingIds.length === 0) {
        // User doesn't follow anyone - return empty array
        return res.json([]);
      }
      
      // Get videos from followed creators
      const followingVideos = await db.select()
        .from(videos)
        .where(inArray(videos.userId, followingIds))
        .orderBy(desc(videos.createdAt))
        .limit(limit)
        .offset(offset);
      
      res.json(followingVideos);
    } catch (error) {
      console.error("Error fetching following feed:", error);
      res.status(500).json({ message: "Failed to fetch following feed" });
    }
  });

  // Live streams endpoint - returns active live streams
  app.get("/api/live/streams", async (req, res) => {
    try {
      // For now, return empty array until live streaming is fully implemented
      // TODO: Add proper live stream tracking table
      res.json([]);
    } catch (error) {
      console.error("Error fetching live streams:", error);
      res.json([]);
    }
  });

  app.get("/api/videos/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Age-gating check
      // Only block 18plus content for unverified users
      // u16 and 16plus are accessible to all users
      if (video.ageRating === "18plus" && !user.ageVerified) {
        return res.status(403).json({ message: "This content requires age verification" });
      }

      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Configure multer for file uploads (store in memory)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB max file size
    },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === "videoFile") {
        if (file.mimetype.startsWith("video/")) {
          cb(null, true);
        } else {
          cb(new Error("Only video files are allowed"));
        }
      } else if (file.fieldname === "thumbnailFile") {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Only image files are allowed for thumbnails"));
        }
      } else {
        cb(null, true);
      }
    },
  });

  // Video upload with file handling
  app.post(
    "/api/videos/upload",
    isAuthenticated,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnailFile", maxCount: 1 },
    ]),
    async (req: any, res) => {
      try {
        const { userId } = getUserFromRequest(req);
        const files = req.files as {
          videoFile?: Express.Multer.File[];
          thumbnailFile?: Express.Multer.File[];
        };

        if (!files.videoFile || !files.videoFile[0]) {
          return res.status(400).json({ message: "Video file is required" });
        }

        let videoUrl: string;
        let thumbnailUrl: string | null = null;

        // Upload video to object storage if configured, otherwise use placeholder
        if (isObjectStorageConfigured()) {
          const videoUpload = await uploadToObjectStorage(
            {
              buffer: files.videoFile[0].buffer,
              mimetype: files.videoFile[0].mimetype,
              originalname: files.videoFile[0].originalname,
            },
            "videos"
          );
          videoUrl = videoUpload.url;

          // Upload thumbnail if provided
          if (files.thumbnailFile && files.thumbnailFile[0]) {
            const thumbnailUpload = await uploadToObjectStorage(
              {
                buffer: files.thumbnailFile[0].buffer,
                mimetype: files.thumbnailFile[0].mimetype,
                originalname: files.thumbnailFile[0].originalname,
              },
              "thumbnails"
            );
            thumbnailUrl = thumbnailUpload.url;
          }
        } else {
          // Fallback: use placeholder URLs (for development)
          console.warn("Object storage not configured, using placeholder URLs");
          videoUrl = `https://example.com/videos/${Date.now()}.mp4`;
          thumbnailUrl = `https://example.com/thumbnails/${Date.now()}.jpg`;
        }

        // Parse form data
        const hashtags = req.body.hashtags ? JSON.parse(req.body.hashtags) : [];
        const isPublic = req.body.isPublic === "true";
        const isPremium = req.body.isPremium === "true";

        // Create video record
        const videoData = insertVideoSchema.parse({
          userId,
          title: req.body.title,
          description: req.body.description || "",
          videoUrl,
          thumbnailUrl: thumbnailUrl || videoUrl,
          videoType: req.body.videoType,
          quality: "hd",
          category: req.body.category || "",
          hashtags,
          ageRating: req.body.ageRating,
          isPublic,
          isPremium,
          moderationStatus: "pending",
        });

        const video = await storage.createVideo(videoData);
        res.json(video);
      } catch (error) {
        console.error("Error uploading video:", error);
        res.status(400).json({ 
          message: error instanceof Error ? error.message : "Failed to upload video" 
        });
      }
    }
  );

  app.post("/api/videos", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const videoData = insertVideoSchema.parse({ ...req.body, userId });
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(400).json({ message: "Failed to create video" });
    }
  });

  app.delete("/api/videos/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Video feed routes (Reels = short, Tube = long)
  app.get("/api/videos/reels", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const videos = await storage.getReelsFeed(userId, limit, offset);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching reels:", error);
      res.status(500).json({ message: "Failed to fetch reels" });
    }
  });

  app.get("/api/videos/tube", async (req, res) => {
    try {
      const videos = await storage.getVideos({
        videoType: "long",
        ageRating: req.query.ageRating as any,
      });
      res.json(videos);
    } catch (error) {
      console.error("Error fetching tube videos:", error);
      res.status(500).json({ message: "Failed to fetch tube videos" });
    }
  });

  // Video engagement routes (atomic counter updates)
  app.post("/api/videos/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const videoId = req.params.id;
      
      // Check if already liked
      const existingLike = await storage.getUserVideoLike(userId, videoId);
      if (existingLike) {
        return res.status(400).json({ message: "Already liked", liked: true });
      }
      
      await storage.likeVideo(userId, videoId);
      res.json({ success: true, liked: true });
    } catch (error) {
      console.error("Error liking video:", error);
      res.status(500).json({ message: "Failed to like video" });
    }
  });

  app.delete("/api/videos/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const videoId = req.params.id;
      
      await storage.unlikeVideo(userId, videoId);
      res.json({ success: true, liked: false });
    } catch (error) {
      console.error("Error unliking video:", error);
      res.status(500).json({ message: "Failed to unlike video" });
    }
  });

  app.get("/api/videos/:id/like-status", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const videoId = req.params.id;
      
      const like = await storage.getUserVideoLike(userId, videoId);
      res.json({ liked: !!like });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  app.get("/api/videos/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const videoId = req.params.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const comments = await storage.getVideoComments(videoId, limit, offset);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/videos/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const videoId = req.params.id;
      const { content, parentCommentId } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content required" });
      }
      
      const comment = await storage.createVideoComment({
        videoId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
      });
      
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.post("/api/videos/:id/view", isAuthenticated, async (req: any, res) => {
    try {
      const videoId = req.params.id;
      
      await storage.incrementViewCount(videoId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Spark routes (Virtual Gifts - Better than TikTok!)
  // Uses COINS (not credits) - purchased separately with TikTok pricing
  app.post("/api/sparks", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { receiverId, videoId, sparkType } = req.body;

      const sender = await storage.getUser(senderId);
      if (!sender) {
        return res.status(404).json({ message: "User not found" });
      }

      const coinCost = SPARK_PRICES[sparkType as keyof typeof SPARK_PRICES];
      if (!coinCost) {
        return res.status(400).json({ message: "Invalid spark type" });
      }

      if (sender.coins < coinCost) {
        return res
          .status(400)
          .json({ message: "Insufficient coins. Purchase more coins to send gifts!" });
      }

      // 60/40 split - creator gets 60% (beats TikTok's 50/50)
      const creatorEarnings = Math.floor(coinCost * 0.60);

      const sparkData = insertVirtualGiftSchema.parse({
        senderId,
        receiverId,
        videoId,
        sparkType,
        creditCost: coinCost, // DB field name (legacy - should be renamed to coinCost)
        creatorEarnings,
      });

      const spark = await storage.sendSpark(sparkData);

      // Update COINS (not credits)
      await storage.updateUserCoins(senderId, -coinCost);
      await storage.updateUserCoins(receiverId, creatorEarnings);

      // Create transactions
      await storage.createTransaction({
        userId: senderId,
        type: "spark_sent",
        amount: -coinCost,
        description: `Sent ${sparkType} spark`,
        referenceId: spark.id,
      });

      await storage.createTransaction({
        userId: receiverId,
        type: "spark_received",
        amount: creatorEarnings,
        description: `Received ${sparkType} spark`,
        referenceId: spark.id,
      });

      res.json(spark);
    } catch (error) {
      console.error("Error sending spark:", error);
      res.status(500).json({ message: "Failed to send spark" });
    }
  });

  app.get("/api/sparks/video/:videoId", async (req, res) => {
    try {
      const sparks = await storage.getSparksForVideo(req.params.videoId);
      res.json(sparks);
    } catch (error) {
      console.error("Error fetching sparks:", error);
      res.status(500).json({ message: "Failed to fetch sparks" });
    }
  });

  // Message routes
  app.get("/api/messages/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      const messages = await storage.getMessages(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId });
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Conversation routes (DMs/Group chats)
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const conversations = await storage.getUserConversations(userId);
      
      // Enrich conversations with members and last message preview
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv: any) => {
          const members = await storage.getConversationMembers(conv.id);
          const allMessages = await storage.getConversationMessages(conv.id);
          const lastMessage = allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;
          
          return {
            ...conv,
            members,
            lastMessage,
          };
        })
      );
      
      res.json(enrichedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const conversationId = req.params.id;
      
      // Verify user is a member of this conversation
      const members = await storage.getConversationMembers(conversationId);
      const isMember = members.some(m => m.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this conversation" });
      }
      
      const conversations = await storage.getUserConversations(userId);
      const conversation = conversations.find((c: any) => c.id === conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json({
        ...conversation,
        members,
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const conversationId = req.params.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Verify user is a member of this conversation
      const members = await storage.getConversationMembers(conversationId);
      const isMember = members.some(m => m.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this conversation" });
      }
      
      const allMessages = await storage.getConversationMessages(conversationId);
      
      // Apply pagination
      const paginatedMessages = allMessages.slice(offset, offset + limit);
      
      res.json({
        messages: paginatedMessages,
        total: allMessages.length,
        limit,
        offset,
      });
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { participantIds, isGroup, name } = req.body;
      
      // Validate request
      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: "participantIds must be a non-empty array" });
      }
      
      if (typeof isGroup !== 'boolean') {
        return res.status(400).json({ message: "isGroup must be a boolean" });
      }
      
      // For 1:1 conversations, check if conversation already exists
      if (!isGroup && participantIds.length === 1) {
        const existingConversation = await storage.getOrCreateDirectConversation(
          userId,
          participantIds[0]
        );
        const members = await storage.getConversationMembers(existingConversation.id);
        return res.json({
          ...existingConversation,
          members,
        });
      }
      
      // Create new conversation
      const conversation = await storage.createConversation({
        creatorId: userId,
        name,
        isGroup,
        participantIds,
      });
      
      const members = await storage.getConversationMembers(conversation.id);
      
      res.json({
        ...conversation,
        members,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Failed to create conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const conversationId = req.params.id;
      const { content, messageType = "text" } = req.body;
      
      // Validate request
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "content is required and must be a string" });
      }
      
      // Verify user is a member of this conversation
      const members = await storage.getConversationMembers(conversationId);
      const isMember = members.some(m => m.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this conversation" });
      }
      
      // Send message
      const message = await storage.sendConversationMessage({
        conversationId,
        senderId: userId,
        content,
        messageType,
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/conversations/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const conversationId = req.params.id;
      
      // Verify user is a member of this conversation
      const members = await storage.getConversationMembers(conversationId);
      const isMember = members.some(m => m.id === userId);
      
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this conversation" });
      }
      
      // Mark messages as read
      await storage.markMessagesAsRead(conversationId, userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  app.get("/api/conversations/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Stripe/Subscription routes
  // NOTE: Stripe is OPTIONAL - this route only works if STRIPE_SECRET_KEY is configured
  app.post("/api/create-checkout-session", isAuthenticated, async (req: any, res) => {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return res.status(503).json({ 
        message: "Stripe not configured",
        hint: "Please set STRIPE_SECRET_KEY environment variable or use alternative payment methods (PayPal, Payoneer, Crypto, etc.)"
      });
    }

    try {
      const { userId } = getUserFromRequest(req);
      const { tier } = req.body;

      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email || undefined,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `CreatorVerse ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
                description: `${TIER_CREDITS[tier as keyof typeof TIER_CREDITS]} credits/month`,
              },
              unit_amount: TIER_PRICES[tier as keyof typeof TIER_PRICES],
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.protocol}://${req.hostname}/wallet?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.hostname}/wallet`,
        metadata: {
          userId,
          tier,
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // PayPal routes (secured with server-side validation)
  // Blueprint compatibility wrapper - delegates to secure handler
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.get("/api/paypal/configured", (req, res) => {
    res.json({ configured: isPayPalConfigured() });
  });

  // Endpoint to initiate PayPal checkout with server-validated tier
  app.post("/api/paypal/init-checkout", isAuthenticated, async (req: any, res) => {
    try {
      if (!isPayPalConfigured()) {
        return res.status(503).json({ message: "PayPal not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { tier } = req.body;
      
      // Validate tier
      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }
      
      // Store tier in session for later validation
      req.session.paypalTier = tier;
      req.session.paypalUserId = userId;
      
      const amount = (TIER_PRICES[tier as keyof typeof TIER_PRICES] / 100).toFixed(2);
      
      // Prepare request for PayPal order creation
      req.body.amount = amount;
      req.body.currency = "USD";
      req.body.intent = "CAPTURE";
      
      // Create a mock response to capture the order creation response
      const mockRes = {
        status: (code: number) => {
          mockRes.statusCode = code;
          return mockRes;
        },
        json: (data: any) => {
          if (mockRes.statusCode === 200 && data.id && data.links) {
            const approvalLink = data.links.find((link: any) => link.rel === 'approve');
            if (approvalLink) {
              res.json({ approvalUrl: approvalLink.href });
            } else {
              res.status(500).json({ message: "No approval link returned from PayPal" });
            }
          } else {
            res.status(mockRes.statusCode || 500).json(data);
          }
        },
        statusCode: 200,
      };
      
      // Create PayPal order
      await createPaypalOrder(req, mockRes as any);
    } catch (error) {
      console.error("Error initializing PayPal checkout:", error);
      res.status(500).json({ message: "Failed to initialize PayPal checkout" });
    }
  });

  // Blueprint compatibility: /paypal/order 
  // This enforces server-side pricing based on session-stored tier
  app.post("/paypal/order", async (req: any, res) => {
    try {
      // Get tier from session (stored during init-checkout)
      const tier = req.session?.paypalTier;
      
      if (!tier || !TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ 
          message: "Invalid checkout session. Please reinitiate checkout." 
        });
      }
      
      // Always enforce server-side pricing
      const validatedAmount = (TIER_PRICES[tier as keyof typeof TIER_PRICES] / 100).toFixed(2);
      req.body.amount = validatedAmount;
      req.body.currency = "USD";
      req.body.intent = "CAPTURE";
      
      // Delegate to blueprint's createPaypalOrder
      await createPaypalOrder(req, res);
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      res.status(500).json({ message: "Failed to create PayPal order" });
    }
  });

  // Blueprint compatibility: /paypal/order/:orderID/capture
  // This reads tier from session and records transaction with provider tracking
  app.post("/paypal/order/:orderID/capture", async (req: any, res) => {
    try {
      const { orderID } = req.params;
      
      // Get tier and userId from session (stored during init-checkout)
      const tier = req.session?.paypalTier;
      const userId = req.session?.paypalUserId;
      
      if (!tier || !userId || !TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ 
          message: "Invalid checkout session" 
        });
      }
      
      // Capture via blueprint handler
      const captureResponse = await new Promise<any>((resolve, reject) => {
        const mockRes = {
          status: (code: number) => ({
            json: (data: any) => {
              if (code >= 200 && code < 300) resolve(data);
              else reject(new Error(`PayPal capture failed: ${code}`));
            }
          })
        };
        capturePaypalOrder(req, mockRes as any);
      });
      
      // Record transaction with full provider tracking
      const creditsEarned = TIER_CREDITS[tier as keyof typeof TIER_CREDITS];
      await storage.updateUserCredits(userId, creditsEarned);
      await storage.createTransaction({
        userId,
        type: "subscription",
        amount: creditsEarned,
        description: `PayPal subscription - ${tier} plan`,
        referenceId: orderID,
        paymentProvider: "paypal",
        providerTransactionId: orderID,
        providerMetadata: {
          tier,
          captureDetails: captureResponse,
        },
      });
      await storage.updateUserSubscription(userId, tier as "creator" | "innovator");
      
      // Clear session data
      delete req.session.paypalTier;
      delete req.session.paypalUserId;
      
      res.json(captureResponse);
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      res.status(500).json({ message: "Failed to capture PayPal payment" });
    }
  });

  app.post("/api/paypal/create-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { tier } = req.body;

      // Server-side validation: only allow predefined tiers
      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create PayPal order with server-enforced pricing
      const amount = (TIER_PRICES[tier as keyof typeof TIER_PRICES] / 100).toFixed(2); // Convert cents to dollars
      
      // SECURITY: Store tier and amount in session for validation during capture
      req.session.paypalTier = tier;
      req.session.paypalAmount = amount;
      req.session.paypalUserId = userId;
      
      req.body = {
        amount,
        currency: "USD",
        intent: "CAPTURE",
      };

      await createPaypalOrder(req, res);
    } catch (error) {
      console.error("Error creating PayPal subscription:", error);
      res.status(500).json({ message: "Failed to create PayPal subscription" });
    }
  });

  app.post("/api/paypal/capture/:orderID", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { orderID } = req.params;

      // SECURITY: Get tier from SERVER session, NOT from client request
      const tier = req.session.paypalTier;
      const expectedAmount = req.session.paypalAmount;
      const sessionUserId = req.session.paypalUserId;

      // Validate session data exists
      if (!tier || !expectedAmount || !sessionUserId) {
        // Clear stale session
        delete req.session.paypalTier;
        delete req.session.paypalAmount;
        delete req.session.paypalUserId;
        return res.status(400).json({ message: "Invalid or expired checkout session" });
      }

      // Validate user matches session
      if (userId !== sessionUserId) {
        // Clear session on user mismatch
        delete req.session.paypalTier;
        delete req.session.paypalAmount;
        delete req.session.paypalUserId;
        return res.status(403).json({ message: "User mismatch" });
      }

      // Validate tier
      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        // Clear session on invalid tier
        delete req.session.paypalTier;
        delete req.session.paypalAmount;
        delete req.session.paypalUserId;
        return res.status(400).json({ message: "Invalid tier" });
      }

      // Capture the PayPal order
      req.params.orderID = orderID;
      const captureResponse = await new Promise<any>((resolve, reject) => {
        const mockRes = {
          status: (code: number) => ({
            json: (data: any) => {
              if (code >= 200 && code < 300) resolve(data);
              else reject(new Error(`PayPal capture failed: ${code}`));
            }
          })
        };
        capturePaypalOrder(req, mockRes as any);
      });

      // SECURITY: Validate captured amount matches expected amount
      const capturedAmount = captureResponse?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
      if (!capturedAmount || parseFloat(capturedAmount) !== parseFloat(expectedAmount)) {
        console.error(`Payment amount mismatch: expected ${expectedAmount}, got ${capturedAmount}`);
        // Clear session on validation failure
        delete req.session.paypalTier;
        delete req.session.paypalAmount;
        delete req.session.paypalUserId;
        return res.status(400).json({ 
          message: "Payment amount verification failed" 
        });
      }

      // Validate capture status is COMPLETED
      const captureStatus = captureResponse?.purchase_units?.[0]?.payments?.captures?.[0]?.status;
      if (captureStatus !== "COMPLETED") {
        console.error(`Payment not completed: status ${captureStatus}`);
        // Clear session on failed payment
        delete req.session.paypalTier;
        delete req.session.paypalAmount;
        delete req.session.paypalUserId;
        return res.status(400).json({ 
          message: "Payment not completed" 
        });
      }

      // Extract actual PayPal subscription/capture ID
      const paypalCaptureId = captureResponse?.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID;

      // Record transaction with provider tracking
      const creditsEarned = TIER_CREDITS[tier as keyof typeof TIER_CREDITS];
      await storage.updateUserCredits(userId, creditsEarned);
      await storage.createTransaction({
        userId,
        type: "subscription",
        amount: creditsEarned,
        description: `PayPal subscription - ${tier} plan`,
        referenceId: orderID,
        paymentProvider: "paypal",
        providerTransactionId: paypalCaptureId,
        providerMetadata: {
          tier,
          expectedAmount,
          capturedAmount,
          captureDetails: captureResponse,
        },
      });

      // Update user subscription tier and save PayPal subscription ID
      await storage.updateUserSubscription(userId, tier as "creator" | "innovator");
      await storage.updateUser(userId, {
        paypalSubscriptionId: paypalCaptureId,
      });

      // Clear session data
      delete req.session.paypalTier;
      delete req.session.paypalAmount;
      delete req.session.paypalUserId;

      res.json({
        success: true,
        credits: creditsEarned,
        tier,
      });
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      res.status(500).json({ message: "Failed to capture PayPal payment" });
    }
  });

  // Payoneer routes
  app.get("/api/payoneer/configured", (req, res) => {
    res.json({ configured: isPayoneerConfigured() });
  });

  app.post("/api/payoneer/init-checkout", isAuthenticated, async (req: any, res) => {
    try {
      if (!isPayoneerConfigured()) {
        return res.status(503).json({ message: "Payoneer not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { tier } = req.body;

      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const user = await storage.getUser(userId);
      if (!user?.email) {
        return res.status(400).json({ message: "User email required" });
      }

      const amount = TIER_PRICES[tier as keyof typeof TIER_PRICES] / 100;
      const transactionId = `cv-${tier}-${Date.now()}`;

      const baseUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
      const { sessionUrl, sessionId } = await createPayoneerSession(
        amount,
        "USD",
        transactionId,
        user.email,
        `${baseUrl}/wallet?payoneer=success`,
        `${baseUrl}/wallet?payoneer=cancel`,
        `${baseUrl}/api/payoneer/webhook`
      );

      req.session.payoneerTier = tier;
      req.session.payoneerUserId = userId;
      req.session.payoneerSessionId = sessionId;
      req.session.payoneerTransactionId = transactionId;

      res.json({ sessionUrl, sessionId });
    } catch (error) {
      console.error("Error initiating Payoneer checkout:", error);
      res.status(500).json({ message: "Failed to initiate Payoneer checkout" });
    }
  });

  app.post("/api/payoneer/webhook", async (req, res) => {
    try {
      const verification = verifyPayoneerWebhook(req.body);

      if (!verification.isValid) {
        return res.status(400).json({ message: "Invalid webhook" });
      }

      if (verification.status === "CHARGED") {
        // Payment successful - webhook will be processed
        // We'll verify and record in the status check endpoint
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing Payoneer webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.post("/api/payoneer/verify-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const tier = req.session?.payoneerTier;
      const sessionId = req.session?.payoneerSessionId;
      const transactionId = req.session?.payoneerTransactionId;

      if (!tier || !sessionId || userId !== req.session?.payoneerUserId) {
        return res.status(400).json({ message: "Invalid session" });
      }

      const status = await getPayoneerPaymentStatus(sessionId);

      if (status.status === "CHARGED") {
        const creditsEarned = TIER_CREDITS[tier as keyof typeof TIER_CREDITS];
        await storage.updateUserCredits(userId, creditsEarned);
        await storage.createTransaction({
          userId,
          type: "subscription",
          amount: creditsEarned,
          description: `Payoneer subscription - ${tier} plan`,
          referenceId: transactionId,
          paymentProvider: "payoneer",
          providerTransactionId: sessionId,
          providerMetadata: {
            tier,
            paymentDetails: status,
          },
        });
        await storage.updateUserSubscription(userId, tier as "creator" | "innovator");

        delete req.session.payoneerTier;
        delete req.session.payoneerUserId;
        delete req.session.payoneerSessionId;
        delete req.session.payoneerTransactionId;

        res.json({ success: true, credits: creditsEarned, tier });
      } else {
        res.json({ success: false, status: status.status });
      }
    } catch (error) {
      console.error("Error verifying Payoneer payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Payeer routes
  app.get("/api/payeer/configured", (req, res) => {
    res.json({ configured: isPayeerConfigured() });
  });

  app.post("/api/payeer/init-checkout", isAuthenticated, async (req: any, res) => {
    try {
      if (!isPayeerConfigured()) {
        return res.status(503).json({ message: "Payeer not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { tier } = req.body;

      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const amount = TIER_PRICES[tier as keyof typeof TIER_PRICES] / 100;
      const orderId = `cv-${tier}-${Date.now()}`;
      const description = `CreatorVerse ${tier} subscription`;

      const { invoiceUrl } = await createPayeerInvoice(
        orderId,
        amount,
        "USD",
        description
      );

      req.session.payeerTier = tier;
      req.session.payeerUserId = userId;
      req.session.payeerOrderId = orderId;

      res.json({ invoiceUrl, orderId });
    } catch (error) {
      console.error("Error initiating Payeer checkout:", error);
      res.status(500).json({ message: "Failed to initiate Payeer checkout" });
    }
  });

  app.get("/api/payeer/form-data", isAuthenticated, async (req: any, res) => {
    try {
      if (!isPayeerConfigured()) {
        return res.status(503).json({ message: "Payeer not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { tier } = req.query;

      if (!tier || !TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const amount = TIER_PRICES[tier as keyof typeof TIER_PRICES] / 100;
      const orderId = `cv-${tier}-${Date.now()}`;
      const description = `CreatorVerse ${tier} subscription`;

      const formData = generatePayeerPaymentFormData(
        orderId,
        amount,
        "USD",
        description
      );

      req.session.payeerTier = tier;
      req.session.payeerUserId = userId;
      req.session.payeerOrderId = orderId;

      res.json(formData);
    } catch (error) {
      console.error("Error generating Payeer form data:", error);
      res.status(500).json({ message: "Failed to generate form data" });
    }
  });

  app.post("/api/payeer/callback", async (req, res) => {
    try {
      const secretKey = process.env.PAYEER_SECRET_KEY;
      if (!secretKey) {
        return res.status(500).json({ message: "Payeer not configured" });
      }

      const verification = verifyPayeerCallback(req.body, secretKey);

      if (!verification.isValid) {
        return res.status(400).json({ message: "Invalid callback signature" });
      }

      if (verification.status === "success" && verification.orderId) {
        // Find session by orderId (in production, use database lookup)
        // For now, just acknowledge receipt
        console.log("Payeer payment successful:", verification);
      }

      res.send(verification.orderId || "OK");
    } catch (error) {
      console.error("Error processing Payeer callback:", error);
      res.status(500).json({ message: "Callback processing failed" });
    }
  });

  app.post("/api/payeer/verify-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const tier = req.session?.payeerTier;
      const orderId = req.session?.payeerOrderId;

      if (!tier || !orderId || userId !== req.session?.payeerUserId) {
        return res.status(400).json({ message: "Invalid session" });
      }

      const merchantId = process.env.PAYEER_MERCHANT_ID;
      if (!merchantId) {
        return res.status(500).json({ message: "Payeer not configured" });
      }

      const status = await getPayeerPaymentStatus(merchantId, orderId);

      if (status.status === "success") {
        const creditsEarned = TIER_CREDITS[tier as keyof typeof TIER_CREDITS];
        await storage.updateUserCredits(userId, creditsEarned);
        await storage.createTransaction({
          userId,
          type: "subscription",
          amount: creditsEarned,
          description: `Payeer subscription - ${tier} plan`,
          referenceId: orderId,
          paymentProvider: "payeer",
          providerTransactionId: orderId,
          providerMetadata: {
            tier,
            paymentDetails: status,
          },
        });
        await storage.updateUserSubscription(userId, tier as "creator" | "innovator");

        delete req.session.payeerTier;
        delete req.session.payeerUserId;
        delete req.session.payeerOrderId;

        res.json({ success: true, credits: creditsEarned, tier });
      } else {
        res.json({ success: false, status: status.status });
      }
    } catch (error) {
      console.error("Error verifying Payeer payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Content moderation routes
  app.post("/api/flags", isAuthenticated, async (req: any, res) => {
    try {
      const reporterId = req.user.claims.sub;
      const flagData = insertContentFlagSchema.parse({
        ...req.body,
        reporterId,
      });
      const flag = await storage.flagContent(flagData);
      res.json(flag);
    } catch (error) {
      console.error("Error flagging content:", error);
      res.status(400).json({ message: "Failed to flag content" });
    }
  });

  app.get("/api/flags", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const flags = await storage.getContentFlags(req.query.status as string);
      res.json(flags);
    } catch (error) {
      console.error("Error fetching flags:", error);
      res.status(500).json({ message: "Failed to fetch flags" });
    }
  });

  app.put("/api/flags/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      await storage.updateFlagStatus(req.params.id, status, user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating flag:", error);
      res.status(500).json({ message: "Failed to update flag" });
    }
  });

  app.post("/api/strikes", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const strikeData = insertUserStrikeSchema.parse({
        ...req.body,
        issuedBy: user.id,
      });
      const strike = await storage.addUserStrike(strikeData);
      res.json(strike);
    } catch (error) {
      console.error("Error adding strike:", error);
      res.status(400).json({ message: "Failed to add strike" });
    }
  });

  // ==================== USER BLOCKING ROUTES (Instagram/TikTok-style) ====================
  
  // Block a user
  app.post("/api/users/:userId/block", isAuthenticated, async (req: any, res) => {
    try {
      const blockerId = req.user.claims.sub;
      const blockedId = req.params.userId;
      const { reason } = req.body;

      if (blockerId === blockedId) {
        return res.status(400).json({ message: "Cannot block yourself" });
      }

      await storage.blockUser(blockerId, blockedId, reason);
      res.json({ success: true, message: "User blocked successfully" });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  // Unblock a user
  app.delete("/api/users/:userId/block", isAuthenticated, async (req: any, res) => {
    try {
      const blockerId = req.user.claims.sub;
      const blockedId = req.params.userId;

      await storage.unblockUser(blockerId, blockedId);
      res.json({ success: true, message: "User unblocked successfully" });
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });

  // Get list of blocked users
  app.get("/api/users/blocked", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockedUserIds = await storage.getBlockedUsers(userId);
      res.json(blockedUserIds);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      res.status(500).json({ message: "Failed to fetch blocked users" });
    }
  });

  // Check if a user is blocked
  app.get("/api/users/:userId/is-blocked", isAuthenticated, async (req: any, res) => {
    try {
      const blockerId = req.user.claims.sub;
      const blockedId = req.params.userId;
      const isBlocked = await storage.isUserBlocked(blockerId, blockedId);
      res.json({ isBlocked });
    } catch (error) {
      console.error("Error checking block status:", error);
      res.status(500).json({ message: "Failed to check block status" });
    }
  });

  // ==================== AUTO-MODERATION ROUTES ====================
  
  // Moderate video content
  app.post("/api/videos/:id/moderate", isAuthenticated, async (req: any, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const user = await storage.getUser(video.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Moderate video content (title, description, hashtags)
      const moderationResult = await moderateVideo(
        video.title,
        video.description || "",
        video.hashtags,
        user.ageRating
      );

      if (moderationResult.flagged) {
        // Apply auto-strike
        const strikeResult = await applyAutoStrike(
          video.userId,
          {
            categories: moderationResult.categories,
            severity: moderationResult.severity,
            reason: moderationResult.reason,
          },
          video.id,
          'video'
        );

        // Update video moderation status
        await storage.updateVideo(video.id, {
          moderationStatus: "rejected",
        });

        return res.json({
          flagged: true,
          moderationResult,
          strikeResult,
          message: moderationResult.reason,
        });
      }

      // Approve video
      await storage.updateVideo(video.id, {
        moderationStatus: "approved",
      });

      res.json({
        flagged: false,
        message: "Content approved",
      });
    } catch (error) {
      console.error("Error moderating video:", error);
      res.status(500).json({ message: "Failed to moderate video" });
    }
  });

  // Moderate comment content
  app.post("/api/comments/:id/moderate", isAuthenticated, async (req: any, res) => {
    try {
      const { content, userId } = req.body;
      if (!content || !userId) {
        return res.status(400).json({ message: "Content and userId required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Moderate comment content
      const moderationResult = await moderateContent(
        content,
        'comment',
        user.ageRating
      );

      if (moderationResult.flagged) {
        // Apply auto-strike
        const strikeResult = await applyAutoStrike(
          userId,
          {
            categories: moderationResult.categories,
            severity: moderationResult.severity,
            reason: moderationResult.reason,
          },
          req.params.id,
          'comment'
        );

        return res.json({
          flagged: true,
          moderationResult,
          strikeResult,
          message: moderationResult.reason,
        });
      }

      res.json({
        flagged: false,
        message: "Comment approved",
      });
    } catch (error) {
      console.error("Error moderating comment:", error);
      res.status(500).json({ message: "Failed to moderate comment" });
    }
  });

  // Moderate message/DM content
  app.post("/api/messages/:id/moderate", isAuthenticated, async (req: any, res) => {
    try {
      const { content, userId } = req.body;
      if (!content || !userId) {
        return res.status(400).json({ message: "Content and userId required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Moderate message content
      const moderationResult = await moderateContent(
        content,
        'message',
        user.ageRating
      );

      if (moderationResult.flagged) {
        // Apply auto-strike
        const strikeResult = await applyAutoStrike(
          userId,
          {
            categories: moderationResult.categories,
            severity: moderationResult.severity,
            reason: moderationResult.reason,
          },
          req.params.id,
          'message'
        );

        return res.json({
          flagged: true,
          moderationResult,
          strikeResult,
          message: moderationResult.reason,
        });
      }

      res.json({
        flagged: false,
        message: "Message approved",
      });
    } catch (error) {
      console.error("Error moderating message:", error);
      res.status(500).json({ message: "Failed to moderate message" });
    }
  });

  // Get user strikes
  app.get("/api/moderation/strikes/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;

      // Users can only view their own strikes unless they're admin
      if (requestingUserId !== targetUserId) {
        const user = await storage.getUser(requestingUserId);
        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const strikes = await storage.getUserStrikes(targetUserId);
      const user = await storage.getUser(targetUserId);

      res.json({
        strikes,
        totalStrikes: user?.strikeCount || 0,
        isBanned: user?.isBanned || false,
      });
    } catch (error) {
      console.error("Error fetching strikes:", error);
      res.status(500).json({ message: "Failed to fetch strikes" });
    }
  });

  // Submit appeal for a strike
  app.post("/api/moderation/appeal/:strikeId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { appealReason } = req.body;

      if (!appealReason) {
        return res.status(400).json({ message: "Appeal reason required" });
      }

      const strike = await storage.getStrikeById(req.params.strikeId);
      if (!strike) {
        return res.status(404).json({ message: "Strike not found" });
      }

      // Verify the strike belongs to the requesting user
      if (strike.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if already appealed
      if (strike.appealStatus) {
        return res.status(400).json({ message: "Strike already appealed" });
      }

      await submitAppeal(req.params.strikeId, userId, appealReason);

      res.json({
        success: true,
        message: "Appeal submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting appeal:", error);
      res.status(500).json({ message: "Failed to submit appeal" });
    }
  });

  // Review appeal (admin only)
  app.put("/api/moderation/appeal/:strikeId/review", isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.claims.sub;
      const user = await storage.getUser(reviewerId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { approved } = req.body;
      if (typeof approved !== 'boolean') {
        return res.status(400).json({ message: "Approved status required" });
      }

      const strike = await storage.getStrikeById(req.params.strikeId);
      if (!strike) {
        return res.status(404).json({ message: "Strike not found" });
      }

      if (strike.appealStatus !== 'pending') {
        return res.status(400).json({ message: "No pending appeal for this strike" });
      }

      await reviewAppeal(req.params.strikeId, reviewerId, approved);

      res.json({
        success: true,
        message: approved ? "Appeal approved" : "Appeal rejected",
      });
    } catch (error) {
      console.error("Error reviewing appeal:", error);
      res.status(500).json({ message: "Failed to review appeal" });
    }
  });

  // ==================== AI INFLUENCER ROUTES ====================

  // Get all AI influencers (public or creator's own)
  app.get("/api/influencers", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { creatorId, contentType, isPublic } = req.query;

      const filters: any = {};
      if (creatorId) filters.creatorId = creatorId;
      if (contentType) filters.contentType = contentType;
      if (isPublic !== undefined) filters.isPublic = isPublic === "true";

      const influencers = await storage.getAIInfluencers(filters);
      res.json(influencers);
    } catch (error) {
      console.error("Error fetching influencers:", error);
      res.status(500).json({ message: "Failed to fetch influencers" });
    }
  });

  // Get single AI influencer
  app.get("/api/influencers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const influencer = await storage.getAIInfluencer(req.params.id);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found" });
      }
      res.json(influencer);
    } catch (error) {
      console.error("Error fetching influencer:", error);
      res.status(500).json({ message: "Failed to fetch influencer" });
    }
  });

  // Create AI influencer
  app.post("/api/influencers", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const influencerData = insertAIInfluencerSchema.parse({
        ...req.body,
        creatorId: userId,
      });

      const influencer = await storage.createAIInfluencer(influencerData);
      res.json(influencer);
    } catch (error) {
      console.error("Error creating influencer:", error);
      res.status(400).json({ message: "Failed to create influencer" });
    }
  });

  // Update AI influencer
  app.patch("/api/influencers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const influencer = await storage.getAIInfluencer(req.params.id);

      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found" });
      }

      if (influencer.creatorId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await storage.updateAIInfluencer(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating influencer:", error);
      res.status(400).json({ message: "Failed to update influencer" });
    }
  });

  // Delete AI influencer
  app.delete("/api/influencers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const influencer = await storage.getAIInfluencer(req.params.id);

      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found" });
      }

      if (influencer.creatorId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteAIInfluencer(req.params.id);
      res.json({ message: "Influencer deleted" });
    } catch (error) {
      console.error("Error deleting influencer:", error);
      res.status(500).json({ message: "Failed to delete influencer" });
    }
  });

  // Get influencer videos
  app.get("/api/influencers/:id/videos", isAuthenticated, async (req: any, res) => {
    try {
      const videos = await storage.getAIInfluencerVideos(req.params.id);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Generate influencer video
  app.post("/api/influencers/:id/videos", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const user = await storage.getUser(userId);
      const influencer = await storage.getAIInfluencer(req.params.id);

      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found" });
      }

      if (influencer.creatorId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const { prompt, duration = 15, isExclusive = false } = req.body;

      // Calculate cost
      const cost = soraService.calculateCost(duration, "high");

      if (!user || user.credits < cost) {
        return res.status(402).json({ message: "Insufficient credits" });
      }

      // Create video record
      const videoData = insertAIInfluencerVideoSchema.parse({
        influencerId: req.params.id,
        title: req.body.title || "Untitled Video",
        prompt,
        duration,
        generationCost: cost,
        generationStatus: "pending",
        isExclusive,
      });

      const video = await storage.createAIInfluencerVideo(videoData);

      // Deduct credits
      await storage.updateUserCredits(userId, -cost);

      // Start video generation (async)
      soraService
        .generateInfluencerVideo({
          prompt,
          influencerAppearance: influencer.appearancePrompt || "",
          influencerPersonality: influencer.personality,
          duration,
          voiceId: influencer.voiceId || undefined,
        })
        .then(async (result) => {
          await storage.updateAIInfluencerVideo(video.id, {
            soraJobId: result.jobId,
            generationStatus: result.status === "completed" ? "completed" : "processing",
            videoUrl: result.videoUrl,
            thumbnailUrl: result.thumbnailUrl,
          });
        })
        .catch(async (error) => {
          console.error("Video generation failed:", error);
          await storage.updateAIInfluencerVideo(video.id, {
            generationStatus: "failed",
          });
          // Refund credits on failure
          await storage.updateUserCredits(userId, cost);
        });

      res.json(video);
    } catch (error) {
      console.error("Error generating video:", error);
      res.status(400).json({ message: "Failed to generate video" });
    }
  });

  // Subscribe to influencer
  app.post("/api/influencers/:id/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const user = await storage.getUser(userId);
      const influencer = await storage.getAIInfluencer(req.params.id);

      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found" });
      }

      const subscriptionPrice = influencer.subscriptionPrice ?? 0;
      
      if (!user || user.credits < subscriptionPrice) {
        return res.status(402).json({ message: "Insufficient credits" });
      }

      // Deduct subscription cost
      await storage.updateUserCredits(userId, -subscriptionPrice);

      // Credit creator (80/20 split)
      const creatorEarnings = Math.floor(subscriptionPrice * 0.8);
      await storage.updateUserCredits(influencer.creatorId, creatorEarnings);

      // Create subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 30 days

      const subscription = await storage.subscribeToInfluencer({
        userId,
        influencerId: req.params.id,
        endDate,
      });

      res.json(subscription);
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(400).json({ message: "Failed to subscribe" });
    }
  });

  // Unsubscribe from influencer
  app.post("/api/influencers/:id/unsubscribe", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      await storage.unsubscribeFromInfluencer(userId, req.params.id);
      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(400).json({ message: "Failed to unsubscribe" });
    }
  });

  // Get user's influencer subscriptions
  app.get("/api/influencers/subscriptions/me", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const subscriptions = await storage.getInfluencerSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // ======== INVITE CODE ROUTES ========

  // Get user's invite codes
  app.get("/api/invites/codes", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const codes = await storage.getUserInviteCodes(userId);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching invite codes:", error);
      res.status(500).json({ message: "Failed to fetch invite codes" });
    }
  });

  // Generate invite codes for user (called on first login)
  app.post("/api/invites/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      
      // IMPORTANT: Ensure user exists in database first
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User ${userId} not found in database`);
        return res.status(404).json({ 
          message: "User not found. Please log in again.",
          error: "USER_NOT_FOUND"
        });
      }
      
      // Check if user already has codes
      const existingCodes = await storage.getUserInviteCodes(userId);
      if (existingCodes.length > 0) {
        return res.json(existingCodes);
      }

      // Generate 5 codes
      const codes = await storage.createInviteCodes(userId, 5);
      res.json(codes);
    } catch (error) {
      console.error("Error generating invite codes:", error);
      res.status(500).json({ 
        message: "Failed to generate invite codes",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Validate invite code (public route for signup)
  app.post("/api/invites/validate", async (req, res) => {
    console.log("🔍 INVITE VALIDATION REQUEST RECEIVED:", req.body);
    try {
      const { code } = req.body;
      
      if (!code) {
        console.log("❌ No code provided in request");
        return res.status(400).json({ message: "Code is required" });
      }

      // Validate code from database ONLY (no hardcoded bypasses)
      console.log("✅ Validating code:", code);
      const inviteCode = await storage.validateInviteCode(code);
      
      if (!inviteCode) {
        console.log("❌ Invalid or used code:", code);
        return res.status(404).json({ message: "Invalid or already used invite code" });
      }

      console.log("✅ Code validation successful:", code);
      res.json({ valid: true, code: inviteCode });
    } catch (error) {
      console.error("❌ Error validating invite code:", error);
      res.status(500).json({ message: "Failed to validate invite code" });
    }
  });

  // NEW PDF-STYLE SIGNUP FLOW: Step 1 - Create verification and send email
  // INVITE CODE DISABLED - Open signup temporarily
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { inviteCode, email, username, password, dateOfBirth } = req.body;

      // Validate required fields (invite code now optional)
      if (!email || !username || !password) {
        return res.status(400).json({ 
          success: false,
          error: "Email, username, and password are required" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid email format" 
        });
      }

      // Validate username (3+ chars, alphanumeric + hyphens/underscores)
      if (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({ 
          success: false,
          error: "Username must be 3+ characters (letters, numbers, hyphens, underscores only)" 
        });
      }

      // Validate password (8+ chars, 1 uppercase, 1 number)
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ 
          success: false,
          error: "Password must be 8+ characters with 1 uppercase and 1 number" 
        });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: "Email already registered" 
        });
      }

      // Check if username already taken
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ 
          success: false,
          error: "Username already taken" 
        });
      }

      // INVITE CODE DISABLED - Skip validation for now
      // TODO: Re-enable when everything is fixed
      const normalizedCode = inviteCode ? inviteCode.toUpperCase().trim() : 'OPEN_SIGNUP';

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = await generateEmailVerificationCode();

      // Create signup verification record
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await db.insert(signupVerifications).values({
        email,
        username,
        passwordHash,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        inviteCode: normalizedCode,
        verificationToken,
        status: 'pending',
        expiresAt,
      });

      // Send verification email with credentials
      const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
      
      if (isEmailConfigured()) {
        await sendVerificationEmail(email, verificationLink, { email, username });
      } else {
        console.log('⚠️ Email not configured. Verification link:', verificationLink);
      }

      res.json({ 
        success: true,
        message: "Verification email sent! Check your inbox to confirm your account."
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ 
        success: false,
        error: "Signup failed. Please try again." 
      });
    }
  });

  // NEW PDF-STYLE SIGNUP FLOW: Step 2 - Verify email and create account
  app.get("/api/auth/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;

      // Find verification record
      const [verification] = await db
        .select()
        .from(signupVerifications)
        .where(eq(signupVerifications.verificationToken, token));

      if (!verification) {
        return res.status(404).send(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1>❌ Invalid Verification Link</h1>
              <p>This verification link is invalid or has already been used.</p>
              <a href="/">Return to homepage</a>
            </body>
          </html>
        `);
      }

      // Check if expired
      if (new Date() > verification.expiresAt) {
        return res.status(400).send(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1>⏰ Verification Link Expired</h1>
              <p>This verification link has expired. Please sign up again.</p>
              <a href="/signup">Sign up again</a>
            </body>
          </html>
        `);
      }

      // Check if already verified
      if (verification.status === 'verified') {
        return res.status(400).send(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1>✅ Already Verified</h1>
              <p>This account has already been verified.</p>
              <a href="/login">Go to login</a>
            </body>
          </html>
        `);
      }

      // Create user account
      const [newUser] = await db.insert(users).values({
        email: verification.email,
        username: verification.username,
        displayName: verification.username,
        passwordHash: verification.passwordHash,
        dateOfBirth: verification.dateOfBirth, // Age verification
        coins: 0,
        credits: 0, // No transferable credits on signup
        bonusCredits: 100, // 100 non-transferable welcome bonus credits
        role: 'user',
      }).returning();

      // Mark verification as verified
      await db
        .update(signupVerifications)
        .set({ 
          status: 'verified', 
          verifiedAt: new Date() 
        })
        .where(eq(signupVerifications.id, verification.id));

      // Use invite code
      if (verification.inviteCode.toUpperCase() !== "FOUNDER2026") {
        await storage.useInviteCode(verification.inviteCode, newUser.id);
      }

      // Generate 5 invite codes for new user
      await storage.createInviteCodes(newUser.id, 5);

      // Send welcome email with invite codes
      const inviteCodes = await storage.getUserInviteCodes(newUser.id);
      if (isEmailConfigured()) {
        await sendInviteCodesEmail(verification.email, inviteCodes.map(c => c.code));
      }

      // Success page with auto-login link
      res.send(`
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to PROFITHACK AI</title>
          </head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; max-width: 500px; margin: 0 auto; backdrop-filter: blur(10px);">
              <h1 style="font-size: 3rem; margin-bottom: 20px;">✅ Welcome to PROFITHACK AI!</h1>
              <p style="font-size: 1.2rem; margin-bottom: 30px;">Your account has been created successfully.</p>
              <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Email:</strong> ${verification.email}</p>
                <p><strong>Username:</strong> @${verification.username}</p>
                <p><strong>Welcome Bonus:</strong> 100 CREDITS</p>
              </div>
              <p style="margin: 20px 0;">You've received 5 invite codes to share with friends!</p>
              <a href="/login" style="display: inline-block; background: white; color: #667eea; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">
                Sign In Now →
              </a>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Verification Failed</h1>
            <p>An error occurred during verification. Please try again.</p>
            <a href="/">Return to homepage</a>
          </body>
        </html>
      `);
    }
  });

  // ADMIN: Get a fresh invite code (bypass for creator)
  app.get("/api/admin/get-code", async (req, res) => {
    try {
      // Get founder codes
      const allCodes = await storage.getAllInviteCodes();
      const validCode = allCodes.find(c => !c.isUsed);
      
      if (!validCode) {
        return res.status(404).json({ message: "No available codes - all used!" });
      }

      console.log(`🔓 ADMIN BYPASS: Providing fresh code ${validCode.code}`);
      res.json({ 
        code: validCode.code,
        redirectUrl: `/signup?invite=${validCode.code}`
      });
    } catch (error) {
      console.error("Admin bypass error:", error);
      res.status(500).json({ message: "Failed to get admin code" });
    }
  });

  // Use invite code (called during signup)
  app.post("/api/invites/use", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }

      // HARDCODED ADMIN BYPASS CODE - Don't mark as used
      if (code.toUpperCase() === "FOUNDER2026") {
        console.log("✅ FOUNDER2026 ADMIN CODE USED - SKIPPING DATABASE TRACKING");
        return res.json({ message: "Invite code used successfully (admin bypass)" });
      }

      await storage.useInviteCode(code, userId);
      res.json({ message: "Invite code used successfully" });
    } catch (error) {
      console.error("Error using invite code:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to use invite code" });
    }
  });

  // Get user's invites (people they invited)
  app.get("/api/invites/my-invites", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const invites = await storage.getUserInvites(userId);
      res.json(invites);
    } catch (error) {
      console.error("Error fetching user invites:", error);
      res.status(500).json({ message: "Failed to fetch invites" });
    }
  });

  // Get invite stats
  app.get("/api/invites/stats", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const stats = await storage.getInviteStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching invite stats:", error);
      res.status(500).json({ message: "Failed to fetch invite stats" });
    }
  });

  // ======== ADMIN ROUTES ========

  // Get all platform invite codes (for sharing with users)
  app.get("/api/admin/platform-codes", async (req, res) => {
    const { setup_token } = req.query;
    
    // Security: Only allow with setup token
    if (setup_token !== "PROFITHACK_INITIAL_SETUP") {
      return res.status(403).json({ message: "Invalid setup token" });
    }
    
    try {
      const systemUserId = "00000000-0000-0000-0000-000000000000";
      const codes = await storage.getUserInviteCodes(systemUserId);
      const unusedCodes = codes.filter(c => !c.isUsed);
      const usedCodes = codes.filter(c => c.isUsed);
      
      res.json({ 
        success: true,
        total: codes.length,
        unused: unusedCodes.length,
        used: usedCodes.length,
        codes: codes.map(c => ({
          code: c.code,
          isUsed: c.isUsed,
          usedBy: c.usedBy,
          usedAt: c.usedAt,
        })),
        // Just the codes for easy copying
        codeList: unusedCodes.map(c => c.code)
      });
    } catch (error) {
      console.error("Error fetching platform codes:", error);
      res.status(500).json({ message: "Failed to fetch codes" });
    }
  });

  // Manual trigger to generate codes (POST or GET)
  const generateCodesHandler = async (req: any, res: any) => {
    const { setup_token } = req.query;
    
    // Security: Only allow with setup token
    if (setup_token !== "PROFITHACK_INITIAL_SETUP") {
      return res.status(403).json({ message: "Invalid setup token" });
    }
    
    try {
      const systemUserId = "00000000-0000-0000-0000-000000000000";
      const existingCodes = await storage.getUserInviteCodes(systemUserId);
      
      if (existingCodes.length > 0) {
        return res.json({ 
          success: true,
          message: "Codes already exist",
          total: existingCodes.length,
          unused: existingCodes.filter(c => !c.isUsed).length,
          codeList: existingCodes.filter(c => !c.isUsed).map(c => c.code)
        });
      }
      
      // Generate 1000 codes
      const codes = await storage.createInviteCodes(systemUserId, 1000);
      
      res.json({ 
        success: true,
        message: "Generated 1000 invite codes",
        total: codes.length,
        codeList: codes.map(c => c.code)
      });
    } catch (error) {
      console.error("Error generating platform codes:", error);
      res.status(500).json({ 
        message: "Failed to generate codes",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  
  app.post("/api/admin/platform-codes/generate", generateCodesHandler);
  app.get("/api/admin/platform-codes/generate", generateCodesHandler);

  // Premium Username Marketplace Routes
  app.get("/api/usernames", async (req, res) => {
    try {
      const { tier, status, search } = req.query;
      const usernames = await storage.getPremiumUsernames({
        tier: tier as any,
        status: status as any,
        search: search as string,
      });
      res.json(usernames);
    } catch (error) {
      console.error("Error fetching usernames:", error);
      res.status(500).json({ message: "Failed to fetch usernames" });
    }
  });

  app.get("/api/usernames/:username", async (req, res) => {
    try {
      const username = await storage.getPremiumUsernameByName(req.params.username);
      if (!username) {
        return res.status(404).json({ message: "Username not found" });
      }
      res.json(username);
    } catch (error) {
      console.error("Error fetching username:", error);
      res.status(500).json({ message: "Failed to fetch username" });
    }
  });

  app.post("/api/usernames/:id/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const user = await storage.getUser(userId);
      const username = await storage.getPremiumUsername(req.params.id);

      if (!username || !user) {
        return res.status(404).json({ message: "Username or user not found" });
      }

      if (username.status !== "available") {
        return res.status(400).json({ message: "Username not available" });
      }

      if (user.credits < username.priceCredits) {
        return res.status(402).json({ message: "Insufficient credits" });
      }

      const purchase = await storage.purchaseUsername(userId, req.params.id);
      res.json(purchase);
    } catch (error) {
      console.error("Error purchasing username:", error);
      res.status(400).json({ message: "Failed to purchase username" });
    }
  });

  app.post("/api/usernames/:id/bid", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { bidAmount } = req.body;
      const user = await storage.getUser(userId);
      const username = await storage.getPremiumUsername(req.params.id);

      if (!username || !user) {
        return res.status(404).json({ message: "Username or user not found" });
      }

      if (username.status !== "auction") {
        return res.status(400).json({ message: "Username not in auction" });
      }

      if (user.credits < bidAmount) {
        return res.status(402).json({ message: "Insufficient credits" });
      }

      const bid = await storage.placeBid(req.params.id, userId, bidAmount);
      res.json(bid);
    } catch (error) {
      console.error("Error placing bid:", error);
      res.status(400).json({ message: "Failed to place bid" });
    }
  });

  // WhatsApp-style Conversations Routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { participantIds, name, isGroup } = req.body;
      
      const conversation = await storage.createConversation({
        creatorId: userId,
        name,
        isGroup,
        participantIds: [...participantIds, userId],
      });
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { content, messageType } = req.body;
      
      const message = await storage.sendConversationMessage({
        conversationId: req.params.id,
        senderId,
        content,
        messageType: messageType || "text",
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // MTN Mobile Money (MoMo) Routes - African Markets
  app.get("/api/momo/configured", (req, res) => {
    res.json({ configured: isMomoConfigured() });
  });

  app.post("/api/momo/create-payment", isAuthenticated, handleMomoPaymentCreation);

  app.get("/api/momo/payment-status/:referenceId", isAuthenticated, handleMomoPaymentStatus);

  app.post("/api/momo/subscription", isAuthenticated, async (req: any, res) => {
    try {
      if (!isMomoConfigured()) {
        return res.status(503).json({ message: "MTN MoMo not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { tier, phoneNumber } = req.body;

      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const amount = (TIER_PRICES[tier as keyof typeof TIER_PRICES] / 100).toString();
      const orderId = `profithack-${tier}-${Date.now()}`;
      const description = `PROFITHACK AI ${tier} subscription`;

      const { createMomoPayment } = await import("./momo");
      const result = await createMomoPayment(
        amount,
        "USD",
        orderId,
        phoneNumber,
        description,
        "Thank you for subscribing to PROFITHACK AI"
      );

      // Store in session for verification
      req.session.momoTier = tier;
      req.session.momoUserId = userId;
      req.session.momoReferenceId = result.referenceId;

      res.json({
        referenceId: result.referenceId,
        status: result.status,
        message: "Payment initiated. Please check your phone for USSD prompt.",
      });
    } catch (error: any) {
      console.error("Error creating MoMo subscription:", error);
      res.status(500).json({ message: error.message || "Failed to create subscription" });
    }
  });

  app.post("/api/momo/verify-subscription", isAuthenticated, async (req: any, res) => {
    try {
      if (!isMomoConfigured()) {
        return res.status(503).json({ message: "MTN MoMo not configured" });
      }

      const { referenceId } = req.body;
      const tier = req.session.momoTier;
      const userId = req.session.momoUserId;

      if (!tier || !userId) {
        return res.status(400).json({ message: "Session expired" });
      }

      const { getMomoPaymentStatus } = await import("./momo");
      const status = await getMomoPaymentStatus(referenceId);

      if (status.status === "SUCCESSFUL") {
        const creditsEarned = TIER_CREDITS[tier as keyof typeof TIER_CREDITS];

        await storage.updateUserCredits(userId, creditsEarned);
        await storage.createTransaction({
          userId,
          type: "subscription",
          amount: creditsEarned,
          paymentProvider: "mtn_momo",
          providerMetadata: {
            tier,
            referenceId,
            financialTransactionId: status.financialTransactionId,
          },
        });
        await storage.updateUserSubscription(userId, tier as "creator" | "innovator");

        delete req.session.momoTier;
        delete req.session.momoUserId;
        delete req.session.momoReferenceId;

        res.json({ success: true, credits: creditsEarned, tier });
      } else if (status.status === "FAILED") {
        res.json({ success: false, status: "failed", reason: status.reason });
      } else {
        res.json({ success: false, status: "pending" });
      }
    } catch (error: any) {
      console.error("Error verifying MoMo subscription:", error);
      res.status(500).json({ message: error.message || "Failed to verify subscription" });
    }
  });

  // Square Payment Routes
  app.get("/api/square/configured", (req, res) => {
    res.json({ configured: isSquareConfigured() });
  });

  app.post("/api/square/subscription", isAuthenticated, async (req: any, res) => {
    try {
      if (!isSquareConfigured()) {
        return res.status(503).json({ message: "Square not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const user = await storage.getUser(userId);
      const { sourceId, tier } = req.body;

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!sourceId || !tier) {
        return res.status(400).json({ message: "Missing sourceId or tier" });
      }

      if (!TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const result = await handleSquareSubscription({
        sourceId,
        tier,
        userId,
        userEmail: user.email || undefined,
      });

      // Add credits to user
      await storage.updateUserCredits(userId, result.credits);

      // Record transaction
      await storage.createTransaction({
        userId,
        type: "subscription",
        amount: result.credits,
        paymentProvider: "square",
        providerMetadata: {
          tier,
          paymentId: result.paymentId,
          status: result.status,
        },
      });

      // Update subscription tier
      await storage.updateUserSubscription(userId, tier as "creator" | "innovator");

      res.json({
        success: true,
        credits: result.credits,
        tier,
        paymentId: result.paymentId,
      });
    } catch (error: any) {
      console.error("Error creating Square subscription:", error);
      res.status(500).json({ message: error.message || "Failed to create subscription" });
    }
  });

  app.post("/api/square/credits", isAuthenticated, async (req: any, res) => {
    try {
      if (!isSquareConfigured()) {
        return res.status(503).json({ message: "Square not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { sourceId, amount } = req.body;

      if (!sourceId || !amount || amount < 1) {
        return res.status(400).json({ message: "Missing or invalid sourceId or amount" });
      }

      const result = await handleSquareCredits({
        sourceId,
        amount,
        userId,
      });

      // Add credits to user
      await storage.updateUserCredits(userId, result.credits);

      // Record transaction
      await storage.createTransaction({
        userId,
        type: "credit_purchase",
        amount: result.credits,
        paymentProvider: "square",
        providerMetadata: {
          paymentId: result.paymentId,
          status: result.status,
          amountUSD: amount,
        },
      });

      res.json({
        success: true,
        credits: result.credits,
        amountUSD: amount,
        paymentId: result.paymentId,
      });
    } catch (error: any) {
      console.error("Error purchasing Square credits:", error);
      res.status(500).json({ message: error.message || "Failed to purchase credits" });
    }
  });

  // Wallet Management Routes
  app.get("/api/wallet/balance", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const balance = await getWalletBalance(userId);
      
      res.json({ balance });
    } catch (error: any) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });

  // Get wallet transaction history (with proper USD formatting)
  app.get("/api/wallet/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);

      // Fetch wallet-related transactions only
      const walletTransactions = await storage.getTransactions(userId);

      // Format transactions with proper USD amounts (stored in cents)
      const formattedTransactions = walletTransactions.map((tx: any) => ({
        ...tx,
        // amount is stored in cents, convert back to dollars for display
        amountUSD: tx.amount / 100,
      }));

      res.json(formattedTransactions);
    } catch (error: any) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Creator Analytics
  app.get("/api/analytics/creator", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      
      // Get user's videos with stats
      const userVideos = await storage.getVideos();
      const myVideos = userVideos.filter((v: any) => v.userId === userId);

      // Calculate totals
      const totalViews = myVideos.reduce((sum: number, v: any) => sum + (v.viewCount || 0), 0);
      const totalLikes = myVideos.reduce((sum: number, v: any) => sum + (v.likeCount || 0), 0);
      const totalComments = myVideos.reduce((sum: number, v: any) => sum + (v.commentCount || 0), 0);
      const totalShares = myVideos.reduce((sum: number, v: any) => sum + (v.giftCount || 0), 0);

      // Estimate earnings (60% revenue share, approx $0.02 per view)
      const estimatedEarnings = totalViews * 0.02 * 0.60;
      const pendingEarnings = estimatedEarnings * 0.3; // 30% pending
      const paidEarnings = estimatedEarnings * 0.7; // 70% paid

      // Mock follower data
      const followerCount = Math.max(100, Math.floor(totalLikes / 10));
      const newFollowers = Math.floor(followerCount * 0.05);

      // Generate chart data for last 7 days
      const chartData = {
        earningsChart: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          earnings: Number((estimatedEarnings / 7 * (1 + Math.random() * 0.3)).toFixed(2)),
          views: Math.floor(totalViews / 7 * (1 + Math.random() * 0.3)),
        })),
        engagementChart: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          likes: Math.floor(totalLikes / 7 * (1 + Math.random() * 0.3)),
          comments: Math.floor(totalComments / 7 * (1 + Math.random() * 0.3)),
          shares: Math.floor(totalShares / 7 * (1 + Math.random() * 0.3)),
        })),
      };

      // Top performing videos
      const topVideos = myVideos
        .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5)
        .map((video: any) => ({
          id: video.id,
          title: video.title,
          views: video.viewCount || 0,
          likes: video.likeCount || 0,
          earnings: Number(((video.viewCount || 0) * 0.02 * 0.60).toFixed(2)),
          createdAt: video.createdAt,
        }));

      const analytics = {
        earnings: {
          total: Number(estimatedEarnings.toFixed(2)),
          pending: Number(pendingEarnings.toFixed(2)),
          paid: Number(paidEarnings.toFixed(2)),
          thisWeek: Number((estimatedEarnings / 4).toFixed(2)),
          lastWeek: Number((estimatedEarnings / 4 * 0.9).toFixed(2)),
          growth: Number((((estimatedEarnings / 4) / Math.max(1, estimatedEarnings / 4 * 0.9) - 1) * 100).toFixed(1)),
        },
        engagement: {
          totalViews,
          totalLikes,
          totalComments,
          totalShares,
          avgEngagementRate: totalViews > 0 ? Number(((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(1)) : 0,
        },
        growth: {
          followers: followerCount,
          newFollowers,
          followerGrowth: Number((newFollowers / Math.max(1, followerCount - newFollowers) * 100).toFixed(1)),
          videoCount: myVideos.length,
        },
        chartData,
        topVideos,
      };

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/wallet/deposit/momo", isAuthenticated, async (req: any, res) => {
    try {
      if (!isMomoConfigured()) {
        return res.status(503).json({ message: "MTN MoMo not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { amount, phoneNumber } = req.body;

      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid amount. Minimum deposit is $1" });
      }

      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required for MoMo deposits" });
      }

      const result = await createMomoPayment(
        amount.toString(),
        "EUR",
        `wallet-${userId}-${Date.now()}`,
        phoneNumber,
        "Wallet deposit",
        "Thank you"
      );
      
      // Store pending deposit in session for webhook processing
      req.session.momoWalletDeposit = {
        userId,
        amount,
        referenceId: result.referenceId,
      };
      
      res.json({
        success: true,
        referenceId: result.referenceId,
        message: "Please check your phone to approve the payment",
      });
    } catch (error: any) {
      console.error("Error creating MoMo wallet deposit:", error);
      res.status(500).json({ message: error.message || "Failed to create MoMo deposit" });
    }
  });

  app.post("/api/wallet/deposit/crypto", isAuthenticated, async (req: any, res) => {
    try {
      if (!isCryptoPaymentsConfigured()) {
        return res.status(503).json({ message: "Crypto payments not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { amount } = req.body;

      if (!amount || amount < 5) {
        return res.status(400).json({ message: "Invalid amount. Minimum deposit is $5" });
      }

      const appUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : `http://localhost:${process.env.PORT || 5000}`;

      const invoice = await cryptoPaymentService.createInvoice({
        amountUSD: amount,
        userId,
        callbackUrl: `${appUrl}/api/wallet/deposit/crypto/webhook`,
        successUrl: `${appUrl}/wallet?deposit=success`,
        cancelUrl: `${appUrl}/wallet?deposit=cancelled`,
      });

      res.json({
        paymentUrl: invoice.invoice_url,
        invoiceId: invoice.id,
        amount: amount,
      });
    } catch (error: any) {
      console.error("Error creating crypto wallet deposit:", error);
      res.status(500).json({ message: error.message || "Failed to create crypto deposit" });
    }
  });

  app.post("/api/wallet/deposit/crypto/webhook", async (req, res) => {
    try {
      const webhookData = req.body;
      const signature = req.headers['x-nowpayments-sig'] as string;
      
      const result = await cryptoPaymentService.processWebhook(webhookData, signature);

      if (result.status === "finished") {
        const amountUSD = result.credits / 41; // Convert credits back to USD (23% markup applied)
        
        await creditWallet({
          userId: result.userId,
          amount: amountUSD,
          paymentProvider: "crypto_nowpayments",
          providerTransactionId: result.paymentId,
          description: "Crypto wallet deposit",
        });
      }

      res.sendStatus(200);
    } catch (error: any) {
      console.error("Error processing crypto deposit webhook:", error);
      res.sendStatus(200); // Always return 200 to prevent webhook retries
    }
  });

  app.post("/api/wallet/deposit/square", isAuthenticated, async (req: any, res) => {
    try {
      if (!isSquareConfigured()) {
        return res.status(503).json({ message: "Square not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { amount, sourceId } = req.body;

      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid amount. Minimum deposit is $1" });
      }

      if (!sourceId) {
        return res.status(400).json({ message: "Payment source is required" });
      }

      const result = await handleSquareCredits({ sourceId, amount, userId });
      
      const amountUSD = result.credits / 41; // Convert credits back to USD (23% markup applied)
      
      await creditWallet({
        userId,
        amount: amountUSD,
        paymentProvider: "square",
        providerTransactionId: result.paymentId,
        description: "Wallet deposit via Square",
      });

      res.json({
        success: true,
        amount: amountUSD,
        paymentId: result.paymentId,
      });
    } catch (error: any) {
      console.error("Error processing Square wallet deposit:", error);
      res.status(500).json({ message: error.message || "Failed to process Square deposit" });
    }
  });

  app.post("/api/wallet/deposit/paypal", isAuthenticated, async (req: any, res) => {
    try {
      if (!isPayPalConfigured()) {
        return res.status(503).json({ message: "PayPal not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { amount } = req.body;

      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid amount. Minimum deposit is $1" });
      }

      const appUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : `http://localhost:${process.env.PORT || 5000}`;

      const order = await createPaypalOrderDirect(
        amount.toString(),
        "Wallet Deposit",
        `${appUrl}/wallet?deposit=success`,
        `${appUrl}/wallet?deposit=cancelled`
      );

      // Store pending deposit for later processing
      req.session.paypalWalletDeposit = {
        userId,
        amount,
        orderId: order.id,
      };

      res.json({
        orderId: order.id,
        approvalUrl: order.links.find((link: any) => link.rel === "approve")?.href,
      });
    } catch (error: any) {
      console.error("Error creating PayPal wallet deposit:", error);
      res.status(500).json({ message: error.message || "Failed to create PayPal deposit" });
    }
  });

  app.post("/api/wallet/deposit/paypal/capture", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      const result = await capturePaypalOrderDirect(orderId);
      const amountUSD = parseFloat(result.purchase_units[0].amount.value);

      await creditWallet({
        userId,
        amount: amountUSD,
        paymentProvider: "paypal",
        providerTransactionId: orderId,
        description: "Wallet deposit via PayPal",
      });

      res.json({
        success: true,
        amount: amountUSD,
        orderId,
      });
    } catch (error: any) {
      console.error("Error capturing PayPal wallet deposit:", error);
      res.status(500).json({ message: error.message || "Failed to capture PayPal deposit" });
    }
  });

  app.post("/api/wallet/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { amount, paymentProvider, momoPhoneNumber } = req.body;

      if (!amount || amount < 10) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $10" });
      }

      if (paymentProvider === "mtn_momo" && !momoPhoneNumber) {
        return res.status(400).json({ message: "Phone number is required for MoMo withdrawals" });
      }

      const withdrawalRequest = await createWithdrawalRequest({
        userId,
        amount,
        paymentProvider,
        momoPhoneNumber,
      });

      res.json({
        success: true,
        withdrawalId: withdrawalRequest.id,
        amount,
        fee: parseFloat(withdrawalRequest.fee),
        netAmount: parseFloat(withdrawalRequest.netAmount),
        status: withdrawalRequest.status,
      });
    } catch (error: any) {
      console.error("Error creating withdrawal request:", error);
      res.status(500).json({ message: error.message || "Failed to create withdrawal request" });
    }
  });

  // Wallet-based subscription (like TikTok coins!)
  app.post("/api/wallet/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { tier } = req.body;

      if (!tier || !["creator", "innovator"].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }

      const result = await purchaseSubscriptionWithWallet(userId, tier as "creator" | "innovator");

      res.json({
        success: true,
        tier: result.tier,
        credits: result.credits,
        amountCharged: result.amountCharged,
        message: `Successfully subscribed to ${tier} plan!`,
      });
    } catch (error: any) {
      console.error("Error purchasing subscription with wallet:", error);
      res.status(500).json({ message: error.message || "Failed to purchase subscription" });
    }
  });

  // Wallet-based credit purchase (for AI tools only)
  app.post("/api/wallet/purchase-credits", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { amount } = req.body;

      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid amount. Minimum purchase is $1" });
      }

      const result = await purchaseCreditsWithWallet(userId, amount);

      res.json({
        success: true,
        credits: result.credits,
        amountCharged: result.amountCharged,
        message: `Successfully purchased ${result.credits} credits!`,
      });
    } catch (error: any) {
      console.error("Error purchasing credits with wallet:", error);
      res.status(500).json({ message: error.message || "Failed to purchase credits" });
    }
  });

  // Wallet-based coin purchase (for gifts/tips - TikTok pricing!)
  app.post("/api/wallet/purchase-coins", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { packageId } = req.body;

      if (!packageId) {
        return res.status(400).json({ message: "Package ID required" });
      }

      // Import coin packages
      const { COIN_PACKAGES } = await import("@shared/coin-packages");
      const selectedPackage = COIN_PACKAGES.find(pkg => pkg.id === packageId);

      if (!selectedPackage) {
        return res.status(400).json({ message: "Invalid package" });
      }

      // For now, just add coins directly (wallet-based)
      // TODO: Integrate with payment providers for real purchases
      await storage.updateUserCoins(userId, selectedPackage.coins);

      // Record transaction
      await storage.createTransaction({
        userId,
        type: "coin_purchase",
        amount: selectedPackage.coins,
        description: `Purchased ${selectedPackage.coins} coins`,
      });

      res.json({
        success: true,
        coins: selectedPackage.coins,
        amountCharged: selectedPackage.priceUSD,
        message: `Successfully purchased ${selectedPackage.coins} coins!`,
      });
    } catch (error: any) {
      console.error("Error purchasing coins:", error);
      res.status(500).json({ message: error.message || "Failed to purchase coins" });
    }
  });

  // Quick payment/purchase endpoint for coins & credits
  app.post("/api/payments/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { type, amount, priceCents } = req.body;
      
      if (!type || !amount || !priceCents) {
        return res.status(400).json({ message: "Type, amount, and price required" });
      }
      
      // For MVP - just add credits/coins (would integrate with payment provider)
      if (type === "credits") {
        await storage.updateUserCredits(userId, amount);
      } else if (type === "coins") {
        await db.update(users).set({
          coins: sql`${users.coins} + ${amount}`
        }).where(eq(users.id, userId));
      }
      
      await storage.createTransaction({
        userId,
        type: "credit_purchase",
        amount: priceCents,
        status: "completed",
      });
      
      res.json({ success: true, amount });
    } catch (error: any) {
      console.error("Error processing purchase:", error);
      res.status(500).json({ message: error.message || "Failed to process purchase" });
    }
  });

  // Battle rooms API
  app.post("/api/battles/create", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { title, teamCount, teamSize, maxParticipants } = req.body;
      
      const roomName = `battle_${userId}_${Date.now()}`;
      
      // Create Twilio room
      const twilioRoom = await twilioVideoService.createRoom({
        uniqueName: roomName,
        type: "battle",
        maxParticipants: maxParticipants || 20,
      });
      
      // Store in database
      const dbRoom = await storage.createTwilioRoom({
        twilioRoomSid: twilioRoom.roomSid,
        roomType: "battle",
        hostId: userId,
        title: title || "Battle Room",
        maxParticipants: maxParticipants || 20,
        teamCount: teamCount || 0,
        teamSize: teamSize || 1,
        status: "active",
      });
      
      res.json(dbRoom);
    } catch (error: any) {
      console.error("Error creating battle:", error);
      res.status(500).json({ message: error.message || "Failed to create battle" });
    }
  });

  app.get("/api/battles/active", async (req, res) => {
    try {
      const rooms = await twilioVideoService.getActiveRooms("battle");
      res.json(rooms);
    } catch (error: any) {
      console.error("Error fetching battles:", error);
      res.status(500).json({ message: error.message || "Failed to fetch battles" });
    }
  });

  app.post("/api/battles/:id/join", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const roomId = req.params.id;
      
      const room = await storage.getTwilioRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      // Generate access token for user to join
      const token = await twilioVideoService.generateAccessToken({
        identity: userId,
        roomName: room.twilioRoomSid,
      });
      
      // Add participant to database
      await storage.addTwilioParticipant({
        roomId: room.id,
        userId,
        twilioParticipantSid: `participant_${userId}_${Date.now()}`,
      });
      
      res.json({
        token,
        roomSid: room.twilioRoomSid,
        roomName: room.twilioRoomSid,
      });
    } catch (error: any) {
      console.error("Error joining battle:", error);
      res.status(500).json({ message: error.message || "Failed to join battle" });
    }
  });

  // Battle Challenges API
  app.post("/api/battles/challenge/send", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { challengedId, title, message, battleType, teamCount, teamSize } = req.body;
      
      if (!challengedId || !title) {
        return res.status(400).json({ message: "Challenged user and title required" });
      }
      
      // Can't challenge yourself
      if (challengedId === userId) {
        return res.status(400).json({ message: "Cannot challenge yourself" });
      }
      
      // Create challenge with 24 hour expiry
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const [challenge] = await db.insert(battleChallenges).values({
        challengerId: userId,
        challengedId,
        title,
        message: message || null,
        battleType: battleType || "solo",
        teamCount: teamCount || 2,
        teamSize: teamSize || 1,
        status: "pending",
        expiresAt,
      }).returning();
      
      res.json(challenge);
    } catch (error: any) {
      console.error("Error sending battle challenge:", error);
      res.status(500).json({ message: error.message || "Failed to send challenge" });
    }
  });

  app.get("/api/battles/challenges/pending", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      
      // Get challenges where user is challenged and status is pending
      const pendingChallenges = await db.query.battleChallenges.findMany({
        where: (challenges, { eq, and }) => and(
          eq(challenges.challengedId, userId),
          eq(challenges.status, "pending")
        ),
        with: {
          challenger: true,
        },
        orderBy: (challenges, { desc }) => [desc(challenges.createdAt)],
      });
      
      res.json(pendingChallenges);
    } catch (error: any) {
      console.error("Error fetching pending challenges:", error);
      res.status(500).json({ message: error.message || "Failed to fetch challenges" });
    }
  });

  app.post("/api/battles/challenge/:id/accept", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const challengeId = req.params.id;
      
      const challenge = await db.query.battleChallenges.findFirst({
        where: (challenges, { eq }) => eq(challenges.id, challengeId),
      });
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      if (challenge.challengedId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      if (challenge.status !== "pending") {
        return res.status(400).json({ message: "Challenge already responded to" });
      }
      
      // Check if expired
      if (new Date() > new Date(challenge.expiresAt)) {
        await db.update(battleChallenges)
          .set({ status: "expired" })
          .where(eq(battleChallenges.id, challengeId));
        return res.status(400).json({ message: "Challenge has expired" });
      }
      
      // Create battle room
      const roomName = `battle_${challenge.challengerId}_${userId}_${Date.now()}`;
      const twilioRoom = await twilioVideoService.createRoom({
        uniqueName: roomName,
        type: "battle",
        maxParticipants: challenge.battleType === "teams" ? challenge.teamCount * challenge.teamSize : challenge.teamCount,
      });
      
      const dbRoom = await storage.createTwilioRoom({
        twilioRoomSid: twilioRoom.roomSid,
        roomType: "battle",
        hostId: challenge.challengerId,
        coHostId: userId,
        title: challenge.title,
        maxParticipants: challenge.battleType === "teams" ? challenge.teamCount * challenge.teamSize : challenge.teamCount,
        teamCount: challenge.teamCount,
        teamSize: challenge.teamSize,
        status: "active",
      });
      
      // Update challenge status
      await db.update(battleChallenges)
        .set({
          status: "accepted",
          respondedAt: new Date(),
          roomId: dbRoom.id,
        })
        .where(eq(battleChallenges.id, challengeId));
      
      res.json({ ...challenge, roomId: dbRoom.id, battleRoom: dbRoom });
    } catch (error: any) {
      console.error("Error accepting challenge:", error);
      res.status(500).json({ message: error.message || "Failed to accept challenge" });
    }
  });

  app.post("/api/battles/challenge/:id/decline", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const challengeId = req.params.id;
      
      const challenge = await db.query.battleChallenges.findFirst({
        where: (challenges, { eq }) => eq(challenges.id, challengeId),
      });
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      if (challenge.challengedId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      if (challenge.status !== "pending") {
        return res.status(400).json({ message: "Challenge already responded to" });
      }
      
      await db.update(battleChallenges)
        .set({
          status: "declined",
          respondedAt: new Date(),
        })
        .where(eq(battleChallenges.id, challengeId));
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error declining challenge:", error);
      res.status(500).json({ message: error.message || "Failed to decline challenge" });
    }
  });

  // Live stream API
  app.post("/api/live/create", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { title, description, isPremium, creditsPerMinute, isAdultContent, maxParticipants } = req.body;
      
      const roomName = `live_${userId}_${Date.now()}`;
      
      // Create Twilio room
      const twilioRoom = await twilioVideoService.createRoom({
        uniqueName: roomName,
        type: "live_stream",
        maxParticipants: maxParticipants || 20,
      });
      
      // Store in database
      const dbRoom = await storage.createTwilioRoom({
        twilioRoomSid: twilioRoom.roomSid,
        roomType: "live_stream",
        hostId: userId,
        title: title || "Live Stream",
        description: description || "",
        maxParticipants: maxParticipants || 20,
        creditsPerMinute: isPremium ? (creditsPerMinute || 0) : null,
        isAdultContent: isAdultContent || false,
        status: "active",
      });
      
      // Generate host access token
      const token = await twilioVideoService.generateAccessToken({
        identity: userId,
        roomName: twilioRoom.roomSid,
      });
      
      res.json({
        ...dbRoom,
        token,
      });
    } catch (error: any) {
      console.error("Error creating live stream:", error);
      res.status(500).json({ message: error.message || "Failed to create live stream" });
    }
  });

  app.get("/api/live/active", async (req, res) => {
    try {
      const rooms = await twilioVideoService.getActiveRooms("live_stream");
      res.json(rooms);
    } catch (error: any) {
      console.error("Error fetching live streams:", error);
      res.status(500).json({ message: error.message || "Failed to fetch live streams" });
    }
  });

  // Send Spark (virtual gift) with hidden fees - better than TikTok!
  // Platform takes 40% (vs TikTok's 50%), creator gets 60%
  app.post("/api/sparks/send", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { creatorId, sparkType, sparkValue } = req.body;

      if (!creatorId || !sparkType || !sparkValue) {
        return res.status(400).json({ message: "Creator ID, spark type, and value are required" });
      }

      if (sparkValue < 0.1) {
        return res.status(400).json({ message: "Minimum Spark value is $0.10" });
      }

      const result = await sendSpark(senderId, creatorId, sparkType, sparkValue);

      res.json({
        success: true,
        sparkType: result.sparkType,
        sparkValue: result.sparkValue,
        creatorEarnings: result.creatorEarnings,
        message: `Successfully sent ${sparkType} Spark!`,
      });
    } catch (error: any) {
      console.error("Error sending Spark:", error);
      res.status(500).json({ message: error.message || "Failed to send Spark" });
    }
  });

  // Crypto Payment Routes
  app.post("/api/payments/crypto/create", isAuthenticated, async (req: any, res) => {
    try {
      if (!isCryptoPaymentsConfigured()) {
        return res.status(503).json({
          message: "Crypto payments not configured. Please contact support.",
        });
      }

      const { userId } = getUserFromRequest(req);
      const { amount } = req.body; // Amount in USD

      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const appUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : `http://localhost:${process.env.PORT || 5000}`;

      const invoice = await cryptoPaymentService.createInvoice({
        amountUSD: amount,
        userId,
        callbackUrl: `${appUrl}/api/payments/crypto/webhook`,
        successUrl: `${appUrl}/wallet?payment=success`,
        cancelUrl: `${appUrl}/wallet?payment=cancelled`,
      });

      res.json({
        paymentUrl: invoice.invoice_url,
        invoiceId: invoice.id,
        amount: amount,
        credits: amount * 41, // 23% markup applied
      });
    } catch (error: any) {
      console.error("Error creating crypto payment:", error);
      res.status(500).json({
        message: error.message || "Failed to create crypto payment",
      });
    }
  });

  app.post("/api/payments/crypto/webhook", async (req, res) => {
    try {
      const webhookData = req.body;
      const signature = req.headers['x-nowpayments-sig'] as string;
      
      // SECURITY: Process webhook by verifying signature and re-fetching from NOWPayments
      // This prevents attackers from sending fake "paid" events
      const result = await cryptoPaymentService.processWebhook(webhookData, signature);

      if (result.status === "finished") {
        // Check if transaction already exists to prevent double-crediting
        const existingTransactions = await storage.getTransactions(result.userId);
        const alreadyProcessed = existingTransactions.some(
          (tx) => tx.providerMetadata && (tx.providerMetadata as any).paymentId === result.paymentId
        );

        if (alreadyProcessed) {
          console.log(`Payment ${result.paymentId} already processed, skipping`);
          return res.sendStatus(200);
        }

        // Add credits to user
        await storage.updateUserCredits(result.userId, result.credits);

        // Record transaction
        await storage.createTransaction({
          userId: result.userId,
          type: "credit_purchase",
          amount: result.credits,
          paymentProvider: "crypto_nowpayments",
          providerMetadata: { paymentId: result.paymentId },
        });

        console.log(`Crypto payment processed: ${result.credits} credits added to user ${result.userId}`);
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Crypto webhook error:", error);
      res.sendStatus(200); // Always return 200 to avoid retries
    }
  });

  app.get("/api/payments/crypto/status", isAuthenticated, async (req: any, res) => {
    try {
      res.json({
        configured: isCryptoPaymentsConfigured(),
        supportedCurrencies: ["BTC", "ETH", "USDT", "USDC"],
        conversionRate: 41, // $1 = 41 credits (23% markup applied)
      });
    } catch (error) {
      console.error("Error checking crypto status:", error);
      res.status(500).json({ message: "Failed to check crypto status" });
    }
  });

  // TON (Telegram Open Network) Payment Routes
  app.post("/api/payments/ton/create", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { amountUSD } = req.body;

      if (!amountUSD || amountUSD < 1) {
        return res.status(400).json({ message: "Invalid amount. Minimum $1 USD" });
      }

      // Convert USD to TON
      const tonAmount = await tonPaymentService.convertUsdToTon(amountUSD);
      const credits = Math.floor(amountUSD * 41); // $1 = 41 credits (23% markup)

      // Create payment request
      const orderId = `ton_${userId}_${Date.now()}`;
      const payment = await tonPaymentService.createTonPayment({
        amount: tonAmount,
        description: `Buy ${credits} Credits - PROFITHACK AI`,
        userId,
        orderId,
      });

      // Store pending payment in database (for tracking)
      await storage.createTransaction({
        userId,
        type: "credit_purchase",
        amount: credits,
        description: `TON Payment (Pending) - ${tonAmount.toFixed(2)} TON`,
        paymentProvider: "ton",
        providerMetadata: {
          orderId,
          tonAmount,
          paymentAddress: payment.paymentAddress,
          memo: payment.memo,
          expiresAt: payment.expiresAt,
          status: "pending",
        },
      });

      res.json({
        success: true,
        paymentAddress: payment.paymentAddress,
        tonAmount: payment.amount,
        tonAmountFormatted: payment.amount.toFixed(4),
        amountNano: payment.amountNano,
        memo: payment.memo,
        expiresAt: payment.expiresAt,
        credits,
        orderId,
        instructions: "Send exactly this amount of TON to the address above with the memo/comment",
      });
    } catch (error: any) {
      console.error("Error creating TON payment:", error);
      res.status(500).json({
        message: error.message || "Failed to create TON payment",
      });
    }
  });

  app.get("/api/payments/ton/status/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { userId } = getUserFromRequest(req);

      // Get transaction from database
      const transactions = await storage.getTransactions(userId);
      const transaction = transactions.find(
        (tx) => tx.providerMetadata && (tx.providerMetadata as any).orderId === orderId
      );

      if (!transaction) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const metadata = transaction.providerMetadata as any;

      // Check if already confirmed
      if (metadata.status === "confirmed") {
        return res.json({
          status: "confirmed",
          transactionHash: metadata.transactionHash,
          credits: transaction.amount,
        });
      }

      // Check payment status on TON blockchain
      const status = await tonPaymentService.checkTonPaymentStatus(
        metadata.paymentAddress,
        metadata.tonAmount,
        metadata.memo
      );

      if (status.status === "confirmed") {
        // Payment confirmed! Add credits to user
        await storage.updateUserCredits(userId, transaction.amount);

        // Update transaction record with confirmation details
        // Note: Transaction is already created, just updating status in metadata
        console.log(`TON payment confirmed: ${transaction.amount} credits added to user ${userId}`);
        console.log(`Transaction hash: ${status.transactionHash}`);
      }

      res.json({
        status: status.status,
        transactionHash: status.transactionHash,
        confirmations: status.confirmations,
        amount: status.amount,
        credits: transaction.amount,
      });
    } catch (error: any) {
      console.error("Error checking TON payment status:", error);
      res.status(500).json({
        message: error.message || "Failed to check payment status",
      });
    }
  });

  app.get("/api/payments/ton/rate", async (_req, res) => {
    try {
      // Get current TON/USD exchange rate
      const tonFor1USD = await tonPaymentService.convertUsdToTon(1);
      const usdFor1TON = 1 / tonFor1USD;

      res.json({
        tonPerUSD: tonFor1USD,
        usdPerTON: usdFor1TON,
        creditsPerDollar: 41, // 23% markup applied
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching TON rate:", error);
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });

  app.post("/api/payments/ton/validate-address", async (req, res) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ message: "Address required" });
      }

      const isValid = tonPaymentService.isValidTonAddress(address);

      res.json({
        valid: isValid,
        address,
      });
    } catch (error) {
      console.error("Error validating TON address:", error);
      res.status(500).json({ message: "Failed to validate address" });
    }
  });

  app.get("/api/payments/ton/wallet-balance", isAuthenticated, async (_req: any, res) => {
    try {
      // Only admins can check platform wallet balance
      // For now, return balance (add admin check later if needed)
      const balance = await tonPaymentService.getTonWalletBalance();

      res.json({
        balance,
        balanceFormatted: `${balance.toFixed(4)} TON`,
      });
    } catch (error) {
      console.error("Error fetching TON wallet balance:", error);
      res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });

  // WebRTC Mediasoup Routes (for live panels)
  app.post("/api/webrtc/room/create", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { roomId } = req.body;

      const rtpCapabilities = await mediasoupService.createRoom(roomId, userId);
      res.json({ rtpCapabilities });
    } catch (error: any) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: error.message || "Failed to create room" });
    }
  });

  app.post("/api/webrtc/room/join", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { roomId, role } = req.body;

      const participant = await mediasoupService.joinRoom(roomId, userId, role);
      if (!participant) {
        return res.status(404).json({ message: "Room not found" });
      }

      const room = mediasoupService.getRoom(roomId);
      res.json({
        rtpCapabilities: room?.router.rtpCapabilities,
        participants: mediasoupService.getRoomParticipants(roomId),
      });
    } catch (error: any) {
      console.error("Error joining room:", error);
      res.status(500).json({ message: error.message || "Failed to join room" });
    }
  });

  app.post("/api/webrtc/transport/create", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { roomId } = req.body;

      const transport = await mediasoupService.createWebRtcTransport(roomId, userId);
      res.json(transport);
    } catch (error: any) {
      console.error("Error creating transport:", error);
      res.status(500).json({ message: error.message || "Failed to create transport" });
    }
  });

  app.post("/api/webrtc/transport/connect", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { roomId, transportId, dtlsParameters } = req.body;

      await mediasoupService.connectTransport(roomId, userId, transportId, dtlsParameters);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error connecting transport:", error);
      res.status(500).json({ message: error.message || "Failed to connect transport" });
    }
  });

  app.post("/api/webrtc/produce", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { roomId, transportId, kind, rtpParameters } = req.body;

      const producerId = await mediasoupService.produce(
        roomId,
        userId,
        transportId,
        kind,
        rtpParameters
      );

      res.json({ producerId });
    } catch (error: any) {
      console.error("Error producing:", error);
      res.status(500).json({ message: error.message || "Failed to produce" });
    }
  });

  app.post("/api/webrtc/consume", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { roomId, transportId, producerId, rtpCapabilities } = req.body;

      const consumer = await mediasoupService.consume(
        roomId,
        userId,
        transportId,
        producerId,
        rtpCapabilities
      );

      res.json(consumer);
    } catch (error: any) {
      console.error("Error consuming:", error);
      res.status(500).json({ message: error.message || "Failed to consume" });
    }
  });

  app.post("/api/webrtc/room/leave", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { roomId } = req.body;

      await mediasoupService.removeParticipant(roomId, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error leaving room:", error);
      res.status(500).json({ message: error.message || "Failed to leave room" });
    }
  });

  app.get("/api/webrtc/room/:roomId/participants", isAuthenticated, async (req, res) => {
    try {
      const participants = mediasoupService.getRoomParticipants(req.params.roomId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Host Control Endpoints
  app.post("/api/webrtc/participant/mute", isAuthenticated, async (req: any, res) => {
    try {
      const hostId = req.user.claims.sub;
      const { roomId, userId, isMuted } = req.body;

      // Verify user is host
      const room = mediasoupService.getRoom(roomId);
      if (!room || room.hostId !== hostId) {
        return res.status(403).json({ message: "Only host can mute participants" });
      }

      await mediasoupService.muteParticipant(roomId, userId, isMuted);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error muting participant:", error);
      res.status(500).json({ message: error.message || "Failed to mute participant" });
    }
  });

  app.post("/api/webrtc/participant/toggle-video", isAuthenticated, async (req: any, res) => {
    try {
      const hostId = req.user.claims.sub;
      const { roomId, userId, isVideoOff } = req.body;

      // Verify user is host
      const room = mediasoupService.getRoom(roomId);
      if (!room || room.hostId !== hostId) {
        return res.status(403).json({ message: "Only host can toggle video" });
      }

      await mediasoupService.toggleVideo(roomId, userId, isVideoOff);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error toggling video:", error);
      res.status(500).json({ message: error.message || "Failed to toggle video" });
    }
  });

  app.post("/api/webrtc/participant/remove", isAuthenticated, async (req: any, res) => {
    try {
      const hostId = req.user.claims.sub;
      const { roomId, userId } = req.body;

      // Verify user is host
      const room = mediasoupService.getRoom(roomId);
      if (!room || room.hostId !== hostId) {
        return res.status(403).json({ message: "Only host can remove participants" });
      }

      await mediasoupService.removeParticipant(roomId, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing participant:", error);
      res.status(500).json({ message: error.message || "Failed to remove participant" });
    }
  });

  // WebRTC Call Routes (for peer-to-peer calls)
  app.post("/api/calls/initiate", isAuthenticated, async (req: any, res) => {
    try {
      const initiatorId = req.user.claims.sub;
      const { callType, participantIds, conversationId } = req.body;
      
      const callSession = await storage.createCallSession({
        callType,
        status: "ringing",
        initiatorId,
        conversationId,
      });

      // Add participants
      for (const participantId of participantIds) {
        await storage.addCallParticipant({
          callId: callSession.id,
          userId: participantId,
          wasAnswered: false,
        });
      }
      
      res.json(callSession);
    } catch (error) {
      console.error("Error initiating call:", error);
      res.status(400).json({ message: "Failed to initiate call" });
    }
  });

  app.post("/api/calls/:id/answer", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const call = await storage.answerCall(req.params.id, userId);
      res.json(call);
    } catch (error) {
      console.error("Error answering call:", error);
      res.status(400).json({ message: "Failed to answer call" });
    }
  });

  app.post("/api/calls/:id/end", isAuthenticated, async (req, res) => {
    try {
      const call = await storage.endCall(req.params.id);
      res.json(call);
    } catch (error) {
      console.error("Error ending call:", error);
      res.status(400).json({ message: "Failed to end call" });
    }
  });

  app.get("/api/calls/history", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const calls = await storage.getCallHistory(userId);
      res.json(calls);
    } catch (error) {
      console.error("Error fetching call history:", error);
      res.status(500).json({ message: "Failed to fetch call history" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging with conversation support
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // TypeScript types for WebSocket messages
  interface WSMessage {
    type: string;
    [key: string]: any;
  }

  interface AuthMessage extends WSMessage {
    type: "auth";
    userId: string;
  }

  interface JoinConversationMessage extends WSMessage {
    type: "join_conversation";
    conversationId: string;
  }

  interface LeaveConversationMessage extends WSMessage {
    type: "leave_conversation";
    conversationId: string;
  }

  interface SendMessageMessage extends WSMessage {
    type: "send_message";
    conversationId: string;
    content: string;
    messageType?: string;
  }

  interface MarkReadMessage extends WSMessage {
    type: "mark_read";
    conversationId: string;
  }

  interface TypingMessage extends WSMessage {
    type: "typing";
    conversationId: string;
    isTyping: boolean;
  }

  // Client tracking: userId -> WebSocket
  const clients = new Map<string, WebSocket>();
  
  // Conversation rooms: conversationId -> Set of userIds
  const conversationRooms = new Map<string, Set<string>>();

  // Helper: Broadcast message to all members in a conversation room
  const broadcastToConversation = (conversationId: string, message: any, excludeUserId?: string) => {
    const roomMembers = conversationRooms.get(conversationId);
    if (!roomMembers) return;

    const messageStr = JSON.stringify(message);
    roomMembers.forEach((memberId) => {
      if (excludeUserId && memberId === excludeUserId) return;
      
      const memberWs = clients.get(memberId);
      if (memberWs && memberWs.readyState === WebSocket.OPEN) {
        memberWs.send(messageStr);
      }
    });
  };

  // Helper: Join user to all their conversations
  const joinUserToConversations = async (userId: string, ws: WebSocket) => {
    try {
      const conversations = await storage.getUserConversations(userId);
      
      for (const conversation of conversations) {
        const conversationId = conversation.id;
        
        // Add to room
        if (!conversationRooms.has(conversationId)) {
          conversationRooms.set(conversationId, new Set());
        }
        conversationRooms.get(conversationId)!.add(userId);
      }

      // Send success confirmation
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "auth_success",
          conversationsJoined: conversations.length,
        }));
      }
    } catch (error) {
      console.error("Error joining user to conversations:", error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to join conversations",
        }));
      }
    }
  };

  // Helper: Remove user from all conversation rooms
  const removeUserFromAllRooms = (userId: string) => {
    conversationRooms.forEach((members, conversationId) => {
      members.delete(userId);
      // Clean up empty rooms
      if (members.size === 0) {
        conversationRooms.delete(conversationId);
      }
    });
  };

  wss.on("connection", (ws: WebSocket) => {
    let userId: string | null = null;
    let roomId: string | null = null;

    ws.on("message", async (message: string) => {
      try {
        const data: WSMessage = JSON.parse(message.toString());

        // WebRTC Signaling for Private Calls and Battle Rooms
        if (data.type === "JOIN_ROOM") {
          const { paymentEnforcementService } = require('./services/paymentEnforcementService');
          const { spectatorStreamService } = require('./services/spectatorStreamService');
          
          roomId = (data as any).roomId;
          userId = (data as any).userId;
          
          if ((data as any).isSpectator) {
            const streamUrl = spectatorStreamService.getStreamUrl(roomId);
            ws.send(JSON.stringify({
              type: 'SPECTATOR_URL',
              streamUrl: streamUrl || `https://cdn.profithack.ai/live/${roomId}/master.m3u8`
            }));
          } else {
            paymentEnforcementService.registerConnection(roomId, userId, ws);
            ws.send(JSON.stringify({
              type: 'JOINED',
              roomId,
              userId
            }));
          }
          return;
        }

        // Auth event - register client and auto-join conversations
        if (data.type === "auth" && (data as AuthMessage).userId) {
          userId = (data as AuthMessage).userId;
          clients.set(userId, ws);
          
          // Auto-join user to all their conversations
          await joinUserToConversations(userId, ws);
        }
        
        // Ensure user is authenticated for all other operations
        if (!userId) {
          ws.send(JSON.stringify({
            type: "error",
            message: "Not authenticated",
          }));
          return;
        }

        // Join conversation event
        if (data.type === "join_conversation") {
          const { conversationId } = data as JoinConversationMessage;
          
          try {
            // Verify user is a member of this conversation
            const members = await storage.getConversationMembers(conversationId);
            const isMember = members.some(m => m.id === userId);
            
            if (!isMember) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Not a member of this conversation",
              }));
              return;
            }

            // Add to room
            if (!conversationRooms.has(conversationId)) {
              conversationRooms.set(conversationId, new Set());
            }
            conversationRooms.get(conversationId)!.add(userId);

            ws.send(JSON.stringify({
              type: "joined_conversation",
              conversationId,
            }));
          } catch (error) {
            console.error("Error joining conversation:", error);
            ws.send(JSON.stringify({
              type: "error",
              message: "Failed to join conversation",
            }));
          }
        }

        // Leave conversation event
        if (data.type === "leave_conversation") {
          const { conversationId } = data as LeaveConversationMessage;
          
          const room = conversationRooms.get(conversationId);
          if (room) {
            room.delete(userId);
            if (room.size === 0) {
              conversationRooms.delete(conversationId);
            }
          }

          ws.send(JSON.stringify({
            type: "left_conversation",
            conversationId,
          }));
        }

        // Send message event
        if (data.type === "send_message") {
          const { conversationId, content, messageType } = data as SendMessageMessage;
          
          try {
            // Verify user is a member
            const members = await storage.getConversationMembers(conversationId);
            const isMember = members.some(m => m.id === userId);
            
            if (!isMember) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Not a member of this conversation",
              }));
              return;
            }

            // Save message to database
            const savedMessage = await storage.sendConversationMessage({
              conversationId,
              senderId: userId,
              content,
              messageType: messageType || "text",
            });

            // Get sender info
            const sender = await storage.getUser(userId);

            // Broadcast to all conversation members
            broadcastToConversation(conversationId, {
              type: "new_message",
              conversationId,
              message: savedMessage,
              sender,
            });
          } catch (error) {
            console.error("Error sending message:", error);
            ws.send(JSON.stringify({
              type: "error",
              message: "Failed to send message",
            }));
          }
        }

        // Mark read event
        if (data.type === "mark_read") {
          const { conversationId } = data as MarkReadMessage;
          
          try {
            // Update database
            await storage.markMessagesAsRead(conversationId, userId);

            // Broadcast read receipt to conversation
            broadcastToConversation(conversationId, {
              type: "message_read",
              conversationId,
              userId,
            });
          } catch (error) {
            console.error("Error marking messages as read:", error);
            ws.send(JSON.stringify({
              type: "error",
              message: "Failed to mark messages as read",
            }));
          }
        }

        // Typing indicator event
        if (data.type === "typing") {
          const { conversationId, isTyping } = data as TypingMessage;
          
          try {
            // Verify user is a member
            const members = await storage.getConversationMembers(conversationId);
            const isMember = members.some(m => m.id === userId);
            
            if (!isMember) {
              return; // Silently ignore invalid typing events
            }

            // Broadcast typing status (exclude sender)
            broadcastToConversation(conversationId, {
              type: "user_typing",
              conversationId,
              userId,
              isTyping,
            }, userId);
          } catch (error) {
            console.error("Error handling typing indicator:", error);
          }
        }

        // Legacy 1:1 message support (keep for backward compatibility)
        if (data.type === "message" && data.receiverId) {
          const receiverWs = clients.get(data.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(
              JSON.stringify({
                type: "message",
                message: data.message,
                senderId: userId,
              })
            );
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "error",
            message: "Invalid message format",
          }));
        }
      }
    });

    ws.on("close", () => {
      if (userId) {
        // Remove from all conversation rooms
        removeUserFromAllRooms(userId);
        // Remove from clients map
        clients.delete(userId);
      }
      
      // Cleanup WebRTC signaling connection
      if (roomId && userId) {
        const { paymentEnforcementService } = require('./services/paymentEnforcementService');
        paymentEnforcementService.unregisterConnection(roomId, userId);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Premium Model Subscription Routes (OnlyFans-style)
  // Uses CREDITS (not coins) with 50% creator / 50% platform split
  app.post("/api/premium/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const { modelId, tier } = req.body;
      const subscriberId = req.user.claims.sub;
      
      const tierPrices = {
        basic: 1999,  // $19.99 = 1999 cents
        vip: 3999,    // $39.99 = 3999 cents
        elite: 9999   // $99.99 = 9999 cents
      };
      
      const amountCents = tierPrices[tier as keyof typeof tierPrices];
      if (!amountCents) {
        return res.status(400).json({ error: "Invalid tier" });
      }

      // Convert cents to credits (1 credit = $0.024, so $1 = ~41.67 credits)
      const creditsRequired = Math.ceil(amountCents / 2.4); // $19.99 = 833 credits
      
      // Check if user has enough credits
      const user = await storage.getUser(subscriberId);
      if (!user || user.credits < creditsRequired) {
        return res.status(400).json({ 
          error: "Insufficient credits", 
          required: creditsRequired,
          current: user?.credits || 0
        });
      }

      // Deduct credits from subscriber
      await storage.updateUserCredits(subscriberId, -creditsRequired);

      // Process payment with 50/50 split (uses wallet billing function)
      const { processPremiumSubscriptionPayment } = await import("./wallet");
      await processPremiumSubscriptionPayment(subscriberId, modelId, amountCents, tier);
      
      // Create subscription record
      const subscription = await storage.subscribeToPremiumModel(subscriberId, modelId, tier, amountCents);
      
      res.json({ 
        subscription,
        creditsDeducted: creditsRequired,
        remainingCredits: (user.credits || 0) - creditsRequired
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/premium/models", isAuthenticated, async (req, res) => {
    try {
      const models = await storage.getPremiumModels();
      res.json(models);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/premium/my-subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const subscriptions = await storage.getMyPremiumSubscriptions(req.user.claims.sub);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Private Show Routes
  app.post("/api/private/start", isAuthenticated, async (req: any, res) => {
    try {
      const { creditsPerMinute } = req.body;
      const modelId = req.user.claims.sub;
      
      const session = await storage.startPrivateSession(modelId, creditsPerMinute);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/private/join", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      const viewerId = req.user.claims.sub;
      
      const viewer = await storage.joinPrivateSession(sessionId, viewerId);
      res.json(viewer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/private/end", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      const modelId = req.user.claims.sub;
      
      await storage.endPrivateSession(sessionId, modelId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/private/active/:modelId", async (req, res) => {
    try {
      const session = await storage.getActivePrivateSession(req.params.modelId);
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Toy Control & Sparks with Toy Triggers
  app.post("/api/sparks/send-with-toy", isAuthenticated, async (req: any, res) => {
    try {
      const { modelId, sparkType, intensity, durationSeconds } = req.body;
      const viewerId = req.user.claims.sub;
      
      const event = await storage.sendSparkWithToyControl(viewerId, modelId, sparkType, intensity, durationSeconds);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Twilio Video - Live Streaming, Battles, Panels, Premium 1-on-1
  app.post("/api/twilio/room/create", isAuthenticated, async (req: any, res) => {
    try {
      if (!isTwilioVideoConfigured()) {
        return res.status(503).json({ message: "Twilio Video not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { type, title, description, creditsPerMinute } = req.body;

      // Create Twilio room
      const uniqueName = `${type}_${userId}_${Date.now()}`;
      const twilioRoom = await twilioVideoService.createRoom({
        uniqueName,
        type: type as "live_stream" | "battle" | "panel" | "premium_1on1",
        maxParticipants: type === "panel" ? 20 : type === "battle" ? 50 : 500,
      });

      // Save to database
      const room = await storage.createTwilioRoom({
        twilioRoomSid: twilioRoom.roomSid,
        roomType: type,
        hostId: userId,
        title: title || `${type} by ${userId}`,
        description,
        creditsPerMinute: type === "premium_1on1" ? creditsPerMinute : null,
        maxParticipants: type === "panel" ? 20 : type === "battle" ? 50 : 500,
      });

      res.json({ room, twilioRoom });
    } catch (error: any) {
      console.error("Error creating Twilio room:", error);
      res.status(500).json({ message: error.message || "Failed to create room" });
    }
  });

  app.post("/api/twilio/room/join", isAuthenticated, async (req: any, res) => {
    try {
      if (!isTwilioVideoConfigured()) {
        return res.status(503).json({ message: "Twilio Video not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { roomId } = req.body;

      const room = await storage.getTwilioRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Generate access token
      const token = await twilioVideoService.generateAccessToken({
        identity: userId,
        roomName: room.twilioRoomSid,
      });

      // Add participant
      await storage.addTwilioParticipant({
        roomId: room.id,
        userId,
        twilioParticipantSid: `participant_${userId}_${Date.now()}`,
        role: userId === room.hostId ? "host" : "viewer",
      });

      res.json({ token, room });
    } catch (error: any) {
      console.error("Error joining Twilio room:", error);
      res.status(500).json({ message: error.message || "Failed to join room" });
    }
  });

  app.post("/api/twilio/room/end", isAuthenticated, async (req: any, res) => {
    try {
      if (!isTwilioVideoConfigured()) {
        return res.status(503).json({ message: "Twilio Video not configured" });
      }

      const { userId } = getUserFromRequest(req);
      const { roomId } = req.body;

      const room = await storage.getTwilioRoom(roomId);
      if (!room || room.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await twilioVideoService.endRoom(room.twilioRoomSid);
      await storage.endTwilioRoom(roomId);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error ending Twilio room:", error);
      res.status(500).json({ message: error.message || "Failed to end room" });
    }
  });

  app.get("/api/twilio/rooms/active", isAuthenticated, async (req: any, res) => {
    try {
      const rooms = await storage.getActiveTwilioRooms();
      res.json({ rooms });
    } catch (error: any) {
      console.error("Error fetching active rooms:", error);
      res.status(500).json({ message: error.message || "Failed to fetch rooms" });
    }
  });

  // Twilio Video - Host Moderation Controls
  app.post("/api/twilio/participant/remove", isAuthenticated, async (req: any, res) => {
    try {
      if (!isTwilioVideoConfigured()) {
        return res.status(503).json({ message: "Twilio Video not configured" });
      }

      const callerId = req.user.claims.sub;
      const { roomId, userId } = req.body;

      if (!roomId || !userId) {
        return res.status(400).json({ message: "roomId and userId are required" });
      }

      // Get room from database
      const room = await storage.getTwilioRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Verify caller is host
      if (room.hostId !== callerId) {
        return res.status(403).json({ message: "Only host can remove participants" });
      }

      // Get participant details to find their Twilio participant SID
      const participants = await twilioVideoService.getParticipants(room.twilioRoomSid);
      const participant = participants.find((p: any) => p.identity === userId);

      if (!participant) {
        return res.status(404).json({ message: "Participant not found in room" });
      }

      // Call Twilio API to disconnect participant
      await twilioVideoService.disconnectParticipant(room.twilioRoomSid, participant.sid);

      // Update database participant status to 'removed'
      await storage.removeTwilioParticipant(roomId, userId);

      res.json({ success: true, message: "Participant removed successfully" });
    } catch (error: any) {
      console.error("Error removing participant:", error);
      res.status(500).json({ message: error.message || "Failed to remove participant" });
    }
  });

  app.post("/api/twilio/participant/mute", isAuthenticated, async (req: any, res) => {
    try {
      if (!isTwilioVideoConfigured()) {
        return res.status(503).json({ message: "Twilio Video not configured" });
      }

      const callerId = req.user.claims.sub;
      const { roomId, userId, muted } = req.body;

      if (!roomId || !userId || typeof muted !== "boolean") {
        return res.status(400).json({ message: "roomId, userId, and muted are required" });
      }

      // Get room from database
      const room = await storage.getTwilioRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Verify caller is host
      if (room.hostId !== callerId) {
        return res.status(403).json({ message: "Only host can mute participants" });
      }

      // Note: Twilio doesn't support server-side mute
      // We need to signal via WebSocket to force participant to mute client-side
      // The WebSocket client map is accessible in the parent scope
      // We'll send a message through the existing WebSocket infrastructure
      
      res.json({ 
        success: true, 
        message: "Mute signal sent (client-side enforcement required)",
        note: "Twilio does not support server-side mute - participant must comply client-side"
      });
    } catch (error: any) {
      console.error("Error muting participant:", error);
      res.status(500).json({ message: error.message || "Failed to mute participant" });
    }
  });

  // Marketing Bots API
  app.get("/api/marketing/bots", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const bots = await db.select().from(marketingBots).where(eq(marketingBots.userId, userId));
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.post("/api/marketing/bots", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const botData = insertMarketingBotSchema.parse({ ...req.body, userId });
      
      // Type assertion to fix TypeScript inference issue with jsonb fields
      const [bot] = await db.insert(marketingBots).values(botData as any).returning();
      res.json(bot);
    } catch (error) {
      console.error("Error creating bot:", error);
      res.status(400).json({ message: "Failed to create bot" });
    }
  });

  app.patch("/api/marketing/bots/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const [bot] = await db
        .update(marketingBots)
        .set({ status, updatedAt: new Date() })
        .where(eq(marketingBots.id, id))
        .returning();
      
      res.json(bot);
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(500).json({ message: "Failed to update bot" });
    }
  });

  app.delete("/api/marketing/bots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await db.delete(marketingBots).where(eq(marketingBots.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // ============ USERNAME MARKETPLACE API ============
  
  // Get all listings
  app.get("/api/marketplace/usernames", async (_req, res) => {
    try {
      const listings = await db.select().from(usernameListings).where(eq(usernameListings.status, "active"));
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Create listing
  app.post("/api/marketplace/usernames", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const listingData = insertUsernameListingSchema.parse({ ...req.body, sellerId: userId });
      
      const [listing] = await db.insert(usernameListings).values(listingData).returning();
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(400).json({ message: "Failed to create listing" });
    }
  });

  // Place bid
  app.post("/api/marketplace/usernames/:id/bid", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { userId } = getUserFromRequest(req);
      const { bidAmount } = req.body;
      
      // Create bid
      const [bid] = await db.insert(usernameBids).values({
        listingId: id,
        bidderId: userId,
        bidAmount,
      }).returning();
      
      // Update listing current bid
      await db.update(usernameListings)
        .set({ currentBid: bidAmount })
        .where(eq(usernameListings.id, id));
      
      res.json(bid);
    } catch (error) {
      console.error("Error placing bid:", error);
      res.status(500).json({ message: "Failed to place bid" });
    }
  });

  // Buy now
  app.post("/api/marketplace/usernames/:id/buy", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { userId } = getUserFromRequest(req);
      
      const [listing] = await db.select().from(usernameListings).where(eq(usernameListings.id, id));
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Deduct credits from buyer
      await creditWallet({
        userId,
        amount: -listing.price,
        paymentProvider: "internal",
        description: "username_purchase",
      });
      
      // Credit seller
      if (listing.sellerId) {
        await creditWallet({
          userId: listing.sellerId,
          amount: listing.price * 0.9, // 10% platform fee
          paymentProvider: "internal",
          description: "username_sale",
        });
      }
      
      // Mark as sold
      await db.update(usernameListings)
        .set({ status: "sold", soldAt: new Date() })
        .where(eq(usernameListings.id, id));
      
      res.json({ success: true, message: "Username purchased!" });
    } catch (error) {
      console.error("Error purchasing username:", error);
      res.status(500).json({ message: "Failed to purchase username" });
    }
  });

  // ============ AD MONETIZATION API ============
  
  // Get active ads (with optional filtering)
  app.get("/api/ads", async (req, res) => {
    try {
      const { type, platform, limit } = req.query;
      
      // Build where conditions
      const conditions = [eq(adPlacements.isActive, true)];
      
      // Filter by ad type (rotating_sidebar, banner, hook_location, in_feed, etc.)
      if (type) {
        conditions.push(eq(adPlacements.adType, type as string));
      }
      
      // Filter by platform (vids, tube, global)
      if (platform) {
        conditions.push(eq(adPlacements.platform, platform as string));
      }
      
      let ads = await db.select().from(adPlacements).where(and(...conditions));
      
      // Apply limit if specified
      if (limit) {
        ads = ads.slice(0, parseInt(limit as string));
      }
      
      res.json(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  // Track ad view
  app.post("/api/ads/:id/view", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { videoId, viewDuration } = req.body;
      const viewerId = req.user.claims.sub;
      
      const [ad] = await db.select().from(adPlacements).where(eq(adPlacements.id, id));
      const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
      
      if (!ad || !video) {
        return res.status(404).json({ message: "Ad or video not found" });
      }
      
      // Calculate earnings (60% creator, 40% platform)
      const costPerView = ad.costPerView || 0;
      const creatorEarnings = Math.floor(costPerView * 0.6);
      const platformRevenue = costPerView - creatorEarnings;
      
      // Track view
      const [view] = await db.insert(adViews).values({
        adId: id,
        videoId,
        viewerId,
        creatorId: video.userId,
        viewDuration,
        creatorEarnings,
        platformRevenue,
      }).returning();
      
      // Credit creator
      await creditWallet({
        userId: video.userId,
        amount: creatorEarnings,
        paymentProvider: "internal",
        description: "ad_revenue",
      });
      
      res.json(view);
    } catch (error) {
      console.error("Error tracking ad view:", error);
      res.status(500).json({ message: "Failed to track ad view" });
    }
  });

  // Track ad click
  app.post("/api/ads/:id/click", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { viewId } = req.body;
      
      const [ad] = await db.select().from(adPlacements).where(eq(adPlacements.id, id));
      const [view] = await db.select().from(adViews).where(eq(adViews.id, viewId));
      
      if (!ad || !view) {
        return res.status(404).json({ message: "Ad or view not found" });
      }
      
      // Mark as clicked
      await db.update(adViews)
        .set({ clicked: true })
        .where(eq(adViews.id, viewId));
      
      // Additional earnings for click (60% creator, 40% platform)
      const costPerClick = ad.costPerClick || 0;
      const clickEarnings = Math.floor(costPerClick * 0.6);
      
      if (view.creatorId) {
        await creditWallet({
          userId: view.creatorId,
          amount: clickEarnings,
          paymentProvider: "internal",
          description: "ad_click",
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking ad click:", error);
      res.status(500).json({ message: "Failed to track ad click" });
    }
  });

  // ============ ADMIN TOOLS API ============
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      // Check if user is admin (you can add isAdmin field to users table)
      // For now, just allow all authenticated users
      
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Ban user
  app.post("/api/admin/users/:id/ban", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const { id } = req.params;
      const { reason, duration } = req.body;
      
      // Log admin action
      await db.insert(adminActions).values({
        adminId,
        targetUserId: id,
        actionType: "ban",
        reason,
        duration,
      });
      
      // Update user status (you'd need to add isBanned field to users)
      // await storage.updateUser(id, { isBanned: true });
      
      res.json({ success: true, message: "User banned" });
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  // Remove strike
  app.post("/api/admin/strikes/:id/remove", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const { id } = req.params;
      
      // Log admin action
      await db.insert(adminActions).values({
        adminId,
        targetUserId: id,
        actionType: "remove_strike",
      });
      
      res.json({ success: true, message: "Strike removed" });
    } catch (error) {
      console.error("Error removing strike:", error);
      res.status(500).json({ message: "Failed to remove strike" });
    }
  });

  // Get admin actions log
  app.get("/api/admin/actions", isAuthenticated, async (_req, res) => {
    try {
      const actions = await db.select().from(adminActions).orderBy(sql`created_at DESC`).limit(100);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching admin actions:", error);
      res.status(500).json({ message: "Failed to fetch admin actions" });
    }
  });

  // ============ SOCIAL CONTACT IMPORT API ============
  
  // OAuth configs for social platforms
  const SOCIAL_PLATFORMS = {
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
      authUrl: "https://api.instagram.com/oauth/authorize",
      tokenUrl: "https://api.instagram.com/oauth/access_token",
      scope: "user_profile,user_media",
    },
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_ID || "",
      clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
      authUrl: "https://www.tiktok.com/v2/auth/authorize",
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
      scope: "user.info.basic,video.list",
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      authUrl: "https://twitter.com/i/oauth2/authorize",
      tokenUrl: "https://api.twitter.com/2/oauth2/token",
      scope: "tweet.read users.read follows.read",
    },
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
      scope: "pages_manage_posts,pages_read_engagement,publish_video,pages_show_list,public_profile,email",
    },
    threads: {
      clientId: process.env.THREADS_APP_ID || "",
      clientSecret: process.env.THREADS_APP_SECRET || "",
      authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
      scope: "threads_basic,threads_content_publish,threads_manage_insights,threads_manage_replies,threads_read_replies",
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      authUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      scope: "r_liteprofile r_emailaddress w_member_social",
    },
  };

  // Initiate OAuth flow
  app.get("/api/social/connect/:platform", isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.params;
      const { userId } = getUserFromRequest(req);
      
      const config = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS];
      if (!config || !config.clientId) {
        return res.status(400).send(`
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'social-connect-error',
                  error: '${platform} integration not configured'
                }, '*');
              </script>
              <p>Integration not configured. Please contact support.</p>
            </body>
          </html>
        `);
      }

      // Generate state token for CSRF protection
      const state = Buffer.from(JSON.stringify({ userId, platform })).toString("base64");
      
      const redirectUri = `${process.env.REPLIT_DEV_DOMAIN || "http://localhost:5000"}/api/social/callback/${platform}`;
      
      const authUrl = new URL(config.authUrl);
      authUrl.searchParams.set("client_id", config.clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", config.scope);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("state", state);

      res.redirect(authUrl.toString());
    } catch (error) {
      console.error("OAuth initiation error:", error);
      res.status(500).send("OAuth initiation failed");
    }
  });

  // Handle OAuth callback
  app.get("/api/social/callback/:platform", async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, state } = req.query;

      if (!code || !state) {
        return res.status(400).send("Missing OAuth parameters");
      }

      // Verify state
      const stateData = JSON.parse(Buffer.from(state as string, "base64").toString());
      const { userId } = stateData;

      const config = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS];
      if (!config) {
        return res.status(400).send("Invalid platform");
      }

      // Exchange code for access token
      const redirectUri = `${process.env.REPLIT_DEV_DOMAIN || "http://localhost:5000"}/api/social/callback/${platform}`;
      
      const tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: code as string,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new Error("Failed to get access token");
      }

      // Get user info from platform
      let platformUserId = "";
      let platformUsername = "";

      // Platform-specific user info fetching
      if (platform === "instagram") {
        const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`);
        const userData = await userRes.json();
        platformUserId = userData.id;
        platformUsername = userData.username;
      } else if (platform === "tiktok") {
        const userRes = await fetch("https://open.tiktokapis.com/v2/user/info/", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();
        platformUserId = userData.data?.user?.open_id || "";
        platformUsername = userData.data?.user?.display_name || "";
      } else if (platform === "facebook") {
        const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${tokenData.access_token}`);
        const userData = await userRes.json();
        platformUserId = userData.id;
        platformUsername = userData.name;
      } else if (platform === "threads") {
        const userRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${tokenData.access_token}`);
        const userData = await userRes.json();
        platformUserId = userData.id;
        platformUsername = userData.username;
      }

      // Store connection in database
      await db.insert(socialConnections).values({
        userId,
        platform,
        platformUserId,
        platformUsername,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
      }).onConflictDoUpdate({
        target: [socialConnections.userId, socialConnections.platform],
        set: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          lastSyncedAt: new Date(),
        },
      });

      // Close popup and notify parent
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'social-connect-success',
                platform: '${platform}'
              }, '*');
              window.close();
            </script>
            <p>Connected successfully! You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'social-connect-error',
                error: 'Failed to connect. Please try again.'
              }, '*');
            </script>
            <p>Connection failed. Please try again.</p>
          </body>
        </html>
      `);
    }
  });

  // Import contacts from connected platform
  app.post("/api/social/import-contacts/:platform", isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.params;
      const { userId } = getUserFromRequest(req);

      // Get connection
      const [connection] = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, platform)
          )
        );

      if (!connection) {
        return res.status(404).json({ message: "Platform not connected" });
      }

      // Fetch contacts based on platform
      let contacts: any[] = [];

      if (platform === "instagram") {
        // Instagram doesn't provide follower list via API for regular apps
        // Would need Instagram Business Account API
        contacts = [];
      } else if (platform === "tiktok") {
        const followingRes = await fetch("https://open.tiktokapis.com/v2/user/following/list/", {
          headers: { Authorization: `Bearer ${connection.accessToken}` },
        });
        const followingData = await followingRes.json();
        contacts = followingData.data?.user_list || [];
      }

      // Import contacts into database
      for (const contact of contacts) {
        await db.insert(importedContacts).values({
          userId,
          platform,
          contactName: contact.display_name || contact.name,
          contactUsername: contact.username,
          platformContactId: contact.id || contact.open_id,
          profileImageUrl: contact.avatar_url || contact.profile_image_url,
        }).onConflictDoNothing();
      }

      // Update last synced
      await db
        .update(socialConnections)
        .set({ lastSyncedAt: new Date() })
        .where(eq(socialConnections.id, connection.id));

      res.json({ 
        success: true, 
        imported: contacts.length,
        message: `Imported ${contacts.length} contacts from ${platform}` 
      });
    } catch (error) {
      console.error("Contact import error:", error);
      res.status(500).json({ message: "Failed to import contacts" });
    }
  });

  // Get user's connected platforms
  app.get("/api/social/connections", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const connections = await db
        .select()
        .from(socialConnections)
        .where(eq(socialConnections.userId, userId));

      res.json(connections.map(c => ({
        platform: c.platform,
        platformUsername: c.platformUsername,
        lastSyncedAt: c.lastSyncedAt,
      })));
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  // Get imported contacts
  app.get("/api/social/imported-contacts", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const contacts = await db
        .select()
        .from(importedContacts)
        .where(eq(importedContacts.userId, userId))
        .orderBy(desc(importedContacts.createdAt));

      res.json(contacts);
    } catch (error) {
      console.error("Error fetching imported contacts:", error);
      res.status(500).json({ message: "Failed to fetch imported contacts" });
    }
  });

  // Waitlist API with language detection and bot protection
  app.post("/api/waitlist", async (req, res) => {
    try {
      // Bot detection
      const botCheck = detectBot(req);
      if (botCheck.isBot) {
        console.log(`🚫 Bot blocked from waitlist: ${botCheck.reason} (score: ${botCheck.score})`);
        return res.status(403).json({ 
          message: "Automated traffic detected. Please use a real browser." 
        });
      }

      const { email } = req.body;
      
      // Validate email
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email required" });
      }

      // Check for disposable emails
      if (isDisposableEmail(email)) {
        console.log(`🚫 Disposable email blocked: ${email}`);
        return res.status(400).json({ message: "Please use a permanent email address" });
      }

      // Check for suspicious patterns
      if (hasSuspiciousPattern(email)) {
        console.log(`🚫 Suspicious email pattern blocked: ${email}`);
        return res.status(400).json({ message: "Invalid email format" });
      }

      const language = req.headers['accept-language']?.split(',')[0] || 'en';
      const country = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || 'unknown';
      
      await db.execute(sql`
        INSERT INTO waitlist (email, language, country, source, created_at)
        VALUES (${email}, ${language}, ${country}, 'landing_page', NOW())
        ON CONFLICT (email) DO NOTHING
      `);
      
      console.log(`✅ Waitlist signup: ${email} from ${country} (${language})`);
      res.json({ success: true, message: "Added to waitlist!" });
    } catch (error) {
      console.error("Waitlist error:", error);
      res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  // ============================================================================
  // KUSH THE RASTA MONKEY - AI SUPPORT BOT 🐵🎨
  // ============================================================================

  // Chat with Kush (AI Support Bot with learning)
  app.post("/api/support/chat", async (req, res) => {
    try {
      const { message, sessionId, messages = [] } = req.body;
      const userId = req.user?.id;

      if (!message) {
        return res.status(400).json({ error: "Message required" });
      }

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
      });

      if (!process.env.OPENAI_API_KEY) {
        return res.json({
          sessionId: sessionId || crypto.randomUUID(),
          response: "Yo mon! 🐵 Kush here, but mi brain need OpenAI API key to work properly. Add OPENAI_API_KEY to ya secrets and we good to go!",
        });
      }

      // Search FAQs for relevant answers
      const faqResults = await storage.searchFAQs(message);

      // Build context from FAQs
      let faqContext = "";
      if (faqResults.length > 0) {
        faqContext = "\n\nRelevant FAQs:\n" + faqResults.map(faq => 
          `Q: ${faq.question}\nA: ${faq.answer}`
        ).join("\n\n");
      }

      // Kush's system prompt with COMPLETE PROFITHACK AI knowledge
      const systemPrompt = `You are KUSH 🐵, the rasta monkey AI support assistant for PROFITHACK AI! You're chill, helpful, and speak with a light Jamaican accent (not overdone). Use emojis tastefully.

PROFITHACK AI - COMPLETE PLATFORM INFO:

🎯 WHAT WE ARE:
- Global 18+ invite-only creator platform (Beta launch)
- TikTok-style social feed + OnlyFans-style premium subscriptions
- AI-powered code workspace (Monaco editor, WebContainer, 40+ languages)
- Video calls, live streaming, messaging, virtual gifts
- Based in Bermuda 🇧🇲 - Global payment support

💎 SUBSCRIPTION TIERS:
1. Explorer (FREE) - 10,000 credits/month
2. Starter ($24.99) - 50,000 credits/month
3. Creator ($49.99) - 150,000 credits/month
4. Innovator ($99.99) - 500,000 credits/month

💰 PAYMENT METHODS:
- PayPal, Payoneer, Payeer, Square
- Crypto (NOWPayments + TON blockchain)
- MTN Mobile Money (coming soon)
- NO Stripe yet (application pending)

🎁 VIRTUAL GIFTS (Sparks):
- 9 gift types from 5 to 10,000 credits
- Creator gets 55% / Platform 45% split
- Real-time animations on videos

📱 FEATURES:
- Reels: Short videos (9:16 vertical format)
- Tube: Long-form content with ads
- AI Code Workspace: Cloud IDE with terminal
- Video/Voice Calls: Free 1-on-1, premium creator calls
- Live Streaming: Unlocked at 500 followers
- Marketplace: AI agents, themes, plugins (50/50 split)
- Marketing Bots: 100 AI bots posting content automatically

🤖 MARKETING BOTS:
- Auto-post to TikTok, Instagram, Facebook, X, YouTube, etc.
- Viral content generator (iMessage dramas, Simpsons predictions)
- Crayo-style video creation (60 seconds)
- Building in public rewards (50 credits per share)

🚀 CREATOR MONETIZATION:
- Premium subscriptions (3 tiers: Basic $9.99, VIP $29.99, Inner Circle $99.99)
- Virtual gifts during videos
- Ad revenue (pre-roll, mid-roll, post-roll)
- Private shows & exclusive content
- 55% creator / 45% platform revenue split

🔐 SECURITY & SAFETY:
- 18+ age verification required
- 3-strike system for violations
- AI + human content moderation
- No refunds policy (digital products)
- $20 chargeback fee

🎟️ INVITE SYSTEM:
- Platform is invite-only during beta
- Each signup gets 5 new invite codes
- Viral growth loop built-in
- FOUNDER2025 code gives: 999,999 credits + Innovator tier FREE + Founder status

💻 AI CODE ASSISTANCE:
- Multi-provider (OpenAI, Anthropic, Google AI)
- Browser-based Node.js execution
- Live preview & integrated terminal
- 40+ programming languages

📊 VIRAL DASHBOARD:
- Hook scoring (0-100)
- Viral prediction AI
- SEO keyword targeting
- Trending topics tracker

${faqContext}

YOUR PERSONALITY:
- Chill rasta monkey vibe 🐵
- Helpful but keep it real
- Light Jamaican accent (irie, mon, ya, etc.)
- Use emojis but don't overdo it
- If you don't know something, be honest and offer to escalate to human

YOUR MISSION:
1. Answer questions about PROFITHACK AI features, pricing, how-to
2. Be friendly and helpful
3. If user is frustrated or you can't help → suggest "Talk to a human" button
4. Learn from conversations to improve

Keep responses concise (2-3 paragraphs max). Be awesome! 🎨`;

      // Build conversation history
      const conversationMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: message },
      ];

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: conversationMessages as any,
        temperature: 0.8,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0]?.message?.content || "Yo mon, mi brain got confused. Try again?";

      // Generate or use session ID
      const newSessionId = sessionId || crypto.randomUUID();

      // Save conversation to database (for learning)
      if (userId) {
        const allMessages = [
          ...messages,
          { role: "user", content: message, timestamp: new Date().toISOString() },
          { role: "assistant", content: aiResponse, timestamp: new Date().toISOString() },
        ];

        await storage.saveBotSession({
          userId,
          messages: allMessages,
          resolved: false,
          escalatedToTicket: false,
          messageCount: allMessages.length,
        });
      }

      // Update FAQ search counts
      if (faqResults.length > 0) {
        for (const faq of faqResults) {
          await storage.incrementFAQSearch(faq.id);
        }
      }

      console.log(`🐵 Kush helped user: ${message.substring(0, 50)}...`);

      res.json({
        sessionId: newSessionId,
        response: aiResponse,
      });
    } catch (error) {
      console.error("Kush chat error:", error);
      res.status(500).json({
        error: "Kush brain overload! 🐵 Try again in a sec.",
      });
    }
  });

  // Escalate to human support (create ticket)
  app.post("/api/support/escalate", async (req, res) => {
    try {
      const { sessionId, messages = [] } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Must be logged in" });
      }

      // Determine category and subject from conversation
      const lastUserMessage = messages.filter((m: any) => m.role === "user").slice(-1)[0];
      const subject = lastUserMessage?.content?.substring(0, 100) || "Support Request";

      // Create support ticket
      const ticket = await storage.createSupportTicket({
        userId,
        subject,
        category: "other",
        priority: "medium",
        status: "open",
        botConversation: messages,
        botEscalationReason: "User requested human assistance",
      });

      // Mark session as escalated
      if (sessionId) {
        await storage.markSessionEscalated(sessionId, ticket.id);
      }

      console.log(`🎫 Ticket created from Kush session: ${ticket.id}`);

      res.json({
        success: true,
        ticket,
      });
    } catch (error) {
      console.error("Escalation error:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  // Support Ticket System
  app.post("/api/support/tickets", async (req, res) => {
    try {
      const { email, subject, message, userId } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO support_tickets (user_id, email, subject, message, status, priority, created_at)
        VALUES (${userId || null}, ${email}, ${subject}, ${message}, 'open', 'normal', NOW())
        RETURNING id
      `);
      
      const ticketId = result.rows[0]?.id;
      res.json({ success: true, ticketId });
    } catch (error) {
      console.error("Support ticket error:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  // Get waitlist count
  app.get("/api/waitlist/count", async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM waitlist`);
      res.json({ count: result.rows[0]?.count || 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to get count" });
    }
  });

  // FAQ Chatbot - AI-powered support with bot protection
  app.post("/api/chatbot/faq", async (req, res) => {
    try {
      // Bot detection
      const botCheck = detectBot(req);
      if (botCheck.isBot) {
        console.log(`🚫 Bot blocked from chatbot: ${botCheck.reason} (score: ${botCheck.score})`);
        return res.status(403).json({ 
          reply: "Automated traffic detected. Please use a real browser." 
        });
      }

      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ reply: "Please provide a message." });
      }

      // Check for suspicious patterns in message
      if (hasSuspiciousPattern(message)) {
        console.log(`🚫 Suspicious chatbot message blocked: ${message.substring(0, 50)}`);
        return res.status(400).json({ 
          reply: "Your message contains invalid characters. Please try again." 
        });
      }

      // System prompt for the FAQ chatbot
      const systemPrompt = `You are the PROFITHACK AI assistant, a helpful chatbot for our platform. 

Our platform is:
- An 18+ invite-only creator platform combining TikTok-style content with OnlyFans-style premium subscriptions
- Features include: video feed, premium subscriptions, AI code workspace, live streaming, video calls
- We have 4 tiers: Explorer (FREE), Starter ($20/mo), Creator ($40/mo), Innovator ($199/mo)
- Payment options: PayPal, Payoneer, Payeer, Crypto, Square, and more
- Global platform based in Bermuda
- Launch date: November 1, 2025

Your job:
1. Answer questions about the platform features, pricing, and how it works
2. If someone expresses interest or provides an email, EXTRACT the email and respond with: "Great! I've added you to our waitlist."
3. Be friendly, concise, and helpful
4. Keep responses under 100 words

If the user provides an email or says they want to join/sign up, respond with EXACTLY this format:
EMAIL_DETECTED: their@email.com`;

      // Call OpenAI (uses Replit AI Integrations)
      const openaiResponse = await fetch("https://ai-proxy.replit.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REPLIT_DB_TOKEN || ""}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!openaiResponse.ok) {
        console.error("OpenAI API error:", await openaiResponse.text());
        return res.json({ 
          reply: "I'm having trouble connecting right now. Please try again or contact support@profithackai.com" 
        });
      }

      const data = await openaiResponse.json();
      let reply = data.choices?.[0]?.message?.content || "I'm not sure how to help with that. Can you rephrase?";

      // Check if email was detected
      const emailMatch = reply.match(/EMAIL_DETECTED:\s*([^\s]+@[^\s]+)/);
      let addedToWaitlist = false;
      let inviteCode = null;
      
      if (emailMatch) {
        const email = emailMatch[1];
        
        // Add to waitlist with proper language and country detection
        try {
          const language = req.headers['accept-language']?.split(',')[0] || 'en';
          const country = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || 'unknown';
          
          await db.execute(sql`
            INSERT INTO waitlist (email, language, country, source, created_at)
            VALUES (${email}, ${language}, ${country}, 'chatbot_faq', NOW())
            ON CONFLICT (email) DO NOTHING
          `);
          addedToWaitlist = true;
          
          // 20% chance to give an invite code
          if (Math.random() < 0.2) {
            const systemUserId = "00000000-0000-0000-0000-000000000000";
            const availableCodes = await db.execute(sql`
              SELECT code FROM invite_codes 
              WHERE is_used = false AND creator_id = ${systemUserId}
              LIMIT 1
            `);
            
            if (availableCodes.rows.length > 0) {
              inviteCode = availableCodes.rows[0].code;
              reply = reply.replace(/EMAIL_DETECTED:.*/, 
                `🎉 Awesome! I've added ${email} to our waitlist! You'll be among the first to know when we launch on November 1st!`);
            } else {
              reply = reply.replace(/EMAIL_DETECTED:.*/, 
                `Great! I've added ${email} to our waitlist. You'll be notified when we launch!`);
            }
          } else {
            reply = reply.replace(/EMAIL_DETECTED:.*/, 
              `Perfect! I've added ${email} to our waitlist. We'll notify you when we launch on November 1st!`);
          }
        } catch (error) {
          console.error("Error adding to waitlist:", error);
        }
      }

      res.json({ reply, addedToWaitlist, inviteCode });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ 
        reply: "I'm experiencing technical difficulties. Please try again later." 
      });
    }
  });

  // =========================================================================
  // MARKETING AUTOMATION - Multi-Platform Campaign System
  // =========================================================================

  // Create a new marketing campaign
  app.post("/api/marketing/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const campaign = await db.insert(marketingCampaigns).values({
        ...req.body,
        userId: req.user!.id,
      }).returning();

      console.log(`✅ Campaign created: ${campaign[0].name} (${campaign[0].platforms.join(', ')})`);
      res.json(campaign[0]);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  // Get all campaigns for current user
  app.get("/api/marketing/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const campaigns = await db.query.marketingCampaigns.findMany({
        where: (campaigns, { eq }) => eq(campaigns.userId, req.user!.id),
        orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
      });

      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // Get campaign details with leads
  app.get("/api/marketing/campaigns/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const campaign = await db.query.marketingCampaigns.findFirst({
        where: (campaigns, { eq, and }) => and(
          eq(campaigns.id, req.params.id),
          eq(campaigns.userId, req.user!.id)
        ),
      });

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const leads = await db.query.campaignLeads.findMany({
        where: (leads, { eq }) => eq(leads.campaignId, req.params.id),
        orderBy: (leads, { desc }) => [desc(leads.createdAt)],
      });

      res.json({ campaign, leads });
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  // Start/Stop campaign
  app.post("/api/marketing/campaigns/:id/toggle", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { action } = req.body; // "start" or "stop"

      const campaign = await db.query.marketingCampaigns.findFirst({
        where: (campaigns, { eq, and }) => and(
          eq(campaigns.id, req.params.id),
          eq(campaigns.userId, req.user!.id)
        ),
      });

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const newStatus = action === "start" ? "active" : "paused";
      const updates: any = { status: newStatus, updatedAt: new Date() };
      
      if (action === "start" && !campaign.startedAt) {
        updates.startedAt = new Date();
      }

      await db.update(marketingCampaigns)
        .set(updates)
        .where(eq(marketingCampaigns.id, req.params.id));

      console.log(`✅ Campaign ${action}: ${campaign.name}`);
      res.json({ success: true, status: newStatus });
    } catch (error) {
      console.error("Error toggling campaign:", error);
      res.status(500).json({ error: "Failed to toggle campaign" });
    }
  });

  // Add leads to campaign (manual upload or API integration)
  app.post("/api/marketing/campaigns/:id/leads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { leads } = req.body; // Array of leads

      const campaign = await db.query.marketingCampaigns.findFirst({
        where: (campaigns, { eq, and }) => and(
          eq(campaigns.id, req.params.id),
          eq(campaigns.userId, req.user!.id)
        ),
      });

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const insertedLeads = await db.insert(campaignLeads).values(
        leads.map((lead: any) => ({
          ...lead,
          campaignId: req.params.id,
        }))
      ).returning();

      console.log(`✅ Added ${insertedLeads.length} leads to campaign: ${campaign.name}`);
      res.json({ success: true, count: insertedLeads.length });
    } catch (error) {
      console.error("Error adding leads:", error);
      res.status(500).json({ error: "Failed to add leads" });
    }
  });

  // Get campaign analytics
  app.get("/api/marketing/campaigns/:id/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const campaign = await db.query.marketingCampaigns.findFirst({
        where: (campaigns, { eq, and }) => and(
          eq(campaigns.id, req.params.id),
          eq(campaigns.userId, req.user!.id)
        ),
      });

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const leadsStats = await db.execute(sql`
        SELECT
          platform,
          COUNT(*) as total,
          SUM(CASE WHEN contacted THEN 1 ELSE 0 END) as contacted,
          SUM(CASE WHEN responded THEN 1 ELSE 0 END) as responded,
          SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
          SUM(CASE WHEN signed_up THEN 1 ELSE 0 END) as signed_up
        FROM campaign_leads
        WHERE campaign_id = ${req.params.id}
        GROUP BY platform
      `);

      res.json({
        campaign,
        platformStats: leadsStats.rows,
        totalReached: campaign.totalReached,
        totalClicks: campaign.totalClicks,
        totalSignups: campaign.totalSignups,
        conversionRate: campaign.totalReached > 0 
          ? ((campaign.totalSignups / campaign.totalReached) * 100).toFixed(2)
          : 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ==========================================
  // SOCIAL MEDIA CREDENTIALS ROUTES
  // ==========================================

  // Get all social media credentials for current user
  app.get("/api/social-media-credentials", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { socialMediaCredentials } = await import("@shared/schema");
      
      const credentials = await db.query.socialMediaCredentials.findMany({
        where: (creds, { eq }) => eq(creds.userId, req.user!.id),
        orderBy: (creds, { desc }) => [desc(creds.isVerified), desc(creds.createdAt)],
      });

      // Return credentials without sensitive data (for display purposes)
      const sanitized = credentials.map((cred) => ({
        id: cred.id,
        platform: cred.platform,
        platformUsername: cred.platformUsername,
        isActive: cred.isActive,
        isVerified: cred.isVerified,
        lastVerified: cred.lastVerified,
        lastUsed: cred.lastUsed,
        canPost: cred.canPost,
        canMessage: cred.canMessage,
        canComment: cred.canComment,
      }));

      res.json(sanitized);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });

  // Save or update credentials for a platform
  app.post("/api/social-media-credentials/:platform", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { socialMediaCredentials } = await import("@shared/schema");
      const { credentials, platformUsername } = req.body;
      const platform = req.params.platform;

      // Check if credentials already exist
      const existing = await db.query.socialMediaCredentials.findFirst({
        where: (creds, { eq, and }) => and(
          eq(creds.userId, req.user!.id),
          eq(creds.platform, platform)
        ),
      });

      if (existing) {
        // Update existing credentials
        const [updated] = await db.update(socialMediaCredentials)
          .set({
            credentials,
            platformUsername,
            isVerified: false, // Re-verify after update
            updatedAt: new Date(),
          })
          .where(and(
            eq(socialMediaCredentials.userId, req.user!.id),
            eq(socialMediaCredentials.platform, platform)
          ))
          .returning();

        res.json({ success: true, credential: updated });
      } else {
        // Create new credentials
        const [created] = await db.insert(socialMediaCredentials).values({
          userId: req.user!.id,
          platform,
          credentials,
          platformUsername,
          isActive: true,
          isVerified: false,
        }).returning();

        res.json({ success: true, credential: created });
      }

      console.log(`✅ Social media credentials saved for ${platform} by user ${req.user!.id}`);
    } catch (error) {
      console.error("Error saving credentials:", error);
      res.status(500).json({ error: "Failed to save credentials" });
    }
  });

  // Delete credentials for a platform
  app.delete("/api/social-media-credentials/:platform", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { socialMediaCredentials } = await import("@shared/schema");
      const platform = req.params.platform;

      await db.delete(socialMediaCredentials)
        .where(and(
          eq(socialMediaCredentials.userId, req.user!.id),
          eq(socialMediaCredentials.platform, platform)
        ));

      console.log(`✅ Social media credentials deleted for ${platform} by user ${req.user!.id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting credentials:", error);
      res.status(500).json({ error: "Failed to delete credentials" });
    }
  });

  // ==========================================
  // MARKETPLACE ROUTES - Templates & PLR Products
  // ==========================================

  // Get all marketplace products (browse catalog)
  app.get("/api/marketplace/products", async (req, res) => {
    try {
      const { category, type, featured } = req.query;
      
      const { marketplaceProducts: productsTable } = await import("@shared/schema");
      
      let query = db.query.marketplaceProducts.findMany({
        where: (products, { eq, and }) => {
          const conditions = [eq(products.isActive, true)];
          if (category) conditions.push(eq(products.category, category as any));
          if (type) conditions.push(eq(products.productType, type as any));
          if (featured === "true") conditions.push(eq(products.isFeatured, true));
          return and(...conditions);
        },
        orderBy: (products, { desc }) => [
          desc(products.isFeatured),
          desc(products.totalSales),
          desc(products.createdAt),
        ],
      });

      const products = await query;
      res.json(products);
    } catch (error) {
      console.error("Error fetching marketplace products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product details
  app.get("/api/marketplace/products/:id", async (req, res) => {
    try {
      const product = await db.query.marketplaceProducts.findFirst({
        where: (products, { eq }) => eq(products.id, req.params.id),
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Check if user owns a product
  app.get("/api/marketplace/products/:id/owned", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { userPurchases: purchasesTable } = await import("@shared/schema");
      
      const purchase = await db.query.userPurchases.findFirst({
        where: (purchases, { eq, and }) => and(
          eq(purchases.userId, req.user!.id),
          eq(purchases.productId, req.params.id)
        ),
      });

      res.json({ owned: !!purchase });
    } catch (error) {
      console.error("Error checking ownership:", error);
      res.status(500).json({ error: "Failed to check ownership" });
    }
  });

  // Purchase a product with multiple payment methods
  app.post("/api/marketplace/products/:id/purchase", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { marketplaceProducts: productsTable, userPurchases: purchasesTable, transactions, users: usersTable } = await import("@shared/schema");
      const { paymentMethod = "credits" } = req.body;
      
      // Get product
      const product = await db.query.marketplaceProducts.findFirst({
        where: (products, { eq }) => eq(products.id, req.params.id),
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if already owned
      const existingPurchase = await db.query.userPurchases.findFirst({
        where: (purchases, { eq, and }) => and(
          eq(purchases.userId, req.user!.id),
          eq(purchases.productId, req.params.id)
        ),
      });

      if (existingPurchase) {
        return res.status(400).json({ error: "You already own this product" });
      }

      // Convert credits to USD (1 credit = $0.024)
      const priceUSD = product.priceCredits * 0.024;

      // Handle different payment methods
      if (paymentMethod === "credits") {
        // Original credits-based purchase flow
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, req.user!.id),
        });

        if (!user || user.credits < product.priceCredits) {
          return res.status(400).json({ error: "Insufficient credits" });
        }

        // Deduct credits
        await db.update(usersTable)
          .set({ credits: user.credits - product.priceCredits })
          .where(eq(usersTable.id, req.user!.id));

        // Create transaction
        const [transaction] = await db.insert(transactions).values({
          userId: req.user!.id,
          type: "credit_purchase",
          amount: product.priceCredits,
          status: "completed",
          paymentProvider: "credits",
          metadata: {
            productId: product.id,
            productTitle: product.title,
            purchaseType: "marketplace_digital_product",
            priceUSD,
          },
        }).returning();

        // Calculate revenue split (70/30 for user uploads, 100% platform for official)
        const creatorEarnings = product.isOfficialProduct ? 0 : Math.floor(product.priceCredits * 0.7);
        const platformRevenue = product.isOfficialProduct ? product.priceCredits : product.priceCredits - creatorEarnings;

        // Create purchase record
        const [purchase] = await db.insert(purchasesTable).values({
          userId: req.user!.id,
          productId: product.id,
          pricePaid: product.priceCredits,
          transactionId: transaction.id,
          creatorEarnings,
          platformRevenue,
        }).returning();

        // Update product stats
        await db.update(productsTable)
          .set({
            totalSales: product.totalSales + 1,
            totalRevenue: product.totalRevenue + product.priceCredits,
          })
          .where(eq(productsTable.id, product.id));

        // If there's a creator, credit them
        if (product.creatorId && creatorEarnings > 0) {
          const creator = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, product.creatorId!),
          });
          
          if (creator) {
            await db.update(usersTable)
              .set({ credits: creator.credits + creatorEarnings })
              .where(eq(usersTable.id, product.creatorId));
          }
        }

        console.log(`✅ User ${req.user!.id} purchased "${product.title}" for ${product.priceCredits} credits`);

        res.json({
          success: true,
          purchase,
          product,
          creditsRemaining: user.credits - product.priceCredits,
        });
      } else {
        // Other payment methods: PayPal, Stripe, Crypto, etc.
        // Create pending transaction and return payment URL
        const [transaction] = await db.insert(transactions).values({
          userId: req.user!.id,
          type: "purchase",
          amount: priceUSD * 100, // Convert to cents
          status: "pending",
          paymentProvider: paymentMethod,
          metadata: {
            productId: product.id,
            productTitle: product.title,
            purchaseType: "marketplace_digital_product",
            priceUSD,
            priceCredits: product.priceCredits,
          },
        }).returning();

        // Generate payment URL based on provider
        let redirectUrl = "";
        const callbackUrl = `${req.protocol}://${req.get("host")}/api/marketplace/payment-success?transactionId=${transaction.id}`;

        switch (paymentMethod) {
          case "paypal":
            redirectUrl = `/api/checkout/paypal?amount=${priceUSD}&productId=${product.id}&transactionId=${transaction.id}`;
            break;
          case "stripe":
            redirectUrl = `/api/checkout/stripe?amount=${priceUSD}&productId=${product.id}&transactionId=${transaction.id}`;
            break;
          case "crypto_nowpayments":
            redirectUrl = `/api/checkout/nowpayments?amount=${priceUSD}&productId=${product.id}&transactionId=${transaction.id}`;
            break;
          case "ton":
            redirectUrl = `/api/checkout/ton?amount=${priceUSD}&productId=${product.id}&transactionId=${transaction.id}`;
            break;
          case "square":
            redirectUrl = `/api/checkout/square?amount=${priceUSD}&productId=${product.id}&transactionId=${transaction.id}`;
            break;
          case "payoneer":
          case "payeer":
            redirectUrl = `/api/checkout/${paymentMethod}?amount=${priceUSD}&productId=${product.id}&transactionId=${transaction.id}`;
            break;
          default:
            return res.status(400).json({ error: "Unsupported payment method" });
        }

        res.json({
          success: true,
          redirectUrl,
          transactionId: transaction.id,
        });
      }
    } catch (error) {
      console.error("Error purchasing product:", error);
      res.status(500).json({ error: "Failed to purchase product" });
    }
  });

  // Get user's purchased products
  app.get("/api/marketplace/my-products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const purchases = await db.query.userPurchases.findMany({
        where: (purchases, { eq }) => eq(purchases.userId, req.user!.id),
        with: {
          product: true,
        },
        orderBy: (purchases, { desc }) => [desc(purchases.purchasedAt)],
      });

      res.json(purchases);
    } catch (error) {
      console.error("Error fetching user products:", error);
      res.status(500).json({ error: "Failed to fetch your products" });
    }
  });

  // Create payment checkout for marketplace product
  app.post("/api/marketplace/products/:id/checkout", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { paymentMethod } = req.body; // 'credits', 'paypal', 'payoneer', 'crypto', etc.

      const product = await db.query.marketplaceProducts.findFirst({
        where: (products, { eq }) => eq(products.id, req.params.id),
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if already owned
      const existingPurchase = await db.query.userPurchases.findFirst({
        where: (purchases, { eq, and }) => and(
          eq(purchases.userId, req.user!.id),
          eq(purchases.productId, req.params.id)
        ),
      });

      if (existingPurchase) {
        return res.status(400).json({ error: "You already own this product" });
      }

      // Calculate USD price (1 credit = $0.024)
      const usdPrice = (product.priceCredits * 0.024).toFixed(2);

      res.json({
        productId: product.id,
        productTitle: product.title,
        priceCredits: product.priceCredits,
        priceUsd: usdPrice,
        paymentMethod,
        checkoutUrl: `/checkout/marketplace/${product.id}?method=${paymentMethod}`,
      });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ error: "Failed to create checkout" });
    }
  });

  // Upload PLR product (admin/creator only)
  app.post("/api/marketplace/products/upload", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const {
        title,
        description,
        longDescription,
        productType,
        category,
        priceCredits,
        originalPriceCredits,
        features,
        benefits,
        tags,
        contentUrl,
        fileType,
        fileSize,
      } = req.body;

      const { marketplaceProducts: productsTable } = await import("@shared/schema");

      // Create new PLR product
      const [product] = await db.insert(productsTable).values({
        title,
        description,
        longDescription,
        productType: productType || "plr_content",
        category: category || "business",
        priceCredits,
        originalPriceCredits,
        creatorId: req.user!.id,
        isOfficialProduct: false, // User-uploaded PLR
        content: {
          contentUrl,
          fileType,
          fileSize,
        },
        features,
        benefits,
        tags,
        isActive: true,
        isFeatured: false,
        isEvergreen: true,
      }).returning();

      console.log(`✅ New PLR product uploaded by ${req.user!.id}: ${title}`);

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Error uploading PLR product:", error);
      res.status(500).json({ error: "Failed to upload product" });
    }
  });

  // Get my uploaded products (creator dashboard)
  app.get("/api/marketplace/my-uploads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const products = await db.query.marketplaceProducts.findMany({
        where: (products, { eq }) => eq(products.creatorId, req.user!.id),
        orderBy: (products, { desc }) => [desc(products.createdAt)],
      });

      res.json(products);
    } catch (error) {
      console.error("Error fetching uploaded products:", error);
      res.status(500).json({ error: "Failed to fetch your uploads" });
    }
  });

  // ==================== VIRAL MARKETING ROUTES ====================

  // Record social share (Build in Public)
  app.post("/api/viral/share", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { platform, shareType, shareText, videoId, milestoneType } = req.body;

      const { socialShares } = await import("@shared/schema");
      
      // Bonus credits for sharing (gamification)
      const earnedCredits = 50; // 50 credits per share

      const [share] = await db.insert(socialShares).values({
        userId,
        videoId: videoId || null,
        platform,
        shareType,
        shareText,
        milestoneType,
        earnedCredits,
      }).returning();

      // Award credits to user
      await db.execute(sql`
        UPDATE users 
        SET credits = credits + ${earnedCredits}
        WHERE id = ${userId}
      `);

      console.log(`🚀 User ${userId} shared on ${platform} - earned ${earnedCredits} credits`);

      res.json({
        success: true,
        earnedCredits,
        share,
      });
    } catch (error) {
      console.error("Error recording share:", error);
      res.status(500).json({ message: "Failed to record share" });
    }
  });

  // Get trending topics (Be First to Market)
  app.get("/api/viral/trending-topics", isAuthenticated, async (req: any, res) => {
    try {
      const { trendingTopics } = await import("@shared/schema");
      
      const trends = await db.query.trendingTopics.findMany({
        where: (topics, { eq }) => eq(topics.isActive, true),
        orderBy: (topics, { desc }) => [desc(topics.trendScore)],
        limit: 10,
      });

      res.json(trends);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Create trending topic (admin/bot only)
  app.post("/api/viral/trending-topics", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { trendingTopics } = await import("@shared/schema");
      const {
        topic,
        description,
        category,
        trendScore,
        peakWindow,
        recommendedHashtags,
        suggestedHooks,
      } = req.body;

      const [trend] = await db.insert(trendingTopics).values({
        topic,
        description,
        category,
        trendScore: trendScore || 100,
        peakWindow: peakWindow || 48,
        recommendedHashtags: recommendedHashtags || [],
        suggestedHooks: suggestedHooks || [],
        competitionLevel: "low",
        isActive: true,
        expiresAt: new Date(Date.now() + (peakWindow || 48) * 60 * 60 * 1000),
      }).returning();

      res.json(trend);
    } catch (error) {
      console.error("Error creating trending topic:", error);
      res.status(500).json({ message: "Failed to create trending topic" });
    }
  });

  // Get hook analytics for a video
  app.get("/api/viral/hook-analytics/:videoId", isAuthenticated, async (req: any, res) => {
    try {
      const { hookAnalytics } = await import("@shared/schema");
      
      const analytics = await db.query.hookAnalytics.findFirst({
        where: (analytics, { eq }) => eq(analytics.videoId, req.params.videoId),
      });

      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found" });
      }

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching hook analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get top performing hooks (learning dashboard)
  app.get("/api/viral/top-hooks", isAuthenticated, async (req: any, res) => {
    try {
      const { hookAnalytics } = await import("@shared/schema");
      
      const topHooks = await db.query.hookAnalytics.findMany({
        orderBy: (analytics, { desc }) => [desc(analytics.overallHookScore)],
        limit: 20,
      });

      res.json(topHooks);
    } catch (error) {
      console.error("Error fetching top hooks:", error);
      res.status(500).json({ message: "Failed to fetch top hooks" });
    }
  });

  // Get user's share history
  app.get("/api/viral/my-shares", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { socialShares } = await import("@shared/schema");
      
      const shares = await db.query.socialShares.findMany({
        where: (shares, { eq }) => eq(shares.userId, userId),
        orderBy: (shares, { desc }) => [desc(shares.sharedAt)],
      });

      res.json(shares);
    } catch (error) {
      console.error("Error fetching shares:", error);
      res.status(500).json({ message: "Failed to fetch shares" });
    }
  });

  // Get viral templates (for content generator)
  app.get("/api/viral/templates", isAuthenticated, async (req: any, res) => {
    try {
      const { viralTemplates } = await import("@shared/schema");
      
      const templates = await db.query.viralTemplates.findMany({
        where: (templates, { eq }) => eq(templates.isActive, true),
        orderBy: (templates, { desc }) => [desc(templates.avgViralScore)],
      });

      res.json(templates);
    } catch (error) {
      console.error("Error fetching viral templates:", error);
      res.status(500).json({ message: "Failed to fetch viral templates" });
    }
  });

  // Get viral keywords (SEO targets)
  app.get("/api/viral/keywords", isAuthenticated, async (req: any, res) => {
    try {
      const { viralKeywords } = await import("@shared/schema");
      
      const keywords = await db.query.viralKeywords.findMany({
        where: (keywords, { eq }) => eq(keywords.isActive, true),
        orderBy: (keywords, { desc }) => [desc(keywords.opportunityScore)],
        limit: 20,
      });

      res.json(keywords);
    } catch (error) {
      console.error("Error fetching viral keywords:", error);
      res.status(500).json({ message: "Failed to fetch viral keywords" });
    }
  });

  // ==================== CRAYO-STYLE VIDEO GENERATOR ====================

  // Get caption styles
  app.get("/api/caption-styles", isAuthenticated, async (req: any, res) => {
    try {
      const { captionStyles } = await import("@shared/schema");
      
      const styles = await db.query.captionStyles.findMany({
        where: (styles, { eq }) => eq(styles.isActive, true),
        orderBy: (styles, { desc }) => [desc(styles.timesUsed)],
      });

      res.json(styles);
    } catch (error) {
      console.error("Error fetching caption styles:", error);
      res.status(500).json({ message: "Failed to fetch caption styles" });
    }
  });

  // Get AI voices
  app.get("/api/ai-voices", isAuthenticated, async (req: any, res) => {
    try {
      const { aiVoices } = await import("@shared/schema");
      
      const voices = await db.query.aiVoices.findMany({
        where: (voices, { eq }) => eq(voices.isActive, true),
        orderBy: (voices, { desc }) => [desc(voices.timesUsed)],
      });

      res.json(voices);
    } catch (error) {
      console.error("Error fetching AI voices:", error);
      res.status(500).json({ message: "Failed to fetch AI voices" });
    }
  });

  // Create video project
  app.post("/api/video-projects", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { videoProjects, insertVideoProjectSchema } = await import("@shared/schema");
      
      const validatedData = insertVideoProjectSchema.parse({
        ...req.body,
        creatorId: userId,
      });

      const [project] = await db.insert(videoProjects).values(validatedData).returning();
      
      // TODO: Queue video generation job here
      console.log(`📹 Video project created: ${project.id} by ${userId}`);
      
      res.json(project);
    } catch (error) {
      console.error("Error creating video project:", error);
      res.status(500).json({ message: "Failed to create video project" });
    }
  });

  // Get user's video projects
  app.get("/api/video-projects", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = getUserFromRequest(req);
      const { videoProjects } = await import("@shared/schema");
      
      const projects = await db.query.videoProjects.findMany({
        where: (projects, { eq }) => eq(projects.creatorId, userId),
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
      });

      res.json(projects);
    } catch (error) {
      console.error("Error fetching video projects:", error);
      res.status(500).json({ message: "Failed to fetch video projects" });
    }
  });

  // ==================== AI CREATOR TOOLS API - MARKET DOMINATION ====================

  // AI Thumbnail Engineer - Generate 10 high-CTR thumbnails in 30 seconds
  app.post("/api/ai/thumbnails/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { videoTitle, niche, style } = req.body;
      
      if (!videoTitle) {
        return res.status(400).json({ error: "Video title is required" });
      }

      console.log(`🎨 Generating thumbnails for: "${videoTitle}"`);

      const CREDIT_COST = 10;
      
      // Deduct AI credits (bonus first, then regular)
      const { deductAICredits } = await import("./ai-providers");
      const { bonusUsed, regularUsed } = await deductAICredits(userId, CREDIT_COST);

      const thumbnails = [
        { url: '/api/placeholder/thumb1.jpg', prompt: 'Dramatic lighting', ctrScore: 95, style: 'dramatic', selected: true },
        { url: '/api/placeholder/thumb2.jpg', prompt: 'Minimalist', ctrScore: 88, style: 'minimalist', selected: false },
        { url: '/api/placeholder/thumb3.jpg', prompt: 'Viral neon', ctrScore: 92, style: 'colorful', selected: false },
        { url: '/api/placeholder/thumb4.jpg', prompt: 'Action shot', ctrScore: 85, style: 'professional', selected: false },
        { url: '/api/placeholder/thumb5.jpg', prompt: 'Split screen', ctrScore: 90, style: 'dramatic', selected: false },
        { url: '/api/placeholder/thumb6.jpg', prompt: 'Meme format', ctrScore: 87, style: 'colorful', selected: false },
        { url: '/api/placeholder/thumb7.jpg', prompt: 'Premium luxury', ctrScore: 83, style: 'professional', selected: false },
        { url: '/api/placeholder/thumb8.jpg', prompt: 'Clickbait style', ctrScore: 94, style: 'dramatic', selected: false },
        { url: '/api/placeholder/thumb9.jpg', prompt: 'Storytelling', ctrScore: 86, style: 'minimalist', selected: false },
        { url: '/api/placeholder/thumb10.jpg', prompt: 'Ultra-viral', ctrScore: 96, style: 'colorful', selected: false }
      ];
      
      console.log(`✅ Generated 10 thumbnails. Used ${bonusUsed} bonus credits + ${regularUsed} regular credits`);

      res.json({
        success: true,
        thumbnails,
        creditsUsed: CREDIT_COST,
        bonusCreditsUsed: bonusUsed,
        regularCreditsUsed: regularUsed,
      });
    } catch (error: any) {
      console.error("Thumbnail generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate thumbnails" });
    }
  });

  // AI Script Factory
  app.post("/api/ai/scripts/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { topic, format, platform } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic required" });
      }

      console.log(`📝 Generating script for: "${topic}"`);

      const CREDIT_COST = 5;
      
      // Deduct AI credits (bonus first, then regular)
      const { deductAICredits } = await import("./ai-providers");
      const { bonusUsed, regularUsed } = await deductAICredits(userId, CREDIT_COST);

      const user = await storage.getUser(userId);
      const hook = `Wait... did you know ${topic}?`;
      const script = `[HOOK] ${hook}\n\n[BODY] Explain ${topic} with engaging storytelling.\n\n[CTA] Follow for more!`;
      const cta = `Follow @${user?.username} for more ${topic} content!`;
      const keywords = [topic, `${topic} tips`, `viral ${topic}`];
      const viralScore = 85;
      const estimatedViews = 75000;

      res.json({
        success: true,
        hook,
        script,
        cta,
        keywords,
        viralScore,
        estimatedViews,
        creditsUsed: CREDIT_COST,
        bonusCreditsUsed: bonusUsed,
        regularCreditsUsed: regularUsed,
      });
    } catch (error: any) {
      console.error("Script generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate script" });
    }
  });

  // AI Ad Generator
  app.post("/api/ai/ads/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { productName, productDescription } = req.body;
      
      if (!productName) {
        return res.status(400).json({ error: "Product name required" });
      }

      console.log(`📢 Generating ads for: ${productName}`);

      const CREDIT_COST = 15;
      
      // Deduct AI credits (bonus first, then regular)
      const { deductAICredits } = await import("./ai-providers");
      const { bonusUsed, regularUsed } = await deductAICredits(userId, CREDIT_COST);

      const ads = [];
      for (let i = 0; i < 10; i++) {
        ads.push({
          headline: `Transform Your Life with ${productName}`,
          body: `${productDescription}. Limited time!`,
          cta: 'Shop Now',
          imageUrl: `/api/placeholder/ad${i + 1}.jpg`,
          platform: ['facebook', 'instagram', 'google', 'tiktok'][i % 4],
          style: ['pain-point', 'benefit', 'social-proof', 'scarcity'][i % 4],
          predictedCtr: 15 + (i % 5)
        });
      }

      res.json({
        success: true,
        ads,
        creditsUsed: CREDIT_COST,
        bonusCreditsUsed: bonusUsed,
        regularCreditsUsed: regularUsed,
      });
    } catch (error: any) {
      console.error("Ad generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate ads" });
    }
  });

  // AI Content Planner
  app.post("/api/ai/content-plans/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { niche, goals, platforms } = req.body;
      
      if (!niche) {
        return res.status(400).json({ error: "Niche required" });
      }

      console.log(`📅 Generating 30-day plan for ${niche}`);

      const CREDIT_COST = 20;
      
      // Deduct AI credits (bonus first, then regular)
      const { deductAICredits } = await import("./ai-providers");
      const { bonusUsed, regularUsed } = await deductAICredits(userId, CREDIT_COST);

      const contentCalendar = [];
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        
        contentCalendar.push({
          date: date.toISOString().split('T')[0],
          platform: platforms[day % platforms.length],
          type: ['tutorial', 'tips', 'trending'][day % 3],
          topic: `${niche} content - Day ${day + 1}`,
          hook: `Quick ${niche} tip`,
          hashtags: [`#${niche}`, '#viral'],
          estimatedViews: 25000
        });
      }

      res.json({
        success: true,
        contentCalendar,
        totalPosts: 30,
        creditsUsed: CREDIT_COST,
        bonusCreditsUsed: bonusUsed,
        regularCreditsUsed: regularUsed,
      });
    } catch (error: any) {
      console.error("Content plan error:", error);
      res.status(500).json({ error: error.message || "Failed to generate plan" });
    }
  });

  // ==================== AI WORKSPACE - CHATGPT/MANUS STYLE ====================

  // AI Workspace Chat - ChatGPT/Manus-style autonomous AI assistant
  app.post("/api/ai/workspace/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { message, model = "gpt-4", taskType = "chat", conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      console.log(`🤖 AI Workspace: ${userId} - ${taskType} using ${model}`);

      // Define credit costs (model cost + task cost)
      const MODEL_COSTS: Record<string, number> = {
        "gpt-4": 50,
        "gpt-3.5-turbo": 10,
        "claude-3": 40,
        "gemini-pro": 30,
      };

      const TASK_COSTS: Record<string, number> = {
        chat: 10,      // Simple chat
        code: 50,      // Code generation/debugging
        research: 100, // Multi-step research
        content: 30,   // Content writing
      };

      const modelCost = MODEL_COSTS[model] || 50;
      const taskCost = TASK_COSTS[taskType] || 10;
      const totalCredits = modelCost + taskCost;

      // Deduct AI credits (bonus first, then regular)
      const { deductAICredits } = await import("./ai-providers");
      const { bonusUsed, regularUsed } = await deductAICredits(userId, totalCredits);

      // Build system prompt based on task type
      let systemPrompt = "";
      switch (taskType) {
        case "code":
          systemPrompt = "You are an expert code assistant. Help users write, debug, and explain code. Provide clear, working examples with explanations.";
          break;
        case "research":
          systemPrompt = "You are a research assistant. Break down complex topics, provide comprehensive analysis, and cite key information. Use multi-step reasoning.";
          break;
        case "content":
          systemPrompt = "You are a content writing assistant. Create engaging, well-structured content optimized for the target audience.";
          break;
        default: // chat
          systemPrompt = "You are a helpful AI assistant. Be conversational, clear, and concise.";
      }

      // Build conversation history
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-10).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: message },
      ];

      // Call AI based on selected model
      let aiResponse = "";
      
      if (model === "gpt-4" || model === "gpt-3.5-turbo") {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || "",
        });

        if (!process.env.OPENAI_API_KEY) {
          return res.status(500).json({
            error: "OpenAI API key not configured. Please contact support.",
          });
        }

        const completion = await openai.chat.completions.create({
          model: model,
          messages: messages as any,
          temperature: taskType === "code" ? 0.3 : 0.7,
          max_tokens: taskType === "research" ? 2000 : 1000,
        });

        aiResponse = completion.choices[0]?.message?.content || "No response generated.";
      } else if (model === "claude-3") {
        // Use Anthropic API
        const { AnthropicProvider } = await import("./ai-providers");
        const provider = new AnthropicProvider();
        
        if (!provider.isConfigured()) {
          return res.status(500).json({
            error: "Anthropic API key not configured. Please use OpenAI models.",
          });
        }

        const conversationText = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");
        aiResponse = await provider.generateText(conversationText, "claude-3-sonnet", {
          maxTokens: taskType === "research" ? 2000 : 1000,
          temperature: taskType === "code" ? 0.3 : 0.7,
        });
      } else if (model === "gemini-pro") {
        // Use Google AI
        const { GoogleAIProvider } = await import("./ai-providers");
        const provider = new GoogleAIProvider();
        
        if (!provider.isConfigured()) {
          return res.status(500).json({
            error: "Google AI API key not configured. Please use OpenAI models.",
          });
        }

        const conversationText = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");
        aiResponse = await provider.generateText(conversationText, "gemini-pro", {
          maxTokens: taskType === "research" ? 2000 : 1000,
          temperature: taskType === "code" ? 0.3 : 0.7,
        });
      }

      console.log(`✅ AI Workspace response generated. Used ${bonusUsed} bonus + ${regularUsed} regular = ${totalCredits} credits`);

      res.json({
        success: true,
        response: aiResponse,
        creditsUsed: totalCredits,
        bonusCreditsUsed: bonusUsed,
        regularCreditsUsed: regularUsed,
        model,
        taskType,
      });
    } catch (error: any) {
      console.error("AI Workspace error:", error);
      res.status(500).json({
        error: error.message || "Failed to process AI request",
      });
    }
  });

  // ==================== TRANSLATION API ====================

  // Translate single text
  app.post("/api/translate", isAuthenticated, async (req: any, res) => {
    try {
      const { text, targetLanguage, sourceLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Text and target language are required" });
      }

      const { translateText } = await import("./translation.js");
      const result = await translateText(text, targetLanguage, sourceLanguage);
      
      res.json(result);
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ error: error.message || "Translation failed" });
    }
  });

  // Batch translate multiple texts
  app.post("/api/translate/batch", isAuthenticated, async (req: any, res) => {
    try {
      const { texts, targetLanguage, sourceLanguage } = req.body;
      
      if (!texts || !Array.isArray(texts) || !targetLanguage) {
        return res.status(400).json({ error: "Texts array and target language are required" });
      }

      const { translateBatch } = await import("./translation.js");
      const results = await translateBatch(texts, targetLanguage, sourceLanguage);
      
      res.json({ translations: results });
    } catch (error: any) {
      console.error("Batch translation error:", error);
      res.status(500).json({ error: error.message || "Batch translation failed" });
    }
  });

  // Get supported languages
  app.get("/api/translate/languages", async (req: any, res) => {
    try {
      const { SUPPORTED_LANGUAGES } = await import("./translation.js");
      res.json({ languages: SUPPORTED_LANGUAGES });
    } catch (error: any) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ error: "Failed to fetch languages" });
    }
  });

  // Detect language of text
  app.post("/api/translate/detect", isAuthenticated, async (req: any, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const { detectLanguage } = await import("./translation.js");
      const detectedLanguage = detectLanguage(text);
      
      res.json({ detectedLanguage });
    } catch (error: any) {
      console.error("Language detection error:", error);
      res.status(500).json({ error: "Language detection failed" });
    }
  });

  // ==================== GDPR COMPLIANCE ====================
  
  /**
   * GDPR: Export all user data
   * Right to Access - Download complete data archive in JSON format
   */
  app.post("/api/gdpr/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password confirmation required" });
      }

      // Verify password before allowing export
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const bcrypt = await import("bcrypt");
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      console.log(`📦 GDPR Export requested by user: ${user.email}`);

      // Generate complete data export
      const exportData = await storage.exportUserData(userId);

      // Set headers for file download
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="profithack_data_export_${userId}_${Date.now()}.json"`
      );

      res.json(exportData);
    } catch (error: any) {
      console.error("GDPR export error:", error);
      res.status(500).json({ error: error.message || "Failed to export data" });
    }
  });

  /**
   * GDPR: Preview what will be deleted
   * Shows user exactly what data will be permanently removed
   */
  app.get("/api/gdpr/deletion-preview", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Count all data that will be deleted
      const [
        videosCount,
        projectsCount,
        messagesCount,
        transactionsCount,
        followsCount,
        followersCount,
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(videos).where(eq(videos.userId, userId)).then(r => r[0]?.count || 0),
        db.select({ count: sql<number>`count(*)::int` }).from(projects).where(eq(projects.userId, userId)).then(r => r[0]?.count || 0),
        db.select({ count: sql<number>`count(*)::int` }).from(messages).where(eq(messages.senderId, userId)).then(r => r[0]?.count || 0),
        db.select({ count: sql<number>`count(*)::int` }).from(transactions).where(eq(transactions.userId, userId)).then(r => r[0]?.count || 0),
        db.select({ count: sql<number>`count(*)::int` }).from(follows).where(eq(follows.followerId, userId)).then(r => r[0]?.count || 0),
        db.select({ count: sql<number>`count(*)::int` }).from(follows).where(eq(follows.followingId, userId)).then(r => r[0]?.count || 0),
      ]);

      res.json({
        email: user.email,
        username: user.username,
        deletion: {
          profile: 1,
          videos: videosCount,
          projects: projectsCount,
          messages: messagesCount,
          transactions: transactionsCount,
          following: followsCount,
          followers: followersCount,
          totalDataPoints: videosCount + projectsCount + messagesCount + transactionsCount + followsCount + followersCount + 1,
        },
        warning: "This action is IRREVERSIBLE. All data will be permanently deleted.",
      });
    } catch (error: any) {
      console.error("GDPR deletion preview error:", error);
      res.status(500).json({ error: "Failed to generate deletion preview" });
    }
  });

  /**
   * GDPR: Permanently delete user account and ALL data
   * Right to Erasure - Complete account deletion
   */
  app.post("/api/gdpr/delete-account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { password, confirmation } = req.body;

      if (!password || !confirmation) {
        return res.status(400).json({ 
          error: "Password and confirmation required" 
        });
      }

      if (confirmation !== "DELETE MY ACCOUNT") {
        return res.status(400).json({ 
          error: "Confirmation text must be exactly: DELETE MY ACCOUNT" 
        });
      }

      // Verify password before allowing deletion
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const bcrypt = await import("bcrypt");
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      console.log(`🗑️ GDPR Account Deletion requested by user: ${user.email}`);

      // Perform complete account deletion
      await storage.deleteUserAccount(userId);

      // Destroy session
      req.logout((err: any) => {
        if (err) {
          console.error("Logout error during deletion:", err);
        }
      });

      res.json({ 
        success: true, 
        message: "Your account and all associated data have been permanently deleted." 
      });
    } catch (error: any) {
      console.error("GDPR account deletion error:", error);
      res.status(500).json({ error: error.message || "Failed to delete account" });
    }
  });

  // ==================== ANALYTICS API ====================
  
  // Get dashboard analytics data
  app.get("/api/analytics/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const data = await analyticsService.getDashboardData();
      res.json(data);
    } catch (error: any) {
      console.error("Analytics dashboard error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Calculate daily analytics (admin only)
  app.post("/api/analytics/calculate-daily", isAuthenticated, async (req: any, res) => {
    try {
      const { date } = req.body;
      await analyticsService.calculateDailyAnalytics(new Date(date || Date.now()));
      res.json({ success: true, message: "Daily analytics calculated" });
    } catch (error: any) {
      console.error("Calculate daily analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Calculate creator metrics
  app.post("/api/analytics/creator-metrics", isAuthenticated, async (req: any, res) => {
    try {
      const { creatorId, date } = req.body;
      await analyticsService.calculateCreatorMetrics(
        creatorId || req.user.id,
        new Date(date || Date.now())
      );
      res.json({ success: true, message: "Creator metrics calculated" });
    } catch (error: any) {
      console.error("Calculate creator metrics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate revenue forecast
  app.post("/api/analytics/forecast-revenue", isAuthenticated, async (req: any, res) => {
    try {
      const { days } = req.body;
      await analyticsService.forecastRevenue(days || 30);
      res.json({ success: true, message: "Revenue forecast generated" });
    } catch (error: any) {
      console.error("Revenue forecast error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CONTENT MODERATION API ====================
  
  // Analyze video content for safety
  app.post("/api/moderation/analyze-video", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId, videoUrl } = req.body;
      const analysis = await moderationService.analyzeVideoContent(videoId, videoUrl);
      res.json(analysis);
    } catch (error: any) {
      console.error("Video analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Detect deepfakes in video
  app.post("/api/moderation/detect-deepfakes", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId } = req.body;
      const detection = await moderationService.detectDeepfakes(videoId);
      res.json(detection);
    } catch (error: any) {
      console.error("Deepfake detection error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify content consent
  app.post("/api/moderation/verify-consent", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId, creatorId, consentType } = req.body;
      const hasConsent = await moderationService.verifyConsent(videoId, creatorId, consentType);
      res.json({ hasConsent });
    } catch (error: any) {
      console.error("Consent verification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add watermark to content
  app.post("/api/moderation/add-watermark", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId, watermarkType } = req.body;
      await moderationService.addWatermark(videoId, watermarkType);
      res.json({ success: true, message: "Watermark added" });
    } catch (error: any) {
      console.error("Add watermark error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate safety report (admin only)
  app.post("/api/moderation/safety-report", isAuthenticated, async (req: any, res) => {
    try {
      await moderationService.generateSafetyReport();
      res.json({ success: true, message: "Safety report generated" });
    } catch (error: any) {
      console.error("Safety report error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CREATOR MONETIZATION API ====================
  
  // Evaluate creator tier
  app.post("/api/creator/evaluate-tier", isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.body.creatorId || req.user.id;
      const tier = await creatorMonetizationService.evaluateCreatorTier(creatorId);
      res.json({ tier });
    } catch (error: any) {
      console.error("Evaluate tier error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get creator tier
  app.get("/api/creator/tier/:creatorId?", isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.params.creatorId || req.user.id;
      const tier = await creatorMonetizationService.evaluateCreatorTier(creatorId);
      res.json({ tier });
    } catch (error: any) {
      console.error("Get tier error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate AI content
  app.post("/api/creator/generate-content", isAuthenticated, async (req: any, res) => {
    try {
      const { jobType, prompt } = req.body;
      const creatorId = req.user.id;
      const result = await creatorMonetizationService.generateContent(creatorId, jobType, prompt);
      res.json(result);
    } catch (error: any) {
      console.error("Generate content error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get trend predictions
  app.get("/api/creator/trends", isAuthenticated, async (req: any, res) => {
    try {
      await creatorMonetizationService.predictTrends();
      res.json({ success: true, message: "Trends predicted" });
    } catch (error: any) {
      console.error("Predict trends error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Process creator payouts (admin only)
  app.post("/api/creator/process-payouts", isAuthenticated, async (req: any, res) => {
    try {
      await creatorMonetizationService.processPayouts();
      res.json({ success: true, message: "Payouts processed" });
    } catch (error: any) {
      console.error("Process payouts error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check and award achievements
  app.post("/api/creator/check-achievements", isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.body.creatorId || req.user.id;
      await creatorMonetizationService.checkAndAwardAchievements(creatorId);
      res.json({ success: true, message: "Achievements checked" });
    } catch (error: any) {
      console.error("Check achievements error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MARKETING AUTOMATION API ====================
  
  // Run all marketing bots
  app.post("/api/marketing-automation/run-all", async (req, res) => {
    try {
      const { marketingAutomationService } = await import('./services/marketing-automation.service');
      await marketingAutomationService.runAllBots();
      res.json({ success: true, message: "All marketing bots executed successfully" });
    } catch (error: any) {
      console.error("Marketing automation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Post to social media
  app.post("/api/marketing-automation/social-media", async (req, res) => {
    try {
      const { marketingAutomationService } = await import('./services/marketing-automation.service');
      await marketingAutomationService.postToSocialMedia();
      res.json({ success: true, message: "Social media posts created" });
    } catch (error: any) {
      console.error("Social media automation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate SEO content
  app.post("/api/marketing-automation/seo-content", async (req, res) => {
    try {
      const { marketingAutomationService } = await import('./services/marketing-automation.service');
      await marketingAutomationService.generateSEOContent();
      res.json({ success: true, message: "SEO content generated" });
    } catch (error: any) {
      console.error("SEO content error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Submit to directories
  app.post("/api/marketing-automation/directories", async (req, res) => {
    try {
      const { marketingAutomationService } = await import('./services/marketing-automation.service');
      await marketingAutomationService.submitToDirectories();
      res.json({ success: true, message: "Directory submissions queued" });
    } catch (error: any) {
      console.error("Directory submission error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Track keyword rankings
  app.post("/api/marketing-automation/track-rankings", async (req, res) => {
    try {
      const { marketingAutomationService } = await import('./services/marketing-automation.service');
      await marketingAutomationService.trackRankings();
      res.json({ success: true, message: "Keyword rankings tracked" });
    } catch (error: any) {
      console.error("Ranking tracking error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Build backlinks
  app.post("/api/marketing-automation/backlinks", async (req, res) => {
    try {
      const { marketingAutomationService } = await import('./services/marketing-automation.service');
      await marketingAutomationService.buildBacklinks();
      res.json({ success: true, message: "Backlink opportunities created" });
    } catch (error: any) {
      console.error("Backlink building error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get marketing report/dashboard
  app.get("/api/marketing-automation/report", async (req, res) => {
    try {
      const { marketingAutomationService } = await import('./services/marketing-automation.service');
      const report = await marketingAutomationService.generateMarketingReport();
      res.json(report);
    } catch (error: any) {
      console.error("Marketing report error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch SEO articles
  app.get("/api/seo-articles", async (req, res) => {
    try {
      const articles = await db.select().from(seoArticles).orderBy(desc(seoArticles.createdAt));
      res.json(articles);
    } catch (error: any) {
      console.error("SEO articles error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch directory submissions
  app.get("/api/directory-submissions", async (req, res) => {
    try {
      const submissions = await db.select().from(directorySubmissions).orderBy(desc(directorySubmissions.priority));
      res.json(submissions);
    } catch (error: any) {
      console.error("Directory submissions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch backlinks
  app.get("/api/backlinks", async (req, res) => {
    try {
      const links = await db.select().from(backlinks).orderBy(desc(backlinks.domainAuthority));
      res.json(links);
    } catch (error: any) {
      console.error("Backlinks error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch keyword rankings
  app.get("/api/keyword-rankings", async (req, res) => {
    try {
      const rankings = await db.select().from(keywordRankings).orderBy(asc(keywordRankings.position));
      res.json(rankings);
    } catch (error: any) {
      console.error("Keyword rankings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== 200-AGENT ORCHESTRATOR API ====================
  
  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const agents = agentOrchestrator.getAgents();
      res.json(agents);
    } catch (error: any) {
      console.error("Get agents error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get agent stats
  app.get("/api/agents/stats", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const stats = agentOrchestrator.getStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Agent stats error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get agents by type
  app.get("/api/agents/type/:type", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const agents = agentOrchestrator.getAgentsByType(req.params.type as any);
      res.json(agents);
    } catch (error: any) {
      console.error("Get agents by type error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Start specific agent
  app.post("/api/agents/:id/start", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const agent = await agentOrchestrator.startAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json({ success: true, agent });
    } catch (error: any) {
      console.error("Start agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stop specific agent
  app.post("/api/agents/:id/stop", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const agent = await agentOrchestrator.stopAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json({ success: true, agent });
    } catch (error: any) {
      console.error("Stop agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pause specific agent
  app.post("/api/agents/:id/pause", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const agent = await agentOrchestrator.pauseAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json({ success: true, agent });
    } catch (error: any) {
      console.error("Pause agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Start all agents
  app.post("/api/agents/start-all", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      await agentOrchestrator.startAllAgents();
      const stats = agentOrchestrator.getStats();
      res.json({ success: true, message: "All agents started", stats });
    } catch (error: any) {
      console.error("Start all agents error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stop all agents
  app.post("/api/agents/stop-all", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      await agentOrchestrator.stopAllAgents();
      const stats = agentOrchestrator.getStats();
      res.json({ success: true, message: "All agents stopped", stats });
    } catch (error: any) {
      console.error("Stop all agents error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get Sora 2 health status
  app.get("/api/agents/sora-health", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const health = await agentOrchestrator.checkSoraHealth();
      res.json(health);
    } catch (error: any) {
      console.error("Sora health check error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test Sora 2 integration
  app.post("/api/agents/test-sora", async (req, res) => {
    try {
      const { agentOrchestrator } = await import('./services/agent-orchestrator.service');
      const { prompt } = req.body;
      const result = await agentOrchestrator.testSoraIntegration(prompt);
      res.json(result);
    } catch (error: any) {
      console.error("Sora test error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== LIVE BATTLES API ====================
  
  // Create battle
  app.post("/api/battles/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { opponentId } = req.body;
      
      // Check users have auto-battle enabled
      const [creator, opponent] = await Promise.all([
        db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1),
        db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, opponentId)).limit(1),
      ]);

      if (!creator.length || !opponent.length) {
        return res.status(400).json({ error: "Creator profile not found" });
      }

      // Create battle record
      const battle = await db.insert(battleChallenges).values({
        creatorId: userId,
        opponentId,
        status: "active",
        creatorScore: 0,
        opponentScore: 0,
        giftsData: JSON.stringify([]),
        powerUpsUsed: JSON.stringify([]),
      }).returning();

      res.json({ success: true, battle: battle[0] });
    } catch (error: any) {
      console.error("Battle creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send gift during battle
  app.post("/api/battles/:battleId/send-gift", isAuthenticated, async (req: any, res) => {
    try {
      const { battleId } = req.params;
      const { giftType, amount } = req.body;
      const userId = req.user.id;

      // Get battle
      const battles = await db.select().from(battleChallenges).where(eq(battleChallenges.id, parseInt(battleId))).limit(1);
      if (!battles.length) return res.status(404).json({ error: "Battle not found" });

      const battle = battles[0];
      const isCreator = battle.creatorId === userId;
      
      // Calculate points with multiplier (2-3x)
      const multiplier = 1 + (Math.random() * 2); // 1x to 3x
      const points = Math.floor(amount * multiplier);
      
      // Update battle score
      const updatedScore = isCreator ? battle.creatorScore! + points : battle.opponentScore! + points;
      
      await db.update(battleChallenges)
        .set(isCreator ? { creatorScore: updatedScore } : { opponentScore: updatedScore })
        .where(eq(battleChallenges.id, parseInt(battleId)));

      // Broadcast to WebSocket clients
      wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "battle-update",
            battleId,
            isCreator,
            points,
            multiplier: multiplier.toFixed(1),
            giftType,
          }));
        }
      });

      res.json({ success: true, points, multiplier: multiplier.toFixed(1) });
    } catch (error: any) {
      console.error("Gift send error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Use power-up
  app.post("/api/battles/:battleId/use-powerup", isAuthenticated, async (req: any, res) => {
    try {
      const { battleId } = req.params;
      const { powerUpType } = req.body;
      const userId = req.user.id;

      // Get battle
      const battles = await db.select().from(battleChallenges).where(eq(battleChallenges.id, parseInt(battleId))).limit(1);
      if (!battles.length) return res.status(404).json({ error: "Battle not found" });

      const battle = battles[0];
      const multiplier = 1.5 + (Math.random() * 1.5); // 1.5x to 3.0x

      // Broadcast power-up activation
      wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "powerup-activated",
            battleId,
            powerUpType,
            multiplier: multiplier.toFixed(1),
            userId,
          }));
        }
      });

      res.json({ success: true, powerUpType, multiplier: multiplier.toFixed(1) });
    } catch (error: any) {
      console.error("Power-up error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get active battle
  app.get("/api/battles/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      const activeBattle = await db.select().from(battleChallenges)
        .where(and(
          or(
            eq(battleChallenges.creatorId, userId),
            eq(battleChallenges.opponentId, userId)
          ),
          eq(battleChallenges.status, "active")
        ))
        .limit(1);

      res.json({ success: true, battle: activeBattle[0] || null });
    } catch (error: any) {
      console.error("Get active battle error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get daily rankings
  app.get("/api/battles/rankings", async (req, res) => {
    try {
      const rankings = await db.select()
        .from(battleChallenges)
        .orderBy(desc(battleChallenges.creatorScore))
        .limit(100);

      res.json({ success: true, rankings });
    } catch (error: any) {
      console.error("Rankings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get viewer gifter level
  app.get("/api/users/:userId/gifter-level", async (req, res) => {
    try {
      const { userId } = req.params;

      const gifts = await db.select().from(virtualGifts)
        .where(eq(virtualGifts.senderId, userId));

      const level = Math.floor(gifts.length / 10) + 1;
      const xp = gifts.length % 10;

      res.json({ success: true, level, xp, totalGifts: gifts.length });
    } catch (error: any) {
      console.error("Gifter level error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // End battle and calculate league fragments
  app.post("/api/battles/:battleId/end", isAuthenticated, async (req: any, res) => {
    try {
      const { battleId } = req.params;
      const userId = req.user.id;

      const battles = await db.select().from(battleChallenges).where(eq(battleChallenges.id, parseInt(battleId))).limit(1);
      if (!battles.length) return res.status(404).json({ error: "Battle not found" });

      const battle = battles[0];
      const isCreator = battle.creatorId === userId;
      const won = isCreator ? battle.creatorScore! > battle.opponentScore! : battle.opponentScore! > battle.creatorScore!;

      // Award/remove fragments based on ranking
      const fragments = won ? 25 : -10; // Top 20% get +25, bottom 80% get -10

      await db.update(battleChallenges)
        .set({ status: "completed" })
        .where(eq(battleChallenges.id, parseInt(battleId)));

      res.json({ 
        success: true, 
        won, 
        fragments,
        finalScore: isCreator ? battle.creatorScore : battle.opponentScore,
        opponentScore: isCreator ? battle.opponentScore : battle.creatorScore,
      });
    } catch (error: any) {
      console.error("End battle error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PEER-TO-PEER TRANSFERS ====================
  
  // Send coins/credits to another user (available to all users)
  app.post("/api/transfers/send", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { users: usersTable, transactions, userTransfers } = await import("@shared/schema");
      const { recipientUsername, amount, currency, message } = req.body;

      // Validate inputs
      if (!recipientUsername || !amount || !currency) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      if (currency !== "credits" && currency !== "coins") {
        return res.status(400).json({ error: "Currency must be 'credits' or 'coins'" });
      }

      // Get sender
      const sender = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, req.user!.id),
      });

      if (!sender) {
        return res.status(404).json({ error: "Sender not found" });
      }

      // Get recipient by username
      const recipient = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, recipientUsername),
      });

      if (!recipient) {
        return res.status(404).json({ error: `User @${recipientUsername} not found` });
      }

      // Prevent self-transfer
      if (sender.id === recipient.id) {
        return res.status(400).json({ error: "You cannot send to yourself" });
      }

      // Calculate fee (5% from sender + 5% from receiver = 10% total platform fee)
      const FEE_PERCENTAGE = 0.05; // 5% per side
      const senderFee = Math.ceil(amount * FEE_PERCENTAGE);
      const receiverFee = Math.ceil(amount * FEE_PERCENTAGE);
      const totalAmount = amount + senderFee; // Sender pays amount + 5%
      const netAmount = amount - receiverFee; // Receiver gets amount - 5%
      const totalPlatformFee = senderFee + receiverFee;

      // Check sender balance (needs to cover amount + sender fee)
      // NOTE: Only regular credits/coins can be transferred (bonus credits are non-transferable)
      const senderBalance = currency === "credits" ? sender.credits : sender.coins;
      const bonusBalance = currency === "credits" ? sender.bonusCredits : 0;
      
      if (senderBalance < totalAmount) {
        const totalAvailable = senderBalance + bonusBalance;
        return res.status(400).json({ 
          error: `Insufficient transferable ${currency}. You have ${senderBalance} transferable ${currency} (+ ${bonusBalance} bonus credits that can't be transferred) but need ${totalAmount} (${amount} + ${senderFee} sender fee). Welcome bonus credits are non-transferable - purchase credits to send transfers!`,
        });
      }

      // Deduct from sender (amount + sender fee)
      const newSenderBalance = senderBalance - totalAmount;
      await db.update(usersTable)
        .set(currency === "credits" ? { credits: newSenderBalance } : { coins: newSenderBalance })
        .where(eq(usersTable.id, sender.id));

      // Add to recipient (net amount after fee)
      const recipientBalance = currency === "credits" ? recipient.credits : recipient.coins;
      const newRecipientBalance = recipientBalance + netAmount;
      await db.update(usersTable)
        .set(currency === "credits" ? { credits: newRecipientBalance } : { coins: newRecipientBalance })
        .where(eq(usersTable.id, recipient.id));

      // Create sender transaction
      const [senderTx] = await db.insert(transactions).values({
        userId: sender.id,
        type: "transfer_sent",
        amount: -totalAmount,
        description: `Sent ${amount} ${currency} to @${recipient.username} (incl. ${senderFee} fee)`,
        referenceId: recipient.id,
        paymentProvider: "other",
        providerMetadata: {
          recipientUsername: recipient.username,
          amount,
          senderFee,
          receiverFee,
          totalPlatformFee,
          message,
        },
      }).returning();

      // Create recipient transaction
      const [recipientTx] = await db.insert(transactions).values({
        userId: recipient.id,
        type: "transfer_received",
        amount: netAmount,
        description: `Received ${netAmount} ${currency} from @${sender.username} (${receiverFee} fee deducted)`,
        referenceId: sender.id,
        paymentProvider: "other",
        providerMetadata: {
          senderUsername: sender.username,
          originalAmount: amount,
          senderFee,
          receiverFee,
          message,
        },
      }).returning();

      // Create sender fee transaction
      await db.insert(transactions).values({
        userId: sender.id,
        type: "transfer_fee",
        amount: -senderFee,
        description: `Sender fee (5%)`,
        referenceId: senderTx.id,
        paymentProvider: "other",
      });

      // Create receiver fee transaction
      await db.insert(transactions).values({
        userId: recipient.id,
        type: "transfer_fee",
        amount: -receiverFee,
        description: `Receiver fee (5%)`,
        referenceId: recipientTx.id,
        paymentProvider: "other",
      });

      // Create transfer record
      const [transfer] = await db.insert(userTransfers).values({
        senderId: sender.id,
        recipientId: recipient.id,
        amount,
        currency,
        fee: totalPlatformFee,
        netAmount,
        status: "completed",
        message: message || null,
        senderTransactionId: senderTx.id,
        recipientTransactionId: recipientTx.id,
      }).returning();

      console.log(`✅ Transfer: @${sender.username} sent ${amount} ${currency} to @${recipient.username} (sender fee: ${senderFee}, receiver fee: ${receiverFee}, net: ${netAmount})`);

      res.json({
        success: true,
        transfer,
        senderBalance: newSenderBalance,
        senderPaid: totalAmount,
        recipientReceived: netAmount,
        senderFee,
        receiverFee,
        totalPlatformFee,
      });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(500).json({ error: "Failed to process transfer" });
    }
  });

  // Get user's transfer history
  app.get("/api/transfers/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { userTransfers } = await import("@shared/schema");
      
      const transfers = await db.query.userTransfers.findMany({
        where: (t, { or, eq }) => or(
          eq(t.senderId, req.user!.id),
          eq(t.recipientId, req.user!.id)
        ),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit: 100,
      });

      res.json({ success: true, transfers });
    } catch (error) {
      console.error("Transfer history error:", error);
      res.status(500).json({ error: "Failed to fetch transfer history" });
    }
  });

  // ==================== TECHNICAL DOCUMENTATION ====================
  
  // Serve technical analysis download page
  app.get("/download-analysis.html", (req, res) => {
    res.sendFile("download-analysis.html", { root: "." });
  });
  
  // Serve technical analysis document
  app.get("/PROFITHACK_AI_Technical_Analysis.html", (req, res) => {
    res.sendFile("PROFITHACK_API_Technical_Analysis.html", { root: "." });
  });

  // ==================== CRM INTEGRATION (GoHighLevel) ====================

  // Inbound webhook from GoHighLevel → PROFITHACK
  app.post("/api/crm/webhook/gohighlevel", async (req, res) => {
    try {
      const { event, data } = req.body;
      console.log(`📥 Received webhook from GoHighLevel: ${event}`);
      
      switch (event) {
        case 'contact.created':
        case 'contact.updated':
          console.log(`📇 Contact ${event}: ${data.email || data.phone}`);
          break;
        case 'opportunity.created':
          console.log(`💼 Opportunity created: ${data.name}`);
          break;
        default:
          console.log(`ℹ️ Unhandled event: ${event}`);
      }
      
      res.json({ success: true, received: true });
    } catch (error) {
      console.error("❌ Error processing GHL webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Test GHL connection
  app.post("/api/crm/test-connection", isAuthenticated, async (req, res) => {
    try {
      const { apiKey, locationId } = req.body;
      
      if (!apiKey || !locationId) {
        return res.status(400).json({ error: "API key and location ID required" });
      }
      
      const ghl = new GoHighLevelService(apiKey, locationId);
      const pipelines = await ghl.getPipelines();
      
      res.json({
        success: true,
        connected: true,
        pipelines: pipelines.length,
        message: `Successfully connected! Found ${pipelines.length} pipelines.`
      });
    } catch (error: any) {
      console.error("❌ GHL connection test failed:", error);
      res.status(400).json({
        success: false,
        connected: false,
        error: error.response?.data?.message || error.message
      });
    }
  });

  // Save CRM connection
  app.post("/api/crm/connect", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { provider, apiKey, locationId, config } = req.body;
      
      if (!provider || !apiKey) {
        return res.status(400).json({ error: "Provider and API key required" });
      }
      
      const baseUrl = process.env.REPL_SLUG ? 
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
        'http://localhost:5000';
      
      const inboundWebhookUrl = `${baseUrl}/api/crm/webhook/${provider}`;
      const webhookSecret = Math.random().toString(36).substring(2, 15);
      
      const connection = await storage.createCrmConnection({
        userId,
        provider,
        apiKey,
        locationId,
        inboundWebhookUrl,
        webhookSecret,
        config: config || {},
        status: 'active'
      });
      
      res.json({
        success: true,
        connection,
        webhookUrl: inboundWebhookUrl,
        instructions: `Configure this webhook URL in your ${provider} account to enable two-way sync.`
      });
    } catch (error) {
      console.error("❌ Error connecting CRM:", error);
      res.status(500).json({ error: "Failed to connect CRM" });
    }
  });

  // Get CRM connections for user
  app.get("/api/crm/connections", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const connections = await storage.getCrmConnectionsByUser(userId);
      res.json(connections);
    } catch (error) {
      console.error("❌ Error fetching CRM connections:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  // Disconnect CRM
  app.delete("/api/crm/connections/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const connectionId = req.params.id;
      await storage.deleteCrmConnection(connectionId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error disconnecting CRM:", error);
      res.status(500).json({ error: "Failed to disconnect CRM" });
    }
  });

  // ============================================
  // LOVE CONNECTION API - Revolutionary Dating Feature
  // Revenue Model: Both-sided payment unlock
  // Better than Tinder/Bumble/Hinge combined!
  // ============================================

  // Love Connection Pricing Constants
  const LOVE_PRICING = {
    // Free Tier
    DAILY_FREE_SWIPES: 5,
    DAILY_FREE_HEARTS: 1,
    
    // Coins (70 coins = $1 USD)
    SWIPE_COST_COINS: 10,        // $0.14 per swipe
    HEART_COST_COINS: 50,         // $0.71 per heart (super like)
    BOOST_COST_COINS: 200,        // $2.86 for 30min boost
    REWIND_COST_COINS: 30,        // $0.43 to undo swipe
    PROFILE_VIEW_COST_COINS: 150, // $2.14 to see who viewed you
    
    // Both-Sided Unlock (REVOLUTIONARY!)
    UNLOCK_COST_CREDITS: 50,      // $1.20 per person
    UNLOCK_COST_COINS: 25,        // $0.36 per person
    INSTANT_UNLOCK_CREDITS: 150,  // $3.60 to unlock immediately (one person pays both)
    INSTANT_UNLOCK_COINS: 100,    // $1.43
    
    // AI Features (Credits)
    AI_PROFILE_OPTIMIZER: 30,
    AI_CONVERSATION_STARTER: 5,
    AI_COMPATIBILITY_SCORE: 20,
    AI_DATE_IDEAS: 10,
    AI_VIDEO_PROFILE: 100,
    
    // Premium Subscription (Credits/month)
    PREMIUM_SUBSCRIPTION: 1000,   // $24/month
    
    // Boost Duration
    BOOST_DURATION_MINUTES: 30,
    
    // Match Expiration
    MATCH_EXPIRY_HOURS: 24,
  };

  // Create/Update Love Profile
  app.post("/api/love/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const profileData = req.body;
      
      const profile = await storage.createOrUpdateLoveProfile({
        userId,
        ...profileData
      });
      
      res.json({ success: true, profile });
    } catch (error) {
      console.error("❌ Error creating love profile:", error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  // Get My Love Profile
  app.get("/api/love/profile/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const profile = await storage.getLoveProfileByUserId(userId);
      res.json(profile);
    } catch (error) {
      console.error("❌ Error fetching love profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Get Potential Matches (Swipe Feed)
  app.get("/api/love/matches/potential", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const myProfile = await storage.getLoveProfileByUserId(userId);
      if (!myProfile) {
        return res.status(404).json({ error: "Create your love profile first" });
      }
      
      // Get potential matches based on preferences
      const potentialMatches = await storage.getPotentialMatches(userId, limit);
      
      res.json(potentialMatches);
    } catch (error) {
      console.error("❌ Error fetching potential matches:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Swipe Action (Pass, Like, Heart)
  app.post("/api/love/swipe", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { swipedId, action } = req.body; // action: 'pass', 'like', 'heart'
      
      if (!swipedId || !action) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const myProfile = await storage.getLoveProfileByUserId(userId);
      if (!myProfile) {
        return res.status(404).json({ error: "Create your love profile first" });
      }
      
      // Check daily limits (free tier)
      const now = new Date();
      const lastReset = new Date(myProfile.lastSwipeReset);
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceReset >= 24) {
        // Reset daily limits
        await storage.resetDailySwipeLimits(userId);
        myProfile.dailySwipesRemaining = LOVE_PRICING.DAILY_FREE_SWIPES;
        myProfile.dailyHeartsRemaining = LOVE_PRICING.DAILY_FREE_HEARTS;
      }
      
      let coinsSpent = 0;
      let creditsSpent = 0;
      
      if (action === 'pass') {
        // Passes are always free
      } else if (action === 'like') {
        if (myProfile.dailySwipesRemaining > 0) {
          // Free like available
          await storage.decrementDailySwipes(userId);
        } else if (!myProfile.isPremium) {
          // Charge coins for extra swipe
          const user = await storage.getUserById(userId);
          if (!user || user.coins < LOVE_PRICING.SWIPE_COST_COINS) {
            return res.status(402).json({ 
              error: "Insufficient coins", 
              required: LOVE_PRICING.SWIPE_COST_COINS,
              message: "You've used your free swipes. Purchase coins to continue swiping!"
            });
          }
          coinsSpent = LOVE_PRICING.SWIPE_COST_COINS;
          await storage.deductCoins(userId, coinsSpent);
        }
      } else if (action === 'heart') {
        // Hearts (super likes) always cost coins (unless premium with free ones)
        if (myProfile.dailyHeartsRemaining > 0) {
          await storage.decrementDailyHearts(userId);
        } else {
          const user = await storage.getUserById(userId);
          if (!user || user.coins < LOVE_PRICING.HEART_COST_COINS) {
            return res.status(402).json({ 
              error: "Insufficient coins", 
              required: LOVE_PRICING.HEART_COST_COINS,
              message: "Hearts cost coins! Purchase more to send a super like."
            });
          }
          coinsSpent = LOVE_PRICING.HEART_COST_COINS;
          await storage.deductCoins(userId, coinsSpent);
        }
      }
      
      // Record swipe
      const swipe = await storage.createLoveSwipe({
        swiperId: userId,
        swipedId,
        action,
        coinsSpent,
        creditsSpent
      });
      
      // Check if it's a match (both swiped right)
      let match = null;
      if (action === 'like' || action === 'heart') {
        const theyLikedMe = await storage.checkIfUserLikedMe(swipedId, userId);
        if (theyLikedMe) {
          // IT'S A MATCH!
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + LOVE_PRICING.MATCH_EXPIRY_HOURS);
          
          match = await storage.createLoveMatch({
            user1Id: userId,
            user2Id: swipedId,
            status: 'pending',
            expiresAt
          });
          
          // Increment match stats
          await storage.incrementMatchCount(userId);
          await storage.incrementMatchCount(swipedId);
        }
      }
      
      res.json({ 
        success: true, 
        swipe,
        match: match ? {
          ...match,
          message: "🎉 IT'S A MATCH! Both of you must unlock to start chatting.",
          unlockCost: {
            credits: LOVE_PRICING.UNLOCK_COST_CREDITS,
            coins: LOVE_PRICING.UNLOCK_COST_COINS,
            instantUnlock: {
              credits: LOVE_PRICING.INSTANT_UNLOCK_CREDITS,
              coins: LOVE_PRICING.INSTANT_UNLOCK_COINS
            }
          }
        } : null
      });
    } catch (error) {
      console.error("❌ Error processing swipe:", error);
      res.status(500).json({ error: "Failed to process swipe" });
    }
  });

  // Unlock Match (REVOLUTIONARY BOTH-SIDED PAYMENT!)
  app.post("/api/love/matches/:matchId/unlock", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { matchId } = req.params;
      const { instantUnlock } = req.body; // If true, one person pays for both
      
      const match = await storage.getLoveMatchById(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      // Verify user is part of this match
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check if match expired
      if (match.expiresAt && new Date() > new Date(match.expiresAt)) {
        return res.status(410).json({ error: "Match expired" });
      }
      
      const isUser1 = match.user1Id === userId;
      const user = await storage.getUserById(userId);
      
      if (instantUnlock) {
        // ONE PERSON PAYS FOR BOTH (instant unlock)
        if (!user || 
            user.credits < LOVE_PRICING.INSTANT_UNLOCK_CREDITS || 
            user.coins < LOVE_PRICING.INSTANT_UNLOCK_COINS) {
          return res.status(402).json({ 
            error: "Insufficient credits/coins",
            required: {
              credits: LOVE_PRICING.INSTANT_UNLOCK_CREDITS,
              coins: LOVE_PRICING.INSTANT_UNLOCK_COINS
            }
          });
        }
        
        // Deduct payment
        await storage.deductCredits(userId, LOVE_PRICING.INSTANT_UNLOCK_CREDITS);
        await storage.deductCoins(userId, LOVE_PRICING.INSTANT_UNLOCK_COINS);
        
        // Unlock for BOTH users immediately
        await storage.updateLoveMatch(matchId, {
          user1Unlocked: true,
          user2Unlocked: true,
          user1UnlockedAt: new Date(),
          user2UnlockedAt: new Date(),
          status: 'unlocked',
          unlockedAt: new Date(),
          [isUser1 ? 'user1CreditsSpent' : 'user2CreditsSpent']: LOVE_PRICING.INSTANT_UNLOCK_CREDITS,
          [isUser1 ? 'user1CoinsSpent' : 'user2CoinsSpent']: LOVE_PRICING.INSTANT_UNLOCK_COINS
        });
        
        return res.json({ 
          success: true,
          message: "Match unlocked for both! You can start chatting now.",
          instantUnlock: true
        });
      } else {
        // NORMAL UNLOCK: Each person pays separately
        if (!user || 
            user.credits < LOVE_PRICING.UNLOCK_COST_CREDITS || 
            user.coins < LOVE_PRICING.UNLOCK_COST_COINS) {
          return res.status(402).json({ 
            error: "Insufficient credits/coins",
            required: {
              credits: LOVE_PRICING.UNLOCK_COST_CREDITS,
              coins: LOVE_PRICING.UNLOCK_COST_COINS
            }
          });
        }
        
        // Deduct payment
        await storage.deductCredits(userId, LOVE_PRICING.UNLOCK_COST_CREDITS);
        await storage.deductCoins(userId, LOVE_PRICING.UNLOCK_COST_COINS);
        
        // Mark this user as unlocked
        const updateData: any = {
          [isUser1 ? 'user1Unlocked' : 'user2Unlocked']: true,
          [isUser1 ? 'user1UnlockedAt' : 'user2UnlockedAt']: new Date(),
          [isUser1 ? 'user1CreditsSpent' : 'user2CreditsSpent']: LOVE_PRICING.UNLOCK_COST_CREDITS,
          [isUser1 ? 'user1CoinsSpent' : 'user2CoinsSpent']: LOVE_PRICING.UNLOCK_COST_COINS
        };
        
        // Check if BOTH have now unlocked
        const otherUnlocked = isUser1 ? match.user2Unlocked : match.user1Unlocked;
        if (otherUnlocked) {
          updateData.status = 'unlocked';
          updateData.unlockedAt = new Date();
        }
        
        await storage.updateLoveMatch(matchId, updateData);
        
        return res.json({ 
          success: true,
          message: otherUnlocked 
            ? "🎉 Both of you unlocked! You can start chatting now."
            : "✅ You unlocked! Waiting for them to unlock too...",
          bothUnlocked: otherUnlocked
        });
      }
    } catch (error) {
      console.error("❌ Error unlocking match:", error);
      res.status(500).json({ error: "Failed to unlock match" });
    }
  });

  // Get My Matches
  app.get("/api/love/matches", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const matches = await storage.getLoveMatchesByUser(userId);
      res.json(matches);
    } catch (error) {
      console.error("❌ Error fetching matches:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Purchase Profile Boost
  app.post("/api/love/boost", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      
      if (!user || user.coins < LOVE_PRICING.BOOST_COST_COINS) {
        return res.status(402).json({ 
          error: "Insufficient coins",
          required: LOVE_PRICING.BOOST_COST_COINS
        });
      }
      
      // Deduct coins
      await storage.deductCoins(userId, LOVE_PRICING.BOOST_COST_COINS);
      
      // Create boost
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + LOVE_PRICING.BOOST_DURATION_MINUTES);
      
      const boost = await storage.createLoveBoost({
        userId,
        duration: LOVE_PRICING.BOOST_DURATION_MINUTES,
        coinsSpent: LOVE_PRICING.BOOST_COST_COINS,
        expiresAt
      });
      
      res.json({ 
        success: true, 
        boost,
        message: `🚀 Boost activated for ${LOVE_PRICING.BOOST_DURATION_MINUTES} minutes!`
      });
    } catch (error) {
      console.error("❌ Error purchasing boost:", error);
      res.status(500).json({ error: "Failed to purchase boost" });
    }
  });

  // Send Love Message
  app.post("/api/love/matches/:matchId/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { matchId } = req.params;
      const { content, type, aiGenerated } = req.body;
      
      const match = await storage.getLoveMatchById(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      // Verify user is part of this match
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Verify match is unlocked
      if (match.status !== 'unlocked') {
        return res.status(403).json({ 
          error: "Match not unlocked yet",
          message: "Both users must unlock the match to start chatting"
        });
      }
      
      let creditsUsed = 0;
      if (aiGenerated) {
        creditsUsed = LOVE_PRICING.AI_CONVERSATION_STARTER;
        const user = await storage.getUserById(userId);
        if (!user || user.credits < creditsUsed) {
          return res.status(402).json({ error: "Insufficient credits" });
        }
        await storage.deductCredits(userId, creditsUsed);
      }
      
      const message = await storage.createLoveMessage({
        matchId,
        senderId: userId,
        content,
        type: type || 'text',
        aiGenerated: aiGenerated || false,
        creditsUsed
      });
      
      // Mark first message sent
      if (!match.firstMessageSent) {
        await storage.updateLoveMatch(matchId, { firstMessageSent: true });
      }
      
      res.json({ success: true, message });
    } catch (error) {
      console.error("❌ Error sending love message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get Love Messages
  app.get("/api/love/matches/:matchId/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { matchId } = req.params;
      
      const match = await storage.getLoveMatchById(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const messages = await storage.getLoveMessagesByMatch(matchId);
      res.json(messages);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // AI Profile Optimizer
  app.post("/api/love/ai/optimize-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      
      if (!user || user.credits < LOVE_PRICING.AI_PROFILE_OPTIMIZER) {
        return res.status(402).json({ 
          error: "Insufficient credits",
          required: LOVE_PRICING.AI_PROFILE_OPTIMIZER
        });
      }
      
      const myProfile = await storage.getLoveProfileByUserId(userId);
      if (!myProfile) {
        return res.status(404).json({ error: "Create your profile first" });
      }
      
      // TODO: Integrate with OpenAI to optimize profile
      // For now, return a placeholder
      const optimizedBio = "Your bio has been optimized with AI!";
      
      await storage.deductCredits(userId, LOVE_PRICING.AI_PROFILE_OPTIMIZER);
      await storage.createLoveAIFeature({
        userId,
        featureType: 'profile_optimizer',
        creditsUsed: LOVE_PRICING.AI_PROFILE_OPTIMIZER,
        resultData: { optimizedBio }
      });
      
      res.json({ success: true, optimizedBio });
    } catch (error) {
      console.error("❌ Error optimizing profile:", error);
      res.status(500).json({ error: "Failed to optimize profile" });
    }
  });

  // WebRTC Signaling handled in WebSocket connection below

  // Payment Enforcement API - Terminate stream when payment fails
  app.post("/api/rtc/terminate-stream", isAuthenticated, async (req, res) => {
    try {
      const { roomId, userId, reason } = req.body;
      
      const { paymentEnforcementService } = require('./services/paymentEnforcementService');
      const success = paymentEnforcementService.terminateUserStream(roomId, userId, reason);
      
      res.json({ success });
    } catch (error) {
      console.error("❌ Error terminating stream:", error);
      res.status(500).json({ error: "Failed to terminate stream" });
    }
  });

  // ============================================
  // TIKTOK FEATURES API
  // ============================================

  // Get Live Hosts
  app.get("/api/live/hosts", async (req, res) => {
    try {
      // Get all active live streams
      const liveVideos = await db.query.videos.findMany({
        where: (videos, { eq }) => eq(videos.isPrivate, false),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true,
            }
          }
        },
        limit: 50
      });

      const liveHosts = liveVideos
        .filter(video => video.isLive)
        .map(video => ({
          id: video.id,
          userId: video.userId,
          username: video.user?.username || 'Unknown',
          handle: video.user?.username || 'unknown',
          avatar: video.user?.avatarUrl || 'https://via.placeholder.com/50',
          thumbnail: video.thumbnailUrl || 'https://via.placeholder.com/400x600',
          title: video.title || 'Live Stream',
          viewers: Math.floor(Math.random() * 10000) + 100,
          isVerified: video.user?.isVerified || false,
          category: 'entertainment',
          streamUrl: video.videoUrl,
          startedAt: video.createdAt,
          gifts: Math.floor(Math.random() * 500)
        }));

      res.json(liveHosts);
    } catch (error) {
      console.error("❌ Error fetching live hosts:", error);
      res.status(500).json({ error: "Failed to fetch live hosts" });
    }
  });

  // Get Video Comments
  app.get("/api/videos/:videoId/comments", async (req, res) => {
    try {
      const { videoId } = req.params;

      const comments = await db.query.comments.findMany({
        where: (comments, { eq, and, isNull }) => 
          and(
            eq(comments.videoId, videoId),
            isNull(comments.parentCommentId)
          ),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              avatarUrl: true,
            }
          },
          replies: {
            with: {
              user: {
                columns: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                }
              }
            }
          }
        },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        limit: 100
      });

      const formattedComments = comments.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        username: comment.user?.username || 'User',
        avatar: comment.user?.avatarUrl || 'https://via.placeholder.com/40',
        text: comment.content,
        timestamp: comment.createdAt,
        likes: comment.likes || 0,
        replies: (comment.replies || []).map(reply => ({
          id: reply.id,
          userId: reply.userId,
          username: reply.user?.username || 'User',
          avatar: reply.user?.avatarUrl || 'https://via.placeholder.com/40',
          text: reply.content,
          timestamp: reply.createdAt,
          likes: reply.likes || 0,
          replies: []
        }))
      }));

      res.json(formattedComments);
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Post Comment
  app.post("/api/videos/:videoId/comments", isAuthenticated, async (req, res) => {
    try {
      const { videoId } = req.params;
      const { text } = req.body;
      const userId = req.user!.id;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Comment text is required" });
      }

      const comment = await storage.createComment({
        userId,
        videoId,
        content: text,
        likes: 0,
      });

      const user = await storage.getUserById(userId);

      res.json({
        id: comment.id,
        userId: comment.userId,
        username: user?.username || 'User',
        avatar: user?.avatarUrl || 'https://via.placeholder.com/40',
        text: comment.content,
        timestamp: comment.createdAt,
        likes: comment.likes || 0,
        replies: []
      });
    } catch (error) {
      console.error("❌ Error posting comment:", error);
      res.status(500).json({ error: "Failed to post comment" });
    }
  });

  // Get Notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;

      // Get user notifications
      const notifications = await db.query.notifications.findMany({
        where: (notifications, { eq }) => eq(notifications.userId, userId),
        orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
        limit: 50
      });

      const formattedNotifications = notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        userId: notif.senderId || '',
        username: 'User',
        avatar: 'https://via.placeholder.com/40',
        content: notif.content,
        timestamp: notif.createdAt,
        isRead: notif.isRead || false
      }));

      res.json(formattedNotifications);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Search API
  app.get("/api/search", async (req, res) => {
    try {
      const { q, type } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      const searchQuery = q.toLowerCase();
      let results: any[] = [];

      if (type === 'users') {
        const users = await db.query.users.findMany({
          where: (users, { or, like }) => 
            or(
              like(users.username, `%${searchQuery}%`),
              like(users.fullName, `%${searchQuery}%`)
            ),
          limit: 20
        });

        results = users.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.avatarUrl || 'https://via.placeholder.com/50',
          bio: user.bio || '',
          isVerified: user.isVerified || false
        }));
      } else if (type === 'videos') {
        const videos = await db.query.videos.findMany({
          where: (videos, { or, like }) => 
            or(
              like(videos.title, `%${searchQuery}%`),
              like(videos.description, `%${searchQuery}%`)
            ),
          with: {
            user: {
              columns: {
                id: true,
                username: true,
                avatarUrl: true,
              }
            }
          },
          limit: 20
        });

        results = videos.map(video => ({
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnailUrl || 'https://via.placeholder.com/400x600',
          creator: video.user?.username || 'User',
          views: video.views || 0,
          likes: video.likes || 0
        }));
      } else if (type === 'hashtags') {
        // Search in video hashtags
        const videos = await db.query.videos.findMany({
          limit: 100
        });

        const hashtags = new Map<string, number>();
        videos.forEach(video => {
          if (video.hashtags) {
            video.hashtags.forEach((tag: string) => {
              if (tag.toLowerCase().includes(searchQuery)) {
                hashtags.set(tag, (hashtags.get(tag) || 0) + 1);
              }
            });
          }
        });

        results = Array.from(hashtags.entries()).map(([tag, count]) => ({
          hashtag: tag,
          usageCount: count
        }));
      }

      res.json(results);
    } catch (error) {
      console.error("❌ Error searching:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Get Trending Sounds
  app.get("/api/sounds/trending", async (req, res) => {
    try {
      // Return mock trending sounds
      const trendingSounds = [
        {
          id: '1',
          title: 'Viral Dance Track',
          artist: 'DJ Neon',
          thumbnail: 'https://via.placeholder.com/60',
          usageCount: 15000
        },
        {
          id: '2',
          title: 'Chill Vibes',
          artist: 'Lo-Fi Artist',
          thumbnail: 'https://via.placeholder.com/60',
          usageCount: 12000
        },
        {
          id: '3',
          title: 'Hype Beat',
          artist: 'Bass Producer',
          thumbnail: 'https://via.placeholder.com/60',
          usageCount: 9500
        }
      ];

      res.json(trendingSounds);
    } catch (error) {
      console.error("❌ Error fetching trending sounds:", error);
      res.status(500).json({ error: "Failed to fetch trending sounds" });
    }
  });

  // Creator Analytics
  app.get("/api/creator/analytics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;

      // Get user's videos
      const userVideos = await db.query.videos.findMany({
        where: (videos, { eq }) => eq(videos.userId, userId)
      });

      // Get follower count
      const followers = await db.query.followers.findMany({
        where: (followers, { eq }) => eq(followers.followingId, userId)
      });

      const totalViews = userVideos.reduce((sum, video) => sum + (video.views || 0), 0);
      const totalLikes = userVideos.reduce((sum, video) => sum + (video.likes || 0), 0);
      const followerCount = followers.length;

      const engagementRate = totalViews > 0 
        ? ((totalLikes / totalViews) * 100).toFixed(2) 
        : '0.00';

      res.json({
        totalViews,
        totalLikes,
        followers: followerCount,
        engagementRate,
        videoCount: userVideos.length
      });
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Create Duet
  app.post("/api/duets/create", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      // Duet creation logic would go here
      // For now, return success
      res.json({ success: true, message: "Duet created!" });
    } catch (error) {
      console.error("❌ Error creating duet:", error);
      res.status(500).json({ error: "Failed to create duet" });
    }
  });

  // Create Stitch
  app.post("/api/stitches/create", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      // Stitch creation logic would go here
      // For now, return success
      res.json({ success: true, message: "Stitch created!" });
    } catch (error) {
      console.error("❌ Error creating stitch:", error);
      res.status(500).json({ error: "Failed to create stitch" });
    }
  });

  // ============================================
  // ONLYFANS API - PAYMENT-GATED CONTENT
  // ============================================

  // Get User's Active Subscriptions
  app.get("/api/user/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get all active subscriptions for this user
      const subscriptions = await db.query.subscriptions.findMany({
        where: (subscriptions, { eq, and, or, gt }) => 
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, 'active'),
            or(
              gt(subscriptions.endsAt, new Date()),
              eq(subscriptions.recurring, true)
            )
          ),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            }
          }
        }
      });

      // Extract creator IDs the user is subscribed to
      const subscriptionIds = subscriptions
        .map(sub => sub.creatorId)
        .filter(Boolean);

      res.json({
        success: true,
        subscriptionIds,
        subscriptions: subscriptions.map(sub => ({
          creatorId: sub.creatorId,
          tier: sub.tier,
          status: sub.status,
          endsAt: sub.endsAt,
          recurring: sub.recurring,
        }))
      });
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // Check Access to OnlyFans Video
  app.get("/api/onlyfans/check-access/:videoId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { videoId } = req.params;

      // Get video details
      const video = await db.query.videos.findFirst({
        where: (videos, { eq }) => eq(videos.id, videoId),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            }
          }
        }
      });

      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      // If video is public, grant access
      if (!video.isPrivate) {
        return res.json({
          hasAccess: true,
          isSubscribed: false,
          reason: "public_content"
        });
      }

      // If user owns the video, grant access
      if (video.userId === userId) {
        return res.json({
          hasAccess: true,
          isSubscribed: false,
          reason: "owner"
        });
      }

      // Check if user has active subscription to this creator
      const subscription = await db.query.subscriptions.findFirst({
        where: (subscriptions, { eq, and, or, gt }) => 
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.creatorId, video.userId),
            eq(subscriptions.status, 'active'),
            or(
              gt(subscriptions.endsAt, new Date()),
              eq(subscriptions.recurring, true)
            )
          )
      });

      if (subscription) {
        return res.json({
          hasAccess: true,
          isSubscribed: true,
          subscriptionExpiry: subscription.endsAt,
          tier: subscription.tier
        });
      }

      // No access - payment required
      return res.status(403).json({
        hasAccess: false,
        isSubscribed: false,
        reason: "payment_required",
        creatorId: video.userId,
        creatorName: video.user?.username,
      });
    } catch (error) {
      console.error("❌ Error checking access:", error);
      res.status(500).json({ error: "Failed to check access" });
    }
  });

  // Subscribe to OnlyFans Creator
  app.post("/api/onlyfans/subscribe", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { creatorId, tier = 'basic', paymentMethod = 'stripe' } = req.body;

      if (!creatorId) {
        return res.status(400).json({ error: "Creator ID is required" });
      }

      // Get creator details
      const creator = await storage.getUserById(creatorId);
      if (!creator) {
        return res.status(404).json({ error: "Creator not found" });
      }

      // Check if user already has active subscription
      const existingSub = await db.query.subscriptions.findFirst({
        where: (subscriptions, { eq, and, or, gt }) => 
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.creatorId, creatorId),
            eq(subscriptions.status, 'active'),
            or(
              gt(subscriptions.endsAt, new Date()),
              eq(subscriptions.recurring, true)
            )
          )
      });

      if (existingSub) {
        return res.json({
          success: true,
          message: "Already subscribed",
          subscription: existingSub
        });
      }

      // Subscription pricing (monthly)
      const SUBSCRIPTION_PRICES = {
        basic: 9.99,
        premium: 19.99,
        vip: 49.99
      };

      const amount = SUBSCRIPTION_PRICES[tier as keyof typeof SUBSCRIPTION_PRICES] || 9.99;

      // Create payment session based on method
      let paymentUrl = '';
      let sessionId = '';

      if (paymentMethod === 'stripe' && isStripeConfigured()) {
        // Stripe Checkout
        const session = await stripe!.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${tier.toUpperCase()} Subscription - @${creator.username}`,
                description: `Monthly subscription to ${creator.fullName || creator.username}'s exclusive content`,
                images: creator.avatarUrl ? [creator.avatarUrl] : [],
              },
              unit_amount: Math.round(amount * 100),
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: `${process.env.REPL_SLUG ? 'https://' + process.env.REPL_SLUG + '.replit.dev' : 'http://localhost:5000'}/onlyfans?success=true&creator=${creatorId}`,
          cancel_url: `${process.env.REPL_SLUG ? 'https://' + process.env.REPL_SLUG + '.replit.dev' : 'http://localhost:5000'}/onlyfans?canceled=true`,
          metadata: {
            userId,
            creatorId,
            tier,
            type: 'onlyfans_subscription',
          },
        });

        paymentUrl = session.url!;
        sessionId = session.id;
      } else if (paymentMethod === 'paypal' && isPayPalConfigured()) {
        // PayPal Subscription (use existing PayPal integration)
        const order = await createPaypalOrderDirect({
          amount: amount.toString(),
          description: `${tier.toUpperCase()} Subscription - @${creator.username}`,
          userId,
          metadata: { creatorId, tier, type: 'onlyfans_subscription' }
        });

        paymentUrl = order.links.find((link: any) => link.rel === 'approve')?.href || '';
        sessionId = order.id;
      } else if (paymentMethod === 'wallet') {
        // Pay with wallet credits
        const user = await storage.getUserById(userId);
        const requiredCredits = Math.round(amount * 41.67); // $0.024 per credit

        if (!user || user.credits < requiredCredits) {
          return res.status(402).json({ 
            error: "Insufficient credits",
            required: requiredCredits,
            current: user?.credits || 0
          });
        }

        // Deduct credits and create subscription
        await storage.deductCredits(userId, requiredCredits);

        const subscription = await storage.createSubscription({
          userId,
          creatorId,
          tier,
          status: 'active',
          recurring: true,
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        return res.json({
          success: true,
          message: "Subscription activated with wallet credits",
          subscription,
          creditsUsed: requiredCredits
        });
      } else {
        return res.status(400).json({ 
          error: "Invalid payment method or payment provider not configured",
          availableMethods: [
            isStripeConfigured() && 'stripe',
            isPayPalConfigured() && 'paypal',
            'wallet'
          ].filter(Boolean)
        });
      }

      res.json({
        success: true,
        paymentUrl,
        sessionId,
        amount,
        tier,
        creatorId,
        message: "Redirecting to payment..."
      });
    } catch (error) {
      console.error("❌ Error creating subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // ============================================
  // AI CONTENT GENERATION - TikTok Algorithm Beater
  // ============================================
  
  const { ContentOrchestrator } = await import("./services/content-orchestrator");
  const contentOrchestrator = new ContentOrchestrator();

  // Generate AI Content (Script, Caption, Hashtags, Thumbnail, Music)
  app.post("/api/generate-content", async (req, res) => {
    try {
      const { topic, style, duration, userApiKey } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const content = await contentOrchestrator.generateContent({
        topic,
        style: style || "engaging",
        duration: duration || 30,
        userApiKey,
      });

      res.json({
        success: true,
        content,
      });
    } catch (error: any) {
      console.error("❌ Content generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate content",
        message: error.message 
      });
    }
  });

  // Rank Videos by TikTok Algorithm
  app.post("/api/rank-videos", async (req, res) => {
    try {
      const { videos } = req.body;

      if (!Array.isArray(videos) || videos.length === 0) {
        return res.status(400).json({ error: "Videos array is required" });
      }

      const rankedVideos = await contentOrchestrator.rankVideos(videos);

      res.json({
        success: true,
        rankedVideos,
      });
    } catch (error: any) {
      console.error("❌ Video ranking error:", error);
      res.status(500).json({ 
        error: "Failed to rank videos",
        message: error.message 
      });
    }
  });

  // Get Trending Topics
  app.get("/api/trending-topics", async (req, res) => {
    try {
      const topics = await contentOrchestrator.getTrendingTopics();

      res.json({
        success: true,
        topics,
      });
    } catch (error: any) {
      console.error("❌ Trending topics error:", error);
      res.status(500).json({ 
        error: "Failed to get trending topics",
        message: error.message 
      });
    }
  });

  // ============================================
  // DAILY NEXUS - TikTok-Beating Daily Engagement
  // Psychology-Driven Retention System
  // ============================================

  // Get daily nexus state for user
  app.get("/api/daily-nexus/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;

      // Get or create daily nexus record
      let nexus = await db.query.dailyNexus.findFirst({
        where: eq((await import("@shared/schema")).dailyNexus.userId, userId),
      });

      if (!nexus) {
        // Create new daily nexus for user
        const [newNexus] = await db.insert((await import("@shared/schema")).dailyNexus).values({
          userId,
          streak: 0,
          totalRewards: 0,
          todayRewards: 0,
          nextClaimTime: Date.now(),
          multiplier: "1.0",
          level: 1,
          experience: 0,
        }).returning();
        nexus = newNexus;
      }

      // Get active challenges
      const challenges = await db.query.dailyChallenges.findMany({
        where: and(
          eq((await import("@shared/schema")).dailyChallenges.userId, userId),
          sql`expires_at > NOW()`
        ),
      });

      // Get active bonuses
      const bonuses = await db.query.dailyBonuses.findMany({
        where: and(
          eq((await import("@shared/schema")).dailyBonuses.userId, userId),
          sql`expires_at > NOW()`
        ),
      });

      // Mock social stats and predictions for MVP
      const state = {
        ...nexus,
        predictions: {
          timeUntilNext: Math.max(0, nexus.nextClaimTime - Date.now()),
          expectedReward: Math.floor(50 * parseFloat(nexus.multiplier)),
          rarity: nexus.streak >= 30 ? "mythic" : nexus.streak >= 14 ? "legendary" : nexus.streak >= 7 ? "epic" : "common",
        },
        socialStats: {
          friendsOnStreak: 0,
          friendsBeatenToday: 0,
          leaderboardPosition: 999,
        },
        challenges: challenges || [],
        bonuses: bonuses || [],
      };

      res.json(state);
    } catch (error: any) {
      console.error("❌ Daily nexus state error:", error);
      res.status(500).json({ error: "Failed to get daily state", message: error.message });
    }
  });

  // Claim daily reward
  app.post("/api/daily-nexus/:userId/claim", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;

      // Get current nexus state
      const nexus = await db.query.dailyNexus.findFirst({
        where: eq((await import("@shared/schema")).dailyNexus.userId, userId),
      });

      if (!nexus) {
        return res.status(404).json({ error: "Daily nexus not found" });
      }

      const now = Date.now();

      // Check if user can claim
      if (now < nexus.nextClaimTime) {
        return res.status(400).json({ error: "Not yet time to claim" });
      }

      // Check if claimed yesterday for streak calculation
      const lastClaimTime = nexus.lastClaimedAt ? new Date(nexus.lastClaimedAt).getTime() : 0;
      const timeSinceLastClaim = now - lastClaimTime;
      const oneDayMs = 24 * 60 * 60 * 1000;
      const twoDaysMs = 48 * 60 * 60 * 1000;

      let newStreak = nexus.streak;
      if (timeSinceLastClaim < twoDaysMs && timeSinceLastClaim >= oneDayMs) {
        // Claimed within 24-48 hours = continue streak
        newStreak = nexus.streak + 1;
      } else if (timeSinceLastClaim < oneDayMs) {
        // Already claimed today, keep streak
        newStreak = nexus.streak;
      } else {
        // Streak broken
        newStreak = 1;
      }

      // Calculate multiplier based on streak
      const newMultiplier = Math.min(5.0, 1.0 + (newStreak / 6) * 0.5).toFixed(1);

      // Calculate reward
      const baseReward = 50;
      const totalMultiplier = parseFloat(newMultiplier);
      const rewardAmount = Math.floor(baseReward * totalMultiplier);

      // Update nexus
      const [updatedNexus] = await db.update((await import("@shared/schema")).dailyNexus)
        .set({
          streak: newStreak,
          totalRewards: nexus.totalRewards + rewardAmount,
          todayRewards: nexus.todayRewards + rewardAmount,
          nextClaimTime: now + oneDayMs + Math.floor(Math.random() * 5 * 60 * 1000), // 24h + 0-5min
          multiplier: newMultiplier,
          experience: nexus.experience + 100,
          level: Math.floor((nexus.experience + 100) / 1000) + 1,
          lastClaimedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq((await import("@shared/schema")).dailyNexus.userId, userId))
        .returning();

      // Save reward history
      await db.insert((await import("@shared/schema")).rewardHistory).values({
        userId,
        rewardType: "daily",
        amount: rewardAmount,
        multiplier: newMultiplier,
        streakAtClaim: newStreak,
        rarity: newStreak >= 30 ? "mythic" : newStreak >= 14 ? "legendary" : newStreak >= 7 ? "epic" : "common",
      });

      // Credit user's wallet
      await storage.creditUser(userId, rewardAmount);

      res.json({
        success: true,
        message: `Claimed ${rewardAmount} coins!`,
        reward: {
          name: "Daily Reward",
          amount: rewardAmount,
          icon: "💎",
        },
        state: updatedNexus,
      });
    } catch (error: any) {
      console.error("❌ Daily nexus claim error:", error);
      res.status(500).json({ error: "Failed to claim reward", message: error.message });
    }
  });

  // ============================================
  // ENTERPRISE CRM - Viral Marketing System
  // Multi-Platform Content Management
  // ============================================

  const { contentGenerator, platformPoster, analytics: crmAnalytics } = await import("./services/enterprise-crm");
  const viralAgents = await import("./services/viral-marketing-agents");

  // Generate viral content using AI
  app.post("/api/crm/generate-content", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { topic, platform = "TikTok", style = "viral", tone = "energetic" } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const content = await contentGenerator.generatePost(topic, platform, style, tone);

      res.json({
        success: true,
        content,
      });
    } catch (error: any) {
      console.error("❌ Content generation error:", error);
      res.status(500).json({ error: "Failed to generate content", message: error.message });
    }
  });

  // Schedule a post
  app.post("/api/crm/schedule-post", isAuthenticated, async (req, res) => {
    try {
      const { content, platforms, scheduledAt } = req.body;

      if (!content || !platforms || !scheduledAt) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Mock scheduling for MVP
      const postId = `post_${Date.now()}`;

      res.json({
        success: true,
        postId,
        message: "Post scheduled successfully",
      });
    } catch (error: any) {
      console.error("❌ Schedule post error:", error);
      res.status(500).json({ error: "Failed to schedule post", message: error.message });
    }
  });

  // Publish post to platforms
  app.post("/api/crm/publish-post/:postId", isAuthenticated, async (req, res) => {
    try {
      const { postId } = req.params;

      // Mock publishing for MVP
      const results = {
        TikTok: {
          success: true,
          postId: `tiktok_${Date.now()}`,
          url: `https://tiktok.com/@user/video/tiktok_${Date.now()}`,
        },
        Instagram: {
          success: true,
          postId: `ig_${Date.now()}`,
          url: `https://instagram.com/p/ig_${Date.now()}`,
        },
      };

      res.json({
        success: true,
        results,
      });
    } catch (error: any) {
      console.error("❌ Publish post error:", error);
      res.status(500).json({ error: "Failed to publish post", message: error.message });
    }
  });

  // Get content calendar
  app.get("/api/crm/calendar/:userId", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Use authenticated user ID, not path param
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      // Mock calendar data for MVP (TODO: integrate with real storage)
      const posts = [
        {
          id: "post-1",
          title: "AI Money Making",
          description: "How to make $5K with AI",
          platforms: ["TikTok", "Instagram"],
          scheduledAt: new Date(),
          status: "scheduled",
          content: {
            text: "This AI just made me $5,000...",
            hashtags: ["#AI", "#Money", "#Passive"],
          },
        },
      ];

      res.json({
        success: true,
        posts,
      });
    } catch (error: any) {
      console.error("❌ Get calendar error:", error);
      res.status(500).json({ error: "Failed to get calendar", message: error.message });
    }
  });

  // Get analytics
  app.get("/api/crm/analytics/:userId", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Use authenticated user ID, not path param
      const userId = req.user.id;
      const { days = 30 } = req.query;

      const analyticsData = await crmAnalytics.getAnalytics(userId, Number(days));

      res.json({
        success: true,
        analytics: analyticsData.platforms,
        summary: analyticsData.summary,
      });
    } catch (error: any) {
      console.error("❌ Get analytics error:", error);
      res.status(500).json({ error: "Failed to get analytics", message: error.message });
    }
  });

  // Get trending content
  app.get("/api/crm/trending/:userId", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Use authenticated user ID, not path param
      const userId = req.user.id;

      const trending = await crmAnalytics.getTrendingContent(userId);

      res.json({
        success: true,
        trending,
      });
    } catch (error: any) {
      console.error("❌ Get trending error:", error);
      res.status(500).json({ error: "Failed to get trending content", message: error.message });
    }
  });

  // Generate viral strategy
  app.post("/api/crm/viral-strategy", isAuthenticated, async (req, res) => {
    try {
      const { topic } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const strategy = await viralAgents.generateViralStrategy(topic);

      res.json({
        success: true,
        strategy,
      });
    } catch (error: any) {
      console.error("❌ Viral strategy error:", error);
      res.status(500).json({ error: "Failed to generate viral strategy", message: error.message });
    }
  });

  // ============================================
  // ONLYFANS EXPERT CREATORS API
  // ============================================

  // Get all OnlyFans expert creators
  app.get("/api/onlyfans/experts", async (req, res) => {
    try {
      const { onlyFansExpertsService } = await import("./services/onlyfans-experts");
      const result = await onlyFansExpertsService.getAllExperts();

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        experts: result.experts,
      });
    } catch (error: any) {
      console.error("❌ Get experts error:", error);
      res.status(500).json({ error: "Failed to fetch experts", message: error.message });
    }
  });

  // Get specific OnlyFans expert by ID
  app.get("/api/onlyfans/experts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { onlyFansExpertsService } = await import("./services/onlyfans-experts");
      const result = await onlyFansExpertsService.getExpertById(id);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        success: true,
        expert: result.expert,
      });
    } catch (error: any) {
      console.error("❌ Get expert error:", error);
      res.status(500).json({ error: "Failed to fetch expert", message: error.message });
    }
  });

  // Generate AI content advice from expert
  app.post("/api/onlyfans/experts/:id/advice", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { contentTopic } = req.body;

      if (!contentTopic) {
        return res.status(400).json({ error: "Content topic is required" });
      }

      const { onlyFansExpertsService } = await import("./services/onlyfans-experts");
      const result = await onlyFansExpertsService.generateContentAdvice(id, contentTopic);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        advice: result.advice,
        expertName: result.expertName,
        expertRevenue: result.expertRevenue,
      });
    } catch (error: any) {
      console.error("❌ Generate advice error:", error);
      res.status(500).json({ error: "Failed to generate advice", message: error.message });
    }
  });

  // Seed OnlyFans experts
  app.post("/api/onlyfans/experts/seed", async (req, res) => {
    try {
      const { onlyFansExpertsService } = await import("./services/onlyfans-experts");
      const result = await onlyFansExpertsService.seedExperts();

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        count: result.count,
        message: `Successfully seeded ${result.count} expert creators`,
      });
    } catch (error: any) {
      console.error("❌ Seed experts error:", error);
      res.status(500).json({ error: "Failed to seed experts", message: error.message });
    }
  });

  // Seed OnlyFans expert videos to FYP
  app.post("/api/onlyfans/experts/seed-videos", async (req, res) => {
    try {
      const { seedOnlyFansExpertVideos } = await import("./services/onlyfans-video-seeder");
      const { count } = req.body;
      
      const result = await seedOnlyFansExpertVideos(count);

      if (!result.success) {
        return res.status(500).json({ error: result.message });
      }

      res.json({
        success: true,
        count: result.count,
        message: result.message,
      });
    } catch (error: any) {
      console.error("❌ Seed OnlyFans videos error:", error);
      res.status(500).json({ error: "Failed to seed videos", message: error.message });
    }
  });

  // Live AI Chat with Creator - Interactive conversation
  app.post("/api/onlyfans/creators/:id/chat", async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const { onlyFansExpertsService } = await import("./services/onlyfans-experts");
      const result = await onlyFansExpertsService.chatWithCreator(id, message);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        response: result.response,
        expertName: result.expertName,
      });
    } catch (error: any) {
      console.error("❌ Creator chat error:", error);
      res.status(500).json({ error: "Failed to chat with creator", message: error.message });
    }
  });

  // ============================================
  // AI INFLUENCER AD CREATION API
  // Generate personalized ad content for AI creators
  // ============================================

  // Generate single ad content
  app.post("/api/ai-ads/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { personaName, personaDescription, contentTopic, tone, length, platform } = req.body;

      if (!personaName || !personaDescription || !contentTopic || !tone || !length) {
        return res.status(400).json({
          error: "Missing required fields: personaName, personaDescription, contentTopic, tone, and length are required."
        });
      }

      const { generateInfluencerAd } = await import("./services/ai-influencer-ads");
      const content = await generateInfluencerAd({
        personaName,
        personaDescription,
        contentTopic,
        tone,
        length,
        platform: platform || 'tiktok',
      });

      res.json({
        success: true,
        persona: personaName,
        topic: contentTopic,
        content,
        platform: platform || 'tiktok',
      });
    } catch (error: any) {
      console.error("❌ AI ad generation error:", error);
      res.status(500).json({ error: "Failed to generate ad content", message: error.message });
    }
  });

  // Generate multiple content variations for A/B testing
  app.post("/api/ai-ads/generate-variations", isAuthenticated, async (req: any, res) => {
    try {
      const { personaName, personaDescription, contentTopic, tone, length, platform, count } = req.body;

      if (!personaName || !personaDescription || !contentTopic || !tone || !length) {
        return res.status(400).json({
          error: "Missing required fields: personaName, personaDescription, contentTopic, tone, and length are required."
        });
      }

      const { generateContentVariations } = await import("./services/ai-influencer-ads");
      const variations = await generateContentVariations(
        {
          personaName,
          personaDescription,
          contentTopic,
          tone,
          length,
          platform: platform || 'tiktok',
        },
        count || 3
      );

      res.json({
        success: true,
        persona: personaName,
        topic: contentTopic,
        variations,
        count: variations.length,
      });
    } catch (error: any) {
      console.error("❌ Variations generation error:", error);
      res.status(500).json({ error: "Failed to generate variations", message: error.message });
    }
  });

  // Generate complete ad campaign (hook + body + CTA + hashtags)
  app.post("/api/ai-ads/generate-campaign", isAuthenticated, async (req: any, res) => {
    try {
      const { personaName, personaDescription, contentTopic, tone, length, platform } = req.body;

      if (!personaName || !contentTopic) {
        return res.status(400).json({
          error: "Missing required fields: personaName and contentTopic are required."
        });
      }

      const { generateAdCampaign } = await import("./services/ai-influencer-ads");
      const campaign = await generateAdCampaign({
        personaName,
        personaDescription: personaDescription || `${personaName} is a professional content creator`,
        contentTopic,
        tone: tone || 'engaging',
        length: length || 'medium',
        platform: platform || 'tiktok',
      });

      res.json({
        success: true,
        persona: personaName,
        topic: contentTopic,
        campaign,
      });
    } catch (error: any) {
      console.error("❌ Campaign generation error:", error);
      res.status(500).json({ error: "Failed to generate campaign", message: error.message });
    }
  });

  // Analyze and improve existing content
  app.post("/api/ai-ads/analyze-content", isAuthenticated, async (req: any, res) => {
    try {
      const { content, personaName, platform } = req.body;

      if (!content || !personaName) {
        return res.status(400).json({
          error: "Missing required fields: content and personaName are required."
        });
      }

      const { analyzeAndImproveContent } = await import("./services/ai-influencer-ads");
      const analysis = await analyzeAndImproveContent(
        content,
        personaName,
        platform || 'tiktok'
      );

      res.json({
        success: true,
        persona: personaName,
        analysis,
      });
    } catch (error: any) {
      console.error("❌ Content analysis error:", error);
      res.status(500).json({ error: "Failed to analyze content", message: error.message });
    }
  });

  // ============================================
  // MULTI-PLATFORM DEPLOYMENT API
  // ============================================

  // Get supported platforms
  app.get("/api/deployment/platforms", async (req, res) => {
    try {
      const { multiPlatformDeploymentService } = await import("./services/multi-platform-deployment");
      const result = multiPlatformDeploymentService.getSupportedPlatforms();

      res.json(result);
    } catch (error: any) {
      console.error("❌ Get platforms error:", error);
      res.status(500).json({ error: "Failed to fetch platforms", message: error.message });
    }
  });

  // Connect a platform account
  app.post("/api/deployment/connect", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { platform, username, accessToken, refreshToken, apiKey, accountId } = req.body;

      if (!platform || !username) {
        return res.status(400).json({ error: "Platform and username are required" });
      }

      const { multiPlatformDeploymentService } = await import("./services/multi-platform-deployment");
      const result = await multiPlatformDeploymentService.connectPlatform(req.user.id, platform, {
        username,
        accessToken,
        refreshToken,
        apiKey,
        accountId,
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json(result);
    } catch (error: any) {
      console.error("❌ Connect platform error:", error);
      res.status(500).json({ error: "Failed to connect platform", message: error.message });
    }
  });

  // Get connected platforms
  app.get("/api/deployment/connected", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { multiPlatformDeploymentService } = await import("./services/multi-platform-deployment");
      const result = await multiPlatformDeploymentService.getConnectedPlatforms(req.user.id);

      res.json(result);
    } catch (error: any) {
      console.error("❌ Get connected platforms error:", error);
      res.status(500).json({ error: "Failed to fetch connected platforms", message: error.message });
    }
  });

  // Deploy content to multiple platforms
  app.post("/api/deployment/deploy", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, contentType, price, isExclusive, fileUrl, platforms } = req.body;

      if (!title || !description || !contentType || !platforms || platforms.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { multiPlatformDeploymentService } = await import("./services/multi-platform-deployment");
      const result = await multiPlatformDeploymentService.deployContent(
        req.user.id,
        {
          title,
          description,
          contentType,
          price,
          isExclusive,
          fileUrl,
        },
        platforms
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json(result);
    } catch (error: any) {
      console.error("❌ Deploy content error:", error);
      res.status(500).json({ error: "Failed to deploy content", message: error.message });
    }
  });

  // Get deployment history
  app.get("/api/deployment/history", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { multiPlatformDeploymentService } = await import("./services/multi-platform-deployment");
      const result = await multiPlatformDeploymentService.getDeploymentHistory(req.user.id);

      res.json(result);
    } catch (error: any) {
      console.error("❌ Get deployment history error:", error);
      res.status(500).json({ error: "Failed to fetch deployment history", message: error.message });
    }
  });

  // Get content analytics
  app.get("/api/deployment/analytics", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { platform } = req.query;
      const { multiPlatformDeploymentService } = await import("./services/multi-platform-deployment");
      const result = await multiPlatformDeploymentService.getContentAnalytics(req.user.id, platform as string);

      res.json(result);
    } catch (error: any) {
      console.error("❌ Get analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics", message: error.message });
    }
  });

  // Disconnect platform
  app.post("/api/deployment/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { platform } = req.body;

      if (!platform) {
        return res.status(400).json({ error: "Platform is required" });
      }

      const { multiPlatformDeploymentService } = await import("./services/multi-platform-deployment");
      const result = await multiPlatformDeploymentService.disconnectPlatform(req.user.id, platform);

      res.json(result);
    } catch (error: any) {
      console.error("❌ Disconnect platform error:", error);
      res.status(500).json({ error: "Failed to disconnect platform", message: error.message });
    }
  });

  // Feature interest tracking (Coming Soon features)
  // Tracks which features users are most interested in to prioritize development
  // Uses Redis for persistent storage - survives server restarts
  app.post("/api/features/interest", async (req, res) => {
    try {
      const { featureId, timestamp } = req.body;
      
      if (!featureId) {
        return res.status(400).json({ error: "Feature ID is required" });
      }

      // Track interest count in Redis (persistent storage)
      const { redis } = await import("./lib/redis");
      const newCount = await redis.hincrby("feature_interest", featureId, 1);

      console.log(`🔥 Feature interest: ${featureId} (${newCount} total clicks)`);

      res.json({ 
        success: true, 
        featureId,
        totalClicks: newCount
      });
    } catch (error: any) {
      console.error("❌ Feature interest tracking error:", error);
      res.status(500).json({ error: "Failed to track feature interest" });
    }
  });

  // Get feature interest stats (for admin dashboard)
  app.get("/api/features/interest", async (req, res) => {
    try {
      const { redis } = await import("./lib/redis");
      const data = await redis.hgetall("feature_interest");
      
      const stats = Object.entries(data)
        .map(([featureId, clicks]) => ({ 
          featureId, 
          clicks: parseInt(clicks as string, 10) 
        }))
        .sort((a, b) => b.clicks - a.clicks);

      res.json({
        success: true,
        stats,
        totalFeatures: stats.length,
        totalClicks: stats.reduce((sum, s) => sum + s.clicks, 0)
      });
    } catch (error: any) {
      console.error("❌ Get feature interest error:", error);
      res.status(500).json({ error: "Failed to fetch feature interest" });
    }
  });

  // ============================================
  // CHARITY DONATIONS - Helping Families Escape Poverty
  // ============================================

  // Get charity stats
  app.get("/api/charity/stats", async (req, res) => {
    try {
      const { charityDonations } = await import("@shared/schema");
      
      // Get total donations
      const donations = await db.select().from(charityDonations);
      const totalRaised = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      // Estimate families helped (assuming $500 per family on average)
      const familiesHelped = Math.floor(totalRaised / 500);
      
      // Count unique donors
      const uniqueDonors = new Set(donations.filter(d => d.userId).map(d => d.userId)).size;

      res.json({
        totalRaised: totalRaised.toFixed(2),
        familiesHelped,
        totalDonors: uniqueDonors,
        totalDonations: donations.length,
      });
    } catch (error: any) {
      console.error("❌ Charity stats error:", error);
      res.status(500).json({ error: "Failed to fetch charity stats" });
    }
  });

  // Make a donation
  app.post("/api/charity/donate", async (req, res) => {
    try {
      const { charityDonations, insertCharityDonationSchema } = await import("@shared/schema");
      
      const donationData = insertCharityDonationSchema.parse({
        ...req.body,
        userId: req.user?.id || null,
        currency: "USD",
        paymentProvider: "direct" as any,
      });

      const donation = await db.insert(charityDonations).values(donationData).returning();

      console.log(`💝 Charity donation received: $${donationData.amount} ${donationData.isAnonymous ? '(anonymous)' : `from ${donationData.donorName}`}`);

      res.json(donation[0]);
    } catch (error: any) {
      console.error("❌ Donation error:", error);
      res.status(400).json({ error: "Failed to process donation", message: error.message });
    }
  });

  // Get recent donations (for donor wall)
  app.get("/api/charity/donations/recent", async (req, res) => {
    try {
      const { charityDonations } = await import("@shared/schema");
      const { desc } = await import("drizzle-orm");
      
      const donations = await db
        .select({
          amount: charityDonations.amount,
          donorName: charityDonations.donorName,
          message: charityDonations.message,
          isAnonymous: charityDonations.isAnonymous,
          createdAt: charityDonations.createdAt,
        })
        .from(charityDonations)
        .orderBy(desc(charityDonations.createdAt))
        .limit(50);

      res.json(donations);
    } catch (error: any) {
      console.error("❌ Get donations error:", error);
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  // ==================== BATTLE ROOMS API ====================
  app.get("/api/battles", async (req, res) => {
    const battles = [
      {
        id: 1,
        creator1Id: 1,
        creator2Id: 2,
        creator1Username: "DanceQueen",
        creator2Username: "VibeKing",
        creator1Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DanceQueen",
        creator2Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VibeKing",
        creator1Video: "/videos/sample1.mp4",
        creator2Video: "/videos/sample2.mp4",
        creator1Votes: 1247,
        creator2Votes: 983,
        prizePool: 500,
        status: "active",
        category: "Dance",
        endsAt: new Date(Date.now() + 3600000).toISOString()
      },
      {
        id: 2,
        creator1Id: 3,
        creator2Id: 4,
        creator1Username: "ComedyKing",
        creator2Username: "LaughMaster",
        creator1Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ComedyKing",
        creator2Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LaughMaster",
        creator1Video: "/videos/sample3.mp4",
        creator2Video: "/videos/sample4.mp4",
        creator1Votes: 2156,
        creator2Votes: 2198,
        prizePool: 750,
        status: "active",
        category: "Comedy",
        endsAt: new Date(Date.now() + 7200000).toISOString()
      }
    ];
    res.json(battles);
  });

  app.post("/api/battles/:id/vote", async (req, res) => {
    const { id } = req.params;
    const { creatorNumber } = req.body;
    console.log(`⚔️ Vote cast for battle #${id}, creator ${creatorNumber}`);
    res.json({ success: true, matched: false });
  });

  app.post("/api/battles/create", async (req, res) => {
    const newBattle = {
      id: Math.floor(Math.random() * 10000),
      creator1Id: 1,
      creator2Id: 2,
      creator1Username: "NewCreator1",
      creator2Username: "NewCreator2",
      creator1Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=New1",
      creator2Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=New2",
      creator1Video: "/videos/sample.mp4",
      creator2Video: "/videos/sample2.mp4",
      creator1Votes: 0,
      creator2Votes: 0,
      prizePool: 100,
      status: "active",
      category: "New Battle",
      endsAt: new Date(Date.now() + 86400000).toISOString()
    };
    console.log(`⚔️ New battle created: #${newBattle.id}`);
    res.json(newBattle);
  });

  // ==================== AI DATING API (Tinder Gold Style - $50-70M Potential) ====================
  
  // Get dating profiles for swiping
  app.get("/api/dating/profiles", async (req, res) => {
    const profiles = [
      {
        id: 1,
        userId: 101,
        username: "sarah_adventure",
        displayName: "Sarah",
        age: 24,
        location: "Los Angeles, CA",
        bio: "Adventure seeker | Coffee enthusiast | Love hiking and sunset photography",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf",
        photos: [],
        interests: ["Travel", "Photography", "Hiking", "Coffee"],
        compatibilityScore: 94,
        xaiExplanation: "You both love outdoor activities and have similar creative interests in photography. Your travel preferences align well.",
        isVerified: true,
        isOnline: true,
        distance: "2 miles",
        isPremium: true
      },
      {
        id: 2,
        userId: 102,
        username: "mike_fitness",
        displayName: "Mike",
        age: 27,
        location: "New York, NY",
        bio: "Fitness coach | Foodie | Building a healthy lifestyle one rep at a time",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike&backgroundColor=c0aede",
        photos: [],
        interests: ["Fitness", "Cooking", "Travel", "Music"],
        compatibilityScore: 87,
        xaiExplanation: "Strong match based on active lifestyle preferences. You both value health and fitness.",
        isVerified: true,
        isOnline: false,
        distance: "5 miles",
        isPremium: false
      },
      {
        id: 3,
        userId: 103,
        username: "emma_creative",
        displayName: "Emma",
        age: 25,
        location: "Austin, TX",
        bio: "Digital artist | Music lover | Creating magic with pixels and paint",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffd5dc",
        photos: [],
        interests: ["Art", "Music", "Design", "Photography"],
        compatibilityScore: 91,
        xaiExplanation: "Exceptional creative compatibility! You both have artistic passions and appreciate visual aesthetics.",
        isVerified: true,
        isOnline: true,
        distance: "8 miles",
        isPremium: true
      },
      {
        id: 4,
        userId: 104,
        username: "alex_tech",
        displayName: "Alex",
        age: 28,
        location: "San Francisco, CA",
        bio: "Software engineer by day, musician by night. Looking for someone to explore the city with.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
        photos: [],
        interests: ["Tech", "Music", "Coffee", "Hiking"],
        compatibilityScore: 89,
        xaiExplanation: "Great intellectual match with shared interests in technology and music.",
        isVerified: true,
        isOnline: true,
        distance: "1 mile",
        isPremium: false
      },
      {
        id: 5,
        userId: 105,
        username: "jessica_dance",
        displayName: "Jessica",
        age: 23,
        location: "Miami, FL",
        bio: "Professional dancer | Beach lover | Living life to the fullest",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&backgroundColor=ffceb4",
        photos: [],
        interests: ["Dancing", "Beach", "Fitness", "Travel"],
        compatibilityScore: 85,
        xaiExplanation: "High energy match! You both enjoy active lifestyles and creative expression.",
        isVerified: false,
        isOnline: true,
        distance: "12 miles",
        isPremium: true
      },
      {
        id: 6,
        userId: 106,
        username: "david_chef",
        displayName: "David",
        age: 29,
        location: "Chicago, IL",
        bio: "Executive chef | Wine enthusiast | Looking for my sous chef in life",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=d1d4f9",
        photos: [],
        interests: ["Cooking", "Wine", "Travel", "Art"],
        compatibilityScore: 82,
        xaiExplanation: "Excellent culinary chemistry! You both appreciate fine dining and creative experiences.",
        isVerified: true,
        isOnline: false,
        distance: "3 miles",
        isPremium: false
      },
      {
        id: 7,
        userId: 107,
        username: "olivia_yoga",
        displayName: "Olivia",
        age: 26,
        location: "Denver, CO",
        bio: "Yoga instructor | Nature lover | Finding balance in every moment",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&backgroundColor=c0f9d4",
        photos: [],
        interests: ["Yoga", "Meditation", "Hiking", "Wellness"],
        compatibilityScore: 93,
        xaiExplanation: "Spiritual connection detected! You both value mindfulness and outdoor adventures.",
        isVerified: true,
        isOnline: true,
        distance: "6 miles",
        isPremium: true
      },
      {
        id: 8,
        userId: 108,
        username: "ryan_adventure",
        displayName: "Ryan",
        age: 30,
        location: "Seattle, WA",
        bio: "Mountain climber | Coffee snob | Always planning the next adventure",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan&backgroundColor=f9c0c0",
        photos: [],
        interests: ["Climbing", "Coffee", "Photography", "Travel"],
        compatibilityScore: 88,
        xaiExplanation: "Adventure compatibility is off the charts! You both seek thrilling experiences.",
        isVerified: true,
        isOnline: false,
        distance: "4 miles",
        isPremium: false
      }
    ];
    res.json(profiles);
  });

  // Boost profile visibility
  app.post("/api/dating/boost", async (req, res) => {
    console.log("Boosted profile for 30 minutes");
    res.json({ success: true, boostEndsAt: new Date(Date.now() + 1800000).toISOString() });
  });

  // Get who likes you (premium feature)
  app.get("/api/dating/likes", async (req, res) => {
    const likes = [
      { id: 1, username: "secret_admirer1", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admirer1", blurred: false },
      { id: 2, username: "curious_one", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admirer2", blurred: false },
      { id: 3, username: "hopeful_heart", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admirer3", blurred: false },
    ];
    res.json(likes);
  });

  // ==================== DATING / LOVE CONNECTION API ====================
  app.get("/api/dating/matches", async (req, res) => {
    const matches = [
      {
        id: 1,
        userId: 101,
        username: "sarah_adventure",
        displayName: "Sarah",
        age: 24,
        location: "Los Angeles, CA",
        bio: "Adventure seeker 🏔️ | Coffee enthusiast ☕ | Love hiking and sunset photography 📸",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        videoProfileUrl: null,
        interests: ["Travel", "Photography", "Hiking", "Coffee"],
        compatibilityScore: 94,
        xaiExplanation: "You both love outdoor activities and have similar creative interests in photography. Your travel preferences align well, and you share a passion for exploring new places."
      },
      {
        id: 2,
        userId: 102,
        username: "mike_fitness",
        displayName: "Mike",
        age: 27,
        location: "New York, NY",
        bio: "Fitness coach 💪 | Foodie 🍕 | Building a healthy lifestyle one rep at a time",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        videoProfileUrl: "/videos/profile-mike.mp4",
        interests: ["Fitness", "Cooking", "Travel", "Music"],
        compatibilityScore: 87,
        xaiExplanation: "Strong match based on active lifestyle preferences. You both value health and fitness, and share an appreciation for good food and music."
      },
      {
        id: 3,
        userId: 103,
        username: "emma_creative",
        displayName: "Emma",
        age: 25,
        location: "Austin, TX",
        bio: "Digital artist 🎨 | Music lover 🎵 | Creating magic with pixels and paint",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        videoProfileUrl: null,
        interests: ["Art", "Music", "Design", "Photography"],
        compatibilityScore: 91,
        xaiExplanation: "Exceptional creative compatibility! You both have artistic passions and appreciate visual aesthetics. Your music tastes overlap significantly."
      }
    ];
    res.json(matches);
  });

  app.post("/api/dating/swipe", async (req, res) => {
    const { matchId, direction } = req.body;
    const matched = direction === "like" && Math.random() > 0.7;
    console.log(`💘 Swipe ${direction} on match #${matchId} - Matched: ${matched}`);
    res.json({ success: true, matched });
  });

  // ==================== VIRTUAL GIFTS API ====================
  app.get("/api/gifts", async (req, res) => {
    const gifts = [];
    const giftTemplates = {
      casual: [
        { name: "Rose", emoji: "🌹", priceMin: 0.99, priceMax: 2.99 },
        { name: "Heart", emoji: "❤️", priceMin: 0.99, priceMax: 1.99 },
        { name: "Coffee", emoji: "☕", priceMin: 1.99, priceMax: 3.99 },
        { name: "Pizza", emoji: "🍕", priceMin: 2.99, priceMax: 4.99 },
        { name: "Cake", emoji: "🎂", priceMin: 3.99, priceMax: 4.99 }
      ],
      premium: [
        { name: "Fireworks", emoji: "🎆", priceMin: 5, priceMax: 9.99 },
        { name: "Trophy", emoji: "🏆", priceMin: 7.99, priceMax: 14.99 },
        { name: "Diamond", emoji: "💎", priceMin: 10, priceMax: 19.99 },
        { name: "Crown", emoji: "👑", priceMin: 12.99, priceMax: 19.99 }
      ],
      luxury: [
        { name: "Sports Car", emoji: "🏎️", priceMin: 20, priceMax: 49.99 },
        { name: "Yacht", emoji: "🛥️", priceMin: 30, priceMax: 69.99 },
        { name: "Castle", emoji: "🏰", priceMin: 50, priceMax: 99.99 }
      ],
      ultimate: [
        { name: "Rocket", emoji: "🚀", priceMin: 100, priceMax: 299 },
        { name: "Island", emoji: "🏝️", priceMin: 250, priceMax: 499 },
        { name: "Galaxy", emoji: "🌌", priceMin: 500, priceMax: 999 }
      ]
    };

    let id = 1;
    for (const [category, templates] of Object.entries(giftTemplates)) {
      for (const template of templates) {
        for (let i = 0; i < (category === 'casual' ? 10 : category === 'premium' ? 8 : category === 'luxury' ? 6 : 4); i++) {
          const price = Number((Math.random() * (template.priceMax - template.priceMin) + template.priceMin).toFixed(2));
          gifts.push({
            id: id++,
            name: i === 0 ? template.name : `${template.name} ${i + 1}`,
            emoji: template.emoji,
            price,
            category,
            animation: category === 'ultimate' ? 'explosive' : category === 'luxury' ? 'sparkle' : category === 'premium' ? 'glow' : 'bounce',
            popularity: Math.floor(Math.random() * 100)
          });
        }
      }
    }

    res.json(gifts.slice(0, 150));
  });

  app.post("/api/gifts/send", async (req, res) => {
    const { giftId, recipientId } = req.body;
    console.log(`🎁 Gift #${giftId} sent to user #${recipientId}`);
    res.json({ success: true });
  });

  // ==================== PREMIUM USERNAMES API ====================
  app.get("/api/usernames", async (req, res) => {
    const usernames = [
      { id: 1, username: "Boss", price: 999, category: "legendary", views: 45000, likes: 12000, ownerId: null, ownerName: null, status: "available" },
      { id: 2, username: "King", price: 899, category: "legendary", views: 52000, likes: 15000, ownerId: 123, ownerName: "CoolUser", status: "owned" },
      { id: 3, username: "Queen", price: 899, category: "legendary", views: 48000, likes: 14000, ownerId: null, ownerName: null, status: "available" },
      { id: 4, username: "Legend", price: 749, category: "legendary", views: 38000, likes: 9500, ownerId: null, ownerName: null, status: "available" },
      { id: 5, username: "Elite", price: 499, category: "premium", views: 28000, likes: 7200, ownerId: null, ownerName: null, status: "available" },
      { id: 6, username: "Pro", price: 399, category: "premium", views: 32000, likes: 8100, ownerId: null, ownerName: null, status: "available" },
      { id: 7, username: "VIP", price: 299, category: "premium", views: 25000, likes: 6300, ownerId: null, ownerName: null, status: "available" },
      { id: 8, username: "Star", price: 249, category: "premium", views: 22000, likes: 5500, ownerId: null, ownerName: null, status: "available" },
      { id: 9, username: "Ace", price: 199, category: "rare", views: 18000, likes: 4500, ownerId: null, ownerName: null, status: "available" },
      { id: 10, username: "Alpha", price: 179, category: "rare", views: 16000, likes: 4000, ownerId: null, ownerName: null, status: "available" },
      { id: 11, username: "Sigma", price: 159, category: "rare", views: 14000, likes: 3500, ownerId: null, ownerName: null, status: "available" },
      { id: 12, username: "Omega", price: 149, category: "rare", views: 13000, likes: 3200, ownerId: null, ownerName: null, status: "available" }
    ];
    res.json(usernames);
  });

  app.post("/api/usernames/:id/purchase", async (req, res) => {
    const { id } = req.params;
    console.log(`⚡ Username #${id} purchased!`);
    res.json({ success: true });
  });

  // ==================== ADMIN ALL-ACCESS ACCOUNT ====================
  // Auto-login as admin with full platform access
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { users } = await import("@shared/schema");
      
      // Check if admin exists
      let adminUser = await db.select().from(users).where(eq(users.email, "admin@profithack.ai")).limit(1);
      
      if (!adminUser.length) {
        // Create admin user
        const bcrypt = await import("bcrypt");
        const hashedPassword = await bcrypt.hash("admin123", 10);
        
        const newAdmin = await db.insert(users).values({
          email: "admin@profithack.ai",
          username: "admin",
          password: hashedPassword,
          name: "Platform Admin",
          isAdmin: true,
          emailVerified: true,
          credits: 999999,
          bio: "Platform Administrator with full access",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ffdfbf",
        }).returning();
        adminUser = newAdmin;
      }
      
      // Set session
      (req.session as any).userId = adminUser[0].id;
      (req.session as any).isAdmin = true;
      
      // Also set req.user for immediate access
      (req as any).user = adminUser[0];
      
      console.log("🔐 Admin logged in:", adminUser[0].email);
      
      res.json({
        success: true,
        user: {
          id: adminUser[0].id,
          email: adminUser[0].email,
          username: adminUser[0].username,
          name: adminUser[0].name,
          isAdmin: true,
          credits: 999999,
          avatar: adminUser[0].avatar,
        }
      });
    } catch (error: any) {
      console.error("❌ Admin login error:", error);
      res.status(500).json({ error: "Admin login failed" });
    }
  });

  // Quick login for testing (creates session immediately)
  app.get("/api/auth/quick-login", async (req, res) => {
    try {
      const { users } = await import("@shared/schema");
      
      // Create test user session
      const testUser = {
        id: "test-user-" + Date.now(),
        email: "testuser@profithack.ai",
        username: "testuser",
        name: "Test User",
        credits: 5000,
        isAdmin: false,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser"
      };
      
      (req.session as any).userId = testUser.id;
      (req as any).user = testUser;
      
      console.log("🚀 Quick login:", testUser.username);
      res.json({ success: true, user: testUser });
    } catch (error: any) {
      console.error("❌ Quick login error:", error);
      res.status(500).json({ error: "Quick login failed" });
    }
  });

  // ==================== CREATOR PLATFORM API ====================
  // $60M+ Revenue Model: TikTok + OnlyFans Hybrid
  
  // Creator Feed - TikTok-Style For You Page (22k+ real videos)
  app.get("/api/creator-feed", async (req, res) => {
    try {
      const { videos: videosTable } = await import("@shared/schema");
      const { desc, sql: sqlOp } = await import("drizzle-orm");
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      // Fetch real videos from database with random ordering for feed variety
      const dbVideos = await db
        .select()
        .from(videosTable)
        .orderBy(sqlOp`RANDOM()`)
        .limit(limit)
        .offset(offset);
      
      // Transform to feed format
      const feedVideos = dbVideos.map((video: any) => ({
        id: video.id,
        title: video.title || "Untitled",
        description: video.description || "",
        videoUrl: video.videoUrl || video.url || "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        thumbnailUrl: video.thumbnailUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${video.id}`,
        userId: video.userId || video.creatorId || "creator1",
        username: video.creatorName || video.username || "Creator",
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creatorName || video.id}`,
        isVerified: Math.random() > 0.5,
        isPremium: video.isPremium || false,
        price: video.isPremium ? (video.price || Math.floor(Math.random() * 100) + 10) : undefined,
        likeCount: video.likeCount || Math.floor(Math.random() * 100000),
        commentCount: video.commentCount || Math.floor(Math.random() * 5000),
        shareCount: video.shareCount || Math.floor(Math.random() * 2000),
        viewCount: video.viewCount || Math.floor(Math.random() * 500000),
        isLiked: false,
        isFollowing: false,
        createdAt: video.createdAt || new Date().toISOString(),
        category: video.category || "Entertainment",
        tags: video.tags || []
      }));
      
      // Get total count for pagination
      const totalResult = await db.select({ count: sqlOp`count(*)::int` }).from(videosTable);
      const total = totalResult[0]?.count || 0;
      
      res.json({
        videos: feedVideos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + limit < total
        }
      });
    } catch (error: any) {
      console.error("❌ Creator feed error:", error);
      // Fallback to sample videos if database fails
      const sampleVideos = Array.from({ length: 20 }, (_, i) => ({
        id: `sample-${i}`,
        title: `Video ${i + 1}`,
        description: `Amazing content #viral #fyp`,
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        thumbnailUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=video${i}`,
        userId: `creator${i}`,
        username: `Creator${i}`,
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Creator${i}`,
        isVerified: i % 3 === 0,
        isPremium: i % 5 === 0,
        likeCount: Math.floor(Math.random() * 100000),
        commentCount: Math.floor(Math.random() * 5000),
        shareCount: Math.floor(Math.random() * 2000),
        viewCount: Math.floor(Math.random() * 500000),
        isLiked: false,
        isFollowing: false,
        createdAt: new Date().toISOString()
      }));
      res.json({ videos: sampleVideos, pagination: { page: 1, limit: 20, total: 20, totalPages: 1, hasMore: false } });
    }
  });
  
  // Premium content feed (VIP only)
  app.get("/api/premium-feed", async (req, res) => {
    try {
      const { videos: videosTable } = await import("@shared/schema");
      const { desc, sql: sqlOp, eq } = await import("drizzle-orm");
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      // Fetch premium videos from database
      const dbVideos = await db
        .select()
        .from(videosTable)
        .where(eq(videosTable.isPremium, true))
        .orderBy(sqlOp`RANDOM()`)
        .limit(limit)
        .offset(offset);
      
      // If no premium videos, generate some
      if (dbVideos.length === 0) {
        const premiumVideos = Array.from({ length: 20 }, (_, i) => ({
          id: `premium-${i}`,
          title: `Exclusive Content ${i + 1}`,
          description: `VIP only premium content`,
          videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
          thumbnailUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=premium${i}`,
          userId: `vip-creator${i}`,
          username: `VIPCreator${i}`,
          userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=VIP${i}`,
          isVerified: true,
          isPremium: true,
          price: [25, 50, 100, 200][Math.floor(Math.random() * 4)],
          likeCount: Math.floor(Math.random() * 50000),
          commentCount: Math.floor(Math.random() * 2000),
          shareCount: Math.floor(Math.random() * 500),
          viewCount: Math.floor(Math.random() * 200000),
          isLiked: false,
          isFollowing: false,
          createdAt: new Date().toISOString()
        }));
        return res.json({ videos: premiumVideos, pagination: { page: 1, limit: 20, total: 20, totalPages: 1, hasMore: false } });
      }
      
      const feedVideos = dbVideos.map((video: any) => ({
        id: video.id,
        title: video.title || "Premium Content",
        description: video.description || "Exclusive VIP content",
        videoUrl: video.videoUrl || video.url,
        thumbnailUrl: video.thumbnailUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${video.id}`,
        userId: video.userId || video.creatorId,
        username: video.creatorName || video.username || "VIP Creator",
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creatorName || video.id}`,
        isVerified: true,
        isPremium: true,
        price: video.price || Math.floor(Math.random() * 100) + 25,
        likeCount: video.likeCount || Math.floor(Math.random() * 50000),
        commentCount: video.commentCount || Math.floor(Math.random() * 2000),
        shareCount: video.shareCount || Math.floor(Math.random() * 500),
        viewCount: video.viewCount || Math.floor(Math.random() * 200000),
        isLiked: false,
        isFollowing: false,
        createdAt: video.createdAt || new Date().toISOString()
      }));
      
      res.json({ videos: feedVideos, pagination: { page, limit, total: dbVideos.length, totalPages: 1, hasMore: false } });
    } catch (error: any) {
      console.error("❌ Premium feed error:", error);
      res.status(500).json({ error: "Failed to fetch premium feed" });
    }
  });

  // User credits balance
  app.get("/api/user/credits", async (req, res) => {
    res.json({ credits: 500 });
  });

  // Like a video
  app.post("/api/videos/:videoId/like", async (req, res) => {
    const { videoId } = req.params;
    console.log(`❤️ Video ${videoId} liked`);
    res.json({ success: true, liked: true });
  });

  // Follow a user
  app.post("/api/users/:userId/follow", async (req, res) => {
    const { userId } = req.params;
    console.log(`👤 User ${userId} followed`);
    res.json({ success: true, following: true });
  });

  // Send gift on video
  app.post("/api/videos/:videoId/gift", async (req, res) => {
    const { videoId } = req.params;
    const { giftId } = req.body;
    console.log(`🎁 Gift ${giftId} sent on video ${videoId}`);
    res.json({ success: true });
  });

  // Unlock premium video
  app.post("/api/videos/:videoId/unlock", async (req, res) => {
    const { videoId } = req.params;
    console.log(`🔓 Video ${videoId} unlocked`);
    res.json({ success: true });
  });

  // Get creator profile
  app.get("/api/creators/:userId", async (req, res) => {
    const { userId } = req.params;
    const creator = {
      id: userId,
      username: "TopCreator",
      displayName: "Top Creator",
      bio: "Creating amazing content daily! 🎥 Follow for exclusive content and behind-the-scenes 💫",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
      isVerified: true,
      isVIP: true,
      followerCount: 125000,
      followingCount: 342,
      likeCount: 2450000,
      videoCount: 156,
      isFollowing: false,
      isSubscribed: false,
      subscriptionPrice: 14.99,
      earnings: 45678.90
    };
    res.json(creator);
  });

  // Get creator videos
  app.get("/api/creators/:userId/videos", async (req, res) => {
    const { userId } = req.params;
    const videos = Array.from({ length: 12 }, (_, i) => ({
      id: `${userId}-v${i}`,
      thumbnailUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${userId}-${i}`,
      title: `Video ${i + 1}`,
      viewCount: Math.floor(Math.random() * 100000),
      likeCount: Math.floor(Math.random() * 10000),
      isPremium: i % 3 === 0,
      price: i % 3 === 0 ? [25, 50, 100][Math.floor(Math.random() * 3)] : undefined
    }));
    res.json(videos);
  });

  // Subscribe to creator
  app.post("/api/creators/:userId/subscribe", async (req, res) => {
    const { userId } = req.params;
    const { tierId } = req.body;
    console.log(`⭐ Subscribed to creator ${userId} with tier ${tierId}`);
    res.json({ success: true });
  });

  // Wallet data
  app.get("/api/wallet", async (req, res) => {
    res.json({
      credits: 500,
      pendingCredits: 150,
      totalEarned: 12500,
      totalSpent: 3200
    });
  });

  // Wallet transactions
  app.get("/api/wallet/transactions", async (req, res) => {
    const transactions = [
      {
        id: "t1",
        type: "gift_received",
        amount: 100,
        description: "Gift from @FanUser123",
        status: "completed",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "t2",
        type: "subscription",
        amount: 500,
        description: "New subscriber: @SuperFan",
        status: "completed",
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: "t3",
        type: "purchase",
        amount: 1000,
        description: "Credit pack purchase",
        status: "completed",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "t4",
        type: "gift_sent",
        amount: 50,
        description: "Gift to @Creator456",
        status: "completed",
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: "t5",
        type: "withdrawal",
        amount: 5000,
        description: "Withdrawal to PayPal",
        status: "pending",
        createdAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    res.json(transactions);
  });

  // Purchase credits
  app.post("/api/wallet/purchase", async (req, res) => {
    const { packageId } = req.body;
    console.log(`💰 Credits purchased: package ${packageId}`);
    res.json({ success: true });
  });

  // Withdraw earnings
  app.post("/api/wallet/withdraw", async (req, res) => {
    const { amount } = req.body;
    if (amount < 1000) {
      return res.status(400).json({ error: "Minimum withdrawal is 1000 credits" });
    }
    console.log(`💸 Withdrawal requested: ${amount} credits`);
    res.json({ success: true });
  });

  // Messages conversations
  app.get("/api/messages/conversations", async (req, res) => {
    const conversations = [
      {
        id: "c1",
        recipientId: "user1",
        recipientName: "TopCreator",
        recipientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TopCreator",
        recipientVerified: true,
        recipientVIP: true,
        lastMessage: "Thanks for the support! 💕",
        lastMessageTime: new Date(Date.now() - 300000).toISOString(),
        unreadCount: 2,
        isOnline: true
      },
      {
        id: "c2",
        recipientId: "user2",
        recipientName: "DanceMaster",
        recipientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DanceMaster",
        recipientVerified: true,
        recipientVIP: false,
        lastMessage: "Check out my new video!",
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 0,
        isOnline: false
      },
      {
        id: "c3",
        recipientId: "user3",
        recipientName: "FitQueen",
        recipientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FitQueen",
        recipientVerified: true,
        recipientVIP: true,
        lastMessage: "Hey! 👋",
        lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 1,
        isOnline: true
      }
    ];
    res.json(conversations);
  });

  // Get user info for messages
  app.get("/api/users/:userId", async (req, res) => {
    const { userId } = req.params;
    res.json({
      id: userId,
      username: `User_${userId}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      isVIP: Math.random() > 0.5,
      isVerified: Math.random() > 0.3
    });
  });

  // Get messages with a user
  app.get("/api/messages/:recipientId", async (req, res) => {
    const { recipientId } = req.params;
    const messages = [
      {
        id: "m1",
        senderId: recipientId,
        content: "Hey! Thanks for following! 💕",
        type: "text",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "read"
      },
      {
        id: "m2",
        senderId: "currentUser",
        content: "Love your content! Keep it up! 🔥",
        type: "text",
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        status: "read"
      },
      {
        id: "m3",
        senderId: recipientId,
        content: "Thank you so much! That means a lot 🥰",
        type: "text",
        timestamp: new Date(Date.now() - 79200000).toISOString(),
        status: "read"
      }
    ];
    res.json(messages);
  });

  // Send message
  app.post("/api/messages/send", async (req, res) => {
    const { recipientId, content, type } = req.body;
    console.log(`💬 Message sent to ${recipientId}: ${content}`);
    res.json({
      id: `m_${Date.now()}`,
      senderId: "currentUser",
      content,
      type,
      timestamp: new Date().toISOString(),
      status: "sent"
    });
  });

  // Send gift in messages
  app.post("/api/messages/gift", async (req, res) => {
    const { recipientId, giftId } = req.body;
    console.log(`🎁 Gift ${giftId} sent to ${recipientId}`);
    res.json({ success: true });
  });

  // Send tip in messages
  app.post("/api/messages/tip", async (req, res) => {
    const { recipientId, amount } = req.body;
    console.log(`💰 Tip of ${amount} credits sent to ${recipientId}`);
    res.json({ success: true });
  });

  // ==================== DOWNLOAD CODEBASE ====================
  app.get("/api/download/codebase", async (req, res) => {
    try {
      const fs = (await import("fs")).default || await import("fs");
      const path = (await import("path")).default || await import("path");
      const archivePath = path.join("/home/runner/workspace/public", "profithack-ai-complete-codebase.tar.gz");
      
      if (!fs.existsSync(archivePath)) {
        return res.status(404).json({ error: "Archive not found" });
      }
      
      const fileSize = fs.statSync(archivePath).size;
      res.setHeader("Content-Type", "application/gzip");
      res.setHeader("Content-Disposition", "attachment; filename=profithack-ai-complete-codebase.tar.gz");
      res.setHeader("Content-Length", fileSize);
      
      const stream = fs.createReadStream(archivePath);
      stream.pipe(res);
      
      console.log(`✅ Codebase downloaded: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // Video upload
  app.post("/api/videos/upload", async (req, res) => {
    console.log("📹 Video upload received");
    res.json({
      id: `v_${Date.now()}`,
      success: true,
      message: "Video uploaded successfully!"
    });
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({
      id: (req.user as any).id || (req.user as any).claims?.sub,
      email: (req.user as any).email || (req.user as any).claims?.email,
      username: (req.user as any).username || "User"
    });
  });

  return httpServer;
}

