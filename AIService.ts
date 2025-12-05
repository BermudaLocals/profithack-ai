import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ContentRequest {
  personaName: string;
  personaDescription: string;
  contentTopic: string;
  tone: 'flirty' | 'engaging' | 'casual' | 'professional';
  length: 'short' | 'medium' | 'long';
}

export async function generateContent(request: ContentRequest): Promise<string> {
  const { personaName, personaDescription, contentTopic, tone, length } = request;

  if (!process.env.ANTHROPIC_API_KEY) {
    const mockResponse = `
      [AI Content for ${personaName}]
      Topic: ${contentTopic}
      Tone: ${tone}
      
      Hey there! I'm ${personaName} and I'm so excited to share my thoughts on ${contentTopic}!
      This is where the AI-generated content would appear when the API key is configured.
      To enable real AI content generation, ensure ANTHROPIC_API_KEY is set.
    `;
    return Promise.resolve(mockResponse.trim());
  }

  const systemPrompt = `
    You are an AI content creator named ${personaName}.
    Your persona is: "${personaDescription}".
    Your goal is to generate engaging, high-quality social media content for a creator platform.
    The content must be safe, non-explicit, and adhere to all platform guidelines.
    Focus on maintaining the specified tone and persona.
    The output should be a single, well-formatted post. DO NOT include any introductory or concluding remarks.
  `;

  const lengthGuide = length === 'short' ? 'a few sentences' : length === 'medium' ? 'a paragraph' : 'a few paragraphs';
  
  const userMessage = `
    **Content Generation Request:**
    - **Topic:** ${contentTopic}
    - **Desired Tone:** ${tone}
    - **Desired Length:** ${lengthGuide}

    Generate the social media post now.
  `;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.8,
    });

    const generatedText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();
    
    return generatedText;
  } catch (error) {
    console.error("Anthropic API Error:", error);
    throw new Error("Failed to generate content from AI service.");
  }
}

export async function generateViralHook(topic: string, platform: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return `[VIRAL HOOK] Check out this amazing ${topic} content! #${platform} #viral`;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 256,
      system: "You are a viral content expert. Generate catchy, attention-grabbing hooks for social media.",
      messages: [{
        role: "user",
        content: `Generate a viral hook for ${platform} about: ${topic}. Make it short, punchy, and engaging. Include relevant hashtags.`
      }],
      temperature: 0.9,
    });

    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')
      .trim();
  } catch (error) {
    console.error("Hook generation error:", error);
    return `Check out this ${topic}! #viral #${platform}`;
  }
}

export async function generateCaption(videoDescription: string, style: string = 'engaging'): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return `Amazing content incoming! ${videoDescription} #fyp #viral`;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 256,
      system: `You write ${style} video captions for TikTok/Instagram. Keep it under 150 characters with 3-5 hashtags.`,
      messages: [{
        role: "user",
        content: `Write a caption for: ${videoDescription}`
      }],
      temperature: 0.8,
    });

    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')
      .trim();
  } catch (error) {
    console.error("Caption generation error:", error);
    return `${videoDescription} #fyp #viral`;
  }
}
