import { GoogleGenerativeAI } from "@google/generative-ai";
import Bottleneck from 'bottleneck';
import * as dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const limiter = new Bottleneck({
  minTime: 100, // 10 requests per second
  maxConcurrent: 5
});

async function generateEmbeddingWithRetry(
  model: any,
  text: string,
  retries = MAX_RETRIES
): Promise<number[]> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message?.includes('API key') || 
          error.message?.includes('invalid') ||
          error.status === 400) {
        throw error; // Fail fast on auth/validation errors
      }
      
      // Check if we should retry
      if (attempt < retries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.warn(
          `Attempt ${attempt + 1} failed for text "${text.substring(0, 50)}...". ` +
          `Retrying in ${delay}ms. Error: ${error.message}`
        );
        await sleep(delay);
      }
    }
  }
  
  // All retries exhausted
  throw new Error(
    `Failed to generate embedding after ${MAX_RETRIES} retries. ` +
    `Last error: ${lastError?.message}`
  );
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const tasks = texts.map(text => 
    limiter.schedule(() => generateEmbeddingWithRetry(model, text))
  );
  
  const results = await Promise.allSettled(tasks);

  const embeddings: number[][] = [];
  const errors: Error[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      embeddings.push(result.value);
    } else {
      errors.push(result.reason);
    }
  }

  if (errors.length > 0) {
    const errorMessages = errors.map(err => err.message).join('; ');
    throw new Error(`Failed to generate some embeddings: ${errorMessages}`);
  }

  return embeddings;
}
// testing
// async function main() {
//   const texts = [
//     "Hello, how are you?",
//     "The weather is nice today",
//     "I love programming in TypeScript",
//     "", // Empty string - might cause issues
//     "A".repeat(10000) // Very long text - might hit limits
//   ];
  
//   try {
//     const { embeddings, errors } = await embedTexts(texts);
    
//     console.log(`\n✓ Successfully generated ${embeddings.filter(e => e.length > 0).length}/${texts.length} embeddings`);
    
//     if (errors.length > 0) {
//       console.log(`\n⚠ Failed to generate ${errors.length} embeddings:`);
//       errors.forEach(err => {
//         console.log(`  - Index ${err.index}: ${err.error}`);
//       });
//     }
    
//     // Display successful embeddings
//     embeddings.forEach((embedding, index) => {
//       if (embedding.length > 0) {
//         console.log(`\nText ${index + 1}: ${texts[index].substring(0, 50)}...`);
//         console.log(`Embedding dimension: ${embedding.length}`);
//         console.log(`First 5 values: [${embedding.slice(0, 5).join(", ")}...]`);
//       }
//     });
    
//   } catch (error) {
//     console.error("Fatal error:", error);
//     process.exit(1);
//   }
// }

// main();