import { Env } from '../index';
import { ContextWindow } from './contextEngine';

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  confidence: number;
  processingTime: string;
  reasoning?: string;
}

export interface AIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export class AIService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async generateResponse(contextWindow: ContextWindow, options: AIOptions = {}): Promise<AIResponse> {
    const startTime = Date.now();
    const model = options.model || 'gpt-4';

    try {
      // Build the prompt from context window
      const prompt = this.buildPromptFromContext(contextWindow);
      
      // Route to appropriate AI service based on model
      let response: AIResponse;
      
      if (model.startsWith('gpt-')) {
        response = await this.callOpenAI(prompt, model, options);
      } else if (model.startsWith('claude-')) {
        response = await this.callAnthropic(prompt, model, options);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
      
      return {
        ...response,
        processingTime,
        confidence: this.calculateConfidence(response, contextWindow)
      };

    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPromptFromContext(contextWindow: ContextWindow): string {
    const activeLayers = contextWindow.layers.filter(layer => layer.status === 'active');
    
    let prompt = '';

    // Add system instructions from Layer 1
    const instructionsLayer = activeLayers.find(l => l.id === 1);
    if (instructionsLayer) {
      prompt += `# System Instructions\n`;
      prompt += `Constitution: ${instructionsLayer.data.constitution}\n`;
      prompt += `Persona: ${instructionsLayer.data.persona}\n`;
      prompt += `Capabilities: ${instructionsLayer.data.capabilities.join(', ')}\n\n`;
    }

    // Add user context from Layer 2
    const userInfoLayer = activeLayers.find(l => l.id === 2);
    if (userInfoLayer) {
      prompt += `# User Context\n`;
      prompt += `Session: ${userInfoLayer.data.sessionId}\n`;
      prompt += `Interaction Count: ${userInfoLayer.data.sessionStats?.message_count || 0}\n`;
      if (userInfoLayer.data.preferences) {
        prompt += `Preferences: ${JSON.stringify(userInfoLayer.data.preferences)}\n`;
      }
      prompt += '\n';
    }

    // Add knowledge from Layer 3
    const knowledgeLayer = activeLayers.find(l => l.id === 3);
    if (knowledgeLayer && knowledgeLayer.data.retrievedDocuments.length > 0) {
      prompt += `# Relevant Knowledge\n`;
      knowledgeLayer.data.retrievedDocuments.forEach((doc: any, index: number) => {
        prompt += `Document ${index + 1}: ${doc.content}\n`;
      });
      prompt += '\n';
    }

    // Add file context
    if (knowledgeLayer && knowledgeLayer.data.fileContext.length > 0) {
      prompt += `# File Context\n`;
      knowledgeLayer.data.fileContext.forEach((file: any) => {
        prompt += `File: ${file.filename} (${file.file_type})\n`;
        if (file.extracted_content) {
          prompt += `Content: ${file.extracted_content}\n`;
        }
      });
      prompt += '\n';
    }

    // Add memory from Layer 5
    const memoryLayer = activeLayers.find(l => l.id === 5);
    if (memoryLayer) {
      const memory = memoryLayer.data;
      if (memory.shortTerm.items.length > 0) {
        prompt += `# Recent Conversation Context\n`;
        memory.shortTerm.items.forEach((item: any) => {
          prompt += `${item.type}: ${item.content}\n`;
        });
        prompt += '\n';
      }
      
      if (memory.longTerm.items.length > 0) {
        prompt += `# Relevant Past Context\n`;
        memory.longTerm.items.slice(0, 3).forEach((item: any) => {
          prompt += `- ${item.summary}\n`;
        });
        prompt += '\n';
      }
    }

    // Add examples from Layer 7
    const examplesLayer = activeLayers.find(l => l.id === 7);
    if (examplesLayer && examplesLayer.data.fewShot.length > 0) {
      prompt += `# Examples\n`;
      examplesLayer.data.fewShot.forEach((example: any, index: number) => {
        prompt += `Example ${index + 1}:\n`;
        prompt += `User: ${example.input}\n`;
        prompt += `Assistant: ${example.output}\n\n`;
      });
    }

    // Add constraints from Layer 9
    const constraintsLayer = activeLayers.find(l => l.id === 9);
    if (constraintsLayer) {
      prompt += `# Constraints\n`;
      prompt += `- Maintain factual accuracy and cite sources when possible\n`;
      prompt += `- Respect privacy and data security\n`;
      prompt += `- Provide helpful, relevant responses\n`;
      prompt += `- If uncertain, acknowledge limitations\n\n`;
    }

    // Add output format from Layer 10
    const outputFormatLayer = activeLayers.find(l => l.id === 10);
    if (outputFormatLayer) {
      prompt += `# Response Format\n`;
      prompt += `Preferred format: ${outputFormatLayer.data.preferredFormat}\n`;
      prompt += `Style: ${outputFormatLayer.data.style.tone}, ${outputFormatLayer.data.style.detail}\n`;
      prompt += `Include confidence level and processing details\n\n`;
    }

    // Add user query from Layer 11
    const userQueryLayer = activeLayers.find(l => l.id === 11);
    if (userQueryLayer) {
      prompt += `# User Query\n`;
      prompt += `Original: ${userQueryLayer.data.original}\n`;
      prompt += `Intent: ${userQueryLayer.data.intent}\n`;
      prompt += `Complexity: ${userQueryLayer.data.complexity}\n`;
      prompt += `Expected Response Type: ${userQueryLayer.data.expectedResponseType}\n\n`;
    }

    prompt += `Please provide a comprehensive response that demonstrates sophisticated context awareness and leverages all available context layers.`;

    return prompt;
  }

  private async callOpenAI(prompt: string, model: string, options: AIOptions): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are ContextLinc, a next-generation context-aware AI assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
      confidence: 0.85, // Will be calculated later
      processingTime: '0s' // Will be set by caller
    };
  }

