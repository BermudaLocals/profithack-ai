/**
 * AI ROUTER SERVICE
 * 
 * This service intelligently routes AI requests to the most appropriate provider
 * based on the task type, availability, and cost.
 * It handles fallbacks and ensures our app is always responsive.
 */

import { aiProviders, routingRules, fallbackChain } from '../config/aiConfig';
import { GroqProvider, OllamaProvider, GeminiProvider, OpenAIProvider, AnthropicProvider } from './aiProviders';
import { AIMessage, AIResponse } from './aiProviders';

// --- Provider Instances ---
// We initialize the providers once to reuse them throughout the app's lifecycle.
const providerInstances = {
  groq: new GroqProvider(aiProviders.groq),
  ollama: new OllamaProvider(aiProviders.ollama),
  gemini: new GeminiProvider(aiProviders.gemini),
  openai: new OpenAIProvider(aiProviders.openai),
  anthropic: new AnthropicProvider(aiProviders.anthropic),
};

/**
 * The main function to call any AI model.
 * It handles routing, fallbacks, and error handling.
 * 
 * @param taskType - The type of task (e.g., 'text_fast', 'multimodal_reasoning')
 * @param messages - The conversation messages
 * @returns A promise that resolves to the AI response
 */
export async function callAI(taskType: keyof typeof routingRules, messages: AIMessage[]): Promise<AIResponse> {
  // 1. Determine the primary provider and model from the routing rules
  const rule = routingRules[taskType];
  if (!rule) {
    throw new Error(`No routing rule found for task type: ${taskType}`);
  }

  const primaryProviderName = rule.provider;
  const primaryModelKey = rule.model;

  // 2. Attempt to call the primary provider
  try {
    const provider = providerInstances[primaryProviderName as keyof typeof providerInstances];
    if (!provider) {
      throw new Error(`Provider instance not found: ${primaryProviderName}`);
    }
    const model = aiProviders[primaryProviderName].models[primaryModelKey];
    if (!model) {
      throw new Error(`Model not found: ${primaryModelKey} for provider ${primaryProviderName}`);
    }
    console.log(`Attempting primary provider: ${primaryProviderName} with model: ${model}`);
    return await provider.call(messages, model);
  } catch (error) {
    console.error(`Primary provider ${primaryProviderName} failed.`, error);
    // 3. If it fails, iterate through the fallback chain
    for (const fallbackProviderName of fallbackChain) {
      if (fallbackProviderName === primaryProviderName) continue; // Already tried this one
      try {
        console.log(`Attempting fallback to ${fallbackProviderName}...`);
        const provider = providerInstances[fallbackProviderName as keyof typeof providerInstances];
        if (!provider) continue;
        // For fallbacks, we'll try to use a 'default' or 'fast' model
        const modelKey = 'fast' in aiProviders[fallbackProviderName].models ? 'fast' : 'default';
        const model = aiProviders[fallbackProviderName].models[modelKey];
        if (!model) continue;
        const response = await provider.call(messages, model);
        console.log(`Fallback to ${fallbackProviderName} successful.`);
        return response;
      } catch (fallbackError) {
        console.error(`Fallback provider ${fallbackProviderName} also failed.`, fallbackError);
      }
    }
    // 4. If all providers fail, throw a final error
    throw new Error('All AI providers failed.');
  }
}
