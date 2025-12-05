# VibeSDK + AAE Dashboard Deployment Fix Guide

## Quick Fix Steps

### 1. Fix Missing Cloudflare Workers Types

Add to `worker/types/env.d.ts` (create if doesn't exist):

```typescript
/// <reference types="@cloudflare/workers-types" />

export interface Env {
  // Database
  DB: D1Database;

  // KV Namespaces
  RATE_LIMIT_KV: KVNamespace;
  SESSION_KV: KVNamespace;

  // Durable Objects
  RATE_LIMIT: DurableObjectNamespace;

  // Environment Variables
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  SENTRY_DSN?: string;

  // OpenAI/LLM Keys
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  GEMINI_API_KEY: string;
  PERPLEXITY_API_KEY: string;

  // Cloudflare AI Gateway
  AI_GATEWAY_ID?: string;
}

export interface AIGatewayProviders {
  openai: string;
  anthropic: string;
  google: string;
}
```

### 2. Fix Database Export Issue

In `worker/database/index.ts`, ensure `getDb` is exported:

```typescript
export { getDb } from './database';
export * from './schema';
export * from './services';
```

Or if `database.ts` doesn't export it, add:

```typescript
export function getDb(env: Env): DrizzleD1Database {
  return drizzle(env.DB, { schema });
}
```

### 3. Fix AAE Dashboard Type Errors

#### Fix `src/routes/aae-dashboard.tsx` line 87:

```typescript
// Change this:
<Link key={section.id} {...linkProps}>

// To this:
<Link key={section.id} to={section.path || '#'}>
```

#### Fix `src/routes/aae-platforms.tsx` line 39:

```typescript
// Add platform property:
updatePlatform.mutate({
  id: platform.id,
  platform: platform.platform, // Add this
  status: 'disconnected'
});
```

#### Fix `src/routes/aae-workflows.tsx` line 22:

```typescript
// Add required properties:
updateWorkflow.mutate({
  id: workflow.id,
  name: workflow.name, // Add this
  workflowType: workflow.workflowType, // Add this
  workflowId: workflow.workflowId, // Add this
  status: workflow.status === 'active' ? 'paused' : 'active'
});
```

### 4. Fix Implicit Any Types

Add explicit type annotations:

**`src/routes/aae-dashboard.tsx` line 12:**
```typescript
.filter((p: Platform) => p.status === 'connected')
```

**`src/routes/aae-knowledge.tsx` line 98:**
```typescript
.map((result: SearchResult) => (
```

**`src/routes/aae-llm-metrics.tsx` line 87:**
```typescript
.map((metric: LLMMetric) => (
```

**`worker/trpc/routers/llm.ts` line 71:**
```typescript
.reduce((acc: any, metric: any) => {
```

**`worker/trpc/routers/workflows.ts` line 16:**
```typescript
.reduce((acc: any, workflow: any) => {
```

### 5. Fix Date Comparison in `worker/trpc/routers/llm.ts` line 117:

```typescript
// Change from:
and(gte(llmMetrics.date, startDate))

// To:
and(gte(llmMetrics.date, new Date(startDate)))
```

### 6. Fix Crypto Utils Issues

In `worker/utils/cryptoUtils.ts`:

```typescript
// For timingSafeEqual (lines 46, 54):
// Use this polyfill if not available:
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

// For BufferSource type issues (line 104):
const encryptedData = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  new Uint8Array(data) as unknown as BufferSource
);
```

### 7. Add tsconfig.json Compiler Options

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"],
    "lib": ["ES2022", "WebWorker"],
    "module": "ES2022",
    "target": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": false,  // Temporarily disable for quick fix
    "skipLibCheck": true
  }
}
```

## Quick Deploy Commands

```bash
# Fix types
npm install --save-dev @cloudflare/workers-types@latest

# Build with relaxed type checking (temporary)
tsc -b --incremental --noImplicitAny false && vite build

# Or skip type check entirely for quick deploy
vite build --mode production
```

## Recommended: Proper Fix

For production, you should:

1. Create proper TypeScript interfaces for all AAE components
2. Export `getDb` properly from database module
3. Add type definitions for all tRPC routers
4. Fix all implicit `any` types with proper interfaces

## Environment Variables Needed

Make sure these are set in Cloudflare Pages settings:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
```

## If All Else Fails - Emergency Deploy

Add this to `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:force": "cross-env TS_NODE_TRANSPILE_ONLY=true vite build"
  }
}
```

Then use `bun run build:force` instead of `bun run build`.
