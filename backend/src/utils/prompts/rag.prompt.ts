export function buildRagPrompt(
  query: string,
  chunks: { content: string }[]
) {
  const context = chunks
    .map((c, i) => `Source ${i + 1}:\n${c.content}`)
    .join('\n\n');

  return `
You are a helpful AI assistant.

Answer the question ONLY using the information from the sources below.
If the answer is not present in the sources, reply exactly:
"I don't know based on the provided documents."

Sources:
${context}

Question:
${query}

Answer:
`;
}
