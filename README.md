# WordBattle

WordBattle is a multiplayer word-guessing game inspired by Wordle, where players can compete against each other in real-time.

## Features

- **Classic 5x6 Mode**: Compete against other players in the traditional Wordle format
- **Real-time Matchmaking**: Find and challenge other players instantly
- **Friends System**: Add friends and challenge them to private matches
- **Game History**: Track your wins and previous games

## Technical Stack

### Frontend
- Next.js
- Socket.IO Client
- TypeScript
- Tailwind CSS

### Backend
- Node.js (v18+)
- Express
- Socket.IO
- Prisma (Database ORM)
- TypeScript

## Prerequisites

- Node.js v18 or higher
- SSL Certificate (for HTTPS)
- PostgreSQL database

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url:5000
```

### Backend (.env)
```
PORT=5000
FRONTEND_URL=https://your-frontend-url:3000
DATABASE_URL=your-postgresql-connection-string
```

## Socket Connection Types

The application uses three different types of socket connections:

1. **Game Socket** (`useGameSocket`)
   - Handles the core game mechanics
   - Manages game state and player moves

2. **Matchmaking Socket** (`useMatchmakingSocket`)
   - Manages player queuing and matching
   - Handles reconnection with 5 attempts
   - Uses WebSocket transport

3. **Challenge Socket** (`useChallengeSocket`)
   - Manages friend challenges and private games
   - Supports both WebSocket and polling
   - Includes automatic reconnection

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```
3. Set up your environment variables
4. Run database migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```
5. Start the development servers:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

## Security Notes

- SSL certificate is required for secure WebSocket connections
- The application uses CORS with specific origin restrictions
- Environment variables should be properly configured for production

## Troubleshooting

Common issues and solutions:

1. **Matchmaking Issues**
   - Ensure you're using Node.js v18 or higher
   - Check WebSocket connection in browser dev tools
   - Verify backend URL configuration

2. **Friends Page**
   - If modal doesn't appear, check z-index configurations
   - Ensure Command component is properly mounted

3. **SSL Certificate**
   - Verify SSL certificate installation
   - Check certificate chain is complete
   - Ensure proper HTTPS configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
