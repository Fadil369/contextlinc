# ContextLinc: Context Engineering Agent Development Instructions

## Project Overview

Build ContextLinc, a next-generation context engineering agent that transforms how AI systems understand and respond to complex user inputs. This platform implements the 11-layer Context Window Architecture (CWA) with sophisticated multi-modal processing capabilities.

## Core Objectives

- **Context Engineering**: Implement dynamic context systems that provide the right information, in the right format, at the right time
- **Multi-Modal Processing**: Handle diverse file types (documents, images, videos, audio, links, text)
- **Intelligent Context Awareness**: Build sophisticated context understanding through memory systems
- **Cross-Platform Accessibility**: Deploy as PWA with mobile and web interfaces
- **Real-Time Interaction**: Chat-based interface with streaming responses
- **Output Versatility**: Generate text, code, images, and video outputs

## Technical Architecture

### Frontend Stack
```
- Framework: Next.js 14+ with React 18+
- UI Library: Tailwind CSS
- State Management: Redux Toolkit + RTK Query
- Real-time: WebSocket integration
- PWA: Service Worker + Manifest
- Mobile: React Native (Phase 2)
```

### Backend Stack
```
- API Gateway: Kong
- Core Services: Node.js/TypeScript microservices
- Authentication: Auth0
- Database: PostgreSQL with pgvector extension
- Cache: Redis
- Message Queue: RabbitMQ
- File Storage: AWS S3/CloudFlare R2
```

### AI Infrastructure
```
- Model Serving: vLLM
- Primary Models: GPT-4o, Claude 3.5 Sonnet
- Embeddings: Voyage Multimodal-3
- Multi-modal Framework: LlamaIndex
- Document Processing: Apache Tika
- Video Processing: NVIDIA AI Blueprint architecture
- Orchestration: Kubernetes + KServe
```

## Project Structure

```
contextlinc/
├── apps/
│   ├── web/                    # Next.js PWA
│   ├── mobile/                 # React Native (Phase 2)
│   └── api/                    # Node.js API services
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── context-engine/         # Core context engineering logic
│   ├── multi-modal/           # File processing pipeline
│   ├── memory-system/         # Three-tier memory architecture
│   └── shared/                # Shared utilities
├── services/
│   ├── context-service/       # Context management microservice
│   ├── inference-service/     # AI model inference
│   ├── file-processor/        # Multi-modal file processing
│   ├── memory-service/        # Memory management
│   └── auth-service/          # Authentication
├── infrastructure/
│   ├── docker/               # Container configurations
│   ├── kubernetes/           # K8s deployment manifests
│   └── terraform/            # Infrastructure as code
└── docs/                     # Documentation
```

## Context Window Architecture Implementation

### Layer 1: Instructions Layer
```typescript
interface InstructionsLayer {
  constitution: string;
  persona: PersonaConfig;
  goals: string[];
  ethicalBoundaries: EthicalRule[];
  capabilities: Capability[];
}
```

### Layer 2: User Info Layer
```typescript
interface UserInfoLayer {
  userId: string;
  preferences: UserPreferences;
  profile: UserProfile;
  permissions: Permission[];
  customizations: Record<string, any>;
}
```

### Layer 3: Knowledge Layer
```typescript
interface KnowledgeLayer {
  documents: RetrievedDocument[];
  domainExpertise: ExpertiseArea[];
  ragResults: RAGResult[];
  knowledgeGraph: KnowledgeNode[];
}
```

### Layer 4: Task/Goal State
```typescript
interface TaskGoalState {
  currentTask: Task;
  taskHistory: Task[];
  workflowState: WorkflowStep[];
  goals: Goal[];
  progress: ProgressTracker;
}
```

### Layer 5: Memory Layer
```typescript
interface MemoryLayer {
  shortTerm: ShortTermMemory;
  mediumTerm: SessionMemory;
  longTerm: PersistentMemory;
  semanticIndex: SemanticIndex;
}
```

### Layers 6-11: Tools, Examples, Context, Constraints, Output Format, User Query
```typescript
// Implement remaining layers following similar patterns
```

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

#### 1.1 Project Setup
```bash
# Initialize monorepo with Turbo
npx create-turbo@latest contextlinc --package-manager pnpm
cd contextlinc

# Setup workspace structure
mkdir -p apps/{web,api} packages/{ui,context-engine,multi-modal,memory-system,shared}
mkdir -p services/{context-service,inference-service,file-processor,memory-service,auth-service}
mkdir -p infrastructure/{docker,kubernetes,terraform}
```