  private async callAnthropic(prompt: string, model: string, options: AIOptions): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: data.model,
      usage: {
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      confidence: 0.85, // Will be calculated later
      processingTime: '0s' // Will be set by caller
    };
  }

  private calculateConfidence(response: AIResponse, contextWindow: ContextWindow): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on context quality
    const relevanceScore = contextWindow.relevanceScore;
    confidence += relevanceScore * 0.3;

    // Increase confidence based on active layers
    const layerCount = contextWindow.activeLayers.length;
    confidence += (layerCount / 11) * 0.2;

    // Adjust based on response length (longer responses often more confident)
    const responseLength = response.content.length;
    if (responseLength > 500) confidence += 0.1;
    if (responseLength > 1000) confidence += 0.1;

    // Adjust based on model type
    if (response.model.includes('gpt-4')) confidence += 0.1;
    if (response.model.includes('claude-3')) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use Voyage AI for embeddings
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
        throw new Error(`Voyage API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      console.error('Embedding generation error:', error);
      // Fallback to OpenAI embeddings
      return await this.generateOpenAIEmbedding(text);
    }
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
      throw new Error(`OpenAI Embeddings API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async analyzeContent(content: string, contentType: string): Promise<any> {
    const prompt = `Analyze the following ${contentType} content and extract key information:

Content: ${content}

Please provide:
1. Summary (2-3 sentences)
2. Key topics and themes
3. Important entities (people, places, organizations)
4. Sentiment analysis
5. Content category
6. Relevance for context engineering

Respond in JSON format.`;

    try {
      const response = await this.callOpenAI(prompt, 'gpt-3.5-turbo', {
        maxTokens: 1024,
        temperature: 0.3
      });

      // Try to parse JSON response
      try {
        return JSON.parse(response.content);
      } catch {
        // If JSON parsing fails, return structured response
        return {
          summary: response.content.substring(0, 500),
          analysis: 'Content analysis completed',
          confidence: response.confidence
        };
      }
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        summary: 'Unable to analyze content',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}