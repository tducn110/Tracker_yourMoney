# MVP Deploy Guide

## Prerequisites

- TiDB Serverless cluster (or MySQL 8.0+)
- Firebase project with Auth enabled
- Vercel account (for web) or any Node.js host

## Environment Variables

### API (`apps/api/.env`)
```bash
DATABASE_URL=mysql://user:pass@host:4000/finance
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_SECRET=<random-64-char-string>
E2E_ADMIN_SECRET=<random-32-char-string>  # only needed for test/internal routes
```

### Web (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com  # or http://localhost:3001 for local
```

## Production Build

### API (Hono/Node.js)
```bash
cd apps/api
# No build step needed — runs directly with tsx
# For production, use tsx or compile with tsc:
tsc && node dist/index.js
```

### Web (Next.js 16)
**Known Issue**: Next.js 16 (16.2.4) has a `_global-error` prerendering bug in production builds. Workarounds:

1. **Deploy on Vercel** — Vercel's platform may handle this differently
2. **Use `output: 'standalone'`** in next.config.ts and deploy the standalone output
3. **Run dev server behind reverse proxy** (not recommended for production)
4. **Wait for Next.js 16.3 release** which may fix this issue

```bash
cd apps/web
# If build works in your environment:
NODE_ENV=production npx next build --webpack
```

## Deploy Targets

| Service | Platform | Notes |
|---------|----------|-------|
| API     | Railway / Fly.io / VPS | Stateless, scales horizontally |
| Web     | Vercel | Optimized for Next.js |
| DB      | TiDB Serverless | Already provisioned |

## Post-Deploy Checklist

- [ ] Verify login with Google/Facebook/GitHub/Apple
- [ ] Quick-add a transaction
- [ ] Create and pay a bill
- [ ] Create and contribute to a goal
- [ ] Transfer between wallets
- [ ] Check analytics load correctly
