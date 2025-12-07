// invite_code_fixes.ts - Code to fix 5 critical invite code system problems in server/routes.ts

// NOTE: This is a conceptual file showing the necessary changes to your existing server/routes.ts.
// You will need to apply these changes to the correct lines in your actual file.

// ====================================================================
// FIX #1: Re-enable Invite-Only Registration (server/routes.ts:424)
// ====================================================================
// Change this:
// const isOpenRegistration = true; 
// To this:
const isOpenRegistration = false; // Set to false to re-enable invite-only registration

// ====================================================================
// FIX #3: Authentication Check Before Code Generation
// (To prevent Foreign Key Constraint Error)
// ====================================================================
// Assuming a route like: router.post('/generate-code', async (req, res) => { ... })

// Before generating codes, add this check:
if (!req.user || !req.user.id) {
  return res.status(401).json({ error: "Must be logged in to generate codes" });
}

// ... rest of the code generation logic

// ====================================================================
// FIX #2, #4, #5: Code Redemption Logic Fixes
// (Removing hardcoded bypass, adding pessimistic lock, preventing self-redemption)
// ====================================================================
// This block replaces the existing code redemption logic (around server/routes.ts:471)

// Start a database transaction to ensure atomicity and prevent race conditions
await db.transaction(async (tx) => {
  
  // 1. Pessimistic Lock (Fix #4: Race Condition)
  // Lock the row for update to prevent concurrent access
  const [codeToRedeem] = await tx.select().from(inviteCodes)
    .where(eq(inviteCodes.code, inviteCode))
    .forUpdate(); // <--- CRITICAL: Pessimistic lock added
    
  // Check if code exists
  if (!codeToRedeem) {
    throw new Error("Invalid invite code.");
  }

  // 2. Check if already used
  if (codeToRedeem.usedBy !== null) {
    throw new Error("Code already used.");
  }
  
  // 3. Remove Hardcoded Bypass (Fix #2: Security Hole)
  // The hardcoded FOUNDER2025 block is REMOVED entirely.
  // The logic now relies ONLY on the database-stored code.
  
  // 4. Prevent Self-Redemption (Fix #5: Self-Redemption)
  if (codeToRedeem.creatorId === req.user.id) {
    throw new Error("Cannot redeem your own invite code.");
  }

  // 5. Apply Redemption Logic
  // Mark the code as used by the current user
  await tx.update(inviteCodes)
    .set({ 
      usedBy: req.user.id, 
      usedAt: new Date() 
    })
    .where(eq(inviteCodes.code, inviteCode));

  // 6. Grant User Benefits (e.g., Innovator Tier, Credits)
  // This logic remains the same, but now only executes for valid, database-stored codes.
  // Example:
  // await tx.update(users)
  //   .set({ 
  //     tier: 'Innovator', 
  //     credits: sql`${users.credits} + 999999` 
  //   })
  //   .where(eq(users.id, req.user.id));

  // Commit the transaction
});

// Send success response
return res.status(200).json({ message: "Invite code redeemed successfully." });
