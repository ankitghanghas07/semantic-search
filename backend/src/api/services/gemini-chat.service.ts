// gemini-chat.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
// import * as path from "path";

// // Load environment variables
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

dotenv.config();

// Configuration
const MODEL_NAME = "gemini-2.0-flash-exp"; // Free tier model
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Sleep utility
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
  }
): Promise<string> {
  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }

  // Initialize the Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: {
      temperature: options?.temperature ?? 0,
      maxOutputTokens: options?.maxTokens ?? 2048,
    }
  });

  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  let lastError: Error | null = null;

  // Retry loop
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

      // Check if we should retry
      if (attempt < maxRetries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.warn(`[Gemini] Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Failed to generate text after ${maxRetries} retries. ` +
    `Last error: ${lastError?.message}`
  );
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

  // Send the latest message
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  
  return result.response.text();
}

// ============================================================================
// TESTING CODE - Only runs when this file is executed directly
// ============================================================================

async function runTests() {
  console.log('='.repeat(70));
  console.log('GEMINI API SERVICE - TESTS');
  console.log('='.repeat(70));

  // Check API key
  console.log('\n1. Checking API Key...');
  if (process.env.GEMINI_API_KEY) {
    console.log('   ✓ API Key found:', process.env.GEMINI_API_KEY.substring(0, 20) + '...');
  } else {
    console.error('   ✗ API Key not found in .env file');
    console.error('   Make sure GEMINI_API_KEY is set in your .env file');
    process.exit(1);
  }

  try {
    // Test 1: Simple text generation
    console.log('\n2. Test: Simple Text Generation');
    console.log('   Prompt: "Write a haiku about TypeScript"');
    const startTime1 = Date.now();
    const response1 = await generateGeminiResponse("Write a haiku about TypeScript");
    const elapsed1 = Date.now() - startTime1;
    
    console.log('\n   Response:');
    console.log('   ' + '-'.repeat(66));
    console.log('   ' + response1.split('\n').join('\n   '));
    console.log('   ' + '-'.repeat(66));
    console.log(`   ✓ Completed in ${elapsed1}ms`);
    console.log(`   Response length: ${response1.length} characters`);

    // Test 2: Text generation with options
    console.log('\n3. Test: Text Generation with Custom Options');
    console.log('   Prompt: "Explain TypeScript in one sentence"');
    console.log('   Options: temperature=0.3, maxTokens=100');
    const startTime2 = Date.now();
    const response2 = await generateGeminiResponse(
      "Explain TypeScript in one sentence",
      { temperature: 0.3, maxTokens: 100 }
    );
    const elapsed2 = Date.now() - startTime2;
    
    console.log('\n   Response:', response2);
    console.log(`   ✓ Completed in ${elapsed2}ms`);

    // Test 3: Chat with conversation history
    console.log('\n4. Test: Chat with Conversation History');
    const conversation = [
      { role: 'user' as const, content: 'Hi! My name is Alex.' },
      { role: 'model' as const, content: 'Hello Alex! Nice to meet you. How can I help you today?' },
      { role: 'user' as const, content: 'What is my name?' }
    ];
    
    console.log('   Conversation:');
    conversation.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}]: ${msg.content}`);
    });
    
    const startTime3 = Date.now();
    const response3 = await generateGeminiChat(conversation);
    const elapsed3 = Date.now() - startTime3;
    
    console.log('\n   Response:', response3);
    console.log(`   ✓ Completed in ${elapsed3}ms`);

    // Test 4: Command line prompt (if provided)
    const customPrompt = process.argv[2];
    if (customPrompt) {
      console.log('\n5. Test: Custom Prompt from Command Line');
      console.log('   Prompt:', customPrompt);
      const startTime4 = Date.now();
      const response4 = await generateGeminiResponse(customPrompt);
      const elapsed4 = Date.now() - startTime4;
      
      console.log('\n   Response:');
      console.log('   ' + '-'.repeat(66));
      console.log('   ' + response4.split('\n').join('\n   '));
      console.log('   ' + '-'.repeat(66));
      console.log(`   ✓ Completed in ${elapsed4}ms`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✓ ALL TESTS PASSED');
    console.log('='.repeat(70));

  } catch (error: any) {
    console.error('\n' + '='.repeat(70));
    console.error('✗ TEST FAILED');
    console.error('='.repeat(70));
    console.error('\nError:', error.message);
    
    if (error.message?.includes('API key')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check that GEMINI_API_KEY is in your .env file');
      console.error('   2. Verify the API key is valid');
      console.error('   3. Make sure the .env file is in the correct location');
    }
    
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

// Run tests only if this file is executed directly
if (require.main === module) {
  console.log('[INFO] Running in test mode...\n');
  runTests().catch(console.error);
} else {
  console.log('[INFO] gemini-chat.service loaded as module');
}