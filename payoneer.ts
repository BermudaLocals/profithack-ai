import type { Request, Response } from "express";

interface PayoneerConfig {
  merchantCode: string;
  paymentToken: string;
  baseUrl: string;
}

function getPayoneerConfig(): PayoneerConfig | null {
  const merchantCode = process.env.PAYONEER_MERCHANT_CODE;
  const paymentToken = process.env.PAYONEER_PAYMENT_TOKEN;

  if (!merchantCode || !paymentToken) {
    return null;
  }

  return {
    merchantCode,
    paymentToken,
    baseUrl:
      process.env.NODE_ENV === "production"
        ? "https://api.payoneer.com"
        : "https://api.sandbox.payoneer.com",
  };
}

export function isPayoneerConfigured(): boolean {
  return getPayoneerConfig() !== null;
}

export async function createPayoneerSession(
  amount: number,
  currency: string,
  transactionId: string,
  userEmail: string,
  returnUrl: string,
  cancelUrl: string,
  notificationUrl: string
): Promise<{ sessionUrl: string; sessionId: string }> {
  const config = getPayoneerConfig();
  if (!config) {
    throw new Error("Payoneer not configured");
  }

  const credentials = Buffer.from(
    `${config.merchantCode}:${config.paymentToken}`
  ).toString("base64");

  const payload = {
    transactionId,
    country: "US",
    customer: {
      email: userEmail,
    },
    payment: {
      amount,
      currency,
      reference: `CreatorVerse ${transactionId}`,
    },
    style: {
      language: "en",
    },
    callback: {
      returnUrl,
      cancelUrl,
      notificationUrl,
    },
  };

  const response = await fetch(`${config.baseUrl}/lists`, {
    method: "POST",
    headers: {
      "Content-Type":
        "application/vnd.optile.payment.enterprise-v1-extensible+json",
      Accept: "application/vnd.optile.payment.enterprise-v1-extensible+json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payoneer API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return {
    sessionUrl: data.links.redirect || data.listUrl,
    sessionId: data.identification.longId,
  };
}

export async function getPayoneerPaymentStatus(
  sessionId: string
): Promise<{
  status: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
}> {
  const config = getPayoneerConfig();
  if (!config) {
    throw new Error("Payoneer not configured");
  }

  const credentials = Buffer.from(
    `${config.merchantCode}:${config.paymentToken}`
  ).toString("base64");

  const response = await fetch(`${config.baseUrl}/lists/${sessionId}`, {
    method: "GET",
    headers: {
      Accept: "application/vnd.optile.payment.enterprise-v1-extensible+json",
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payoneer API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return {
    status: data.statusCode,
    amount: data.payment?.amount,
    currency: data.payment?.currency,
    paymentMethod: data.paymentMethod,
  };
}

export function verifyPayoneerWebhook(
  notification: any
): {
  isValid: boolean;
  transactionId?: string;
  status?: string;
  amount?: number;
  currency?: string;
} {
  if (!notification || typeof notification !== "object") {
    return { isValid: false };
  }

  return {
    isValid: true,
    transactionId: notification.transactionId,
    status: notification.statusCode,
    amount: notification.amount,
    currency: notification.currency,
  };
}
