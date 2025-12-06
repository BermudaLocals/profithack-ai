# Cryptocurrency Payment Integration Guide

## Overview
PROFITHACK AI supports borderless cryptocurrency payments, critical for users in countries with limited traditional payment access (like Bermuda). This ensures **anyone, anywhere** can participate in the creator economy.

## Supported Cryptocurrencies

### Primary Coins
- **Bitcoin (BTC)** - Most widely adopted
- **Ethereum (ETH)** - Smart contract support
- **USDT (Tether)** - Stable coin (1 USDT = $1 USD)
- **USDC (USD Coin)** - Stable coin (1 USDC = $1 USD)

### Why Stablecoins?
- **No volatility** - $1 stays $1
- **Instant conversion** - Direct credit allocation
- **User-friendly** - Easy to understand pricing

## Recommended Payment Providers

### Option 1: **CoinGate** (Recommended for Bermuda)
**Why CoinGate:**
- ✅ Supports 70+ cryptocurrencies
- ✅ Automatic conversion to USD
- ✅ No geographic restrictions
- ✅ Low fees (1% + blockchain fees)
- ✅ Instant payment verification

**Setup:**
```bash
# Environment variables needed
COINGATE_API_KEY=your_api_key
COINGATE_APP_ID=your_app_id
COINGATE_API_SECRET=your_secret
```

**Flow:**
1. User clicks "Buy Credits with Crypto"
2. Selects amount ($1, $10, $50, $100)
3. Redirected to CoinGate payment page
4. Chooses BTC/ETH/USDT/USDC
5. Sends payment from wallet
6. CoinGate verifies payment
7. Webhook confirms → Credits added instantly

---

### Option 2: **Coinbase Commerce**
**Why Coinbase:**
- ✅ Trusted brand
- ✅ Direct wallet integration
- ✅ Supports BTC, ETH, USDT, USDC
- ✅ Simple API

**Setup:**
```bash
COINBASE_COMMERCE_API_KEY=your_api_key
```

---

### Option 3: **NOWPayments**
**Why NOWPayments:**
- ✅ 200+ cryptocurrencies
- ✅ Non-custodial (you control funds)
- ✅ Instant payouts
- ✅ Low fees (0.5%)

**Setup:**
```bash
NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret
```

---

## Credit Purchase Flow

### User Journey
```
User: "I want to buy 500 credits ($10)"
↓
System: "Pay with Crypto? (BTC/ETH/USDT/USDC)"
↓
User: Selects USDT
↓
System: Generates payment address
↓
User: Sends 10 USDT from wallet
↓
Blockchain: Confirms transaction (2-10 mins)
↓
Webhook: Payment verified
↓
System: Awards 500 credits instantly
↓
Transaction recorded with provider="crypto"
```

### Creator Payout Flow
```
Creator: "I earned 5,000 credits ($100)"
↓
Creator: "Withdraw to crypto"
↓
System: "Send to which address?"
↓
Creator: Provides USDT wallet address
↓
System: Validates address format
↓
System: Calculates amount (75% = $75 USDT)
↓
Payment Gateway: Sends 75 USDT
↓
Blockchain: Confirms in 2-10 mins
↓
Creator: Receives $75 USDT in wallet
```

---

## Implementation Example

### Backend API Route
```typescript
// server/routes.ts
app.post("/api/payments/crypto/create", requireAuth, async (req, res) => {
  const { amount, currency } = req.body; // amount in USD
  
  // Create CoinGate payment
  const payment = await coingate.createOrder({
    price_amount: amount,
    price_currency: "USD",
    receive_currency: "USD", // Auto-convert to USD
    callback_url: `${process.env.APP_URL}/api/payments/crypto/webhook`,
    success_url: `${process.env.APP_URL}/wallet?success=true`,
    cancel_url: `${process.env.APP_URL}/wallet?cancelled=true`,
  });
  
  res.json({
    paymentUrl: payment.payment_url,
    orderId: payment.id,
  });
});

// Webhook handler
app.post("/api/payments/crypto/webhook", async (req, res) => {
  const { id, status, price_amount, buyer_email } = req.body;
  
  if (status === "paid") {
    const credits = Math.floor(parseFloat(price_amount) * 50); // $1 = 50 credits
    
    await storage.addTransaction({
      userId: findUserByEmail(buyer_email),
      type: "credit_purchase",
      amount: credits,
      paymentProvider: "crypto",
      metadata: { orderId: id },
    });
    
    await storage.addCredits(userId, credits);
  }
  
  res.sendStatus(200);
});
```

