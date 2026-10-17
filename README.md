# Hello Club

**Adresseavisen tells you where to go. Hello Club gives you someone to go with.**

Hello Club is a web app that helps students in Trondheim find people to do things with. You post a plan like *"Coffee at Bakklandet on Thursday, who's in?"*. Other students ask to join, you choose who comes, you chat briefly, and you meet in a public place.

Built in 48 hours at **Start Code 2026** (NTNU) for the case from **Polaris Media / Adresseavisen**.

---

## The problem

- **41 %** of students say they have few or no friends at their place of study (SHoT 2022).
- **29 %** often miss having someone to spend time with.
- Facebook groups, TikTok and Reddit let anyone answer a post, which makes them unsafe for meeting new people.

Students don't lack things to do. They lack someone to do them with.

## The solution

| Feature | What it does |
|---|---|
| **For You** | A feed of upcoming plans from other students |
| **Create a plan** | Activity, place, time and number of spots |
| **Requests** | The host accepts or declines everyone who asks to join |
| **Limited chat** | Only the host and accepted guests can chat. 10 messages each, 150 characters per message, so people meet instead of texting |
| **Discover** | Student-friendly places reviewed by **Adresseavisen**, with an *"Omtalt i Adresseavisen"* label |
| **Safety rules** | Meetups are in public places, plans are locked from changes 12 hours before they start, and past plans disappear automatically |

## The role of Adresseavisen / Polaris Media

1. **Content:** places and reviews from Restaurantguiden and the student-discount guides answer *where should we go?*
2. **Trust:** a local media house with editorial responsibility, unlike anonymous posts on social media.
3. **Journalists:** new reviews and guides keep giving students new places to make plans for.
4. **Reach:** Adresseavisen's channels can reach students in Trondheim.

Every place in `frontend/data/places.json` is taken from published Adresseavisen articles, with a link to the source. Nothing is invented: no prices, ratings or partnerships.

---

## Tech stack

```
Next.js + Tailwind (Vercel)
        │
        ▼
FastAPI, Python 3.12 (Render)
        │
        ▼
Supabase: Postgres, Auth, Row Level Security
```

The backend uses layers:
`controller → service → repository → SupabaseGateway (httpx) → Supabase REST`

## Project structure

```
frontend/
  app/            # Next.js pages: For You, create, discover, chat, profile …
  components/     # UI components (e.g. DiscoverVenueCard)
  data/places.json# Adresseavisen places
  lib/            # helpers (places, API, Supabase)
backend/
  app/            # FastAPI: controllers, services, repositories, schemas
supabase/
  migrations/     # SQL migrations (run in order)
```

## Running locally

### 1. Database (Supabase)
Run the files in `supabase/migrations/` **in number order** in the Supabase SQL Editor.

### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
To check it's running, open `http://localhost:8000/health`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`.

## Environment variables

**Backend** (`backend/.env`, or Render → Environment):

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `FRONTEND_ORIGINS` | Allowed frontends, e.g. `http://localhost:3000,https://<your-app>.vercel.app` |
| `PYTHON_VERSION` | `3.12.8` (Render only) |

**Frontend** (`frontend/.env.local`, or Vercel → Environment Variables):
See `frontend/.env.example` for the exact names. You need the Supabase URL, the publishable key, and the backend URL. Use `https://` with no trailing slash.

> Never commit `.env` files.

## Deployment

Pushing to `main` deploys automatically:
- **Frontend:** Vercel
- **Backend:** Render (free tier; the first request after a pause can take ~50 seconds)

## Next steps

- Login with **Feide**, so only students can join
- Map view of plans and places
- More content from Adresseavisen: events, concerts, new reviews
- Notifications when someone asks to join

---

## Team

Made by **Archi Makwana** and teammate, NTNU, at Start Code 2026.
