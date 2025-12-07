import { Request, Response } from "express";
import crypto from "crypto";

/* MTN Mobile Money (MoMo) Integration for African Markets */

const {
  MTN_MOMO_SUBSCRIPTION_KEY,
  MTN_MOMO_USER_ID,
  MTN_MOMO_API_KEY,
  MTN_MOMO_TARGET_ENV = "sandbox", // sandbox or production
} = process.env;

const MOMO_BASE_URL =
  MTN_MOMO_TARGET_ENV === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

// Check if MTN MoMo is configured
export function isMomoConfigured(): boolean {
  return !!(
    MTN_MOMO_SUBSCRIPTION_KEY &&
    MTN_MOMO_USER_ID &&
    MTN_MOMO_API_KEY
  );
}

if (!isMomoConfigured()) {
  console.warn(
    "MTN MoMo not configured - set MTN_MOMO_SUBSCRIPTION_KEY, MTN_MOMO_USER_ID, and MTN_MOMO_API_KEY"
  );
}

// Generate unique reference ID for transactions
function generateReferenceId(): string {
  return crypto.randomUUID();
}

// Get access token for API calls
async function getMomoAccessToken(): Promise<string> {
  if (!isMomoConfigured()) {
    throw new Error("MTN MoMo not configured");
  }

  const credentials = Buffer.from(
    `${MTN_MOMO_USER_ID}:${MTN_MOMO_API_KEY}`
  ).toString("base64");

  const response = await fetch(`${MOMO_BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": MTN_MOMO_SUBSCRIPTION_KEY!,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get MoMo access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Request payment from customer (Collections API)
export async function createMomoPayment(
  amount: string,
  currency: string,
  externalId: string,
  phoneNumber: string,
  payerMessage: string,
  payeeNote: string
): Promise<{ referenceId: string; status: string }> {
  if (!isMomoConfigured()) {
    throw new Error("MTN MoMo not configured");
  }

  const referenceId = generateReferenceId();
  const accessToken = await getMomoAccessToken();

  // Note: Sandbox uses EUR, production uses country-specific currencies
  const requestCurrency = MTN_MOMO_TARGET_ENV === "sandbox" ? "EUR" : currency;

  const payload = {
    amount,
    currency: requestCurrency,
    externalId,
    payer: {
      partyIdType: "MSISDN",
      partyId: phoneNumber, // Customer's MTN mobile number
    },
    payerMessage,
    payeeNote,
  };

  const response = await fetch(
    `${MOMO_BASE_URL}/collection/v1_0/requesttopay`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": MTN_MOMO_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MTN_MOMO_SUBSCRIPTION_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create MoMo payment: ${error}`);
  }

  // 202 Accepted means request was submitted
  return {
    referenceId,
    status: "PENDING",
  };
}

// Check payment status
export async function getMomoPaymentStatus(
  referenceId: string
): Promise<{
  status: string;
  amount: string;
  currency: string;
  externalId: string;
  financialTransactionId?: string;
  reason?: string;
}> {
  if (!isMomoConfigured()) {
    throw new Error("MTN MoMo not configured");
  }

  const accessToken = await getMomoAccessToken();

  const response = await fetch(
    `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Target-Environment": MTN_MOMO_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MTN_MOMO_SUBSCRIPTION_KEY!,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get MoMo payment status: ${error}`);
  }

  const data = await response.json();

  return {
    status: data.status, // PENDING, SUCCESSFUL, FAILED
    amount: data.amount,
    currency: data.currency,
    externalId: data.externalId,
    financialTransactionId: data.financialTransactionId,
    reason: data.reason, // If failed
  };
}

// Get account balance (useful for admin monitoring)
export async function getMomoAccountBalance(): Promise<{
  availableBalance: string;
  currency: string;
}> {
  if (!isMomoConfigured()) {
    throw new Error("MTN MoMo not configured");
  }

  const accessToken = await getMomoAccessToken();

  const response = await fetch(
    `${MOMO_BASE_URL}/collection/v1_0/account/balance`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Target-Environment": MTN_MOMO_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MTN_MOMO_SUBSCRIPTION_KEY!,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get MoMo account balance: ${error}`);
  }

  const data = await response.json();

  return {
    availableBalance: data.availableBalance,
    currency: data.currency,
  };
}

// Validate phone number format
export function validateMTNPhoneNumber(phoneNumber: string): boolean {
  // Remove spaces, dashes, and plus signs
  const cleaned = phoneNumber.replace(/[\s\-+]/g, "");

  // MTN numbers are typically country code + 9-10 digits
  // Examples: 256712345678 (Uganda), 233244567890 (Ghana)
  return /^[0-9]{10,15}$/.test(cleaned);
}

// Get supported currencies by country (production only)
export function getMomoCurrency(countryCode: string): string {
  const currencyMap: { [key: string]: string } = {
    UG: "UGX", // Uganda
    GH: "GHS", // Ghana
    ZM: "ZMW", // Zambia
    CM: "XAF", // Cameroon
    RW: "RWF", // Rwanda
    CI: "XOF", // Ivory Coast
    ZA: "ZAR", // South Africa
    BJ: "XOF", // Benin
    GN: "GNF", // Guinea
    SZ: "SZL", // Eswatini
    CG: "XAF", // Congo
    LR: "LRD", // Liberia
  };

  return currencyMap[countryCode] || "EUR"; // Default to EUR for sandbox
}

// Express route handler for creating MoMo payment
export async function handleMomoPaymentCreation(req: Request, res: Response) {
  try {
    if (!isMomoConfigured()) {
      return res.status(503).json({
        error: "MTN Mobile Money not configured",
      });
    }

    const { amount, currency, orderId, phoneNumber, description } = req.body;

    // Validate inputs
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    if (!phoneNumber || !validateMTNPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        error: "Invalid MTN phone number format",
      });
    }

    // Create payment request
    const result = await createMomoPayment(
      amount,
      currency || "EUR",
      orderId || `order_${Date.now()}`,
      phoneNumber,
      description || "Payment to PROFITHACK AI",
      "Thank you for your purchase"
    );

    res.json({
      referenceId: result.referenceId,
      status: result.status,
      message: "Payment initiated. Customer will receive USSD prompt on their phone.",
    });
  } catch (error: any) {
    console.error("MoMo payment creation error:", error);
    res.status(500).json({
      error: error.message || "Failed to create payment",
    });
  }
}

// Express route handler for checking payment status
export async function handleMomoPaymentStatus(req: Request, res: Response) {
  try {
    if (!isMomoConfigured()) {
      return res.status(503).json({
        error: "MTN Mobile Money not configured",
      });
    }

    const { referenceId } = req.params;

    if (!referenceId) {
      return res.status(400).json({
        error: "Reference ID required",
      });
    }

    const status = await getMomoPaymentStatus(referenceId);

    res.json(status);
  } catch (error: any) {
    console.error("MoMo payment status error:", error);
    res.status(500).json({
      error: error.message || "Failed to get payment status",
    });
  }
}
