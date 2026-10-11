# SwiftDrop — Delivery Platform (full-stack)

React (Vite) frontend + Express + PostgreSQL (Sequelize) backend.
Roles: CUSTOMER, RIDER, ADMIN. Money is shown in ₦.

## Run locally

```bash
# Backend
cd backend
npm install
cp .env.example .env   # then fill in your own values
npx sequelize db:migrate
npx sequelize db:seed:all   # demo accounts below
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev            # http://localhost:5173
```

Full flow to try: register as customer → create delivery → pay →
admin confirms + assigns rider → rider picks up → in transit → delivered.

## Demo logins (password for all: `Password123!`)

| Role     | Email              |
| -------- | ------------------ |
| Admin    | admin@demo.local   |
| Rider    | efua@demo.local    |
| Customer | ama@demo.local     |
| Blocked  | blocked@demo.local (SUSPENDED — login is rejected) |

Cash payments stay PENDING until an admin confirms them
(Admin → Payments → Confirm). CARD/TRANSFER are instant.

Riders can sign up from the Register page (Customer/Rider toggle).
New rider accounts start INACTIVE — an admin approves them
(Admin → Riders → Approve) before they can log in.

## Public landing stats

`GET /api/stats` needs no authentication and returns aggregate counts only
(no personal data), cached in memory for 60 seconds: `totalDeliveries`,
`completedDeliveries`, `inProgressDeliveries` (ASSIGNED + PICKED_UP +
IN_TRANSIT), `availableRiders` (ACTIVE + AVAILABLE), `activeRiders` and
`customers`. The public landing page reads it; if it fails, the stats bar
is hidden instead of showing placeholder numbers.

## Deploy

Backend (Render/Railway/Fly-style host):

- Build: `npm install` · Start: `npm start` (`node server.js`)
- Then run once: `npx sequelize db:migrate` (+ `npx sequelize db:seed:all` for demos)
- On the hosted database, run the same migrate command with the
  production env vars set (it applies pending files such as
  `202410090006-add-rider-fields-to-users`):
  `NODE_ENV=production npx sequelize db:migrate`
- Env vars to set: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`,
  `NODE_ENV=production` (`PORT` is set by the host; `JWT_EXPIRES_IN` optional, defaults to `7d`)

Frontend (Vercel):

- Framework preset: Vite · Build: `npm run build` · Output: `dist`
- `vercel.json` rewrite is included so React routes survive refresh
- Env var to set: `VITE_API_URL=https://your-backend-host/api`
  (must be set at build time — redeploy after changing it)
