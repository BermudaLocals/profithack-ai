/**
 * CREDIT SERVICE
 * 
 * This service manages the user credit system.
 * It handles checking, deducting, and resetting credits.
 */

import { db } from '../db'; // Assuming your db connection is in server/db.ts
import { users } from '../../shared/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

const FREE_USER_DAILY_CREDITS = 50;

/**
 * Checks if a user has enough credits to perform an action.
 * @param userId - The ID of the user.
 * @param cost - The number of credits required.
 * @returns True if the user has enough credits, false otherwise.
 */
export async function hasCredits(userId: number, cost: number): Promise<boolean> {
  const user = await db.select({ credits: users.credits }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) return false;
  return user[0].credits >= cost;
}

/**
 * Deducts a specified number of credits from a user's account.
 * This should only be called after checking if the user has enough credits.
 * @param userId - The ID of the user.
 * @param cost - The number of credits to deduct.
 */
export async function deductCredits(userId: number, cost: number): Promise<void> {
  await db.update(users).set({ credits: sql`${users.credits} - ${cost}` }).where(eq(users.id, userId));
}

/**
 * Resets the credits for a free user if they haven't been reset today.
 * This function should be called when a free user logs in or performs an action.
 * @param userId - The ID of the user.
 * @returns The new credit balance.
 */
export async function resetDailyCreditsIfNeeded(userId: number): Promise<number> {
  const user = await db.select({
    subscriptionTier: users.subscriptionTier,
    credits: users.credits,
    lastCreditReset: users.lastCreditReset,
  }).from(users).where(eq(users.id, userId)).limit(1);

  if (!user.length) {
    throw new Error('User not found');
  }

  const { subscriptionTier, credits, lastCreditReset } = user[0];

  // Only reset for free users
  if (subscriptionTier !== 'free') {
    return credits;
  }

  const now = new Date();
  const lastReset = new Date(lastCreditReset ?? 0);

  // Check if the last reset was before today
  if (lastReset.toDateString() !== now.toDateString()) {
    // Reset credits
    await db.update(users)
      .set({
        credits: FREE_USER_DAILY_CREDITS,
        lastCreditReset: now,
      })
      .where(eq(users.id, userId));
    return FREE_USER_DAILY_CREDITS;
  }

  return credits;
}

/**
 * Adds credits to a user's account.
 * Used for purchases or rewards.
 * @param userId - The ID of the user.
 * @param amount - The number of credits to add.
 */
export async function addCredits(userId: number, amount: number): Promise<void> {
  await db.update(users).set({ credits: sql`${users.credits} + ${amount}` }).where(eq(users.id, userId));
}
