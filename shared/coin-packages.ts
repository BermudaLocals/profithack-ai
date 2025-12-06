// Coin Purchase Packages (TikTok pricing model)
// Coins are used for gifts/sparks and tipping creators
// Separate from Credits (which are for AI tools via subscriptions)

export const COIN_PACKAGES = [
  {
    id: "coins_20",
    coins: 20,
    priceUSD: 0.29,
    name: "Starter Pack",
    description: "Perfect for trying out gifts",
    popular: false,
    bonus: 0,
  },
  {
    id: "coins_70",
    coins: 70,
    priceUSD: 1.00,
    name: "Basic Pack",
    description: "Great value for casual gifting",
    popular: false,
    bonus: 0,
  },
  {
    id: "coins_350",
    coins: 350,
    priceUSD: 5.00,
    name: "Popular Pack",
    description: "Most popular choice",
    popular: true,
    bonus: 0,
  },
  {
    id: "coins_700",
    coins: 700,
    priceUSD: 10.00,
    name: "Power Pack",
    description: "Support your favorite creators",
    popular: false,
    bonus: 0,
  },
  {
    id: "coins_1750",
    coins: 1750,
    priceUSD: 25.00,
    name: "Super Pack",
    description: "Great for active supporters",
    popular: false,
    bonus: 0,
  },
  {
    id: "coins_3500",
    coins: 3500,
    priceUSD: 50.00,
    name: "Mega Pack",
    description: "Bonus coins included!",
    popular: false,
    bonus: 150,
  },
  {
    id: "coins_7000",
    coins: 7000,
    priceUSD: 100.00,
    name: "Ultra Pack",
    description: "Best value - bonus coins!",
    popular: false,
    bonus: 350,
  },
  {
    id: "coins_17500",
    coins: 17500,
    priceUSD: 250.00,
    name: "Ultimate Pack",
    description: "Maximum value with huge bonus",
    popular: false,
    bonus: 1000,
  },
] as const;

export type CoinPackage = typeof COIN_PACKAGES[number];
