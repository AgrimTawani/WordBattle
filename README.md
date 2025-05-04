# Wordle 2.0 - Multiplayer Word Game

A real-time multiplayer version of the popular word-guessing game Wordle, built with Next.js, Socket.IO, and Prisma.

## Features

- Real-time multiplayer gameplay
- User authentication with Clerk
- Live game updates
- Player statistics tracking
- Responsive design

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Clerk Authentication

### Backend
- Node.js
- Express
- Socket.IO
- Prisma
- PostgreSQL

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_BACKEND_URL=your_backend_url
```

### Backend (.env)
```
DATABASE_URL=your_postgresql_url
FRONTEND_URL=your_frontend_url
PORT=5000
```

## Deployment Instructions

This is a monorepo containing both frontend and backend. You'll deploy both from the same repository but configure the services to use different directories.

### Frontend (Vercel)
1. Create a Vercel account at vercel.com
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables in Vercel dashboard
6. Deploy

### Backend (Railway)
1. Create a Railway account at railway.app
2. Create a new project and choose "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Configure the project:
   - Root Directory: `backend`
   - Start Command: `npm start`
5. Add Environment Variables in Railway dashboard
6. Deploy

### Domain Setup
1. Purchase a domain from a registrar (e.g., Namecheap)
2. In Vercel dashboard:
   - Go to Settings > Domains
   - Add your custom domain
   - Copy the nameserver addresses
3. In your domain registrar:
   - Update nameservers to the ones provided by Vercel
   - Wait for DNS propagation (usually 15-30 minutes)

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```
3. Set up environment variables
4. Run the development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd ../backend
   npm run dev
   ```

## Database Setup

1. Set up PostgreSQL database (Railway provides this)
2. Update DATABASE_URL in backend/.env
3. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## Repository Structure
```
wordle_2.0/
├── frontend/          # Next.js frontend application
│   ├── src/
│   └── package.json
├── backend/           # Express backend application
│   ├── src/
│   ├── prisma/
│   └── package.json
└── README.md
``` # WordBattle
