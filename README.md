# RailNav — Smart Railway Station Navigation System (EJS + MVC)

A full-stack, server-rendered Express + EJS application, structured as
classic MVC and laid out flat at the project root so it deploys on
**Render** (or any Node host) with zero configuration beyond environment
variables.

Passengers register, pick a station, pick a current location and a
destination, and get a BFS-calculated shortest walking route with
step-by-step instructions, distance, and time. Also includes facility
search, complaints, suggestions, ratings, a profile page, and a full
admin panel for managing stations, the navigation graph, facilities, and
passenger feedback.

**No client-side JavaScript framework, no fetch/AJAX, no JWT/localStorage.**
Every page is rendered server-side. Auth is session-based (`express-session`,
stored in MongoDB via `connect-mongo`). Dependent dropdowns (e.g. pick a
station → see its locations) work through plain `GET` requests with
auto-submitting `<select>` elements — a normal page reload, not an API call.
Admin create/update/delete actions are classic HTML forms using
`method-override` to send real `PUT`/`DELETE` requests, following the
redirect-after-POST pattern.

## Tech stack

- **Backend:** Node.js, Express
- **Views:** EJS + `express-ejs-layouts`
- **Database:** MongoDB Atlas with Mongoose
- **Auth:** `express-session` + `connect-mongo` (sessions stored in Mongo,
  not in-memory — required for Render's ephemeral filesystem/restarts)
- **Flash messages:** `connect-flash`
- **Forms:** `method-override` for PUT/DELETE from HTML forms

## Project structure (flat MVC, root-level)

```
railnav/
├── app.js                  Express app entry point
├── config/db.js            MongoDB Atlas connection
├── models/                 User, Admin, Station, Location, RouteEdge,
│                            Facility, Complaint, Suggestion, Rating
├── controllers/             One file per resource — renders views,
│                            handles form POSTs, redirects
├── routes/                  indexRoutes, authRoutes, appRoutes (passenger,
│                            requires login), adminRoutes (requires admin)
├── middleware/               authMiddleware (session guards),
│                            errorMiddleware (404 + error pages)
├── services/graphService.js  BFS shortest-path navigation engine
├── utils/seedData.js         Seeds 3 sample stations + admin account
├── views/                    EJS templates
│   ├── layout-public.ejs     Top-nav-only layout (landing/login/register)
│   ├── layout-app.ejs        Passenger sidebar layout
│   ├── admin/                Admin views + admin-layout, admin-layout-blank
│   └── partials/              head, flash, sidebar, admin-sidebar
└── public/css/style.css      Shared design system
```

## 1. Set up MongoDB Atlas

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster.
3. **Database Access** → create a database user (username + password).
4. **Network Access** → allow your IP (or `0.0.0.0/0` for testing/Render).
5. **Connect → Drivers** → copy the connection string.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `MONGO_URI` — your Atlas connection string (add `/railnav` as the db name)
- `SESSION_SECRET` — any long random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used once by the seed script to create
  your admin account

## 3. Install, seed, run

```bash
npm install
npm run seed   # populates 3 sample stations + admin account
npm run dev    # or: npm start
```

Open **http://localhost:5000**. Everything — landing page, auth, dashboard,
route finder, admin panel — is server-rendered from this one Express app.

## 4. Try it out

1. `/register` → create a passenger account.
2. `/route-finder` → pick **New Delhi**, current location **Waiting Hall**,
   destination **Platform 6** → the page reloads with the calculated route.
3. `/facilities` → search "washroom".
4. `/admin/login` → log in with your seeded admin credentials → manage
   stations, the navigation graph, facilities, complaints, suggestions,
   ratings.

## Deploying to Render

1. Push this project to a GitHub repo.
2. On Render: **New → Web Service** → connect the repo.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment variables** (Render dashboard → Environment): add
   `MONGO_URI`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and
   `NODE_ENV=production`.
6. Deploy. Once live, SSH/Shell into the Render instance (or run locally
   pointed at the same `MONGO_URI`) and run `npm run seed` once to
   populate sample data and create the admin account.

No separate frontend build step, no static file host, no CORS
configuration needed — it's a single Node service serving both the pages
and the data layer, which is exactly what Render's free/starter web
service tier expects.

## How the route finder works (no hardcoded routes)

Every station is a graph in MongoDB:
- **Locations** = nodes (platforms, escalators, lifts, exits, facilities)
- **RouteEdges** = edges (a walkable connection with distance + instruction)

`services/graphService.js` builds an adjacency list from whatever edges
exist for a station, runs **BFS** to find the shortest path (fewest hops)
between the selected current location and destination, reconstructs the
path, sums distances, estimates walking time, and returns step-by-step
instructions — built entirely from the database. Admins edit the graph
live from `/admin/graph`.

## Full route/page reference

```
Public
  GET  /                        Landing page
  GET  /login        POST /login
  GET  /register     POST /register
  POST /logout

Passenger (requires session)
  GET  /dashboard
  GET  /route-finder?station=&from=&to=      POST /route-finder/rate
  GET  /facilities?station=&search=&category=
  GET  /complaint    POST /complaint
  GET  /suggestion   POST /suggestion
  GET  /profile

Admin (requires admin session)
  GET  /admin/login    POST /admin/login    POST /admin/logout
  GET  /admin/dashboard
  GET  /admin/stations              POST /admin/stations
  GET  /admin/stations/:id/edit     PUT  /admin/stations/:id     DELETE /admin/stations/:id
  GET  /admin/graph?station=
  POST /admin/graph/locations       DELETE /admin/graph/locations/:id
  POST /admin/graph/edges           DELETE /admin/graph/edges/:id
  GET  /admin/facilities?station=   POST /admin/facilities   DELETE /admin/facilities/:id
  GET  /admin/complaints            PUT  /admin/complaints/:id
  GET  /admin/suggestions
  GET  /admin/ratings
```

## Testing notes

Every EJS template was verified to compile (`ejs.compile`), every backend
JS file was syntax-checked (`node --check`), and every controller→view
variable pass-through was manually cross-checked for name/shape
consistency. A live end-to-end run against a real MongoDB instance could
not be performed in the environment this was built in (no network access
to download a MongoDB server binary) — run through the "Try it out" steps
above against your own Atlas cluster before considering it verified in
your environment.
