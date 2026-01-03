/**
 * AI PROVIDER ABSTRACTION LAYER
 * 
 * This file contains the implementation for each AI provider.
 * Each provider has a standardized interface for making API calls.
 * This allows us to switch providers seamlessly.
 */

import { AIProvider } from '../config/aiConfig';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// --- Standardized Message Format ---
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  // Add optional fields for future use (e.g., images)
  images?: string[];
}

// --- Standardized Response Format ---
export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// --- Provider Implementations ---

export class GroqProvider {
  private client: Groq;

  constructor(config: AIProvider) {
    if (!config.apiKey) throw new Error('Groq API key is missing.');
    this.client = new Groq({ apiKey: config.apiKey });
  }

  async call(messages: AIMessage[], model: string): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: messages as Groq.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
      });
      return {
        content: completion.choices[0]?.message?.content || '',
        provider: 'Groq',
        model,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(`Groq API call failed: ${error}`);
    }
  }
}

export class OllamaProvider {
  private baseUrl: string;

  constructor(config: AIProvider) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  async call(messages: AIMessage[], model: string): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false }),
      });
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        content: data.message.content,
        provider: 'Ollama',
        model,
        usage: {
          // Ollama doesn't provide token usage by default
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw new Error(`Ollama API call failed: ${error}`);
    }
  }
}

export class GeminiProvider {
  private client: GoogleGenerativeAI;
  private model: GoogleGenerativeAI.GenerativeModel;

  constructor(config: AIProvider) {
    if (!config.apiKey) throw new Error('Google API key is missing.');
    this.client = new GoogleGenerativeAI(config.apiKey);
    // We'll initialize the model when we know which one to use
  }

  async call(messages: AIMessage[], model: string): Promise<AIResponse> {
    try {
      this.model = this.client.getGenerativeModel({ model });
      // Gemini requires a single prompt string, so we'll format our messages
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await this.model.generateContent(prompt);
      return {
        content: result.response.text(),
        provider: 'Gemini',
        model,
        usage: {
          // Gemini usage info is in result.response.usageMetadata
          prompt_tokens: result.response.usageMetadata?.promptTokenCount || 0,
          completion_tokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API call failed: ${error}`);
    }
  }
}

export class OpenAIProvider {
  private client: OpenAI;

  constructor(config: AIProvider) {
    if (!config.apiKey) throw new Error('OpenAI API key is missing.');
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async call(messages: AIMessage[], model: string): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
      });
      return {
        content: completion.choices[0]?.message?.content || '',
        provider: 'OpenAI',
        model,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API call failed: ${error}`);
    }
  }
}

export class AnthropicProvider {
  private client: Anthropic;

  constructor(config: AIProvider) {
    if (!config.apiKey) throw new Error('Anthropic API key is missing.');
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  async call(messages: AIMessage[], model: string): Promise<AIResponse> {
    try {
      const completion = await this.client.messages.create({
        model,
        max_tokens: 4096,
        messages: messages as Anthropic.Messages.MessageParam[],
      });
      return {
        content: completion.content[0]?.type === 'text' ? completion.content[0].text : '',
        provider: 'Anthropic',
        model,
        usage: {
          prompt_tokens: completion.usage.input_tokens,
          completion_tokens: completion.usage.output_tokens,
          total_tokens: completion.usage.input_tokens + completion.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw new Error(`Anthropic API call failed: ${error}`);
    }
  }
}
