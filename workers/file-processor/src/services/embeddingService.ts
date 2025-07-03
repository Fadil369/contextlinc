import { Env } from '../index';
import { TextChunk } from '../processors/multiModalProcessor';

export interface EmbeddingResult {
  vector: number[];
  model: string;
  text: string;
  chunkIndex: number;
}

export class EmbeddingService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async generateEmbeddings(text: string, chunks: TextChunk[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    try {
      // Generate embedding for full text (if not too long)
      if (text.length < 8000) {
        const fullTextEmbedding = await this.generateSingleEmbedding(text);
        results.push({
          vector: fullTextEmbedding,
          model: 'voyage-multimodal-3',
          text: text.substring(0, 1000), // Store first 1000 chars for reference
          chunkIndex: -1 // -1 indicates full text
        });
      }

      // Generate embeddings for each chunk
      for (const chunk of chunks) {
        try {
          const chunkEmbedding = await this.generateSingleEmbedding(chunk.text);
          results.push({
            vector: chunkEmbedding,
            model: 'voyage-multimodal-3',
            text: chunk.text,
            chunkIndex: chunk.index
          });

          // Add small delay to avoid rate limiting
          await this.delay(100);

        } catch (error) {
          console.error(`Failed to generate embedding for chunk ${chunk.index}:`, error);
          // Continue with other chunks
        }
      }

      return results;

    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateSingleEmbedding(text: string): Promise<number[]> {
    // Clean and prepare text
    const cleanText = this.cleanTextForEmbedding(text);
    
    try {
      // Primary: Use Voyage AI for multimodal embeddings
      return await this.generateVoyageEmbedding(cleanText);
    } catch (voyageError) {
      console.warn('Voyage AI failed, falling back to OpenAI:', voyageError);
      
      try {
        // Fallback: Use OpenAI embeddings
        return await this.generateOpenAIEmbedding(cleanText);
      } catch (openaiError) {
        console.error('Both embedding services failed:', { voyageError, openaiError });
        throw new Error('All embedding services unavailable');
      }
    }
  }

  private async generateVoyageEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.VOYAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [text],
        model: 'voyage-multimodal-3'
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Voyage API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid response format from Voyage API');
    }

    return data.data[0].embedding;
  }

  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.data[0].embedding;
  }

  private cleanTextForEmbedding(text: string): string {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Remove special characters that might interfere with embedding
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Limit length for embedding APIs (most have token limits)
    if (cleaned.length > 8000) {
      cleaned = cleaned.substring(0, 8000);
    }
    
    return cleaned;
  }

  async generateMultimodalEmbedding(text: string, imageData?: string): Promise<number[]> {
    // For multimodal embeddings that combine text and images
    // This would be used when processing documents with embedded images
    
    if (!imageData) {
      return await this.generateSingleEmbedding(text);
    }

    try {
      // Use Voyage multimodal API for text + image embeddings
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.VOYAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: [
            { type: 'text', content: text },
            { type: 'image', content: imageData }
          ],
          model: 'voyage-multimodal-3'
        }),
      });

      if (!response.ok) {
        throw new Error(`Voyage multimodal API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      console.warn('Multimodal embedding failed, using text only:', error);
      return await this.generateSingleEmbedding(text);
    }
  }

  async searchSimilarEmbeddings(
    queryEmbedding: number[],
    userId: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<any[]> {
    // This would implement similarity search using cosine similarity
    // For now, return empty array as D1 doesn't have native vector search
    // In production, you'd use a vector database like Pinecone, Weaviate, or Qdrant
    
    console.log(`Searching for similar embeddings for user ${userId}`);
    
    // Placeholder implementation
    // In a real system, you would:
    // 1. Retrieve embeddings from vector database
    // 2. Calculate cosine similarity
    // 3. Return top matches above threshold
    
    return [];
  }

  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  async batchGenerateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    const batchSize = 10; // Process in batches to avoid rate limits

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        // Process batch with Voyage AI
        const response = await fetch('https://api.voyageai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.env.VOYAGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: batch,
            model: 'voyage-multimodal-3'
          }),
        });

        if (!response.ok) {
          throw new Error(`Batch embedding error: ${response.status}`);
        }

        const data = await response.json();
        
        for (let j = 0; j < data.data.length; j++) {
          results.push({
            vector: data.data[j].embedding,
            model: 'voyage-multimodal-3',
            text: batch[j],
            chunkIndex: i + j
          });
        }

        // Add delay between batches
        await this.delay(500);

      } catch (error) {
        console.error(`Batch embedding failed for batch starting at ${i}:`, error);
        
        // Fall back to individual processing for this batch
        for (let j = 0; j < batch.length; j++) {
          try {
            const embedding = await this.generateSingleEmbedding(batch[j]);
            results.push({
              vector: embedding,
              model: 'voyage-multimodal-3',
              text: batch[j],
              chunkIndex: i + j
            });
            await this.delay(100);
          } catch (individualError) {
            console.error(`Individual embedding failed for text ${i + j}:`, individualError);
          }
        }
      }
    }

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validateEmbedding(embedding: number[]): boolean {
    // Validate embedding vector
    if (!Array.isArray(embedding)) return false;
    if (embedding.length === 0) return false;
    
    // Check for valid numbers
    for (const value of embedding) {
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        return false;
      }
    }
    
    // Check for reasonable vector magnitude
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0 || magnitude > 100) return false;
    
    return true;
  }

  getEmbeddingDimensions(model: string): number {
    switch (model) {
      case 'voyage-multimodal-3':
        return 1024;
      case 'text-embedding-3-small':
        return 1536;
      case 'text-embedding-3-large':
        return 3072;
      default:
        return 1536; // Default to OpenAI small
    }
  }
}