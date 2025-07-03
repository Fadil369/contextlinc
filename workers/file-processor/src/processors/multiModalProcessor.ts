import { Env } from '../index';

export interface ProcessingResult {
  extractedText: string;
  summary: string;
  keyTopics: string[];
  chunks: TextChunk[];
  metadata: any;
  imageAnalysis?: any;
  videoAnalysis?: any;
  audioTranscription?: any;
}

export interface TextChunk {
  text: string;
  index: number;
  startPosition: number;
  endPosition: number;
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'other';
}

export class MultiModalProcessor {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async processFile(fileObject: R2Object, fileType: string, fileName: string): Promise<ProcessingResult> {
    const fileContent = await fileObject.arrayBuffer();
    
    // Determine processor based on file type
    if (this.isTextDocument(fileType)) {
      return await this.processDocument(fileContent, fileType, fileName);
    } else if (this.isImage(fileType)) {
      return await this.processImage(fileContent, fileType, fileName);
    } else if (this.isVideo(fileType)) {
      return await this.processVideo(fileContent, fileType, fileName);
    } else if (this.isAudio(fileType)) {
      return await this.processAudio(fileContent, fileType, fileName);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private async processDocument(content: ArrayBuffer, fileType: string, fileName: string): Promise<ProcessingResult> {
    let extractedText = '';
    let metadata = {};

    try {
      // Use Apache Tika for document processing
      if (this.env.TIKA_SERVER_URL) {
        const result = await this.processWithTika(content, fileType);
        extractedText = result.text;
        metadata = result.metadata;
      } else {
        // Fallback to basic text extraction
        if (fileType === 'text/plain') {
          const decoder = new TextDecoder();
          extractedText = decoder.decode(content);
        } else {
          throw new Error('Tika server not available for document processing');
        }
      }

      // Chunk the text
      const chunks = this.chunkText(extractedText);

      // Generate summary and key topics using AI
      const analysis = await this.analyzeTextContent(extractedText);

      return {
        extractedText,
        summary: analysis.summary,
        keyTopics: analysis.keyTopics,
        chunks,
        metadata: {
          ...metadata,
          fileName,
          fileType,
          wordCount: extractedText.split(/\s+/).length,
          characterCount: extractedText.length,
          chunkCount: chunks.length
        }
      };

    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processImage(content: ArrayBuffer, fileType: string, fileName: string): Promise<ProcessingResult> {
    try {
      // Convert image to base64 for vision API
      const base64Image = this.arrayBufferToBase64(content);
      
      // Use GPT-4 Vision or similar for image analysis
      const imageAnalysis = await this.analyzeImageContent(base64Image, fileType);

      const extractedText = imageAnalysis.description || '';
      const chunks = extractedText ? this.chunkText(extractedText) : [];

      return {
        extractedText,
        summary: imageAnalysis.summary || 'Image analysis completed',
        keyTopics: imageAnalysis.objects || [],
        chunks,
        metadata: {
          fileName,
          fileType,
          imageSize: content.byteLength,
          analysisTimestamp: new Date().toISOString()
        },
        imageAnalysis
      };

    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processVideo(content: ArrayBuffer, fileType: string, fileName: string): Promise<ProcessingResult> {
    try {
      // For video processing, we would typically:
      // 1. Extract frames at intervals
      // 2. Generate captions for key frames
      // 3. Extract audio for transcription
      // 4. Build knowledge graph of video content
      
      // Simplified implementation for now
      const videoAnalysis = {
        summary: `Video file processed: ${fileName}`,
        duration: 'Unknown',
        frameCount: 'Unknown',
        audioPresent: true
      };

      // Placeholder for video processing
      const extractedText = `Video content: ${fileName}. Detailed video processing requires specialized infrastructure.`;
      const chunks = this.chunkText(extractedText);

      return {
        extractedText,
        summary: videoAnalysis.summary,
        keyTopics: ['video', 'multimedia'],
        chunks,
        metadata: {
          fileName,
          fileType,
          videoSize: content.byteLength,
          processingNote: 'Basic video processing - advanced features require additional infrastructure'
        },
        videoAnalysis
      };

    } catch (error) {
      console.error('Video processing error:', error);
      throw new Error(`Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processAudio(content: ArrayBuffer, fileType: string, fileName: string): Promise<ProcessingResult> {
    try {
      // Audio processing would typically involve:
      // 1. Speech-to-text transcription
      // 2. Audio analysis (music, speech, etc.)
      // 3. Speaker identification
      // 4. Sentiment analysis of transcribed content

      // Simplified implementation
      const audioAnalysis = {
        summary: `Audio file processed: ${fileName}`,
        duration: 'Unknown',
        transcriptionAvailable: false
      };

      const extractedText = `Audio content: ${fileName}. Transcription requires speech-to-text service integration.`;
      const chunks = this.chunkText(extractedText);

      return {
        extractedText,
        summary: audioAnalysis.summary,
        keyTopics: ['audio', 'multimedia'],
        chunks,
        metadata: {
          fileName,
          fileType,
          audioSize: content.byteLength,
          processingNote: 'Basic audio processing - transcription requires additional service integration'
        },
        audioTranscription: audioAnalysis
      };

    } catch (error) {
      console.error('Audio processing error:', error);
      throw new Error(`Failed to process audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processWithTika(content: ArrayBuffer, fileType: string): Promise<any> {
    const response = await fetch(`${this.env.TIKA_SERVER_URL}/tika`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Accept': 'application/json',
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error(`Tika processing failed: ${response.status}`);
    }

    const result = await response.json();
    return {
      text: result.content || '',
      metadata: result.metadata || {}
    };
  }

  private chunkText(text: string, maxChunkSize: number = 1000): TextChunk[] {
    const chunks: TextChunk[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    let startPosition = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length > maxChunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex,
          startPosition,
          endPosition: startPosition + currentChunk.length,
          type: this.determineChunkType(currentChunk)
        });
        
        // Start new chunk
        startPosition = startPosition + currentChunk.length;
        currentChunk = trimmedSentence;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        startPosition,
        endPosition: startPosition + currentChunk.length,
        type: this.determineChunkType(currentChunk)
      });
    }

    return chunks;
  }

  private determineChunkType(text: string): TextChunk['type'] {
    if (text.match(/^#{1,6}\s/)) return 'heading';
    if (text.match(/^\s*[-*+]\s/)) return 'list';
    if (text.match(/\|.*\|/)) return 'table';
    return 'paragraph';
  }

  private async analyzeTextContent(text: string): Promise<{ summary: string; keyTopics: string[] }> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a text analyzer. Provide a concise summary and extract key topics from the given text. Respond in JSON format with "summary" and "keyTopics" fields.'
            },
            {
              role: 'user',
              content: `Analyze this text and provide a summary (2-3 sentences) and key topics (max 10):\n\n${text.substring(0, 3000)}`
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        summary: result.summary || 'Text analysis completed',
        keyTopics: result.keyTopics || []
      };

    } catch (error) {
      console.error('Text analysis error:', error);
      return {
        summary: 'Unable to generate summary',
        keyTopics: []
      };
    }
  }

  private async analyzeImageContent(base64Image: string, fileType: string): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and provide: 1) Detailed description, 2) Key objects/elements, 3) Summary. Respond in JSON format.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${fileType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Vision API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);

    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        description: 'Image analysis not available',
        objects: [],
        summary: 'Unable to analyze image'
      };
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private isTextDocument(fileType: string): boolean {
    return fileType.startsWith('text/') || 
           fileType.includes('pdf') ||
           fileType.includes('document') ||
           fileType.includes('spreadsheet') ||
           fileType.includes('presentation');
  }

  private isImage(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  private isVideo(fileType: string): boolean {
    return fileType.startsWith('video/');
  }

  private isAudio(fileType: string): boolean {
    return fileType.startsWith('audio/');
  }
}