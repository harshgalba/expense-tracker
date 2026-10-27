# Expense Tracker

A small fullstack app to log expenses, organise them into categories and see monthly totals. Built as a learning project.

## Features
- Register and log in (JWT); each user only sees their own data
- Add, edit and delete expenses (amount, date, category, note)
- Default categories plus your own custom ones
- Month filter, monthly total and total per category
- Responsive layout with a menu drawer on phones

## Stack
- **Client:** React 19, Vite, Tailwind CSS v4, React Router v8
- **Server:** Node.js, Express 5, `pg` (raw SQL), bcryptjs, jsonwebtoken
- **Database:** PostgreSQL

```
Browser (React) → /api (Vite proxy in dev) → Express (port 3000) → PostgreSQL
```

## Getting started

### 1. Prerequisites
- Node.js 22.22 or later
- PostgreSQL 16 (on macOS: `brew install postgresql@16` and `brew services start postgresql@16`)

### 2. Database
```bash
createdb expense_tracker
psql expense_tracker -f server/db/schema.sql
psql expense_tracker -c "INSERT INTO categories (name) VALUES ('Food'), ('Rent');"
```
The last line adds the default categories that every user sees.

### 3. Server
```bash
cd server
cp .env.example .env    # then set JWT_SECRET to a long random string
npm install
npm run dev             # http://localhost:3000
```
Generate a secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Client (in a second terminal)
```bash
cd client
npm install
npm run dev             # open http://localhost:5173
```

## Project structure
```
client/   React app (pages/, components/)
server/   Express API (src/routes/, src/middleware/) and db/schema.sql
notes/    Design notes (database, auth)
```

## API
| Method | URL | Purpose |
|---|---|---|
| POST | /api/auth/register | Create an account, returns `{ token, user }` |
| POST | /api/auth/login | Log in, returns `{ token, user }` |
| GET | /api/expenses?month=YYYY-MM | List a month's expenses |
| GET | /api/expenses/summary?month=YYYY-MM | Monthly total, count and totals per category |
| POST / PUT / DELETE | /api/expenses/:id | Add, edit, delete an expense |
| GET / POST | /api/categories | List or add categories |
| DELETE | /api/categories/:id | Delete a custom category |

All `/api/expenses` and `/api/categories` routes need an `Authorization: Bearer <token>` header.