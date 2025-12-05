# CreatorVerse Payment Providers

CreatorVerse supports **GLOBAL payments** through multiple providers to ensure users from any country can participate in the platform economy.

## Current Payment Providers

### 1. ✅ Payoneer (PRIMARY - Installed)
**Regions:** Global (200+ countries)
**Methods:** Credit/Debit cards, Local payment methods (iDEAL, Bancontact, etc.)
**Features:**
- Global payment acceptance
- Multi-currency support (150+ currencies)
- Supports Apple Pay, Google Pay, PayPal
- Hosted checkout pages (no PCI compliance burden)
- Fraud prevention built-in

**Setup Required:**
1. Sign up at: https://www.payoneer.com/checkout/
2. Get your **Merchant Code** and **Payment Token** from merchant portal
3. Add environment variables:
   - `PAYONEER_MERCHANT_CODE` - Your merchant store ID
   - `PAYONEER_PAYMENT_TOKEN` - API authentication token
4. Configure for sandbox testing or production

**Testing:**
- Use Sandbox credentials: https://api.sandbox.payoneer.com
- Test cards:
  - Visa Success: `4111 1111 1111 1111`
  - Visa Decline: `4000 0000 0000 0002`
  - Mastercard: `5555 5555 5555 4444`

**Integration Details:**
- API Endpoint: `https://api.payoneer.com/lists` (production)
- Authentication: HTTP Basic Auth (base64 encoded merchant code:token)
- Flow: Create session → Redirect to checkout → Webhook notification → Verify payment
- Routes: `/api/payoneer/init-checkout`, `/api/payoneer/webhook`, `/api/payoneer/verify-payment`

**Documentation:** https://checkoutdocs.payoneer.com/

---

### 2. ✅ Payeer (PRIMARY - Installed)
**Regions:** Global (200+ countries)
**Methods:** E-wallet, Credit/Debit cards, Cryptocurrency (BTC, ETH), Bank transfers
**Features:**
- E-wallet payment system
- Supports multiple cryptocurrencies
- Low transaction fees
- No chargebacks for crypto payments
- Popular in CIS countries and globally

**Setup Required:**
1. Create Payeer account at: https://payeer.com
2. Apply for merchant account at: https://merchant.payeer.com
3. Add environment variables:
   - `PAYEER_MERCHANT_ID` - Your merchant shop ID
   - `PAYEER_SECRET_KEY` - 32-character secret key for signatures
   - `PAYEER_API_ID` - API user ID
   - `PAYEER_API_PASS` - API password
   - `PAYEER_ACCOUNT_NUMBER` - Your Payeer account (e.g., P1000000)

**Testing:**
- Use sandbox/test merchant account
- Configure success/fail URLs in merchant settings
- Test with small amounts first

**Integration Details:**
- API Endpoint: `https://payeer.com/ajax/api/api.php`
- Payment Form: `https://payeer.com/merchant/`
- Authentication: SHA256 signature verification
- Flow: Create invoice → Redirect to payment page → Callback verification → Record transaction
- Routes: `/api/payeer/init-checkout`, `/api/payeer/callback`, `/api/payeer/verify-payment`

**Documentation:** https://github.com/payeer/docs

---

### 3. ✅ Stripe (Installed)
**Regions:** Global (200+ countries)
**Methods:** Credit/Debit cards, Crypto (Bitcoin, ETH, USDC)
**Features:** 
- Subscription billing
- Credit card payments
- **Crypto payments** (enable in Stripe Dashboard → Settings → Payment Methods)
- One-click checkout

**Setup:** Already configured with `STRIPE_SECRET_KEY`

---

### 2. ✅ PayPal (Installed)
**Regions:** Global (200+ countries)
**Methods:** PayPal balance, Credit/Debit cards linked to PayPal
**Features:**
- One-time payments
- Trusted brand recognition
- Buyer protection

**Setup:** Requires `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- Get credentials at: https://developer.paypal.com/dashboard/
- Use Sandbox credentials for testing
- Use Production credentials for live payments

**Usage:**
```typescript
import PayPalButton from "@/components/PayPalButton";