#### 1.2 Core Web Application
```typescript
// apps/web/app/page.tsx
import { ChatInterface } from '@/components/chat/ChatInterface';
import { FileUpload } from '@/components/upload/FileUpload';
import { ContextPanel } from '@/components/context/ContextPanel';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">Dr. Mohamed El Fadil</span>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-blue-500 bg-clip-text text-transparent">
                BrainSAIT
              </span>
            </div>
            <h1 className="text-2xl font-bold">ContextLinc</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ChatInterface />
          </div>
          <div className="space-y-6">
            <FileUpload />
            <ContextPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
```

#### 1.3 Chat Interface Component
```typescript
// apps/web/components/chat/ChatInterface.tsx
'use client';

import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, connectionStatus } = useWebSocket();

  const handleSendMessage = async (content: string, files?: File[]) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      files,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Process with context engine
    setIsTyping(true);
    try {
      const response = await sendMessage({
        content,
        files,
        context: await buildContextWindow(),
      });
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'assistant',
        content: response.content,
        context: response.context,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
}
```

#### 1.4 File Upload Component
```typescript
// apps/web/components/upload/FileUpload.tsx
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileProcessor } from '@contextlinc/multi-modal';

export function FileUpload() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        // Process file through multi-modal pipeline
        const processed = await FileProcessor.process(file);
        
        // Add to context
        await addToContext({
          type: 'file',
          metadata: processed.metadata,
          content: processed.content,
          embeddings: processed.embeddings,
        });
        
        // Update UI
        showSuccessToast(`${file.name} processed successfully`);
      } catch (error) {
        showErrorToast(`Failed to process ${file.name}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.csv'],
      'application/*': ['.pdf', '.docx', '.xlsx', '.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-gray-600 hover:border-gray-500'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="text-4xl">📁</div>
        <p className="text-sm text-gray-300">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-gray-500">
          Supports: Documents, Images, Videos, Audio, Links
        </p>
      </div>
    </div>
  );
}
```

#### 1.5 Multi-Modal File Processor
```typescript
// packages/multi-modal/src/FileProcessor.ts
import { TikaProcessor } from './processors/TikaProcessor';
import { ImageProcessor } from './processors/ImageProcessor';
import { VideoProcessor } from './processors/VideoProcessor';
import { VoyageEmbeddings } from './embeddings/VoyageEmbeddings';

export class FileProcessor {
  static async process(file: File): Promise<ProcessedFile> {
    const fileType = this.detectFileType(file);
    
    let processor;
    switch (fileType) {
      case 'document':
        processor = new TikaProcessor();
        break;
      case 'image':
        processor = new ImageProcessor();
        break;
      case 'video':
        processor = new VideoProcessor();
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Extract content and metadata
    const extracted = await processor.extract(file);
    
    // Generate embeddings
    const embeddings = await VoyageEmbeddings.generate(
      extracted.content,
      extracted.images
    );

    return {
      metadata: {
        filename: file.name,
        size: file.size,
        type: fileType,
        ...extracted.metadata,
      },
      content: extracted.content,
      embeddings,
      chunks: extracted.chunks,
    };
  }

  private static detectFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['pdf', 'docx', 'txt', 'md'].includes(extension!)) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension!)) return 'image';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension!)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(extension!)) return 'audio';
    
    return 'unknown';
  }
}
```

#### 1.6 Context Engine Core
```typescript
// packages/context-engine/src/ContextEngine.ts
import { ContextWindowArchitecture } from './architecture/ContextWindowArchitecture';
import { MemorySystem } from '@contextlinc/memory-system';

export class ContextEngine {
  private cwa: ContextWindowArchitecture;
  private memory: MemorySystem;

  constructor() {
    this.cwa = new ContextWindowArchitecture();
    this.memory = new MemorySystem();
  }

