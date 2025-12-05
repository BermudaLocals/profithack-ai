// ============================================
// AI INFLUENCER AD CREATION SYSTEM
// Generates personalized ad content for AI creators
// Integrated with ELITE2026 expert personas
// ============================================

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Defines the structure for a content generation request.
 */
export interface ContentRequest {
  personaName: string;
  personaDescription: string;
  contentTopic: string;
  tone: 'flirty' | 'engaging' | 'casual' | 'professional' | 'seductive' | 'playful';
  length: 'short' | 'medium' | 'long';
  platform?: 'tiktok' | 'instagram' | 'onlyfans' | 'youtube' | 'twitter';
}

/**
 * Generates AI influencer ad content using Claude 3.5 Sonnet
 * @param request The content generation request details
 * @returns The generated text content
 */
export async function generateInfluencerAd(request: ContentRequest): Promise<string> {
  const { personaName, personaDescription, contentTopic, tone, length, platform = 'tiktok' } = request;

  // Determine max tokens based on length
  const maxTokensMap = {
    short: 300,
    medium: 800,
    long: 1500,
  };

  // Platform-specific guidance
  const platformGuidance: Record<string, string> = {
    tiktok: 'Keep it punchy, use trending language, include a strong hook in the first 3 seconds.',
    instagram: 'Visual-first, use emojis, create aspirational content, include hashtags.',
    onlyfans: 'Create exclusivity, tease premium content, build anticipation, be provocative but classy.',
    youtube: 'Tell a story, create value, use strong CTAs, optimize for watch time.',
    twitter: 'Be concise, use trending topics, create conversations, be authentic.',
  };

  const systemPrompt = `You are an AI content creator named ${personaName}.
Your persona is: "${personaDescription}".

Your goal is to generate engaging, high-quality social media ad content for a creator platform.
The content must be safe, platform-appropriate, and adhere to all guidelines.
Focus on maintaining the specified tone and persona authentically.

Platform: ${platform.toUpperCase()}
Platform Guidance: ${platformGuidance[platform]}

The output should be a single, well-formatted post. DO NOT include any introductory or concluding remarks.
Write as if YOU are posting this directly to your audience.`;

  const userMessage = `**Content Generation Request:**
- **Topic:** ${contentTopic}
- **Desired Tone:** ${tone}
- **Desired Length:** ${length} (short = a few sentences, medium = a paragraph, long = multiple paragraphs)

Generate the ${platform} post now as ${personaName}.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: maxTokensMap[length],
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.8,
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text.trim();
    }

    return "Failed to generate content.";
  } catch (error) {
    console.error("Anthropic API Error:", error);
    throw new Error("Failed to generate content from AI service.");
  }
}

/**
 * Generates multiple content variations for A/B testing
 */
export async function generateContentVariations(
  request: ContentRequest,
  count: number = 3
): Promise<string[]> {
  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const content = await generateInfluencerAd(request);
      variations.push(content);
    } catch (error) {
      console.error(`Failed to generate variation ${i + 1}:`, error);
    }
  }

  return variations;
}

/**
 * Generates a complete ad campaign (hook + body + CTA)
 */
export async function generateAdCampaign(request: ContentRequest): Promise<{
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}> {
  const { personaName, contentTopic, platform = 'tiktok' } = request;

  const prompt = `You are ${personaName}. Create a complete ad campaign for: "${contentTopic}"

Generate 4 components in JSON format:
1. **hook** - Attention-grabbing opening (5-15 words)
2. **body** - Main message (2-3 sentences)
3. **cta** - Call-to-action (1 sentence)
4. **hashtags** - 5-7 relevant hashtags (array)

Platform: ${platform.toUpperCase()}

Return ONLY valid JSON:
{
  "hook": "...",
  "body": "...",
  "cta": "...",
  "hashtags": ["tag1", "tag2", ...]
}`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const content = response.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error("Failed to parse campaign response");
  } catch (error) {
    console.error("Campaign generation error:", error);
    throw new Error("Failed to generate ad campaign.");
  }
}

/**
 * Analyzes existing content and suggests improvements
 */
export async function analyzeAndImproveContent(
  originalContent: string,
  personaName: string,
  platform: string = 'tiktok'
): Promise<{
  score: number;
  improvements: string[];
  rewrittenContent: string;
}> {
  const prompt = `As a content strategist, analyze this ${platform} post and improve it.

Original Content:
"${originalContent}"

Creator: ${personaName}
Platform: ${platform.toUpperCase()}

Provide analysis in JSON format:
{
  "score": 0-100 (current quality score),
  "improvements": ["improvement 1", "improvement 2", ...],
  "rewrittenContent": "improved version of the post"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error("Failed to parse analysis response");
  } catch (error) {
    console.error("Content analysis error:", error);
    throw new Error("Failed to analyze content.");
  }
}
