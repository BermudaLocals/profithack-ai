/**
 * AI Providers Integration
 * 
 * Supports multiple AI providers for content creation:
 * - OpenAI (GPT-4, DALL-E, Whisper)
 * - Anthropic (Claude)
 * - Google AI (Gemini)
 * 
 * Users can:
 * 1. Use their own API keys (stored encrypted)
 * 2. Use CreatorVerse pooled API (costs credits)
 */

import { OpenAI, toFile } from "openai";

// AI Provider Types
export type AIProvider = "openai" | "anthropic" | "google" | "stability";
export type AIModel = "gpt-4" | "gpt-3.5-turbo" | "claude-3" | "gemini-pro" | "dall-e-3" | "stable-diffusion";

export interface AIGenerateRequest {
  provider: AIProvider;
  model: AIModel;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  userApiKey?: string; // Optional: user's own API key
}

export interface AIImageRequest {
  provider: "openai" | "stability";
  model: "dall-e-3" | "stable-diffusion";
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  userApiKey?: string;
}

export interface AITranscribeRequest {
  provider: "openai";
  audioUrl: string;
  language?: string;
  userApiKey?: string;
}

// Credit costs for AI operations (when using pooled API)
export const AI_CREDIT_COSTS = {
  "gpt-4": 50, // per request
  "gpt-3.5-turbo": 10,
  "claude-3": 40,
  "gemini-pro": 30,
  "dall-e-3": 100, // per image
  "stable-diffusion": 50,
  "whisper": 20, // per minute
};

/**
 * OpenAI Integration
 */
export class OpenAIProvider {
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (key) {
      this.client = new OpenAI({ apiKey: key });
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async generateText(
    prompt: string,
    model: "gpt-4" | "gpt-3.5-turbo" = "gpt-4",
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI API key not configured");
    }

    const completion = await this.client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
    });

    return completion.choices[0]?.message?.content || "";
  }

  async generateImage(
    prompt: string,
    options: {
      size?: "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
    } = {}
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await this.client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: options.size || "1024x1024",
      quality: options.quality || "standard",
    });

    return response.data[0]?.url || "";
  }

  async transcribeAudio(audioUrl: string, language?: string): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      // Download audio file
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
      }
      
      const arrayBuffer = await audioResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Use OpenAI SDK's toFile helper for Node.js compatibility
      const audioFile = await toFile(buffer, "audio.mp3", { type: "audio/mpeg" });

      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: language,
      });

      return transcription.text;
    } catch (error) {
      throw new Error(`Audio transcription failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Anthropic (Claude) Integration
 * Note: Requires @anthropic-ai/sdk package
 */
export class AnthropicProvider {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || null;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async generateText(
    prompt: string,
    model: "claude-3-opus" | "claude-3-sonnet" | "claude-3-haiku" = "claude-3-sonnet",
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    // Direct API call (without SDK for now)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: options.maxTokens || 1000,
        messages: [{ role: "user", content: prompt }],
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "";
  }
}

/**
 * Google AI (Gemini) Integration
 */
export class GoogleAIProvider {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_AI_API_KEY || null;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async generateText(
    prompt: string,
    model: "gemini-pro" | "gemini-pro-vision" = "gemini-pro",
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Google AI API key not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || "";
  }
}

/**
 * Stability AI (Stable Diffusion) Integration
 */
export class StabilityAIProvider {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.STABILITY_API_KEY || null;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async generateImage(
    prompt: string,
    options: {
      width?: number;
      height?: number;
      steps?: number;
    } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Stability AI API key not configured");
    }

    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: options.height || 1024,
          width: options.width || 1024,
          steps: options.steps || 30,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Stability AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Return base64 image (needs to be uploaded to object storage)
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  }
}

/**
 * AI Service Manager
 * Routes requests to appropriate provider
 */
export class AIService {
  async generate(request: AIGenerateRequest): Promise<string> {
    switch (request.provider) {
      case "openai": {
        const provider = new OpenAIProvider(request.userApiKey);
        return await provider.generateText(
          request.prompt,
          request.model as "gpt-4" | "gpt-3.5-turbo",
          {
            maxTokens: request.maxTokens,
            temperature: request.temperature,
          }
        );
      }
      case "anthropic": {
        const provider = new AnthropicProvider(request.userApiKey);
        return await provider.generateText(
          request.prompt,
          "claude-3-sonnet",
          {
            maxTokens: request.maxTokens,
            temperature: request.temperature,
          }
        );
      }
      case "google": {
        const provider = new GoogleAIProvider(request.userApiKey);
        return await provider.generateText(request.prompt, "gemini-pro", {
          maxTokens: request.maxTokens,
          temperature: request.temperature,
        });
      }
      default:
        throw new Error(`Unsupported AI provider: ${request.provider}`);
    }
  }

  async generateImage(request: AIImageRequest): Promise<string> {
    switch (request.provider) {
      case "openai": {
        const provider = new OpenAIProvider(request.userApiKey);
        return await provider.generateImage(request.prompt, {
          size: request.size,
          quality: request.quality,
        });
      }
      case "stability": {
        const provider = new StabilityAIProvider(request.userApiKey);
        const [width, height] = (request.size || "1024x1024")
          .split("x")
          .map(Number);
        return await provider.generateImage(request.prompt, { width, height });
      }
      default:
        throw new Error(`Unsupported image provider: ${request.provider}`);
    }
  }

  async transcribeAudio(request: AITranscribeRequest): Promise<string> {
    if (request.provider === "openai") {
      const provider = new OpenAIProvider(request.userApiKey);
      return await provider.transcribeAudio(request.audioUrl, request.language);
    }
    throw new Error(`Unsupported transcription provider: ${request.provider}`);
  }

  getCreditCost(model: AIModel): number {
    return AI_CREDIT_COSTS[model] || 0;
  }
}

export const aiService = new AIService();

/**
 * Deduct AI credits from user account
 * Priority: Bonus credits first (non-transferable), then regular credits
 * 
 * @param userId - User ID
 * @param creditCost - Number of credits to deduct
 * @returns Object with bonusUsed and regularUsed amounts
 * @throws Error if insufficient credits
 */
export async function deductAICredits(
  userId: string,
  creditCost: number
): Promise<{ bonusUsed: number; regularUsed: number }> {
  const { db } = await import("./db");
  const { users } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");

  // Get user's current balances
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      credits: true,
      bonusCredits: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const totalAvailable = user.credits + user.bonusCredits;
  if (totalAvailable < creditCost) {
    throw new Error(
      `Insufficient credits. You have ${user.credits} regular credits + ${user.bonusCredits} bonus credits (${totalAvailable} total), but need ${creditCost} credits. Purchase credits to continue using AI tools!`
    );
  }

  // Use bonus credits first, then regular credits
  const bonusUsed = Math.min(user.bonusCredits, creditCost);
  const regularUsed = creditCost - bonusUsed;

  // Deduct credits
  await db
    .update(users)
    .set({
      bonusCredits: user.bonusCredits - bonusUsed,
      credits: user.credits - regularUsed,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { bonusUsed, regularUsed };
}