### Frontend Component
```tsx
// client/src/components/CryptoPurchase.tsx
function CryptoPurchase() {
  const [amount, setAmount] = useState(10); // USD
  const credits = amount * 50; // $1 = 50 credits
  
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/payments/crypto/create", "POST", {
        amount,
        currency: "USD",
      });
    },
    onSuccess: (data) => {
      // Redirect to CoinGate payment page
      window.location.href = data.paymentUrl;
    },
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy Credits with Crypto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label>Amount (USD)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
            />
          </div>
          
          <div className="text-lg font-bold">
            = {credits} credits
          </div>
          
          <div className="text-sm text-muted-foreground">
            Accepts: BTC, ETH, USDT, USDC
          </div>
          
          <Button onClick={() => purchaseMutation.mutate()}>
            Pay with Crypto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Security Best Practices

### 1. Webhook Validation
```typescript
// Verify webhook signature
const isValid = coingate.verifySignature(
  req.headers["x-coingate-signature"],
  req.body
);

if (!isValid) {
  return res.status(401).send("Invalid signature");
}
```

### 2. Idempotency
```typescript
// Prevent duplicate credit awards
const existing = await storage.getTransactionByOrderId(orderId);
if (existing) {
  return res.sendStatus(200); // Already processed
}
```

### 3. Address Validation
```typescript
// Validate crypto wallet addresses
import { validate } from "bitcoin-address-validation";
import { isAddress } from "web3-validator";

if (currency === "BTC" && !validate(address)) {
  throw new Error("Invalid Bitcoin address");
}

if (currency === "ETH" && !isAddress(address)) {
  throw new Error("Invalid Ethereum address");
}
```

---

## Pricing Structure (Updated)

### Credit Packages
| USD | Credits | Bonus | Total Credits |
|-----|---------|-------|---------------|
| $1  | 50      | -     | 50            |
| $10 | 500     | 50    | 550           |
| $50 | 2,500   | 375   | 2,875         |
| $100| 5,000   | 1,000 | 6,000         |

### Transaction Fees
- **CoinGate**: 1% + blockchain fees
- **Coinbase**: 1% + blockchain fees  
- **NOWPayments**: 0.5% + blockchain fees

**Platform absorbs fees** - User pays exact USD amount shown.

---

## Gift Revenue Split (75/25)

### Example: User sends $10 Diamond gift

**Old System (80/20):**
- Creator: $8.00 (400 credits)
- Platform: $2.00 (100 credits)

**New System (75/25):**
- Creator: $7.50 (375 credits)
- Platform: $2.50 (125 credits)

---

## Why Crypto Matters for PROFITHACK AI

### Global Reach
- **Bermuda**: No Stripe, limited PayPal
- **Africa**: MTN Mobile Money + Crypto
- **Asia**: WeChat Pay blocked, crypto works
- **Latin America**: High remittance fees, crypto cheaper

### Creator Freedom
- **Instant withdrawals** - No 30-day holds
- **Low fees** - 1% vs 5-10% traditional
- **No middleman** - Direct wallet-to-wallet
- **Borderless** - Works in 190+ countries

### User Benefits
- **Privacy** - No bank account required
- **Speed** - 2-10 min confirmations
- **Accessibility** - Just need a wallet
- **Stable** - Use USDT/USDC to avoid volatility

---

## Next Steps

1. **Choose Provider**: Recommended → CoinGate
2. **Get API Keys**: Sign up at coingate.com/merchants
3. **Add Environment Variables**: See setup section
4. **Implement Routes**: Copy code examples above
5. **Test**: Use testnet first
6. **Launch**: Enable crypto payments globally

---

**With crypto, PROFITHACK AI becomes truly global - empowering creators everywhere!** 🌍🚀
