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
const INITIAL_RETRY_DELAY = 1000;

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
      // NOTE: We pass the config inside embedContent if we want to set dimensions
      const result = await model.embedContent({
        content: { parts: [{ text }] },
        // Optional: Uncomment below if you need exactly 768 dimensions 
        // outputDimensionality: 768 
      });
      return result.embedding.values;
    } catch (error: any) {
      lastError = error;
      
      if (error.message?.includes('API key') || error.status === 400) {
        throw error; 
      }
      
      if (attempt < retries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw new Error(`Failed after ${MAX_RETRIES} retries. Last error: ${lastError?.message}`);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  // const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const tasks = texts.map(text => 
    limiter.schedule(() => generateEmbeddingWithRetry(model, text))
  );
  
  const results = await Promise.allSettled(tasks);
  const embeddings: number[][] = [];
  const errors: string[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      embeddings.push(result.value);
    } else {
      errors.push(result.reason.message);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Failed to generate some embeddings: ${errors.join('; ')}`);
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