  async buildContext(userQuery: string, userId: string): Promise<ContextWindow> {
    // Layer 1: Instructions
    const instructions = await this.cwa.buildInstructionsLayer();
    
    // Layer 2: User Info
    const userInfo = await this.cwa.buildUserInfoLayer(userId);
    
    // Layer 3: Knowledge (RAG)
    const knowledge = await this.cwa.buildKnowledgeLayer(userQuery, userId);
    
    // Layer 4: Task/Goal State
    const taskState = await this.cwa.buildTaskGoalState(userId);
    
    // Layer 5: Memory
    const memory = await this.memory.retrieve(userQuery, userId);
    
    // Layer 6: Tools
    const tools = await this.cwa.buildToolsLayer();
    
    // Layer 7: Examples
    const examples = await this.cwa.buildExamplesLayer(userQuery);
    
    // Layer 8: Context
    const context = await this.cwa.buildContextLayer(userId);
    
    // Layer 9: Constraints
    const constraints = await this.cwa.buildConstraintsLayer();
    
    // Layer 10: Output Format
    const outputFormat = await this.cwa.buildOutputFormatLayer(userQuery);
    
    // Layer 11: User Query
    const processedQuery = await this.cwa.processUserQuery(userQuery);

    return {
      instructions,
      userInfo,
      knowledge,
      taskState,
      memory,
      tools,
      examples,
      context,
      constraints,
      outputFormat,
      userQuery: processedQuery,
    };
  }

  async processResponse(response: string, userId: string): Promise<void> {
    // Update memory systems
    await this.memory.store(response, userId);
    
    // Update context state
    await this.cwa.updateState(response, userId);
  }
}
```

### Phase 2: Enhancement (Weeks 5-8)

#### 2.1 Three-Tier Memory System
```typescript
// packages/memory-system/src/MemorySystem.ts
export class MemorySystem {
  private shortTerm: ShortTermMemory;
  private mediumTerm: SessionMemory;
  private longTerm: PersistentMemory;

  async store(content: string, userId: string, type: MemoryType): Promise<void> {
    // Short-term: Current conversation context
    await this.shortTerm.add(content, { userId, timestamp: Date.now() });
    
    // Medium-term: Session-based memory
    if (this.isSignificant(content)) {
      await this.mediumTerm.add(content, { userId, session: getCurrentSession(userId) });
    }
    
    // Long-term: Persistent semantic memory
    if (this.isPersistentWorthy(content)) {
      const embedding = await this.generateEmbedding(content);
      await this.longTerm.add(content, embedding, { userId });
    }
  }

  async retrieve(query: string, userId: string): Promise<MemoryResult[]> {
    const results = [];
    
    // Search short-term memory
    results.push(...await this.shortTerm.search(query, userId));
    
    // Search medium-term memory
    results.push(...await this.mediumTerm.search(query, userId));
    
    // Search long-term memory with semantic similarity
    const embedding = await this.generateEmbedding(query);
    results.push(...await this.longTerm.semanticSearch(embedding, userId));
    
    return this.rankAndFilter(results);
  }
}
```

#### 2.2 Video Processing with NVIDIA Blueprint
```typescript
// packages/multi-modal/src/processors/VideoProcessor.ts
export class VideoProcessor {
  async extract(file: File): Promise<ExtractedContent> {
    // Break video into manageable chunks
    const chunks = await this.chunkVideo(file, { duration: 30 }); // 30-second chunks
    
    const processedChunks = [];
    for (const chunk of chunks) {
      // Extract frames at key intervals
      const frames = await this.extractFrames(chunk, { interval: 5 }); // Every 5 seconds
      
      // Generate dense captions for each segment
      const captions = await this.generateCaptions(frames);
      
      // Extract audio transcript
      const transcript = await this.extractAudio(chunk);
      
      processedChunks.push({
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        frames,
        captions,
        transcript,
        metadata: chunk.metadata,
      });
    }

    // Build knowledge graph to maintain relationships
    const knowledgeGraph = await this.buildKnowledgeGraph(processedChunks);
    
    return {
      content: this.combineContent(processedChunks),
      chunks: processedChunks,
      knowledgeGraph,
      metadata: {
        duration: await this.getVideoDuration(file),
        resolution: await this.getVideoResolution(file),
        framerate: await this.getFramerate(file),
      },
    };
  }
}
```

#### 2.3 Real-time WebSocket Integration
```typescript
// apps/api/src/websocket/WebSocketHandler.ts
import { WebSocketServer } from 'ws';
import { ContextEngine } from '@contextlinc/context-engine';

