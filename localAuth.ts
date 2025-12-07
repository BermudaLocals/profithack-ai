import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import type { Express } from "express";
import { storage } from "./storage";
import { emailService } from "./services/email";

const SALT_ROUNDS = 10;

export function setupLocalAuth(app: Express) {
  // Configure passport local strategy for email/username + password
  passport.use('local-signup', new LocalStrategy(
    {
      usernameField: 'email', // Will accept email for signup
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req: any, email: string, password: string, done) => {
      try {
        const { inviteCode, username } = req.body;

        // Validate invite code
        if (!inviteCode) {
          return done(null, false, { message: 'Invite code required' });
        }

        const validCode = await storage.validateInviteCode(inviteCode);
        if (!validCode) {
          return done(null, false, { message: 'Invalid or already used invite code' });
        }

        // Check if email already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return done(null, false, { message: 'Email already registered' });
        }

        // Check if username already taken
        if (username) {
          const existingUsername = await storage.getUserByUsername(username);
          if (existingUsername) {
            return done(null, false, { message: 'Username already taken' });
          }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const newUser = await storage.upsertUser({
          email,
          passwordHash,
          username: username || undefined,
        });

        // Prevent self-redemption
        if (validCode.creatorId === newUser.id) {
          await storage.deleteUser(newUser.id);
          return done(null, false, { message: 'Cannot use your own invite code' });
        }

        // Consume invite code
        await storage.useInviteCode(inviteCode, newUser.id);

        // Generate 5 invite codes for new user
        const inviteCodes = await storage.createInviteCodes(newUser.id, 5);
        const inviteCodeStrings = inviteCodes.map(code => code.code);

        // Send welcome email (async, don't wait)
        emailService.sendWelcomeEmail({
          email: newUser.email || email,
          username: newUser.username || undefined,
          inviteCodes: inviteCodeStrings,
        }).catch(err => console.error('Failed to send welcome email:', err));

        return done(null, newUser);
      } catch (error: any) {
        console.error('Signup error:', error);
        return done(error);
      }
    }
  ));

  passport.use('local-login', new LocalStrategy(
    {
      usernameField: 'emailOrUsername', // Accept either email or username
      passwordField: 'password',
    },
    async (emailOrUsername: string, password: string, done) => {
      try {
        // Try to find user by email or username
        let user = await storage.getUserByEmail(emailOrUsername);
        if (!user) {
          user = await storage.getUserByUsername(emailOrUsername);
        }

        if (!user) {
          return done(null, false, { message: 'Invalid email/username or password' });
        }

        // Check if user has password (might be Replit Auth only)
        if (!user.passwordHash) {
          return done(null, false, { message: 'Please sign in with Replit Auth' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: 'Invalid email/username or password' });
        }

        // Check if user is banned
        if (user.isBanned) {
          return done(null, false, { message: 'Account is banned' });
        }

        return done(null, user);
      } catch (error: any) {
        console.error('Login error:', error);
        return done(error);
      }
    }
  ));

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Export helper to check if user is authenticated (for both Replit and local auth)
export function isAuthenticatedLocal(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}
