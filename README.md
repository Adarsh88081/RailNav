# 🚉 RailNav — Smart Railway Station Navigation System

RailNav helps passengers navigate **inside** large railway stations —
New Delhi, Bengaluru, Kanpur Central, and more. Google Maps gets you to
the station gate; RailNav gets you from that gate to your exact platform,
with turn-by-turn walking directions, distance, and time.

Built as a full-stack, server-rendered **Express + EJS** application using
classic **MVC architecture**, with session-based authentication and a
MongoDB-backed navigation graph solved with **BFS (Breadth-First Search)**
— no station route is ever hardcoded.

---

## ✨ Features

**Passenger**
- Register / Login (session-based auth, passwords hashed with bcrypt)
- Select a station → current location → destination → get the shortest
  walking route with step-by-step instructions, total distance, and
  estimated time
- Search station facilities (washrooms, ATMs, medical rooms, food courts,
  etc.) by name or category
- Submit complaints and track their resolution status
- Submit suggestions
- Rate a navigation experience (1–5 stars + optional feedback)
- Profile page with search history and submitted complaints

**Admin** (fully separate login and session)
- Dashboard with live analytics (stations, users, complaints by status,
  suggestions, average rating)
- Add / edit / delete stations
- Build the navigation graph per station — add locations (nodes) and
  walkable edges (distance + instruction) between them
- Add / delete facilities per station
- View and resolve complaints (status: Pending → In Progress → Resolved)
- View suggestions and ratings

---

## 🧠 How routing works (no hardcoded paths)

Every station is represented as a **graph** stored in MongoDB:

| Concept | Model | Represents |
|---|---|---|
| Node | `Location` | Platform, escalator, lift, exit, food court, etc. |
| Edge | `RouteEdge` | A walkable connection between two locations, with distance (m) and an instruction string |

`services/graphService.js` builds an adjacency list from whichever edges
exist for the selected station, then runs **BFS** to find the shortest
path (fewest hops) between the passenger's current location and their
destination. It reconstructs the path, sums the distances, estimates
walking time, and returns a clean step-by-step instruction list —
entirely generated from the database. Admins can extend or edit any
station's graph live from `/admin/graph`.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Views | EJS + `express-ejs-layouts` |
| Database | MongoDB Atlas + Mongoose |
| Auth | `express-session` + `connect-mongo` (sessions stored in Mongo, not memory) |
| Flash messages | `connect-flash` |
| Forms | `method-override` (real PUT/DELETE from HTML forms) |
| Password hashing | `bcryptjs` |

**No frontend framework, no client-side fetch/AJAX, no JWT/localStorage.**
Every page is rendered server-side with EJS. Dependent dropdowns (e.g.
pick a station → see its locations) work via plain `GET` requests with
auto-submitting `<select>` elements. Admin actions use classic HTML forms
with the redirect-after-POST pattern.

---

## 📁 Project Structure

Flat, root-level MVC layout — deploys cleanly on Render or any Node host
with zero extra configuration.

```
railnav/
├── app.js                    Express app entry point
├── config/
│   └── db.js                 MongoDB Atlas connection
├── models/                   User, Admin, Station, Location, RouteEdge,
│                              Facility, Complaint, Suggestion, Rating
├── controllers/               One file per resource — renders views,
│                              handles form POSTs, redirects
├── routes/                    indexRoutes, authRoutes,
│                              appRoutes (passenger), adminRoutes (admin)
├── middleware/                 authMiddleware (session guards),
│                              errorMiddleware (404 / error pages)
├── services/
│   └── graphService.js        BFS shortest-path navigation engine
├── utils/
│   └── seedData.js            Seeds 3 sample stations + admin account
├── views/                     EJS templates
│   ├── layout-public.ejs      Top-nav layout (landing/login/register)
│   ├── layout-app.ejs         Passenger sidebar layout
│   ├── admin/                 Admin views + admin layouts
│   └── partials/               head, flash, sidebar, admin-sidebar
├── public/
│   └── css/style.css          Shared design system
├── .env.example
└── package.json
```

---

## 🚀 Getting Started

### 1. Set up MongoDB Atlas

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free **M0 cluster**
3. **Database Access** → create a database user (username + password)
4. **Network Access** → allow your IP (or `0.0.0.0/0` for testing/Render)
5. **Connect → Drivers** → copy the connection string