<PayPalButton 
  amount="29.00" 
  currency="USD" 
  intent="CAPTURE" 
/>
```

---

### 3. 🔧 MTN Mobile Money (MoMo) - Implementation Ready
**Regions:** 17 African countries (Ghana, Uganda, Rwanda, Zambia, etc.)
**Methods:** Mobile money wallet
**Features:**
- No bank account required
- Mobile-first payment
- Used by 60M+ users across Africa

**Setup Required:**
1. Register at https://momodeveloper.mtn.com/
2. Subscribe to Collections product
3. Get API credentials: `MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_USER_ID`, `MTN_MOMO_API_KEY`

**Implementation Code:**

```typescript
// server/mtn-momo.ts
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const MTN_MOMO_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://momodeveloper.mtn.com'
    : 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
  apiUserId: process.env.MTN_MOMO_USER_ID,
  apiKey: process.env.MTN_MOMO_API_KEY,
};

// Get OAuth token
export async function getMomoToken(): Promise<string> {
  const credentials = Buffer.from(
    `${MTN_MOMO_CONFIG.apiUserId}:${MTN_MOMO_CONFIG.apiKey}`
  ).toString('base64');

  const response = await fetch(
    `${MTN_MOMO_CONFIG.baseUrl}/collection/token/`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': MTN_MOMO_CONFIG.subscriptionKey!,
        'Authorization': `Basic ${credentials}`,
      },
    }
  );

  const data = await response.json();
  return data.access_token;
}

// Request payment from customer
export async function requestMomoPayment(
  phoneNumber: string,
  amount: number,
  currency: string = 'GHS' // Ghana Cedis
): Promise<{ referenceId: string }> {
  const token = await getMomoToken();
  const referenceId = uuidv4();

  const response = await fetch(
    `${MTN_MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        'Ocp-Apim-Subscription-Key': MTN_MOMO_CONFIG.subscriptionKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency,
        externalId: uuidv4(),
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber, // Format: 233XXXXXXXXX (Ghana)
        },
        payerMessage: 'CreatorVerse payment',
        payeeNote: 'Thank you for your purchase',
      }),
    }
  );

  if (response.status !== 202) {
    throw new Error('Failed to initiate MoMo payment');
  }

  return { referenceId };
}

// Check payment status
export async function checkMomoPaymentStatus(
  referenceId: string
): Promise<{ status: string; amount?: string; currency?: string }> {
  const token = await getMomoToken();

  const response = await fetch(
    `${MTN_MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        'Ocp-Apim-Subscription-Key': MTN_MOMO_CONFIG.subscriptionKey!,
      },
    }
  );

  return await response.json();
}
```

**Routes to Add:**
```typescript
// server/routes.ts
app.post("/api/momo/request-payment", isAuthenticated, async (req: any, res) => {
  const { phoneNumber, amount, currency } = req.body;
  const { referenceId } = await requestMomoPayment(phoneNumber, amount, currency);
  res.json({ referenceId });
});