export class WebSocketHandler {
  private wss: WebSocketServer;
  private contextEngine: ContextEngine;

  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.contextEngine = new ContextEngine();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws, request) => {
      const userId = this.extractUserId(request);
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Build context window
          const context = await this.contextEngine.buildContext(message.content, userId);
          
          // Stream response
          const response = await this.streamResponse(context, ws);
          
          // Update memory and context
          await this.contextEngine.processResponse(response, userId);
          
        } catch (error) {
          ws.send(JSON.stringify({ error: error.message }));
        }
      });
    });
  }

  private async streamResponse(context: ContextWindow, ws: WebSocket): Promise<string> {
    // Implementation for streaming AI responses
    // Use vLLM for optimized inference
  }
}
```

### Phase 3: Optimization (Weeks 9-12)

#### 3.1 Advanced Context Compression
```typescript
// packages/context-engine/src/compression/ContextCompressor.ts
export class ContextCompressor {
  async compress(context: ContextWindow): Promise<CompressedContext> {
    // Intelligent summarization
    const summarized = await this.summarizeContext(context);
    
    // Relevance-based pruning
    const pruned = await this.pruneByRelevance(summarized);
    
    // Token budget optimization
    const optimized = await this.optimizeTokenUsage(pruned);
    
    return optimized;
  }

  private async summarizeContext(context: ContextWindow): Promise<ContextWindow> {
    // Use LLM to create concise summaries of less critical sections
    // Preserve high-importance information in full
  }

  private async pruneByRelevance(context: ContextWindow): Promise<ContextWindow> {
    // Calculate relevance scores for each context component
    // Remove low-relevance items based on thresholds
  }
}
```

#### 3.2 Multi-Format Output Generation
```typescript
// packages/context-engine/src/output/OutputGenerator.ts
export class OutputGenerator {
  async generateResponse(context: ContextWindow, outputFormat: OutputFormat): Promise<GeneratedOutput> {
    switch (outputFormat.type) {
      case 'text':
        return await this.generateText(context, outputFormat.options);
      case 'code':
        return await this.generateCode(context, outputFormat.language);
      case 'image':
        return await this.generateImage(context, outputFormat.options);
      case 'video':
        return await this.generateVideo(context, outputFormat.options);
      default:
        throw new Error(`Unsupported output format: ${outputFormat.type}`);
    }
  }

  private async generateText(context: ContextWindow, options: TextOptions): Promise<TextOutput> {
    // Use primary LLM (GPT-4o or Claude 3.5) for text generation
    const prompt = await this.buildPrompt(context);
    const response = await this.llmClient.complete(prompt, options);
    
    return {
      content: response.text,
      metadata: {
        model: response.model,
        tokens: response.tokens,
        confidence: response.confidence,
      },
    };
  }

  private async generateCode(context: ContextWindow, language: string): Promise<CodeOutput> {
    // Specialized code generation with syntax validation
  }

  private async generateImage(context: ContextWindow, options: ImageOptions): Promise<ImageOutput> {
    // Integration with image generation models (DALL-E, Midjourney, etc.)
  }
}
```

## Deployment Configuration

### Docker Configuration
```dockerfile
# infrastructure/docker/Dockerfile.api
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Kubernetes Deployment
```yaml
# infrastructure/kubernetes/contextlinc-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: contextlinc-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: contextlinc-api
  template:
    metadata:
      labels:
        app: contextlinc-api
    spec:
      containers:
      - name: api
        image: contextlinc/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: contextlinc-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: contextlinc-secrets
              key: redis-url
```

### Environment Configuration
```env
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/contextlinc
REDIS_URL=redis://localhost:6379
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
VOYAGE_API_KEY=your-voyage-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

## Development Workflow

### Getting Started
```bash
# Clone and setup
git clone https://github.com/brainsait/contextlinc.git
cd contextlinc
pnpm install

# Setup database
pnpm db:setup
pnpm db:migrate

# Start development servers
pnpm dev
```

### Key Commands
```bash
# Development
pnpm dev              # Start all development servers
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with test data
pnpm db:reset         # Reset database

# Deployment
pnpm deploy:staging   # Deploy to staging
pnpm deploy:prod      # Deploy to production
```

## Testing Strategy

### Unit Tests
```typescript
// packages/context-engine/src/__tests__/ContextEngine.test.ts
import { ContextEngine } from '../ContextEngine';

