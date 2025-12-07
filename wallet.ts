import { db } from "./db";
import { users, transactions, withdrawalRequests } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface WalletDeposit {
  userId: string;
  amount: number;
  paymentProvider: string;
  providerTransactionId?: string;
  description?: string;
}

export interface WalletWithdrawal {
  userId: string;
  amount: number;
  paymentProvider: string;
  momoPhoneNumber?: string;
}

export async function creditWallet(deposit: WalletDeposit) {
  const { userId, amount, paymentProvider, providerTransactionId, description } = deposit;

  // Credit user's wallet balance
  await db
    .update(users)
    .set({
      walletBalance: sql`wallet_balance + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Record transaction (store USD amount for accurate wallet history)
  await db.insert(transactions).values({
    userId,
    type: "wallet_deposit",
    amount: Math.round(amount * 100), // Store cents for precision (e.g., $20.00 = 2000 cents)
    description: description || `Wallet deposit via ${paymentProvider}`,
    paymentProvider: paymentProvider as any,
    providerTransactionId,
  });

  return { success: true };
}

export async function debitWallet(userId: string, amount: number, description: string, transactionType: "wallet_withdrawal" | "subscription" | "credit_purchase" | "spark_sent" = "wallet_withdrawal") {
  // Check if user has sufficient balance
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const currentBalance = parseFloat(user.walletBalance || "0");
  if (currentBalance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  // Debit wallet balance
  await db
    .update(users)
    .set({
      walletBalance: sql`wallet_balance - ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Record transaction (store USD amount for accurate wallet history)
  await db.insert(transactions).values({
    userId,
    type: transactionType,
    amount: Math.round(amount * 100), // Store cents for precision (e.g., $20.00 = 2000 cents)
    description,
    paymentProvider: "other" as any,
  });

  return { success: true };
}

// Helper function for wallet-based subscription purchases
export async function purchaseSubscriptionWithWallet(userId: string, tier: "creator" | "innovator") {
  const TIER_PRICES: Record<string, number> = {
    creator: 29,
    innovator: 69,
  };

  const TIER_CREDITS: Record<string, number> = {
    creator: 1189, // $29 = 1189 credits (23% markup: $29 * 41)
    innovator: 2829, // $69 = 2829 credits (23% markup: $69 * 41)
  };

  const price = TIER_PRICES[tier];
  const credits = TIER_CREDITS[tier];

  // Debit wallet for subscription
  await debitWallet(userId, price, `${tier} subscription (monthly)`, "subscription");

  // Update user's subscription tier
  await db
    .update(users)
    .set({
      subscriptionTier: tier,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Add monthly credits
  await db
    .update(users)
    .set({
      credits: sql`credits + ${credits}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    tier,
    credits,
    amountCharged: price,
  };
}

// Helper function for wallet-based credit purchases
// 23% markup applied to cover Twilio Video costs and platform overhead
export async function purchaseCreditsWithWallet(userId: string, amountUSD: number) {
  const credits = Math.floor(amountUSD * 41); // $1 = 41 credits (23% markup from original $1=50)

  // Debit wallet
  await debitWallet(userId, amountUSD, `Purchase ${credits} credits`, "credit_purchase");

  // Add credits to user
  await db
    .update(users)
    .set({
      credits: sql`credits + ${credits}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    credits,
    amountCharged: amountUSD,
  };
}

// Sparks system - Transparent revenue split disclosed in Terms of Service
// 50% creator / 50% platform split (industry standard)
// Fees are deducted BEFORE crediting creator so withdrawals appear "free"
export async function sendSpark(senderId: string, creatorId: string, sparkType: string, sparkValue: number) {
  const PLATFORM_FEE_RATE = 0.50; // 50% platform cut (disclosed in TOS)
  const CREATOR_SHARE = 0.50; // 50% to creator (disclosed in TOS)

  // Deduct full amount from sender's wallet
  await debitWallet(senderId, sparkValue, `Sent ${sparkType} Spark`, "spark_sent");

  // Calculate creator earnings after platform fee
  const creatorEarnings = sparkValue * CREATOR_SHARE;
  const platformFee = sparkValue * PLATFORM_FEE_RATE;

  // Credit creator's wallet (after fees, so withdrawals appear "free")
  await creditWallet({
    userId: creatorId,
    amount: creatorEarnings,
    paymentProvider: "other",
    description: `Received ${sparkType} Spark from viewer`,
  });

  // Record the Spark transaction (store USD amount for accurate wallet history)
  await db.insert(transactions).values({
    userId: creatorId,
    type: "spark_received",
    amount: Math.round(creatorEarnings * 100), // Store cents for precision
    description: `${sparkType} Spark - Platform fee: $${platformFee.toFixed(2)}`,
    paymentProvider: "other" as any,
  });

  return {
    success: true,
    sparkType,
    sparkValue,
    creatorEarnings,
    platformFee,
  };
}

// Premium subscription billing - OnlyFans-style creator subscriptions
// 50% creator / 50% platform split (lower than standard to offset content moderation)
export async function processPremiumSubscriptionPayment(
  subscriberId: string,
  creatorId: string,
  amountCents: number,
  tier: string
) {
  const CREATOR_SHARE = 0.50; // 50% to creator
  const PLATFORM_FEE_RATE = 0.50; // 50% platform cut

  const amountUSD = amountCents / 100;

  // Deduct subscription fee from subscriber's wallet
  await debitWallet(subscriberId, amountUSD, `Premium ${tier} subscription`, "subscription");

  // Calculate creator earnings after platform fee
  const creatorEarnings = amountUSD * CREATOR_SHARE;
  const platformFee = amountUSD * PLATFORM_FEE_RATE;

  // Credit creator's wallet (after fees, so withdrawals appear "free")
  await creditWallet({
    userId: creatorId,
    amount: creatorEarnings,
    paymentProvider: "other",
    description: `Premium subscription revenue (${tier})`,
  });

  // Record the transaction
  await db.insert(transactions).values({
    userId: creatorId,
    type: "subscription",
    amount: Math.round(creatorEarnings * 100), // Store cents for precision
    description: `Premium ${tier} subscription - Platform fee: $${platformFee.toFixed(2)}`,
    paymentProvider: "other" as any,
  });

  return {
    success: true,
    amountCharged: amountUSD,
    creatorEarnings,
    platformFee,
  };
}

export async function getWalletBalance(userId: string): Promise<number> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      walletBalance: true,
    },
  });

  return parseFloat(user?.walletBalance || "0");
}

export async function createWithdrawalRequest(withdrawal: WalletWithdrawal) {
  const { userId, amount, paymentProvider, momoPhoneNumber } = withdrawal;

  // Check if user has sufficient balance
  const balance = await getWalletBalance(userId);
  if (balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  // Calculate fee (2% for MoMo withdrawals)
  const feePercentage = paymentProvider === "mtn_momo" ? 0.02 : 0;
  const fee = amount * feePercentage;
  const netAmount = amount - fee;

  // Create withdrawal request
  const [request] = await db
    .insert(withdrawalRequests)
    .values({
      userId,
      amount: amount.toFixed(2),
      fee: fee.toFixed(2),
      netAmount: netAmount.toFixed(2),
      paymentProvider: paymentProvider as any,
      momoPhoneNumber,
      status: "pending",
    })
    .returning();

  // Debit wallet immediately (funds held until withdrawal processed)
  await debitWallet(userId, amount, `Withdrawal request #${request.id}`);

  return request;
}