### 2. Configure environment variables

Create a `.env` file in the project root (copy `.env.example`):

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/railnav?retryWrites=true&w=majority

SESSION_SECRET=replace_this_with_a_long_random_string

ADMIN_EMAIL=admin@railnav.com
ADMIN_PASSWORD=Admin@12345
```

### 3. Install, seed, run

```bash
npm install
npm run seed    # populates 3 sample stations + creates your admin account
npm run dev      # or: npm start
```

Open **http://localhost:5000**.

### 4. Try it out

1. `/register` → create a passenger account
2. `/route-finder` → pick **New Delhi**, current location **Waiting Hall**,
   destination **Platform 6** → get the calculated route
3. `/facilities` → search "washroom"
4. `/admin/login` → log in with your seeded admin credentials → manage
   stations, the navigation graph, facilities, complaints, and more

---

## ☁️ Deploying to Render

1. Push this project to a GitHub repository
2. On [render.com](https://render.com): **New → Web Service** → connect your repo
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add environment variables in the Render dashboard:
   ```
   MONGO_URI=<your Atlas connection string>
   SESSION_SECRET=<a long random string>
   ADMIN_EMAIL=<your admin email>
   ADMIN_PASSWORD=<your admin password>
   NODE_ENV=production
   ```
6. In **MongoDB Atlas → Network Access**, make sure `0.0.0.0/0` is allowed
   — Render uses dynamic IPs
7. Deploy. Once live, run `npm run seed` once from your local machine
   (pointed at the same `MONGO_URI`) to populate sample data

It's a single Node service serving both the pages and the data layer —
no separate frontend build, no static host, no CORS config needed.

---

## 🗺️ Route Reference

```
Public
  GET  /                        Landing page
  GET  /login          POST /login
  GET  /register       POST /register
  POST /logout

Passenger (requires session)
  GET  /dashboard
  GET  /route-finder?station=&from=&to=       POST /route-finder/rate
  GET  /facilities?station=&search=&category=
  GET  /complaint      POST /complaint
  GET  /suggestion     POST /suggestion
  GET  /profile

Admin (requires admin session)
  GET  /admin/login    POST /admin/login    POST /admin/logout
  GET  /admin/dashboard
  GET  /admin/stations                 POST /admin/stations
  GET  /admin/stations/:id/edit        PUT /admin/stations/:id      DELETE /admin/stations/:id
  GET  /admin/graph?station=
  POST /admin/graph/locations          DELETE /admin/graph/locations/:id
  POST /admin/graph/edges              DELETE /admin/graph/edges/:id
  GET  /admin/facilities?station=      POST /admin/facilities       DELETE /admin/facilities/:id
  GET  /admin/complaints               PUT /admin/complaints/:id
  GET  /admin/suggestions
  GET  /admin/ratings
```

---

## 🔒 Security Notes

- Passenger and admin authentication are fully separate — different
  MongoDB collections, different session keys (`req.session.userId` vs
  `req.session.adminId`), and different middleware guards. A passenger
  session can never access admin routes.
- Passwords are hashed with `bcryptjs` before storage — plaintext
  passwords are never saved.
- Sessions are stored server-side in MongoDB (via `connect-mongo`), not
  in application memory — required for Render's stateless/restartable
  environment and for running multiple instances safely.

---

## 🛠️ Troubleshooting

| Symptom | Likely cause |
|---|---|
| Station dropdown is empty | Forgot to run `npm run seed`, or `MONGO_URI` points to a different database than the one you seeded |
| "Invalid email or password" on login | Double-check `.env` values match exactly what you're typing; email matching is case-insensitive but whitespace still matters |
| Admin login redirects to `/login` instead of showing the admin form | Make sure `routes/appRoutes.js` applies `requireAuth` per-route, not via a blanket `router.use(requireAuth)` — a global one intercepts every path, including `/admin/*` |
| Render deploy can't connect to MongoDB | Add `0.0.0.0/0` to Atlas Network Access — Render's IPs are dynamic |
| Login "works" but immediately logs you out | If testing locally with `NODE_ENV=production`, the session cookie requires HTTPS and won't persist over plain `http://localhost` — use `NODE_ENV=development` locally |

---

## 📄 License

Built for educational purposes — feel free to fork, extend, and adapt.
