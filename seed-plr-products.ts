import { db } from "./db";
import { marketplaceProducts } from "@shared/schema";

async function seedPLRProducts() {
  console.log("🌱 Seeding PLR Products from attached files...");

  const products = [
    {
      title: "$2 Digital Hustle Quick-Start Guide",
      description: "Your first step into the Digital Dollars™ world! Actionable tools for smartphone hustlers with 2 hours/day.",
      longDescription: `Welcome to your first step into the Digital Dollars™ world! This guide is designed to give you real, actionable tools that you can use with just your smartphone and 2 hours a day.

Included in this Starter Pack:
✅ Full guide (readme)
✅ Affiliate setup tips
✅ Affiliate tools you can promote right away
✅ Link to upgrade to the $10 Starter Kit

Your affiliate tools included:
- Manus AI
- GoHighLevel
- ChatGPT
- InVideo
- ElevenLabs

Perfect for beginners ready to start their digital hustle!`,
      productType: "plr_ebook" as const,
      category: "affiliate" as const,
      priceCredits: 100, // $2.40
      features: [
        "Complete $2 Digital Hustle guide",
        "Affiliate setup instructions",
        "Ready-to-use affiliate tools list",
        "Upgrade pitch template",
        "Social media captions",
        "Full PLR rights - resell, rebrand, modify",
      ],
      benefits: [
        "Start earning with just 2 hours/day",
        "Work from your smartphone",
        "No technical skills required",
        "Proven affiliate tools",
        "Instant digital delivery",
      ],
      conversionRate: "20-35%",
      earningsPotential: "$5 per referral, break even in 2 sales",
      isOfficialProduct: true,
      isFeatured: true,
      plrRights: {
        canResell: true,
        canRebrand: true,
        canModify: true,
        canGiveAway: true,
      },
    },
    {
      title: "30-Day Hustler's Planner",
      description: "Daily AI-powered prompts, tasks, and mindset hacks to keep you motivated and focused.",
      longDescription: `Welcome to the 30-Day Hustler's Planner!

For those days when focus is a myth, and distractions are real — this planner keeps you on track.

Daily AI-powered prompts, tasks, and mindset hacks to keep you motivated.

Perfect for anyone with a busy brain and a broke wallet.

Each day includes:
- Morning mindset prompt
- 3 priority tasks
- AI-generated productivity tips
- Evening reflection questions
- Progress tracking`,
      productType: "plr_ebook" as const,
      category: "business" as const,
      priceCredits: 250, // $6
      features: [
        "30 days of structured planning",
        "AI-powered daily prompts",
        "Task management system",
        "Mindset optimization techniques",
        "Progress tracking sheets",
        "Printable PDF format",
      ],
      benefits: [
        "Stay focused on your goals",
        "Overcome ADHD brain fog",
        "Build consistent habits",
        "Track your progress daily",
        "Boost productivity 3x",
      ],
      conversionRate: "25-40%",
      earningsPotential: "$4.20 per sale (70% of $6)",
      isOfficialProduct: true,
      isFeatured: true,
      plrRights: {
        canResell: true,
        canRebrand: true,
        canModify: true,
        canGiveAway: false,
      },
    },
    {
      title: "1000+ ChatGPT Prompts Vault",
      description: "Your ultimate prompt collection covering everything from birthdays to breakups. Turn brain fog into clarity.",
      longDescription: `Welcome to your ultimate prompt vault!

Whether you're broke, busy, or blessed with ADHD brain energy, these 1000+ ChatGPT prompts are here to save your day.

Use them for social posts, emails, business ideas, or just flexing your AI muscles.

Stay inspired, stay creative, and turn your brain fog into clarity.

Categories included:
- Social media content (200+ prompts)
- Email marketing (150+ prompts)
- Business strategy (100+ prompts)
- Personal development (100+ prompts)
- Content creation (200+ prompts)
- Sales copy (150+ prompts)
- And 100+ more across various niches!`,
      productType: "plr_ebook" as const,
      category: "content_creation" as const,
      priceCredits: 500, // $12
      features: [
        "1000+ ready-to-use prompts",
        "Organized by category",
        "Copy-paste ready format",
        "Covers 15+ niches",
        "Regularly updated collection",
        "Searchable PDF format",
      ],
      benefits: [
        "Never run out of content ideas",
        "Save 10+ hours per week",
        "Generate professional content",
        "Beat writer's block forever",
        "10x your productivity",
      ],
      conversionRate: "30-45%",
      earningsPotential: "$8.40 per sale (70% of $12)",
      isOfficialProduct: true,
      isFeatured: true,
      plrRights: {
        canResell: true,
        canRebrand: true,
        canModify: true,
        canGiveAway: false,
      },
    },
    {
      title: "Affiliate Marketing Starter Bundle",
      description: "Complete affiliate setup guide with proven tools, templates, and social media caption bundles.",
      longDescription: `Complete Affiliate Marketing Starter Bundle

Everything you need to start earning affiliate commissions today:

✅ Affiliate Setup Instructions
✅ Your AI Hustle Tools (with affiliate links)
✅ Upgrade Pitch Templates
✅ Social Media Caption Bundle
✅ Promotional Templates

Tools included:
- Manus AI setup
- GoHighLevel integration
- ElevenLabs voice cloning
- ChatGPT optimization
- InVideo content creation

Perfect for:
- Beginner marketers
- Side hustlers
- Content creators
- Anyone wanting passive income`,
      productType: "marketing_template" as const,
      category: "affiliate" as const,
      priceCredits: 250, // $6
      features: [
        "Complete affiliate toolkit",
        "Pre-written captions",
        "Promotion templates",
        "Tool integration guides",
        "Proven conversion formulas",
      ],
      benefits: [
        "Start earning immediately",
        "No experience required",
        "Proven tools included",
        "Ready-to-share content",
        "Passive income potential",
      ],
      conversionRate: "35-50%",
      earningsPotential: "$5 per referral, unlimited potential",
      isOfficialProduct: true,
      plrRights: {
        canResell: true,
        canRebrand: true,
        canModify: true,
        canGiveAway: true,
      },
    },
  ];

  try {
    for (const product of products) {
      const existing = await db.query.marketplaceProducts.findFirst({
        where: (p, { eq }) => eq(p.title, product.title),
      });

      if (!existing) {
        await db.insert(marketplaceProducts).values({
          ...product,
          content: {
            plrFiles: [],
            metadata: {
              fileCount: 5,
              totalSize: "2.5 MB",
              format: "PDF + TXT",
            },
          },
          isActive: true,
          isEvergreen: true,
        });
        console.log(`✅ Created: ${product.title}`);
      } else {
        console.log(`⏭️  Exists: ${product.title}`);
      }
    }

    console.log("✅ PLR Products seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding PLR products:", error);
  }
}

seedPLRProducts();
