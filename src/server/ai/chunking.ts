/**
 * Utilities for splitting long transcripts into paragraph-bounded chunks
 * to stay safely within LLM translation context windows.
 */

export function splitTextIntoChunks(text: string, maxChunkLength = 1500): string[] {
  if (!text || text.length <= maxChunkLength) {
    return [text];
  }

  // Split by double linebreaks or paragraph boundaries first
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length <= maxChunkLength) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }

      // If a single paragraph is longer than maxChunkLength, split by sentences
      if (para.length > maxChunkLength) {
        const sentences = para.split(/(?<=[.!?।])\s+/);
        let sentenceChunk = "";

        for (const sentence of sentences) {
          if ((sentenceChunk + " " + sentence).length <= maxChunkLength) {
            sentenceChunk = sentenceChunk ? `${sentenceChunk} ${sentence}` : sentence;
          } else {
            if (sentenceChunk) chunks.push(sentenceChunk);
            sentenceChunk = sentence;
          }
        }
        currentChunk = sentenceChunk;
      } else {
        currentChunk = para;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
