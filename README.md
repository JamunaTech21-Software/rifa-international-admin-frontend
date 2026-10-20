# Rifa International — Admin panel

Staff app for Rifa International (RL-693): sign in, then review applications and contact messages.
React 19, Vite, Tailwind CSS 4. It is a **separate app** from the public site (`../customer`) and talks to the PHP
backend (`../../backend`, API in `backend/docs/api.md`).

## Run locally

Requires Node.js 20 or newer and the backend running on http://localhost:8000
(`composer serve` in `backend/`, with a seeded admin: `composer seed:admin`).

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5174 — /api is proxied to http://localhost:8000
```

Port 5174 matches `ADMIN_URL` in the backend's `.env`, which the backend uses for the links in its emails.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 5174 |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint (must have zero errors) |
| `npm run format` | Prettier, with Tailwind class sorting |

## Screens

| Path | Screen | Story |
| --- | --- | --- |
| `/login`, `/forgot-password`, `/reset-password?token=…` | Sign in and password screens | AD-01 |
| `/` | Dashboard (stat cards, status and category bars, latest applications and messages) | AD-02 |
| `/applications` | Applications list: search, filters, sorting, paging and CSV export (all in the URL) | AD-03 |
| `/applications/:id` | Application detail: personal/contact/job info, documents (signed links), status change, notes, history, delete (super admin), emails to the applicant (templates, log, resend) | AD-04, P5-01b |
| `/jobs`, `/jobs/new`, `/jobs/:id` | Job listings for the Malaysia Jobs page: filters, create/edit, publish/unpublish, photo upload, delete (super admin) | P5-02b |
| `/news`, `/news/new`, `/news/:id` | News & Updates posts: status filter (published/scheduled/draft), search, create/edit (plain text, blank line = new paragraph), schedule by date, publish/unpublish, cover photo, delete (super admin) | P5-03b |
| `/messages`, `/messages/:id` | Messages inbox (unread bold, status/subject filters, search, paging) and detail (sender links, reply thread, reply by email, mark unread, archive/restore) | AD-05 |
| `/users` (super admin only) | Admin users: add, edit (name, role, new password), activate / deactivate | AD-05 |
| `/profile` | Own account details and change password | AD-05 |

`/applications/:id`, `/messages/:id` and `/reset-password?token=…` are the addresses the backend puts in its emails.

## How sign-in works

- On load the app calls `GET /admin/auth/me`. A valid session cookie signs the person in; otherwise they are sent to
  `/login?next=<page they wanted>`.
- Every request sends the session cookie. Every non-GET request also sends `X-CSRF-Token` (from login or `/me`).
  If the server answers 419, the token is refreshed and the call is retried once (`src/lib/api.js`).
- A 401 at any time means the session ended (idle 60 minutes, or the password was changed elsewhere): the person is
  sent to `/login?next=…&expired=1` and returns to where they were after signing in. A deliberate Logout goes to a
  plain `/login`.
- `?next=` accepts only paths inside the app, so a crafted link cannot send an admin to another site.
- Roles: `super_admin` sees everything; `staff` has no Users link and `/users` shows "No permission".

## Deploying to Vercel

`vercel.json` makes every route fall back to `index.html` and adds security headers (no framing, no indexing).
The app calls `/api/v1/...` on its own domain, so Vercel must forward `/api` to the PHP backend — `middleware.js` does
that and tells the backend the visitor's real IP.

1. Import this repository in Vercel (framework Vite, build `npm run build`, output `dist`).
2. Add these environment variables (they are **not** prefixed with `VITE_`, so they never reach the browser):
   `BACKEND_ORIGIN` (for example `https://api.rifaint.com`) and `TRUSTED_PROXY_SECRET` (same value as in the backend `.env`).
3. Set the backend's `ADMIN_URL` to this site's address (for example `https://admin.rifaint.com`) so the links in its emails point here.
4. After the first deploy, check (details in `backend/docs/vercel-proxy.md`): sign in works, the page keeps you signed in after a refresh, and /api requests return JSON (not the app's HTML). The session cookie only works over HTTPS, which Vercel provides.

A `robots.txt` and the `X-Robots-Tag` header keep the admin out of search engines; `X-Frame-Options: DENY` stops it being shown inside other sites.

## Conventions

See [CLAUDE.md](./CLAUDE.md). Design tokens, fonts and the form/button components are copied from the public site so
both apps look the same; admin pages use denser 14px text.
