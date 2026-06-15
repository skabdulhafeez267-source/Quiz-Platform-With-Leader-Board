# Quiz Platform with Leaderboard

A full-stack MERN (MongoDB, Express, React, Node.js) quiz application with authentication, timed quizzes, scoring, per-quiz leaderboards, and a global leaderboard.

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React (Vite), React Router, Axios

## Features
- User registration & login (JWT)
- Role-based access (user / admin)
- Browse and attempt quizzes with a countdown timer
- Auto-submit on timeout
- Score calculation and answer review
- Per-quiz leaderboard (top scores)
- Global leaderboard (total score across all quizzes)
- User profile with quiz history
- Admin panel to create/delete quizzes

## Project Structure
```
quiz-platform/
├── backend/
│   ├── config/db.js
│   ├── middleware/ (auth, errorHandler)
│   ├── models/ (User, Quiz, Result)
│   ├── routes/ (authRoutes, quizRoutes, leaderboardRoutes)
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/ (Navbar, ProtectedRoute)
    │   ├── pages/ (Login, Register, QuizList, QuizAttempt, QuizResult,
    │   │           QuizLeaderboard, GlobalLeaderboard, Profile, Admin)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI and JWT secret
npm install
npm run seed   # optional: inserts sample quizzes + admin/demo users
npm run dev    # starts server on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev    # starts dev server on http://localhost:5173
```

The frontend proxies `/api` requests to `http://localhost:5000`.

## Demo Accounts (after running seed)
- Admin: `admin@quizapp.com` / `admin123`
- User: `demo@quizapp.com` / `demo1234`

## API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Current user | User |
| GET | /api/quizzes | List quizzes | User |
| GET | /api/quizzes/:id | Get quiz questions | User |
| POST | /api/quizzes | Create quiz | Admin |
| PUT | /api/quizzes/:id | Update quiz | Admin |
| DELETE | /api/quizzes/:id | Delete quiz | Admin |
| POST | /api/quizzes/:id/submit | Submit answers | User |
| GET | /api/quizzes/:id/leaderboard | Quiz leaderboard | User |
| GET | /api/leaderboard/global | Global leaderboard | User |
| GET | /api/leaderboard/me | User's history | User |

## Notes
- Correct answers are never sent to the client until after submission.
- Passwords are hashed with bcrypt.
- JWT tokens are stored in localStorage and sent via Authorization header.
