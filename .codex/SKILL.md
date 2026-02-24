# Skill: Frontend + Backend Proxy (Cloud Run, single container)

## Purpose
Standardize the architecture for web projects that have:
- **Frontend**: React SPA (builds to `dist/`)
- **Backend**: Node server (builds to `server-dist/`) that:
    - holds **all secrets** (API keys)
    - performs **AI provider calls** (OpenAI / other)
    - exposes `/api/*` endpoints to the frontend
- **Deployment**: single Docker image running on **Google Cloud Run**, serving:
    - static frontend assets
    - backend API routes
    - SPA fallback routing

This skill ensures **no API keys are ever shipped to the browser**, and all AI queries are performed server-side.

---

## When to use (activation cues)
Use this skill when the task includes any of the following:
- Creating a new web project with React + server
- Adding AI/chat/completions features to an existing web project
- Handling secrets / API keys / tokens
- Deploying to Google Cloud Run using Docker
- Setting up a “backend-for-frontend” proxy layer (BFF)

---

## Non-goals
- Not a full authentication/authorization solution (unless explicitly requested).
- Not a full infra/IaC solution (Terraform, etc.) unless requested.
- Not a full microservices architecture—this is a **single Cloud Run service** pattern by default.

---

## Architecture rules (MUST follow)
1. **Frontend MUST NOT**:
    - contain or read API keys
    - call external AI APIs directly (OpenAI endpoints, etc.)
    - embed secrets in `.env` that get bundled
2. **Backend MUST**:
    - read secrets from environment variables (`process.env.*`)
    - expose server routes under `/api/*`
    - implement AI calls in backend only (via SDK or fetch)
3. **Single container**:
    - Docker builds frontend into `dist/`
    - Docker builds backend into `server-dist/`
    - Runtime serves:
        - static files from `dist/`
        - API under `/api/*`
        - SPA fallback to `dist/index.html`
4. **Cloud Run compatibility**:
    - server listens on `process.env.PORT` (default 8080)
    - expose port `8080` in Dockerfile
5. **Error handling**:
    - backend must never return raw secrets
    - sanitize logs (no key printing)
    - return stable JSON errors

---

## Frontend architecture conventions (MUST follow)

### 1) `App.tsx` must be minimal
`App.tsx` should only:
- define top-level routes (if routing is used)
- mount global providers (theme, query client, router, auth provider, etc.)
- render a single `<AppShell />` or `<Routes />` component

`App.tsx` MUST NOT:
- contain business logic
- perform API calls
- contain large UI trees
- implement reusable components inline

**Preferred structure:**
- `App.tsx` = composition only
- `components/AppShell.tsx` (or `layout/AppShell.tsx`) contains layout composition
- `pages/*` contain page-level composition only
- `services/*` contain services that perform api,auth,storage and similar calls

Example (minimal):
```tsx
export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}