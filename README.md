# ContextLinc

> **Next-generation context engineering platform for intelligent AI agents**

[![Deploy Status](https://github.com/fadil369/contextlinc/actions/workflows/deploy.yml/badge.svg)](https://github.com/fadil369/contextlinc/actions/workflows/deploy.yml)
[![Test Status](https://github.com/fadil369/contextlinc/actions/workflows/test.yml/badge.svg)](https://github.com/fadil369/contextlinc/actions/workflows/test.yml)

ContextLinc revolutionizes AI agent development through advanced context engineering, transforming simple chatbots into sophisticated systems that understand and maintain rich contextual awareness.

## 🌐 Live Platform

- **🏠 Landing Page**: [https://context.thefadil.site](https://context.thefadil.site)
- **⚡ Platform**: [https://context.thefadil.site/platform](https://context.thefadil.site/platform)
- **🔧 API**: [https://contextlinc-api.fadil.workers.dev](https://contextlinc-api.fadil.workers.dev)

## 🏗️ Architecture

### 11-Layer Context Window Architecture (CWA)

ContextLinc implements a sophisticated 11-layer context management system:

1. **Instructions Layer** - AI constitution, persona, goals, ethical boundaries
2. **User Info Layer** - Personalization data, preferences, account details
3. **Knowledge Layer** - Retrieved documents and domain expertise through RAG
4. **Task/Goal State** - Multi-step task management and workflow tracking
5. **Memory Layer** - Short, medium, and long-term memory systems
6. **Tools Layer** - External tool definitions and capabilities
7. **Examples Layer** - Few-shot learning examples and demonstrations
8. **Context Layer** - Current conversation state and immediate context
9. **Constraints Layer** - Operational limits and safety guidelines
10. **Output Format** - Response structure and formatting requirements
11. **User Query** - The immediate input triggering generation

### Multi-Modal Processing Pipeline

```
Input → Format Detection → Preprocessing → AI Analysis → 
Metadata Extraction → Vector Generation → Context Integration → Storage
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Deployment**: Cloudflare Pages

### Backend
- **Runtime**: Cloudflare Workers
- **API Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Queues**: Cloudflare Queues

### AI Infrastructure
- **Models**: GPT-4, Claude 3.5 Sonnet
- **Embeddings**: Voyage Multimodal-3
- **Processing**: Apache Tika for documents
- **Architecture**: 11-layer Context Window Architecture

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Cloudflare account with Workers/Pages enabled
- Wrangler CLI

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/fadil369/contextlinc.git
   cd contextlinc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   # Edit with your API keys and configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Start Workers locally**
   ```bash
   # API Worker
   cd workers/api
   npm install
   wrangler dev

   # File Processor Worker (separate terminal)
   cd workers/file-processor
   npm install
   wrangler dev
   ```

### Deployment

The platform uses automated CI/CD with GitHub Actions:

1. **Push to main branch** triggers automatic deployment
2. **Pull requests** run comprehensive tests
3. **Health checks** verify deployment success

## 📁 Project Structure

```
contextlinc/
├── src/                          # Next.js frontend
│   ├── app/                      # App router pages
│   │   ├── page.tsx             # Landing page (iframe)
│   │   └── platform/            # Platform application
│   ├── components/              # React components
│   │   ├── chat/                # Chat interface components
│   │   ├── context/             # Context panel components
│   │   └── upload/              # File upload components
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utilities and API client
├── workers/                     # Cloudflare Workers
│   ├── api/                     # Main API worker
│   │   ├── src/
│   │   │   ├── routes/          # API route handlers
│   │   │   ├── services/        # Business logic services
│   │   │   └── database/        # Database schema and migrations
│   │   └── wrangler.toml        # Worker configuration
│   └── file-processor/          # File processing worker
│       ├── src/
│       │   ├── processors/      # Multi-modal processors
│       │   └── services/        # Processing services
│       └── wrangler.toml        # Worker configuration
├── public/                      # Static assets
│   └── presentation.html        # Landing page content
├── .github/workflows/           # CI/CD workflows
├── package.json                 # Frontend dependencies
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for local development:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Worker Environment
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
VOYAGE_API_KEY=your_voyage_key
JWT_SECRET=your_jwt_secret
```

### Cloudflare Setup

1. **Create D1 Database**
   ```bash
   wrangler d1 create contextlinc-metadata
   ```

2. **Create R2 Bucket**
   ```bash
   wrangler r2 bucket create contextlinc-files
   ```

3. **Create Queue**
   ```bash
   wrangler queues create contextlinc-file-processing
   ```

4. **Apply Database Schema**
   ```bash
   cd workers/api
   wrangler d1 execute contextlinc-metadata --file=src/database/schema.sql
   ```

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

### Worker Testing
```bash
# Test API Worker
cd workers/api
npm test

# Test File Processor
cd workers/file-processor  
npm test
```

## 📋 API Documentation

### Chat Endpoints
- `POST /api/chat/message` - Send message
- `GET /api/chat/history` - Get conversation history
- `DELETE /api/chat/clear` - Clear conversation

### File Endpoints
- `POST /api/files/upload` - Upload files
- `GET /api/files/list` - List uploaded files
- `GET /api/files/{id}/status` - Check processing status

### Context Endpoints
- `GET /api/context/state` - Get context state
- `GET /api/context/layers/{id}` - Get layer data
- `POST /api/context/optimize` - Optimize context

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Phil Schmid** for context engineering principles
- **Cloudflare** for the serverless infrastructure
- **OpenAI & Anthropic** for AI model APIs
- **Next.js team** for the excellent framework

## 📞 Support

- **Documentation**: [CLAUDE.md](CLAUDE.md)
- **Issues**: [GitHub Issues](https://github.com/fadil369/contextlinc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fadil369/contextlinc/discussions)

---

**Built with ❤️ by [BRAINSAIT LTD](https://brainsait.com)**

*Transforming AI agents through advanced context engineering*