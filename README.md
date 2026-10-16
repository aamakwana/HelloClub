# Launchpad: hackathon starter

Next.js + Tailwind frontend, FastAPI backend, Supabase Auth + Postgres.
Includes email/password signup, login/logout, and private task creation/list/deletion.
This is source code, not a provisioned or deployed service. No accounts or credentials are included.

The task example is organised as MVC with a service layer. Request flow:

View → Controller → Service → Repository → Database.

The Model is the SQL schema plus repositories. There is no ORM.

## 1. Supabase
Create a project. Run `supabase/migrations/001_create_tasks.sql` once in its SQL editor.
For Hello Club plans, also run `supabase/migrations/002_create_activities.sql` once.
Copy the project URL and **publishable** key (legacy anon key also works).
Never use a service-role or secret key in this starter. Requests preserve each user's JWT so database row-level security applies.
Enable email/password authentication. Set Auth Site URL to `http://localhost:3000` for development and your frontend domain for deployment. Keep email confirmation enabled; confirm your email and return to sign in. Configure redirect URLs as required by your project's confirmation template.

## 2. Backend (Python 3.11+)
From `backend/`:
```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in the project URL and publishable key in .env.
uvicorn app.main:app --reload --port 8000
```
On Windows activate with `.venv\Scripts\activate` instead.
API docs: http://localhost:8000/docs
Health: http://localhost:8000/health

## 3. Frontend (Node.js 22 LTS or newer supported LTS)
From `frontend/` in another terminal:
```sh
cp .env.example .env.local
# Fill in Supabase URL/key; leave API URL as http://localhost:8000.
npm install
npm run dev
```
Open http://localhost:3000. Sign up, confirm your email, sign in, add a task, reload, delete it.
Commit the generated package-lock.json after installing. Next/React resolve to current releases at first installation; this package has no verified lockfile yet.

## Architecture
Browser authenticates directly with Supabase. It sends its access token to FastAPI.
FastAPI verifies that token with Supabase Auth, then calls the database REST API using the same token.
The backend takes user IDs from verified auth, never from form input. SQL policies independently restrict each user's rows.
Client session state controls the interface only; backend and database enforce access.

### Frontend
- `frontend/app/` — pages and layouts (views)
- `frontend/components/` — reusable UI (auth form, task form, list)
- `frontend/lib/` — Supabase auth client and FastAPI client

### Backend
- `backend/app/main.py` — app setup, CORS, router registration
- `backend/app/controllers/` — thin HTTP routes
- `backend/app/services/` — business rules (blank titles, missing tasks)
- `backend/app/repositories/` — Supabase Auth and PostgREST access
- `backend/app/schemas/` — Pydantic request and response models
- `backend/app/core/` — configuration, JWT identity, HTTP adapter

### Database
- `supabase/migrations/` — versioned schema and row-level security policies

## Deployment
Frontend: import your own Git repository into Vercel, root directory `frontend`, Next.js preset. Set all three frontend environment variables before building. NEXT_PUBLIC_API_URL must be the HTTPS backend URL, not localhost. Rebuild after changing public environment variables.
Backend: deploy `backend/` to a Python-capable host. Install with `pip install -r requirements.txt`; start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (use your host's port variable or configured port). Set backend variables; FRONTEND_ORIGINS must contain the exact frontend origin, no trailing slash. Separate additional allowed origins with commas. Do not use a wildcard for preview domains.
Update Supabase Auth Site URL/redirect settings for your deployed frontend. Keep secrets in host configuration, not Git.

## Required checks with your real project
- Anonymous GET /tasks returns 401; malformed/expired tokens are denied.
- Account A can create, reload and delete its records.
- Account B cannot see A's records or delete them by ID (404).
- Direct database REST access with B's JWT also cannot read/delete A's records or insert a record with A's user_id.
- Blank titles fail; backend and frontend errors are visible.
- Sign out and reload: no private tasks remain visible.
- Test confirmation email, token refresh and deployed CORS configuration.

## Scope and limitations
No password reset UI, OAuth, team sharing, pagination, rate limiting, CI pipeline, or AI-provider integration is included. Add only what your case requires. Supabase Auth and database require external setup. The health endpoint checks the process, not database connectivity. Before wider release add abuse controls and your required recovery flow.

## Working with Cursor and v0
Open this whole folder in Cursor. Ask for one change at a time, review it, test it, then commit.
Use v0 for interface ideas and port components into `frontend/components/` and `frontend/app/page.jsx`; preserve auth and API contracts. Do not let it silently replace FastAPI with another backend.
A useful instruction: "Keep Next.js frontend, FastAPI backend, and Supabase auth/RLS. Keep MVC: thin controllers, services for rules, repositories for data. Explain your plan, change one feature, and tell me how to verify it. Never add service-role credentials or disable RLS."

## Documentation
- https://nextjs.org/docs/app/getting-started/installation
- https://tailwindcss.com/docs/installation/framework-guides/nextjs
- https://fastapi.tiangolo.com/tutorial/
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys
