import axios from "axios";

/**
 * TON (Telegram Open Network) Cryptocurrency Payment Service
 * 
 * TON is a decentralized blockchain designed by Telegram for fast transactions
 * and integration with Telegram apps. It's ideal for global micropayments.
 * 
 * Documentation: https://ton.org/docs/
 * API Reference: https://tonapi.io/docs
 */

const TON_API_KEY = process.env.TON_API_KEY;
const TON_WALLET_ADDRESS = process.env.TON_WALLET_ADDRESS; // Platform's TON wallet
const TON_TESTNET = process.env.TON_TESTNET === "true";

// TON API endpoint
const TON_API_URL = TON_TESTNET 
  ? "https://testnet.tonapi.io/v2" 
  : "https://tonapi.io/v2";

interface TONPaymentRequest {
  amount: number; // Amount in TON
  description: string;
  userId: string;
  orderId: string;
}

interface TONPaymentResponse {
  success: boolean;
  paymentAddress: string; // Wallet address to send payment to
  amount: number;
  amountNano: string; // Amount in nanoTON (1 TON = 1e9 nanoTON)
  memo?: string;
  expiresAt: Date;
}

interface TONTransactionStatus {
  status: "pending" | "confirmed" | "failed" | "expired";
  transactionHash?: string;
  confirmations?: number;
  amount?: number;
}

/**
 * Convert USD to TON using current exchange rate
 */
export async function convertUsdToTon(usdAmount: number): Promise<number> {
  try {
    // Get current TON price from TON API
    const response = await axios.get("https://tonapi.io/v2/rates?tokens=ton&currencies=usd", {
      headers: TON_API_KEY ? { "Authorization": `Bearer ${TON_API_KEY}` } : {},
    });

    const tonPrice = response.data.rates?.TON?.prices?.USD;
    if (!tonPrice) {
      throw new Error("Failed to get TON price");
    }

    return usdAmount / tonPrice;
  } catch (error) {
    console.error("Error fetching TON price:", error);
    // Fallback to approximate rate if API fails
    return usdAmount / 5.0; // Approximate: $5 per TON
  }
}

/**
 * Create a TON payment request
 * Generates a payment address and memo for user to send TON to
 */
export async function createTonPayment(request: TONPaymentRequest): Promise<TONPaymentResponse> {
  try {
    if (!TON_WALLET_ADDRESS) {
      throw new Error("TON_WALLET_ADDRESS not configured");
    }

    // Convert TON to nanoTON (1 TON = 1,000,000,000 nanoTON)
    const amountNano = Math.floor(request.amount * 1e9).toString();

    // Generate unique memo for tracking (uses orderId)
    const memo = `PROFITHACK-${request.orderId}`;

    // Payment expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return {
      success: true,
      paymentAddress: TON_WALLET_ADDRESS,
      amount: request.amount,
      amountNano,
      memo,
      expiresAt,
    };
  } catch (error) {
    console.error("Error creating TON payment:", error);
    throw error;
  }
}

/**
 * Check if a TON payment has been received
 * Monitors incoming transactions to the platform wallet
 */
export async function checkTonPaymentStatus(
  paymentAddress: string,
  expectedAmount: number,
  memo: string
): Promise<TONTransactionStatus> {
  try {
    if (!TON_API_KEY) {
      console.warn("TON_API_KEY not set - payment verification limited");
    }

    // Get recent transactions for the wallet
    const response = await axios.get(
      `${TON_API_URL}/blockchain/accounts/${paymentAddress}/transactions`,
      {
        headers: TON_API_KEY ? { "Authorization": `Bearer ${TON_API_KEY}` } : {},
        params: {
          limit: 20, // Check last 20 transactions
        },
      }
    );

    const transactions = response.data.transactions || [];
    const expectedAmountNano = Math.floor(expectedAmount * 1e9);

    // Look for transaction matching amount and memo
    for (const tx of transactions) {
      // Check if transaction is incoming
      if (tx.in_msg?.value) {
        const receivedAmount = parseInt(tx.in_msg.value);
        const txMemo = tx.in_msg?.message || "";

        // Check if amount matches (within 1% tolerance for fees)
        const amountMatch = Math.abs(receivedAmount - expectedAmountNano) < (expectedAmountNano * 0.01);

        // Check if memo matches
        const memoMatch = txMemo.includes(memo);

        if (amountMatch && memoMatch) {
          return {
            status: "confirmed",
            transactionHash: tx.hash,
            confirmations: tx.lt ? 1 : 0, // TON uses logical time, not block confirmations
            amount: receivedAmount / 1e9,
          };
        }
      }
    }

    // No matching transaction found
    return {
      status: "pending",
    };
  } catch (error) {
    console.error("Error checking TON payment status:", error);
    return {
      status: "failed",
    };
  }
}

/**
 * Send TON to a user's wallet (for payouts)
 */
export async function sendTonPayout(
  recipientAddress: string,
  amount: number,
  description: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    // NOTE: This requires TON wallet private key for signing
    // For security, this should use a secure wallet service or HSM
    // This is a placeholder - integrate with TONKeeper, TON Wallet, or similar
    
    console.warn("TON payout requested but not implemented - requires secure wallet integration");
    console.log({
      recipientAddress,
      amount,
      description,
    });

    return {
      success: false,
      error: "TON payouts require manual processing. Please contact support.",
    };
  } catch (error) {
    console.error("Error sending TON payout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get TON wallet balance
 */
export async function getTonWalletBalance(): Promise<number> {
  try {
    if (!TON_WALLET_ADDRESS) {
      return 0;
    }

    const response = await axios.get(
      `${TON_API_URL}/blockchain/accounts/${TON_WALLET_ADDRESS}`,
      {
        headers: TON_API_KEY ? { "Authorization": `Bearer ${TON_API_KEY}` } : {},
      }
    );

    const balanceNano = response.data.balance || 0;
    return balanceNano / 1e9; // Convert nanoTON to TON
  } catch (error) {
    console.error("Error fetching TON wallet balance:", error);
    return 0;
  }
}

/**
 * Validate TON wallet address format
 */
export function isValidTonAddress(address: string): boolean {
  // TON addresses are 48 characters (base64url encoded)
  // Format: EQ... or UQ... (48 chars total)
  const tonAddressRegex = /^(EQ|UQ)[A-Za-z0-9_-]{46}$/;
  return tonAddressRegex.test(address);
}

export const tonPaymentService = {
  convertUsdToTon,
  createTonPayment,
  checkTonPaymentStatus,
  sendTonPayout,
  getTonWalletBalance,
  isValidTonAddress,
};
