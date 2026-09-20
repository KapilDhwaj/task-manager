# ✅ Task Manager — PERN Stack

A full-stack Task Management System built with **PostgreSQL + Express + React + Node.js**.

## 🗂️ Project Structure

```
task-manager/
├── client/       ← React + Bootstrap 5 frontend (Vite)
└── server/       ← Node.js + Express REST API
```

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js v18+ (you have v24 ✅)
- PostgreSQL installed and running locally

### Step 1 — Setup PostgreSQL Database

1. Open **pgAdmin** or **psql** command line
2. Create a new database called `taskmanager`
3. Run the schema file:

```sql
-- In psql:
\c taskmanager
\i server/src/db/schema.sql
```

Or copy-paste the contents of `server/src/db/schema.sql` into pgAdmin's Query Tool.

### Step 2 — Configure Backend

Edit `server/.env` with your PostgreSQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD   ← Change this!
JWT_SECRET=supersecretjwtkey_changethisinproduction_2024
CLIENT_URL=http://localhost:3000
```

### Step 3 — Start Backend

```bash
cd server
npm install   # (already done)
npm run dev   # starts on http://localhost:5000
```

### Step 4 — Start Frontend

```bash
cd client
npm install   # (already done)
npm run dev   # starts on http://localhost:3000
```

### Step 5 — Open App

Visit **http://localhost:3000** in your browser 🎉

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/tasks` | ✅ | List tasks |
| POST | `/api/tasks` | ✅ | Create task |
| GET | `/api/tasks/:id` | ✅ | Get task |
| PUT | `/api/tasks/:id` | ✅ | Update task |
| DELETE | `/api/tasks/:id` | ✅ | Delete task |
| GET | `/api/tasks/stats` | ✅ | Dashboard stats |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Bootstrap 5 + react-bootstrap |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| State | React Context API |
| Forms | react-hook-form |
| HTTP | Axios |
| Notifications | react-hot-toast |
