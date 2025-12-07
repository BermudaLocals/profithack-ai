import crypto from "crypto";

interface PayeerConfig {
  merchantId: string;
  secretKey: string;
  apiId: string;
  apiPass: string;
  accountNumber: string;
  baseUrl: string;
}

function getPayeerConfig(): PayeerConfig | null {
  const merchantId = process.env.PAYEER_MERCHANT_ID;
  const secretKey = process.env.PAYEER_SECRET_KEY;
  const apiId = process.env.PAYEER_API_ID;
  const apiPass = process.env.PAYEER_API_PASS;
  const accountNumber = process.env.PAYEER_ACCOUNT_NUMBER;

  if (!merchantId || !secretKey || !apiId || !apiPass || !accountNumber) {
    return null;
  }

  return {
    merchantId,
    secretKey,
    apiId,
    apiPass,
    accountNumber,
    baseUrl: "https://payeer.com/ajax/api/api.php",
  };
}

export function isPayeerConfigured(): boolean {
  return getPayeerConfig() !== null;
}

function generatePayeerSignature(params: {
  m_shop: string;
  m_orderid: string;
  m_amount: string;
  m_curr: string;
  m_desc: string;
  secretKey: string;
}): string {
  const { m_shop, m_orderid, m_amount, m_curr, m_desc, secretKey } = params;
  const signatureString = `${m_shop}:${m_orderid}:${m_amount}:${m_curr}:${m_desc}:${secretKey}`;
  return crypto.createHash("sha256").update(signatureString).digest("hex").toUpperCase();
}

export async function createPayeerInvoice(
  orderId: string,
  amount: number,
  currency: string,
  description: string
): Promise<{ invoiceUrl: string; orderId: string }> {
  const config = getPayeerConfig();
  if (!config) {
    throw new Error("Payeer not configured");
  }

  const descriptionBase64 = Buffer.from(description).toString("base64");
  const amountStr = amount.toFixed(2);

  const m_sign = generatePayeerSignature({
    m_shop: config.merchantId,
    m_orderid: orderId,
    m_amount: amountStr,
    m_curr: currency,
    m_desc: descriptionBase64,
    secretKey: config.secretKey,
  });

  const formParams = new URLSearchParams({
    account: config.accountNumber,
    apiId: config.apiId,
    apiPass: config.apiPass,
    action: "invoiceCreate",
    m_shop: config.merchantId,
    m_orderid: orderId,
    m_amount: amountStr,
    m_curr: currency,
    m_desc: descriptionBase64,
  });

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payeer API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.auth_error !== "0" || !data.success) {
    throw new Error(
      `Payeer invoice creation failed: ${JSON.stringify(data.errors || "Unknown error")}`
    );
  }

  return {
    invoiceUrl: data.url,
    orderId,
  };
}

export async function getPayeerPaymentStatus(
  merchantId: string,
  referenceId: string
): Promise<{
  status: string;
  amount?: number;
  currency?: string;
  description?: string;
}> {
  const config = getPayeerConfig();
  if (!config) {
    throw new Error("Payeer not configured");
  }

  const formParams = new URLSearchParams({
    account: config.accountNumber,
    apiId: config.apiId,
    apiPass: config.apiPass,
    action: "paymentDetails",
    merchantId,
    referenceId,
  });

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payeer API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.auth_error !== "0" || !data.success) {
    throw new Error(
      `Payeer payment details failed: ${JSON.stringify(data.errors || "Unknown error")}`
    );
  }

  const payment = data.items?.[0];

  if (!payment) {
    return { status: "not_found" };
  }

  return {
    status: payment.processed ? "success" : "pending",
    amount: parseFloat(payment.amount),
    currency: payment.currency,
    description: payment.description,
  };
}

export function verifyPayeerCallback(
  callbackData: any,
  secretKey: string
): {
  isValid: boolean;
  orderId?: string;
  status?: string;
  amount?: number;
  currency?: string;
} {
  if (!callbackData || typeof callbackData !== "object") {
    return { isValid: false };
  }

  const {
    m_operation_id,
    m_operation_ps,
    m_operation_date,
    m_operation_pay_date,
    m_shop,
    m_orderid,
    m_amount,
    m_curr,
    m_desc,
    m_status,
    m_sign,
  } = callbackData;

  const expectedSign = crypto
    .createHash("sha256")
    .update(
      `${m_operation_id}:${m_operation_ps}:${m_operation_date}:${m_operation_pay_date}:${m_shop}:${m_orderid}:${m_amount}:${m_curr}:${m_desc}:${m_status}:${secretKey}`
    )
    .digest("hex")
    .toUpperCase();

  if (m_sign !== expectedSign) {
    return { isValid: false };
  }

  return {
    isValid: true,
    orderId: m_orderid,
    status: m_status === "success" ? "success" : "failed",
    amount: parseFloat(m_amount),
    currency: m_curr,
  };
}

export function generatePayeerPaymentFormData(
  orderId: string,
  amount: number,
  currency: string,
  description: string
): {
  actionUrl: string;
  formData: Record<string, string>;
} {
  const config = getPayeerConfig();
  if (!config) {
    throw new Error("Payeer not configured");
  }

  const descriptionBase64 = Buffer.from(description).toString("base64");
  const amountStr = amount.toFixed(2);

  const m_sign = generatePayeerSignature({
    m_shop: config.merchantId,
    m_orderid: orderId,
    m_amount: amountStr,
    m_curr: currency,
    m_desc: descriptionBase64,
    secretKey: config.secretKey,
  });

  return {
    actionUrl: "https://payeer.com/merchant/",
    formData: {
      m_shop: config.merchantId,
      m_orderid: orderId,
      m_amount: amountStr,
      m_curr: currency,
      m_desc: descriptionBase64,
      m_sign,
    },
  };
}