describe('ContextEngine', () => {
  let engine: ContextEngine;

  beforeEach(() => {
    engine = new ContextEngine();
  });

  it('should build complete context window', async () => {
    const context = await engine.buildContext('test query', 'user123');
    
    expect(context.instructions).toBeDefined();
    expect(context.userInfo).toBeDefined();
    expect(context.knowledge).toBeDefined();
    // ... test all 11 layers
  });

  it('should compress context when over token limit', async () => {
    const largeContext = createLargeContext();
    const compressed = await engine.compressContext(largeContext);
    
    expect(compressed.tokenCount).toBeLessThan(MAX_TOKEN_LIMIT);
  });
});
```

### Integration Tests
```typescript
// apps/api/src/__tests__/integration/chat.test.ts
import request from 'supertest';
import { app } from '../../app';

describe('Chat API', () => {
  it('should process multimodal message', async () => {
    const response = await request(app)
      .post('/api/chat')
      .attach('file', 'test-document.pdf')
      .field('message', 'Analyze this document')
      .expect(200);

    expect(response.body.message).toBeDefined();
    expect(response.body.context).toBeDefined();
  });
});
```

## Performance Optimization

### Caching Strategy
```typescript
// packages/shared/src/cache/CacheManager.ts
export class CacheManager {
  private redis: Redis;

  async cacheContextWindow(userId: string, context: ContextWindow): Promise<void> {
    await this.redis.setex(
      `context:${userId}`,
      300, // 5 minutes
      JSON.stringify(context)
    );
  }

  async getCachedContext(userId: string): Promise<ContextWindow | null> {
    const cached = await this.redis.get(`context:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

### Database Optimization
```sql
-- Database indexes for performance
CREATE INDEX idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_messages_user_timestamp ON messages(user_id, created_at DESC);
CREATE INDEX idx_files_user_type ON files(user_id, file_type);
```

## Security Considerations

### Authentication & Authorization
```typescript
// packages/shared/src/auth/AuthMiddleware.ts
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyAuth0Token(token);
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

### Data Privacy
```typescript
// packages/shared/src/privacy/DataProcessor.ts
export class DataProcessor {
  static async sanitizeUserData(data: any): Promise<any> {
    // Remove PII before processing
    // Implement data anonymization
    // Apply privacy policies
  }

  static async encryptSensitiveData(data: any): Promise<string> {
    // Encrypt sensitive information before storage
  }
}
```

## Success Metrics & Monitoring

### Key Performance Indicators
```typescript
// packages/shared/src/metrics/MetricsCollector.ts
export class MetricsCollector {
  async trackResponseTime(duration: number): Promise<void> {
    await this.prometheus.histogram('response_time_seconds').observe(duration);
  }

  async trackContextRelevance(score: number): Promise<void> {
    await this.prometheus.gauge('context_relevance_score').set(score);
  }

  async trackTokenUsage(tokens: number): Promise<void> {
    await this.prometheus.counter('tokens_used_total').inc(tokens);
  }
}
```

### Health Checks
```typescript
// apps/api/src/health/HealthChecker.ts
export class HealthChecker {
  async checkDatabase(): Promise<HealthStatus> {
    // Verify database connectivity and performance
  }

  async checkAIServices(): Promise<HealthStatus> {
    // Verify AI model availability and response times
  }

  async checkMemorySystem(): Promise<HealthStatus> {
    // Verify memory system performance
  }
}
```

## Additional Implementation Notes

1. **Error Handling**: Implement comprehensive error handling with proper logging and user feedback
2. **Rate Limiting**: Implement rate limiting to prevent abuse and ensure fair usage
3. **Content Moderation**: Add content filtering and safety measures
4. **Backup Strategy**: Implement automated backups for user data and context
5. **Monitoring**: Set up comprehensive monitoring with alerts for system health
6. **Documentation**: Maintain up-to-date API documentation and user guides

## Target Success Metrics

- **Performance**: AI response time under 2 seconds for 95% of queries
- **Scalability**: Support for 10,000+ concurrent users
- **Quality**: Context relevance score above 90%
- **Cost Efficiency**: Under $0.10 per user interaction
- **Reliability**: 99.9% uptime with automatic failover

## Getting Started Command

```bash
# Initialize the project
npx create-contextlinc-app contextlinc --template=full-stack
cd contextlinc
pnpm install
pnpm dev
```

This comprehensive specification provides Claude Code with all the necessary information to build ContextLinc from scratch, implementing the sophisticated context engineering principles that will transform AI agent interactions for BRAINSAIT LTD.