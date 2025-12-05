import { SquareClient, SquareError, Square } from "square";

const accessToken = process.env.SQUARE_ACCESS_TOKEN;
const locationId = process.env.SQUARE_LOCATION_ID;

// Initialize Square client
const getClient = () => {
  if (!accessToken) {
    throw new Error("SQUARE_ACCESS_TOKEN not configured");
  }

  return new SquareClient({
    token: accessToken,
    environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  });
};

export const isSquareConfigured = (): boolean => {
  return !!(accessToken && locationId);
};

interface CreateSquarePaymentParams {
  sourceId: string; // Payment token from Square Web Payments SDK
  amount: number; // Amount in cents
  currency?: string;
  idempotencyKey: string;
  note?: string;
  customerId?: string;
}

export async function createSquarePayment(params: CreateSquarePaymentParams) {
  const client = getClient();
  
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID not configured");
  }

  const requestBody: Square.CreatePaymentRequest = {
    sourceId: params.sourceId,
    idempotencyKey: params.idempotencyKey,
    amountMoney: {
      amount: BigInt(params.amount),
      currency: (params.currency || "USD") as Square.Currency,
    },
    locationId,
    autocomplete: true, // Auto-complete the payment
  };

  if (params.note) {
    requestBody.note = params.note;
  }

  if (params.customerId) {
    requestBody.customerId = params.customerId;
  }

  try {
    const response = await client.payments.create(requestBody);
    
    if (response.payment) {
      return response.payment;
    }

    throw new Error("Payment creation failed - no payment returned");
  } catch (error) {
    if (error instanceof SquareError) {
      const body = error.body as any;
      const errorMessages = body?.errors?.map((e: any) => e.detail).join(", ") || error.message;
      throw new Error(`Square payment failed: ${errorMessages}`);
    }
    throw error;
  }
}

interface SquareSubscriptionParams {
  sourceId: string;
  tier: "creator" | "innovator";
  userId: number;
  userEmail?: string;
}

export async function handleSquareSubscription(params: SquareSubscriptionParams) {
  const { sourceId, tier, userId } = params;

  // Determine amount based on tier
  const amount = tier === "creator" ? 2900 : 9900; // $29 or $99 in cents
  const credits = tier === "creator" ? 1000 : 5000;

  // Create payment
  const payment = await createSquarePayment({
    sourceId,
    amount,
    currency: "USD",
    idempotencyKey: `square-sub-${userId}-${tier}-${Date.now()}`,
    note: `PROFITHACK AI ${tier.toUpperCase()} subscription for user ${userId}`,
  });

  return {
    paymentId: payment.id,
    status: payment.status,
    amount,
    credits,
    tier,
  };
}

interface SquareCreditsParams {
  sourceId: string;
  amount: number; // Amount in USD
  userId: number;
}

export async function handleSquareCredits(params: SquareCreditsParams) {
  const { sourceId, amount, userId } = params;

  // Convert USD to cents and calculate credits - 23% markup applied (was $1=50, now $1=41)
  const amountInCents = amount * 100;
  const credits = amount * 41;

  // Create payment
  const payment = await createSquarePayment({
    sourceId,
    amount: amountInCents,
    currency: "USD",
    idempotencyKey: `square-credits-${userId}-${Date.now()}`,
    note: `PROFITHACK AI credit purchase: ${credits} credits for user ${userId}`,
  });

  return {
    paymentId: payment.id,
    status: payment.status,
    amount: amountInCents,
    credits,
  };
}

// Webhook signature verification using Square's helper
import { WebhooksHelper } from "square";

export async function verifySquareWebhook(
  requestBody: string,
  signatureHeader: string,
  notificationUrl: string
): Promise<boolean> {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  
  if (!signatureKey) {
    console.warn("SQUARE_WEBHOOK_SIGNATURE_KEY not configured");
    return process.env.NODE_ENV !== "production"; // Allow in dev/sandbox
  }

  try {
    return await WebhooksHelper.verifySignature({
      requestBody,
      signatureHeader,
      signatureKey,
      notificationUrl,
    });
  } catch (error) {
    console.error("Square webhook verification failed:", error);
    return false;
  }
}
