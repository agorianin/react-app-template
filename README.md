# ChatGPT Mimic App (React + Backend Proxy)

Small React application that mimics a ChatGPT-like layout with:
- Authentication modal (`/api/auth/login`)
- Chat input and AI query (`/api/chat`)
- Backend-only AI provider call using `OPENAI_API_KEY`
- Single-container deployment pattern for Cloud Run

## Tech stack
- Frontend: React + Vite + TypeScript (`dist/`)
- Backend: Express + TypeScript (`server-dist/`)
- Runtime: Node server serves static app + `/api/*` + SPA fallback

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Start frontend and backend:
   ```bash
   npm run dev
   ```
4. Open:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8080`

Without `OPENAI_API_KEY`, `/api/chat` returns a mock response.
For verification emails, configure SMTP variables from `.env.example`.

For correct Sign In - you need to register with Firebase console and provide 
details in `/services/firebase.ts`

## Build and run
```bash
npm run build
npm run start
```

## Docker / Cloud Run
```bash
docker build -t chatgpt-mimic .
docker run -p 8080:8080 --env-file .env chatgpt-mimic
```

Cloud Run compatibility:
- Server listens on `process.env.PORT` (default `8080`)
- Image exposes port `8080`
- Secrets remain server-side only
