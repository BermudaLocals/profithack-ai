// This is the users table definition.
// Find and replace your existing one with this.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  // --- EXISTING FIELDS (Keep all your other existing user fields here) ---
  // Example: createdAt: timestamp("created_at").defaultNow().notNull(),
  // Example: updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // --- NEW MONETIZATION & STATUS FIELDS ---
  subscriptionTier: text("subscription_tier").default("free").notNull(), // 'free', 'premium', 'business', 'founder'
  credits: integer("credits").default(50).notNull(), // Daily credits for free users
  lastCreditReset: timestamp("last_credit_reset").defaultNow(),
  affiliateStatus: text("affiliate_status").default("potential"), // 'potential', 'approved'
  agreedToLegalAt: timestamp("agreed_to_legal_at"), // Timestamp when user agreed to TOS/PP
});

// --- UPDATING EXISTING SELECTORS ---
// You will also need to update any existing type definitions or selectors to include these new fields.
// For example, if you have a `selectUser` function, make sure it includes the new fields.