app.get("/api/momo/status/:referenceId", isAuthenticated, async (req, res) => {
  const status = await checkMomoPaymentStatus(req.params.referenceId);
  res.json(status);
});
```

---

### 4. 📋 Crypto (via Stripe or Dedicated Providers)

**Option A: Stripe Crypto (Easiest)**
- Enable in Stripe Dashboard → Settings → Payment Methods
- Supports BTC, ETH, USDC, USDT
- No additional integration needed

**Option B: Coinbase Commerce**
- Website: https://commerce.coinbase.com/
- Accepts BTC, ETH, LTC, BCH, USDC, DAI
- No KYC required for merchants

**Option C: BTCPay Server (Self-hosted)**
- Open-source, self-hosted payment processor
- No fees, direct to wallet
- Complete sovereignty

---

### 5. 📋 WorldRemit (Future)
**Regions:** 150+ countries
**Methods:** Bank transfer, Mobile money, Cash pickup
**Status:** Requires business partnership application
**Website:** https://www.worldremit.com/en/business

---

### 6. 📋 Other Providers

**Regional Providers to Consider:**
- **Flutterwave** (Africa): Ghana, Nigeria, Kenya, etc.
- **Paystack** (Africa): Nigeria, Ghana, South Africa
- **Razorpay** (India): UPI, Cards, Net Banking
- **Mercado Pago** (Latin America): Argentina, Brazil, Mexico
- **Alipay/WeChat Pay** (China)
- **GCash** (Philippines)
- **M-Pesa** (Kenya, Tanzania)

---

## Payment Provider Architecture

### Database Schema
The `transactions` table tracks all payment providers:

```typescript
{
  paymentProvider: 'stripe' | 'paypal' | 'mtn_momo' | 'crypto' | 'worldremit' | 'other',
  providerTransactionId: string, // Provider's transaction ID
  providerMetadata: jsonb, // Provider-specific data
}
```

### Adding a New Provider

1. **Create Provider Service** (`server/new-provider.ts`)
   - Initialize provider SDK
   - Create payment/order function
   - Create capture/confirm function
   - Create status check function

2. **Add Routes** (`server/routes.ts`)
   ```typescript
   app.post("/api/new-provider/create-payment", isAuthenticated, handler);
   app.post("/api/new-provider/capture/:id", isAuthenticated, handler);
   app.get("/api/new-provider/status/:id", isAuthenticated, handler);
   ```

3. **Update UI** (`client/src/pages/wallet.tsx`)
   - Add provider button/option
   - Handle provider-specific flow
   - Show provider in transaction history

4. **Record Transaction**
   ```typescript
   await storage.createTransaction({
     userId,
     type: 'credit_purchase',
     amount: creditsEarned,
     paymentProvider: 'new_provider',
     providerTransactionId: payment.id,
     providerMetadata: { /* provider data */ },
   });
   ```

---

## Currency Considerations

Different providers support different currencies:

| Provider | Currencies |
|----------|-----------|
| Stripe | USD, EUR, GBP, 135+ currencies |
| PayPal | USD, EUR, GBP, 25+ currencies |
| MTN MoMo | GHS (Ghana), UGX (Uganda), RWF (Rwanda), ZMW (Zambia), etc. |
| Crypto | BTC, ETH, USDC (stable) |

**Recommendation:** Display prices in user's local currency but process payments in provider-supported currency with automatic conversion rates.

---

## Credit System Integration

All providers integrate with CreatorVerse's credit system:
- **1 credit = $0.01 USD**
- Subscription tiers grant monthly credits
- Users can purchase additional credits via any provider
- Gifts and services cost credits

**Provider Integration Example:**
```typescript
// After successful payment via any provider
const amountUSD = convertToUSD(amount, currency);
const creditsEarned = Math.floor(amountUSD * 100); // $29 = 2900 credits

await storage.updateUserCredits(userId, creditsEarned);
await storage.createTransaction({
  userId,
  type: 'credit_purchase',
  amount: creditsEarned,
  paymentProvider: provider,
  providerTransactionId: transactionId,
});
```

---

## Testing

### Stripe
- Use test mode keys
- Test cards: `4242 4242 4242 4242`

### PayPal
- Use Sandbox account
- Test with PayPal Sandbox email

### MTN MoMo
- Use Sandbox environment
- Test phone: `46733123450` (default sandbox number)
- Currency: EUR (sandbox only, production uses local currencies)

---

## Security Best Practices

1. **Never expose secrets** - All API keys in environment variables
2. **Validate webhooks** - Verify signatures from provider webhooks
3. **Use HTTPS** - All payment flows must use HTTPS in production
4. **PCI Compliance** - Never store card details (let providers handle it)
5. **Idempotency** - Use unique IDs to prevent duplicate charges
6. **Server-side verification** - Always verify payments server-side

---

## Next Steps

1. ✅ **Ask user for PayPal credentials** to enable PayPal payments
2. 📋 **Decide on MTN MoMo** - Priority for Ghana/Africa users?
3. 📋 **Enable Stripe Crypto** - One-click enable in dashboard
4. 📋 **Add provider selector** to wallet UI
5. 📋 **Implement webhook handlers** for payment confirmations
