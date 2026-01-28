import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


// Configuration
const MODEL_NAME = "gemini-2.5-flash"; // Free tier model
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate text response from Gemini API
 * @param prompt - The text prompt to send to Gemini
 * @param options - Optional configuration
 * @returns Generated text response
 */
export async function generateGeminiResponse(
  prompt: string,
  options?: {
    maxRetries?: number;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json';
  }
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const generationConfig: any = {
    temperature: options?.temperature ?? 0.7,
    maxOutputTokens: options?.maxTokens ?? 2048,
  };

  if (options?.responseFormat === 'json') {
    generationConfig.responseMimeType = 'application/json';
  }

  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig
  });

  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return text;

    } catch (error: any) {
      lastError = error;
      
      // Don't retry on auth/validation errors
      if (error.message?.includes('API key') || 
          error.message?.includes('invalid') ||
          error.status === 400) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.warn(`[Gemini] Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `Failed to generate text after ${maxRetries} retries. ` +
    `Last error: ${lastError?.message}`
  );
}


/**
 * Generate JSON response from Gemini API
 * @param prompt - The text prompt to send to Gemini
 * @param options - Optional configuration
 * @returns Parsed JSON object
 */
export async function generateGeminiJSON<T = any>(
  prompt: string,
  options?: {
    maxRetries?: number,
    temperature?: number,
    maxTokens?: number,
    responseType?: 'application/json'
  }
): Promise<T> {
  const response = await generateGeminiResponse(prompt, {
    ...options,
    responseFormat: 'json'
  });

  try {
    return JSON.parse(response) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}. Response: ${response}`);
  }
}

/**
 * Generate a chat response with conversation history
 * @param messages - Array of conversation messages
 * @returns Generated response
 */
export async function generateGeminiChat(
  messages: Array<{ role: 'user' | 'model'; content: string }>
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // Start a chat session with history
  const chat = model.startChat({
    history: messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }))
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  
  return result.response.text();
}
