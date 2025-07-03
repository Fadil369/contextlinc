# Contributing to ContextLinc

Thank you for your interest in contributing to ContextLinc! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Git
- Cloudflare account (for Workers/Pages development)
- Basic understanding of Next.js, TypeScript, and Cloudflare Workers

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/contextlinc.git
   cd contextlinc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development servers**
   ```bash
   # Frontend
   npm run dev

   # API Worker (separate terminal)
   cd workers/api && wrangler dev

   # File Processor (separate terminal)
   cd workers/file-processor && wrangler dev
   ```

## 📋 Contribution Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript with proper typing
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is handled automatically
- **Naming**: Use descriptive names for variables, functions, and components

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(chat): add real-time message streaming
fix(api): resolve context layer memory leak
docs(readme): update deployment instructions
refactor(workers): optimize file processing pipeline
```

### Branch Naming

- **Feature**: `feature/description` (e.g., `feature/add-voice-input`)
- **Bug Fix**: `fix/description` (e.g., `fix/memory-optimization`)
- **Documentation**: `docs/description` (e.g., `docs/api-reference`)
- **Refactor**: `refactor/description` (e.g., `refactor/context-engine`)

## 🧪 Testing

### Running Tests

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

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and workflows
- **E2E Tests**: Test complete user journeys

```typescript
// Example test structure
describe('ChatInterface', () => {
  it('should send message correctly', async () => {
    // Test implementation
  });
});
```

## 🏗️ Architecture Guidelines

### Frontend (Next.js)

- **Components**: Create reusable, well-documented components
- **Hooks**: Use custom hooks for complex state logic
- **API Client**: Use the centralized API client in `src/lib/api.ts`
- **Styling**: Use Tailwind CSS with consistent design tokens

### Backend (Cloudflare Workers)

- **Routes**: Organize routes by feature in separate files
- **Services**: Implement business logic in service classes
- **Database**: Use D1 with proper migrations and schema versioning
- **Error Handling**: Implement consistent error responses

### Context Engineering

- **Layers**: Follow the 11-layer architecture strictly
- **Memory**: Implement proper memory management strategies
- **Optimization**: Ensure context compression and pruning
- **Analytics**: Track context performance metrics

## 📝 Documentation

### Code Documentation

- **JSDoc**: Document all public functions and classes
- **README**: Update relevant sections for new features
- **API Docs**: Document new endpoints in OpenAPI format
- **Architecture**: Update architecture diagrams for major changes

### Example Documentation

```typescript
/**
 * Processes uploaded files through the multi-modal pipeline
 * @param files - Array of files to process
 * @param options - Processing configuration options
 * @returns Promise resolving to processing results
 */
async function processFiles(files: File[], options: ProcessingOptions): Promise<ProcessingResult[]> {
  // Implementation
}
```

## 🔍 Code Review Process

### Submitting PRs

1. **Create Feature Branch**: Branch from `main`
2. **Implement Changes**: Follow coding standards
3. **Add Tests**: Ensure adequate test coverage
4. **Update Docs**: Document new features/changes
5. **Submit PR**: Use the PR template provided

### PR Requirements

- ✅ All tests pass
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Build succeeds
- ✅ Documentation updated
- ✅ No breaking changes (unless justified)

### Review Criteria

- **Functionality**: Does it work as intended?
- **Performance**: Any performance implications?
- **Security**: Are there security considerations?
- **Maintainability**: Is the code readable and maintainable?
- **Architecture**: Does it fit the overall architecture?

## 🚀 Deployment

### Staging Deployment

PRs are automatically deployed to staging environments for testing.

### Production Deployment

Only maintainers can deploy to production via the main branch.

## 🐛 Bug Reports

### Before Reporting

1. **Search Issues**: Check if the bug is already reported
2. **Reproduce**: Ensure the bug is reproducible
3. **Environment**: Note your environment details

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
```

## 💡 Feature Requests

### Suggesting Features

1. **Check Roadmap**: Review existing roadmap and issues
2. **Use Template**: Follow the feature request template
3. **Provide Context**: Explain the use case and benefits
4. **Consider Implementation**: Think about how it might work

## 🌟 Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **Release Notes**: Major contributions highlighted
- **GitHub**: Contributor statistics and graphs

## 📞 Getting Help

- **Discord**: Join our development Discord server
- **Issues**: Use GitHub issues for technical questions
- **Discussions**: Use GitHub discussions for general questions
- **Email**: Reach out to the maintainers directly

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors:**
- Being respectful and inclusive
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors:**
- Harassment or discriminatory language
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information without permission

### Enforcement

Project maintainers have the right to remove, edit, or reject comments, commits, code, and other contributions that are not aligned with this Code of Conduct.

---

**Thank you for contributing to ContextLinc! 🎉**

Together, we're building the future of context engineering for AI agents.