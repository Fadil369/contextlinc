# ContextLinc Deployment Guide

## Prerequisites

1. **Cloudflare Account** with Workers, Pages, R2, and D1 enabled
2. **API Keys** for OpenAI, Anthropic, and Voyage AI
3. **Domain** configured (context.thefadil.site)
4. **Node.js** 18+ and pnpm installed locally

## Step-by-Step Deployment

### 1. Set up Cloudflare Services

#### Create R2 Bucket
```bash
wrangler r2 bucket create contextlinc-files
```

#### Create D1 Database
```bash
wrangler d1 create contextlinc-metadata
```

#### Create Queue for File Processing
```bash
wrangler queues create contextlinc-file-processing
```

#### Update wrangler.toml files
Update the database IDs in:
- `workers/api/wrangler.toml`
- `workers/file-processor/wrangler.toml`

### 2. Set up Database Schema

```bash
cd workers/api
wrangler d1 execute contextlinc-metadata --file=src/database/schema.sql
```

### 3. Configure Environment Variables

#### For API Worker
```bash
cd workers/api
wrangler secret put OPENAI_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put VOYAGE_API_KEY
wrangler secret put JWT_SECRET
```

#### For File Processor Worker
```bash
cd workers/file-processor
wrangler secret put OPENAI_API_KEY
wrangler secret put VOYAGE_API_KEY
```

### 4. Deploy Workers

#### Deploy API Worker
```bash
cd workers/api
npm install
npm run deploy:production
```

#### Deploy File Processor
```bash
cd workers/file-processor
npm install
npm run deploy:production
```

### 5. Deploy Frontend to Pages

#### Build and Deploy
```bash
cd ../.. # Back to root
npm install
npm run build

# Deploy to Pages
npm run deploy
```

#### Configure Custom Domain
1. Go to Cloudflare Dashboard > Pages
2. Select your project
3. Go to Custom domains
4. Add `context.thefadil.site`

### 6. Update API Endpoint

Update `src/lib/api.ts` with your actual Worker URL:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://contextlinc-api.YOUR_ACCOUNT.workers.dev'
  : 'http://localhost:8787';
```

### 7. Test Deployment

1. Visit https://context.thefadil.site
2. Test chat functionality
3. Test file upload
4. Verify context layers are working
5. Check browser console for any errors

## Environment Configuration

### Production Environment Variables

Set these in Cloudflare Dashboard:

#### Pages Environment Variables
- `NEXT_PUBLIC_APP_URL`: `https://context.thefadil.site`
- `NEXT_PUBLIC_API_URL`: `https://contextlinc-api.YOUR_ACCOUNT.workers.dev`

#### Worker Environment Variables
- `ENVIRONMENT`: `production`
- `CORS_ORIGINS`: `https://context.thefadil.site`

### API Keys Required

1. **OpenAI API Key** - For GPT-4 and embeddings
2. **Anthropic API Key** - For Claude models
3. **Voyage AI API Key** - For multimodal embeddings

## Monitoring and Maintenance

### Health Checks
- API Health: `https://contextlinc-api.YOUR_ACCOUNT.workers.dev/health`
- File Processor: `https://contextlinc-file-processor.YOUR_ACCOUNT.workers.dev/health`

### Logs
```bash
# API Worker logs
wrangler tail contextlinc-api

# File Processor logs
wrangler tail contextlinc-file-processor
```

### Database Management
```bash
# View tables
wrangler d1 execute contextlinc-metadata --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check file processing status
wrangler d1 execute contextlinc-metadata --command="SELECT processing_status, COUNT(*) FROM files GROUP BY processing_status;"
```

## Scaling Considerations

### Performance Optimization
1. **Caching**: Implement Redis for session data
2. **CDN**: Use Cloudflare's CDN for static assets
3. **Database**: Consider partitioning for large datasets
4. **Workers**: Scale based on usage patterns

### Cost Management
1. **R2 Storage**: Monitor file storage costs
2. **D1 Queries**: Optimize database queries
3. **AI API Calls**: Implement caching for embeddings
4. **Worker Invocations**: Monitor and optimize

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGINS environment variable
   - Verify domain configuration

2. **File Upload Failures**
   - Check R2 bucket permissions
   - Verify file size limits

3. **Database Connection Issues**
   - Verify D1 database ID in wrangler.toml
   - Check database schema is applied

4. **API Key Issues**
   - Verify all secrets are set
   - Check API key validity and quotas

### Debug Commands

```bash
# Test API endpoints
curl https://contextlinc-api.YOUR_ACCOUNT.workers.dev/health

# Check D1 database
wrangler d1 execute contextlinc-metadata --command="SELECT COUNT(*) FROM messages;"

# View recent logs
wrangler tail contextlinc-api --format=pretty
```

## Security Checklist

- [ ] All API keys stored as secrets
- [ ] CORS properly configured
- [ ] File upload size limits enforced
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] HTTPS enforced
- [ ] Environment separation (staging/production)

## Backup Strategy

1. **Database Backups**: Export D1 data regularly
2. **R2 Files**: Consider cross-region replication
3. **Configuration**: Keep wrangler.toml files in version control
4. **Secrets**: Document (but don't store) all required secrets

## Support

For deployment issues:
1. Check Cloudflare Workers documentation
2. Review application logs
3. Verify all environment variables
4. Test individual components (API, DB, R2)