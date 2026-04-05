# FlatWork — Flat Work Management System

A full-stack Next.js 14 app for managing chores and tasks across a multi-flat home.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB + Mongoose
- **Auth**: JWT via HTTP-only cookies
- **Fonts**: Sora + Space Mono (Google Fonts)

---

## Features

| Page | Description |
|------|-------------|
| `/signup` | Register a new flat (name, address, email, password) |
| `/login` | Login as flat admin OR member |
| `/work` | Daily task checklist with date navigation — tick tasks as done |
| `/team` | Team chat with image upload + today's work status |
| `/analysis` | Work matrix: user × work type counts + completion bar chart |
| `/users` | Create/delete flat members (admin only) |
| `/worktypes` | Create/delete work types like Dish Washing, Cleaning (admin only) |

---

## Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### 2. Install dependencies

```bash
cd flatwork
npm install
```

### 3. Configure environment

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/flatwork
NEXTAUTH_SECRET=change-this-to-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/flatwork?retryWrites=true&w=majority
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Getting Started

1. Go to `/signup` — register your flat
2. Go to `/worktypes` — create work types (e.g. "Dish Washing 🍽️", "Cleaning 🧹")
3. Go to `/users` — add flat members
4. Go to `/work` — assign daily tasks to members
5. Members log in and tick off their tasks
6. Go to `/analysis` — see who did what and how many times
7. Go to `/team` — chat, upload proof photos, see today's status

---

## Project Structure

```
flatwork/
├── app/
│   ├── api/
│   │   ├── auth/login/      POST: login (flat admin or user)
│   │   ├── auth/logout/     POST: logout
│   │   ├── auth/me/         GET: current user from cookie
│   │   ├── flats/signup/    POST: register a flat
│   │   ├── users/           GET/POST: list/create users
│   │   ├── users/[id]/      DELETE: remove user
│   │   ├── worktypes/       GET/POST: list/create work types
│   │   ├── worktypes/[id]/  DELETE: remove work type
│   │   ├── works/           GET/POST: list/create tasks
│   │   ├── works/[id]/      PATCH/DELETE: toggle done / remove task
│   │   ├── analysis/        GET: matrix + stats
│   │   ├── chat/            GET/POST: messages
│   │   └── upload/          POST: image upload (saved to public/uploads/)
│   ├── login/
│   ├── signup/
│   ├── work/
│   ├── team/
│   ├── analysis/
│   ├── users/
│   ├── worktypes/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── AuthContext.tsx      React context for auth state
│   └── Sidebar.tsx         Responsive nav sidebar
├── lib/
│   ├── mongodb.ts           Mongoose connection helper
│   └── auth.ts              JWT sign/verify helpers
├── models/
│   ├── Flat.ts
│   ├── User.ts
│   ├── WorkType.ts
│   ├── Work.ts
│   └── Message.ts
├── public/uploads/          Auto-created for uploaded images
├── .env.local
└── package.json
```

---

## Roles

- **Flat Admin**: Can create users, work types, assign tasks, see all data
- **Member**: Can see/complete their own tasks, chat, view analysis

---

## Mobile

Fully responsive — sidebar collapses to a hamburger menu on mobile. All pages work on phone screens.

---

## Build for Production

```bash
npm run build
npm start
```
