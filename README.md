# Next.js + shadcn/ui client

This app is the **only** web UI for the project. The FastAPI service is **API-only** (no Jinja templates).

## Run

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000` (or `http://127.0.0.1:3000`). Use the **same host** in `NEXT_PUBLIC_API_BASE_URL` as you use for the browser so auth cookies align (e.g. both `localhost` or both `127.0.0.1`).

## Backend

```bash
# from repo root
source .venv/bin/activate
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (session cookie, `credentials: "include"` from the frontend).

## Stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3
- UI: [shadcn/ui](https://ui.shadcn.com/) (Base UI primitives + `tailwind-merge`)
