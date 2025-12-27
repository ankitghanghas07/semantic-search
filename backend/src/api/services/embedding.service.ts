import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_EMBEDDING_MODEL = 'models/embedding-001';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${GEMINI_EMBEDDING_MODEL}:embedContent`,
      {
        content: {
          parts: [{ text }]
        }
      },
      {
        params: { key: GEMINI_API_KEY },
        timeout: 15_000
      }
    );

    const vector = response.data.embedding.values;
    embeddings.push(vector);
  }

  return embeddings;
}
