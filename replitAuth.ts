import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true, // CRITICAL: Trust the proxy's protocol (Replit uses HTTPS proxy)
    cookie: {
      path: '/', // Explicit path
      httpOnly: true,
      // TEMPORARY FIX: Disable secure for testing - re-enable in production
      secure: false, // process.env.NODE_ENV === 'production' || Boolean(process.env.REPLIT_DOMAINS),
      sameSite: 'lax', // CRITICAL: Required for session cookies to work
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any, inviteCode?: string) {
  const userId = claims["sub"];
  
  // Check if user is new (first time logging in)
  const existingUser = await storage.getUser(userId).catch(() => null);
  const isNewUser = !existingUser;

  // PROFITHACK AI: OPEN SIGNUP - Invite code disabled for testing
  if (isNewUser) {
    // STEP 1: Create user first (needed for foreign key constraint)
    await storage.upsertUser({
      id: userId,
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });

    // STEP 2: Optionally consume invite code if provided
    if (inviteCode) {
      try {
        const validCode = await storage.validateInviteCode(inviteCode);
        if (validCode && validCode.creatorId !== userId) {
          await storage.useInviteCode(inviteCode, userId);
          console.log(`✅ Used invite code ${inviteCode} for new user: ${userId}`);
        }
      } catch (error: any) {
        console.error("Failed to consume invite code (non-fatal):", error);
        // Don't fail signup if invite code fails
      }
    }

    // STEP 3: Auto-generate invite codes for new user (viral loop)
    const baseCodeCount = 5;
    try {
      await storage.createInviteCodes(userId, baseCodeCount);
      console.log(`✅ Generated ${baseCodeCount} invite codes for new user: ${userId}`);
    } catch (error: any) {
      console.error("Failed to generate invite codes for new user:", error);
      // Don't fail signup if code generation fails - user is already created
    }
  } else {
    // Existing user - just update their info
    await storage.upsertUser({
      id: userId,
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify = async (
    req: any,
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    
    try {
      // Get invite code from session if present
      const inviteCode = req.session?.inviteCode;
      await upsertUser(tokens.claims(), inviteCode);
      
      // Clear invite code from session after use
      if (req.session?.inviteCode) {
        delete req.session.inviteCode;
      }
      
      verified(null, user);
    } catch (error: any) {
      console.error("Auth verification error:", error);
      
      // Handle invite-specific errors
      if (error.message === "INVITE_CODE_REQUIRED") {
        console.error("Auth failed: No invite code provided for new user");
        return verified(new Error("Invite code required for new signups"));
      }
      if (error.message === "INVALID_INVITE_CODE") {
        console.error("Auth failed: Invalid or used invite code");
        return verified(new Error("Invalid or already used invite code"));
      }
      if (error.message === "CANNOT_USE_OWN_CODE") {
        console.error("Auth failed: User attempted self-redemption");
        return verified(new Error("You cannot use your own invite code"));
      }
      if (error.message === "INVITE_CODE_CONSUMPTION_FAILED") {
        console.error("Auth failed: Could not consume invite code");
        return verified(new Error("Failed to process invite code. Please try again"));
      }
      
      console.error("Auth verification failed with unexpected error:", error);
      verified(error);
    }
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
        passReqToCallback: true,
      },
      verify
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req: any, res, next) => {
    // Store invite code in session if provided
    const inviteCode = req.query.invite;
    if (inviteCode) {
      req.session.inviteCode = inviteCode;
    }
    
    // Use the first domain from REPLIT_DOMAINS as fallback for localhost
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    const hostname = domains.includes(req.hostname) ? req.hostname : domains[0];
    
    passport.authenticate(`replitauth:${hostname}`, {
      // Removed "prompt: login consent" - this was forcing consent screen every time
      // Now users only see it on first authorization
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Use the first domain from REPLIT_DOMAINS as fallback for localhost
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    const hostname = domains.includes(req.hostname) ? req.hostname : domains[0];
    
    passport.authenticate(`replitauth:${hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Check if user is authenticated at all
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // UNIVERSAL AUTH: Handle both Replit Auth and Local Auth
  // Local Auth users have user.id directly (no claims object)
  // Replit Auth users have user.claims.sub
  if (!user.expires_at) {
    // This is a Local Auth user (email/password) - they're already authenticated
    return next();
  }

  // This is a Replit Auth user - check token expiration
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // Token expired - try to refresh
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
