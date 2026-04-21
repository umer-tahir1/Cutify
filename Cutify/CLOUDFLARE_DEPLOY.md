# Cutify Deployment on Cloudflare (Frontend + Backend)

This setup deploys:
- Frontend on Cloudflare Pages
- Backend on Cloudflare Workers + Containers

Important:
- Cloudflare Containers are available on Workers Paid plan.
- Your MongoDB should be cloud-hosted (for example MongoDB Atlas).

## 1) Backend Deploy (Cloudflare Containers)

Backend deployment config lives in:
- cloudflare/backend/wrangler.jsonc
- cloudflare/backend/src/index.ts
- server/Dockerfile.cloudflare

### Install backend deploy tooling

```powershell
cd cloudflare/backend
npm install
```

### Login and set required secrets

```powershell
npx wrangler login
npx wrangler secret put MONGODB_URI
npx wrangler secret put JWT_SECRET
npx wrangler secret put JWT_REFRESH_SECRET
```

Optional secrets:

```powershell
npx wrangler secret put SMTP_USER
npx wrangler secret put SMTP_PASS
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
npx wrangler secret put WHATSAPP_ACCESS_TOKEN
```

### Set frontend URL in backend config

In cloudflare/backend/wrangler.jsonc set vars.FRONTEND_URL to your Pages domain, for example:

```json
"FRONTEND_URL": "https://cutify-frontend.pages.dev"
```

### Deploy backend

```powershell
npx wrangler deploy
```

After deploy, copy the backend URL, for example:

```text
https://cutify-backend.<your-workers-subdomain>.workers.dev
```

Health check:

```text
https://cutify-backend.<your-workers-subdomain>.workers.dev/_health
```

## 2) Frontend Deploy (Cloudflare Pages)

### Cloudflare Pages build settings

- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist
- Root directory: /

### Frontend environment variables (Pages project)

Set these in Cloudflare Pages project settings:

- VITE_BASE_PATH = /
- VITE_API_MODE = live
- VITE_API_BASE_URL = https://cutify-backend.<your-workers-subdomain>.workers.dev/api

The app defaults to static JSON mode in production. Setting VITE_API_MODE=live enables full backend APIs.

## 3) Domain Setup

Recommended:
- Frontend: shop.yourdomain.com (Cloudflare Pages)
- Backend: api.yourdomain.com (Worker custom domain)

Then set:

- FRONTEND_URL in cloudflare/backend/wrangler.jsonc to frontend domain
- VITE_API_BASE_URL in Pages env vars to backend API base

## 4) Re-deploy order

Whenever URLs change:

1. Deploy backend first (wrangler deploy)
2. Update frontend env vars in Pages
3. Trigger frontend re-deploy

## 5) Notes for this codebase

- Frontend now supports Cloudflare Pages root path automatically.
- Frontend can run static mode or live API mode via VITE_API_MODE.
- Backend image serves existing Express API from a container.
- Local upload storage inside container is ephemeral; for long-term upload persistence, migrate upload endpoints to Cloudflare R2.
