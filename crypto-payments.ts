/**
 * Crypto Payments Integration (NOWPayments)
 * Supports: Bitcoin (BTC), Ethereum (ETH), USDT (TON & ERC-20), USDC
 * For global accessibility including Bermuda
 */

interface NOWPaymentsInvoice {
  id: string;
  token_id: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  pay_currency: string;
  pay_amount: number;
  payment_status: string;
  pay_address: string;
  created_at: string;
  updated_at: string;
  invoice_url: string;
}

interface NOWPaymentsPayment {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  created_at: string;
  updated_at: string;
}

export class CryptoPaymentService {
  private apiKey: string;
  private ipnSecret: string;
  private apiUrl: string;
  // Kraken wallet addresses
  private wallets = {
    BTC: "35erMqm9NG9NCRrMcr5zrhYUSAVL2pw3G4",
    ETH: "0xcd3122a454ae06a596e651957fed8119c7edec20",
    USDT_TON: "TDLDscJDDLeoDVLtGgmsFSURJu3C5MMLdy",
    USDT_ERC20: "0xcd3122a454ae06a596e651957fed8119c7edec20",
    USDC: "0xcd3122a454ae06a596e651957fed8119c7edec20",
  };

  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY || "";
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || "";
    this.apiUrl = "https://api.nowpayments.io/v1";
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.ipnSecret;
  }

  async createInvoice(params: {
    amountUSD: number;
    userId: string;
    callbackUrl: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<NOWPaymentsInvoice> {
    if (!this.isConfigured()) {
      throw new Error("NOWPayments API key not configured");
    }

    const credits = params.amountUSD * 41; // $1 = 41 credits (23% markup applied)

    const invoiceParams = {
      price_amount: params.amountUSD,
      price_currency: "usd",
      order_id: `user_${params.userId}_${Date.now()}`,
      order_description: `Buy ${credits} Credits - PROFITHACK AI`,
      ipn_callback_url: params.callbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    };

    const response = await fetch(`${this.apiUrl}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(invoiceParams),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NOWPayments API error: ${error}`);
    }

    return await response.json();
  }

  async getPaymentStatus(paymentId: string): Promise<NOWPaymentsPayment> {
    if (!this.isConfigured()) {
      throw new Error("NOWPayments API key not configured");
    }

    const response = await fetch(`${this.apiUrl}/payment/${paymentId}`, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NOWPayments API error: ${error}`);
    }

    return await response.json();
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.ipnSecret) return false;
    
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', this.ipnSecret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    
    return calculatedSignature === signature;
  }

  async processWebhook(data: any, signature: string): Promise<{
    userId: string;
    credits: number;
    paymentId: string;
    status: string;
  }> {
    // SECURITY: Verify webhook signature
    const payload = JSON.stringify(data);
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error("Invalid webhook signature - potential fraud attempt");
    }

    // SECURITY: Always re-fetch payment from NOWPayments API
    // Never trust webhook payload directly - prevents fraud
    const payment = await this.getPaymentStatus(data.payment_id);

    if (payment.payment_status !== "finished") {
      throw new Error(`Payment not finished. Status: ${payment.payment_status}`);
    }

    // Double-check payment ID matches webhook data
    if (payment.payment_id.toString() !== data.payment_id.toString()) {
      throw new Error("Payment ID mismatch - potential fraud attempt");
    }

    const amountUSD = parseFloat(payment.price_amount.toString());
    const credits = Math.floor(amountUSD * 41); // $1 = 41 credits (23% markup applied)
    
    // Extract user ID from order_id (format: user_{userId}_{timestamp})
    const orderIdParts = payment.order_id.split('_');
    const userId = orderIdParts[1];

    if (!userId) {
      throw new Error("Invalid order - missing user ID");
    }

    return {
      userId,
      credits,
      paymentId: payment.payment_id.toString(),
      status: payment.payment_status,
    };
  }

  getWalletAddresses() {
    return this.wallets;
  }
}

export const cryptoPaymentService = new CryptoPaymentService();

export function isCryptoPaymentsConfigured(): boolean {
  return cryptoPaymentService.isConfigured();
}
