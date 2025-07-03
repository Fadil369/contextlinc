# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the ContextLinc project repository - a comprehensive context engineering platform for building next-generation AI agents. The repository currently contains documentation and specifications for implementing a sophisticated multi-modal AI system that transforms simple chatbots into intelligent assistants through advanced context management.

## Project Architecture

ContextLinc implements the **11-layer Context Window Architecture (CWA)** as its core design pattern:

1. **Instructions Layer** - AI constitution, persona, goals, ethical boundaries
2. **User Info Layer** - Personalization data, preferences, account details  
3. **Knowledge Layer** - Retrieved documents and domain expertise through RAG
4. **Task/Goal State** - Multi-step task management and workflow tracking
5. **Memory Layer** - Three-tier memory system (short/medium/long-term)
6. **Tools Layer** - External tool definitions and capabilities
7. **Examples Layer** - Few-shot learning examples and demonstrations
8. **Context Layer** - Current conversation state and immediate context
9. **Constraints Layer** - Operational limits and safety guidelines
10. **Output Format** - Response structure and formatting requirements
11. **User Query** - The immediate input triggering generation

### Multi-Modal Processing Pipeline

The system processes diverse content types through:
```
Input → Format Detection → Preprocessing → AI Analysis → 
Metadata Extraction → Vector Generation → Context Integration → Storage
```

## Technical Stack (Planned Implementation)

### Frontend
- **Framework**: Next.js 14+ with React 18+
- **UI Library**: Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **Real-time**: WebSocket integration
- **Deployment**: Progressive Web App (PWA)

### Backend
- **API Gateway**: Kong
- **Core Services**: Node.js/TypeScript microservices
- **Authentication**: Auth0
- **Database**: PostgreSQL with pgvector extension
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **File Storage**: AWS S3/CloudFlare R2

### AI Infrastructure
- **Model Serving**: vLLM for optimized inference
- **Primary Models**: GPT-4o, Claude 3.5 Sonnet
- **Embeddings**: Voyage Multimodal-3
- **Multi-modal Framework**: LlamaIndex
- **Document Processing**: Apache Tika
- **Video Processing**: NVIDIA AI Blueprint architecture
- **Orchestration**: Kubernetes + KServe

## Project Structure (Planned)

The project will follow a monorepo structure with clear separation of concerns:

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
└── infrastructure/
    ├── docker/               # Container configurations
    ├── kubernetes/           # K8s deployment manifests
    └── terraform/            # Infrastructure as code
```

## Development Workflow (When Implemented)

### Setup Commands
```bash
# Initialize monorepo with Turbo
npx create-turbo@latest contextlinc --package-manager pnpm
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
pnpm dev              # Start all development servers
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with test data
pnpm deploy:staging   # Deploy to staging
pnpm deploy:prod      # Deploy to production
```

## Key Implementation Principles

### Context Engineering Focus
- Most agent failures are **context failures, not model failures**
- Dynamic systems that provide the right information, in the right format, at the right time
- Context is the output of a sophisticated system that runs before the main LLM call

### Memory Architecture
- **Short-term**: Current conversation context within context window
- **Medium-term**: Session-based continuity across conversations
- **Long-term**: Persistent semantic memory using vector indexing

### Multi-Modal Processing
- Support for documents, images, videos, audio, and links
- Apache Tika for enterprise document processing (1000+ formats)
- NVIDIA AI Blueprint for video processing with intelligent chunking
- Unified embeddings using Voyage Multimodal-3

### Performance Targets
- AI response time under 2 seconds for 95% of queries
- Support for 10,000+ concurrent users
- Context relevance score above 90%
- Under $0.10 per user interaction
- 99.9% uptime with automatic failover

## Current Repository Status

This repository currently contains:
- `contextlinc-claude-instructions.md` - Comprehensive technical specifications and implementation instructions
- `contextlincagent.md` - Research findings and architectural blueprint
- `contextlinc-presentation.html` - Interactive presentation showcasing the platform vision

## Development Phases

1. **Phase 1 (Weeks 1-4)**: Foundation - Core PWA, basic multi-modal processing, PostgreSQL setup
2. **Phase 2 (Weeks 5-8)**: Enhancement - Video processing, memory systems, real-time features
3. **Phase 3 (Weeks 9-12)**: Optimization - Multi-format output, compression, global deployment

## Project Context

This is a BRAINSAIT LTD project focused on healthcare technology innovation. The platform aims to transform AI agent interactions through sophisticated context engineering, moving beyond simple prompt optimization to dynamic context systems that understand user intent and provide contextually relevant responses.

The project represents a paradigm shift from traditional chatbots to intelligent assistants capable of handling complex multi-modal inputs and maintaining sophisticated context awareness across interactions.