export function buildRagPrompt(
  query: string,
  chunks: { content: string }[]
) {
  const context = chunks
    .map((c, i) => `Source ${i + 1}:\n${c.content}`)
    .join("\n\n");

  return `
You are an assistant answering questions using ONLY the provided sources.

Rules:
- Use ONLY the information in the sources.
- Do NOT use outside knowledge.
- If the answer is not clearly supported by the sources, return:
  {
    "answer": "I don't know",
    "citations": []
  }

- Every sentence in the answer MUST be supported by at least one citation.
- You MUST include citation markers like [1], [2] inside the answer text.
- Do NOT generate an answer without citations.


Citation rules:
- Each source has a numeric ID (1, 2, 3, ...).
- Citations MUST be source numbers.
- Do NOT invent citations.
- Do NOT include citations not used in the answer.
- Citations array MUST NOT be empty if answer is not "I don't know".


Output rules:
- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include explanations.
- Do NOT include text outside JSON.

JSON format:
{
  "answer": string,
  "citations": number[]
}

Sources:
${context}

Question:
${query}
`;
}
