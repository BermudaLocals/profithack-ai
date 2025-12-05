import { db } from "./db";
import { marketplaceProducts } from "../shared/schema";

// Seed marketplace with official templates
export async function seedMarketplaceProducts() {
  try {
    console.log("🌱 Seeding marketplace products...");

    // Marketing Templates - Convert proven templates to marketplace products
    const marketingProducts = [
      {
        title: "Instant Win Method - $625-$1,650 in 48 Hours",
        description: "Proven TikTok ecommerce template that targets impulse buyers. No inventory, no ads, just pure profit.",
        longDescription: `Turn your TikTok audience into CASH in 48 hours flat.

This is the EXACT template that helped 1,247 creators make their first $625-$1,650 in just 2 days.

What you get:
- Complete product research system (find winners in 15 mins)
- Viral video scripts (4 proven formats)
- TikTok Shop integration guide
- Organic traffic playbook (no ads needed)

REAL RESULTS:
"Made $1,243 in 3 days using this exact system" - Sarah M.
"First sale within 6 hours of posting" - Marcus T.

Perfect for: Broke creators, side hustlers, anyone who needs money FAST.`,
        productType: "marketing_template" as const,
        category: "ecommerce" as const,
        priceCredits: 150, // ~$3.60
        originalPriceCredits: 300,
        isOfficialProduct: true,
        content: {
          templateData: {
            platforms: ["tiktok"],
            painPoints: ["broke", "need money fast", "no capital"],
            earnings: "$625-$1,650",
            timeframe: "48 hours",
          },
        },
        features: [
          "Product research system (find winners in 15 mins)",
          "4 viral video script templates",
          "TikTok Shop setup guide",
          "Zero-inventory dropshipping method",
          "Organic traffic playbook (no ads)",
        ],
        benefits: [
          "Make money in 48 hours",
          "No startup capital needed",
          "No inventory or shipping",
          "Works with existing TikTok account",
        ],
        conversionRate: "32-45%",
        earningsPotential: "$625-$1,650 in 48 hours",
        testimonials: [
          {
            name: "Sarah M.",
            quote: "Made $1,243 in 3 days using this exact system",
            result: "$1,243 in 3 days",
          },
        ],
        isEvergreen: true,
        isFeatured: true,
      },
      {
        title: "Loyalty Magnetizer - $200-$400/Month Recurring",
        description: "WhatsApp loyalty program that turns one-time buyers into monthly subscribers.",
        longDescription: `Build RECURRING revenue with existing customers.

This template shows you how to create a WhatsApp VIP club that generates $200-$400/month in passive income.

What you get:
- WhatsApp group setup guide
- Exclusive offer templates
- Member retention system
- Automated engagement scripts

Perfect for: Anyone with existing customers (ecommerce, services, courses)`,
        productType: "marketing_template" as const,
        category: "marketing" as const,
        priceCredits: 120,
        originalPriceCredits: 240,
        isOfficialProduct: true,
        content: {
          templateData: {
            platforms: ["whatsapp", "facebook"],
            painPoints: ["customers don't return", "no recurring revenue"],
            earnings: "$200-$400/month",
            timeframe: "recurring",
          },
        },
        features: [
          "WhatsApp VIP group setup",
          "Exclusive offer templates",
          "Retention automation",
          "Monthly engagement calendar",
        ],
        benefits: [
          "Turn one-time buyers into subscribers",
          "Predictable monthly revenue",
          "Zero ad spend",
          "Works with any business",
        ],
        conversionRate: "25-38%",
        earningsPotential: "$200-$400/month recurring",
        isEvergreen: true,
        isFeatured: true,
      },
      {
        title: "Side Hustle Blueprint - $625-$1,650 in 7 Days",
        description: "Complete beginner system. No cold calling, no tech skills. Just follow the steps.",
        longDescription: `The EASIEST way to make money online in 2026.

No experience? No problem. This step-by-step blueprint shows you exactly what to do each day for 7 days.

Day 1: Setup (30 mins)
Day 2-3: Content creation
Day 4-5: Audience building
Day 6-7: First sales

BEGINNER-FRIENDLY:
- No tech skills needed
- No cold calling
- No selling to friends/family
- Works in any niche`,
        productType: "marketing_template" as const,
        category: "business" as const,
        priceCredits: 100,
        originalPriceCredits: 200,
        isOfficialProduct: true,
        content: {
          templateData: {
            platforms: ["tiktok", "instagram"],
            painPoints: ["no experience", "need side income"],
            earnings: "$625-$1,650",
            timeframe: "7 days",
          },
        },
        features: [
          "7-day step-by-step roadmap",
          "Beginner-friendly (no tech skills)",
          "No cold calling required",
          "Works in any niche",
        ],
        benefits: [
          "Make money in first week",
          "Start with zero experience",
          "No uncomfortable sales calls",
          "Build long-term income stream",
        ],
        conversionRate: "35-50%",
        earningsPotential: "$625-$1,650 in 7 days",
        isEvergreen: true,
        isFeatured: true,
      },
      {
        title: "Google Business Optimizer - $300-$800 Service",
        description: "Sell Google Business Profile optimization to local businesses. Easy $300-$800 per client.",
        longDescription: `Turn local businesses into paying clients.

This template gives you everything you need to sell Google Business Profile optimization for $300-$800 per client.

What you get:
- Cold outreach scripts
- Service delivery checklist
- Pricing packages ($300/$500/$800)
- Client onboarding system

EASIEST SALE EVER:
- Every local business needs this
- Simple to deliver
- High profit margins
- Recurring upsell opportunities`,
        productType: "marketing_template" as const,
        category: "agency" as const,
        priceCredits: 200,
        originalPriceCredits: 400,
        isOfficialProduct: true,
        content: {
          templateData: {
            platforms: ["whatsapp", "facebook"],
            painPoints: ["need local clients", "want high-ticket sales"],
            earnings: "$300-$800",
            timeframe: "per client",
          },
        },
        features: [
          "Cold outreach scripts (DM + email)",
          "Service delivery checklist",
          "3 pricing tiers ($300/$500/$800)",
          "Client onboarding templates",
        ],
        benefits: [
          "Easy $300-$800 per client",
          "Every local business needs this",
          "Simple to deliver",
          "Recurring revenue potential",
        ],
        conversionRate: "20-35%",
        earningsPotential: "$300-$800 per client",
        isEvergreen: true,
      },
      {
        title: "7-Day Affiliate Bootcamp - 40% Recurring Commissions",
        description: "Turn followers into 40% recurring commissions. No product creation required.",
        longDescription: `Make passive income promoting proven products.

This 7-day system teaches you how to turn your audience into 40% recurring commissions.

What you get:
- Affiliate platform selection guide
- Content templates (7 days of posts)
- Conversion tracking system
- Scale-up playbook

PERFECT FOR:
- Anyone with an audience (even small)
- No product to sell
- Want passive income
- Beginners welcome`,
        productType: "marketing_template" as const,
        category: "affiliate" as const,
        priceCredits: 130,
        originalPriceCredits: 260,
        isOfficialProduct: true,
        content: {
          templateData: {
            platforms: ["tiktok", "instagram"],
            painPoints: ["no product", "want passive income"],
            earnings: "40% recurring",
            timeframe: "7 days",
          },
        },
        features: [
          "Affiliate platform selection guide",
          "7 days of content templates",
          "Conversion tracking system",
          "Scale-up playbook",
        ],
        benefits: [
          "40% recurring commissions",
          "No product creation",
          "Passive income stream",
          "Works with any audience size",
        ],
        conversionRate: "28-40%",
        earningsPotential: "40% recurring commissions",
        isEvergreen: true,
      },
    ];

    // Psychology Templates
    const psychologyProducts = [
      {
        title: "Reciprocity Template - 30-45% Conversion",
        description: "Give value first, convert later. This psychological trigger achieves 30-45% conversion rates.",
        longDescription: `The most powerful conversion psychology principle.

When you give value FIRST, people feel obligated to give back. This template shows you exactly how to use reciprocity to turn followers into subscribers.

Based on Cialdini's research + 10,000+ real-world tests.

What you get:
- Free value framework
- Unexpected bonus templates
- Value-first pitch scripts
- Conversion tracking system

PROVEN RESULTS: 30-45% conversion rate`,
        productType: "psychology_template" as const,
        category: "psychology" as const,
        priceCredits: 180,
        originalPriceCredits: 360,
        isOfficialProduct: true,
        content: {
          templateData: {
            principle: "Reciprocity",
            conversionRate: "30-45%",
            tactics: [
              "Offer free value upfront",
              "Give unexpected bonuses",
              "Provide help before asking",
            ],
          },
        },
        features: [
          "Free value framework",
          "Unexpected bonus templates",
          "Value-first pitch scripts",
          "Real-time conversion tracking",
        ],
        benefits: [
          "30-45% conversion rate",
          "Build trust instantly",
          "Stand out from competitors",
          "Works in any niche",
        ],
        conversionRate: "30-45%",
        earningsPotential: "30-45% follower-to-subscriber conversion",
        isEvergreen: true,
        isFeatured: true,
      },
      {
        title: "Scarcity + Urgency Combo - 25-40% Conversion",
        description: "Limited availability creates desire. This template combines scarcity and urgency for maximum conversions.",
        longDescription: `People want what they can't have.

This template shows you how to ethically use scarcity and urgency to drive conversions.

What you get:
- Limited quantity frameworks
- Deadline psychology scripts
- Exclusive access templates
- Price increase strategies

BASED ON: Cialdini's Scarcity Principle + NLP techniques

PROVEN: 25-40% conversion rate`,
        productType: "psychology_template" as const,
        category: "psychology" as const,
        priceCredits: 170,
        originalPriceCredits: 340,
        isOfficialProduct: true,
        content: {
          templateData: {
            principle: "Scarcity + Urgency",
            conversionRate: "25-40%",
            tactics: [
              "Limited quantity",
              "Time-based deadlines",
              "Exclusive access",
              "Price increases",
            ],
          },
        },
        features: [
          "Limited quantity frameworks",
          "Deadline psychology scripts",
          "Exclusive access templates",
          "Price increase strategies",
        ],
        benefits: [
          "25-40% conversion rate",
          "Create immediate action",
          "Ethical scarcity tactics",
          "Proven psychological triggers",
        ],
        conversionRate: "25-40%",
        earningsPotential: "25-40% conversion rate",
        isEvergreen: true,
      },
      {
        title: "Social Proof + Authority - 20-35% Conversion",
        description: "People follow the crowd and trust experts. Combine both for unstoppable conversions.",
        longDescription: `Show them everyone else is already winning.

This template teaches you how to leverage social proof and authority to convert skeptical followers into paying subscribers.

What you get:
- Testimonial collection system
- Authority-building framework
- Social proof display templates
- Endorsement strategies

BASED ON: 10,000+ case studies showing 20-35% conversion rates`,
        productType: "psychology_template" as const,
        category: "psychology" as const,
        priceCredits: 160,
        originalPriceCredits: 320,
        isOfficialProduct: true,
        content: {
          templateData: {
            principle: "Social Proof + Authority",
            conversionRate: "20-35%",
            tactics: [
              "Show subscriber numbers",
              "Display testimonials",
              "Highlight credentials",
              "Get endorsements",
            ],
          },
        },
        features: [
          "Testimonial collection system",
          "Authority-building framework",
          "Social proof templates",
          "Endorsement strategies",
        ],
        benefits: [
          "20-35% conversion rate",
          "Build instant credibility",
          "Overcome skepticism",
          "Works with any audience",
        ],
        conversionRate: "20-35%",
        earningsPotential: "20-35% conversion rate",
        isEvergreen: true,
      },
      {
        title: "Pain → Solution → Action Framework - 35-50% Conversion",
        description: "The highest-converting template. Amplify pain, offer solution, drive action.",
        longDescription: `The HIGHEST-CONVERTING psychology template.

This framework achieves 35-50% conversion by connecting emotionally through shared pain, then offering the perfect solution.

What you get:
- Pain amplification scripts
- Solution presentation framework
- Action-driving templates
- Transformation storytelling system

HIGHEST CONVERSION: 35-50% proven rate
MOST ETHICAL: Helps people while making sales`,
        productType: "psychology_template" as const,
        category: "psychology" as const,
        priceCredits: 220,
        originalPriceCredits: 440,
        isOfficialProduct: true,
        content: {
          templateData: {
            principle: "Pain → Solution → Action",
            conversionRate: "35-50%",
            tactics: [
              "Identify deep pain points",
              "Amplify emotional connection",
              "Present perfect solution",
              "Drive immediate action",
            ],
          },
        },
        features: [
          "Pain amplification scripts",
          "Solution presentation framework",
          "Action-driving templates",
          "Transformation storytelling",
        ],
        benefits: [
          "35-50% conversion rate (HIGHEST)",
          "Deep emotional connection",
          "Ethical persuasion",
          "Works in every niche",
        ],
        conversionRate: "35-50%",
        earningsPotential: "35-50% conversion rate",
        isEvergreen: true,
        isFeatured: true,
      },
      {
        title: "FOMO (Fear of Missing Out) - 28-42% Conversion",
        description: "Create urgency through missed opportunity. Watch conversions skyrocket.",
        longDescription: `While you wait, others are winning.

This template harnesses the power of FOMO to drive conversions. Show people what they're missing RIGHT NOW.

What you get:
- FOMO trigger templates
- Missed opportunity scripts
- Live activity displays
- Urgency escalation system

PROVEN: 28-42% conversion rate using pure FOMO psychology`,
        productType: "psychology_template" as const,
        category: "psychology" as const,
        priceCredits: 175,
        originalPriceCredits: 350,
        isOfficialProduct: true,
        content: {
          templateData: {
            principle: "FOMO",
            conversionRate: "28-42%",
            tactics: [
              "Show live user activity",
              "Highlight missed opportunities",
              "Create time pressure",
              "Display others' success",
            ],
          },
        },
        features: [
          "FOMO trigger templates",
          "Missed opportunity scripts",
          "Live activity displays",
          "Urgency escalation system",
        ],
        benefits: [
          "28-42% conversion rate",
          "Creates immediate action",
          "Leverages social psychology",
          "Works 24/7 automatically",
        ],
        conversionRate: "28-42%",
        earningsPotential: "28-42% conversion rate",
        isEvergreen: true,
      },
    ];

    // Insert all products
    const allProducts = [...marketingProducts, ...psychologyProducts];
    
    for (const product of allProducts) {
      await db.insert(marketplaceProducts).values(product).onConflictDoNothing();
    }

    console.log(`✅ Seeded ${allProducts.length} marketplace products`);
  } catch (error) {
    console.error("❌ Error seeding marketplace:", error);
  }
}
