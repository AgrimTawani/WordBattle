# WordBattle Technical Documentation

## Table of Contents
1. [Custom Hooks](#custom-hooks)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Socket Events](#socket-events)
4. [Database Architecture](#database-architecture)
5. [System Integration](#system-integration)

## Custom Hooks

### 1. useGameSocket
**Purpose**: Manages the core game mechanics and real-time game state updates.

**Implementation Details**:
```typescript
// Location: frontend/src/hooks/useGameSocket.ts
// Main functionality:
- Establishes WebSocket connection to game server
- Handles game state updates
- Manages player moves and game progression
```

**Key Features**:
- Automatically connects to backend using environment URL
- Uses WebSocket transport exclusively
- Implements connection error handling
- Provides cleanup on component unmount

**Usage Example**:
```typescript
const socket = useGameSocket();
// Now you can use socket.emit() for game actions
// and socket.on() for receiving game updates
```

### 2. useMatchmakingSocket
**Purpose**: Handles player matchmaking and queue management.

**Implementation Details**:
```typescript
// Location: frontend/src/hooks/useMatchmakingSocket.ts
// Main functionality:
- Manages matchmaking queue
- Handles player pairing
- Provides connection status
```

**Key Features**:
- Implements reconnection logic (5 attempts)
- 1000ms reconnection delay
- Provides isConnected state
- Automatic cleanup on unmount

**Usage Example**:
```typescript
const { socket, isConnected } = useMatchmakingSocket();
// Use isConnected to show connection status
// Use socket for matchmaking operations
```

### 3. useChallengeSocket
**Purpose**: Manages friend challenges and private game creation.

**Implementation Details**:
```typescript
// Location: frontend/src/hooks/useChallengeSocket.ts
// Main functionality:
- Handles friend challenge requests
- Manages private game creation
- Provides detailed connection logging
```

**Key Features**:
- Supports both WebSocket and polling
- 5 reconnection attempts
- Enhanced error logging
- Automatic cleanup

## Backend API Endpoints

### User Management
```typescript
GET /api/users/:clerkId
```
**Purpose**: Retrieves user information and statistics
- **Input**: clerkId (URL parameter)
- **Output**: 
  ```json
  {
    "id": "string",
    "email": "string",
    "wins": number
  }
  ```
- **Database Interaction**: Queries User table using Prisma
- **Error Handling**: Returns 404 if user not found

### Game History
```typescript
GET /api/games/:clerkId
```
**Purpose**: Retrieves user's game history
- **Input**: clerkId (URL parameter)
- **Output**:
  ```json
  {
    "games": [
      {
        "id": "string",
        "word": "string",
        "winnerId": "string",
        "createdAt": "date"
      }
    ]
  }
  ```
- **Database Interaction**: 
  - Queries Game table with player relationships
  - Joins with User table for winner information

## Socket Events

### Game Socket Events
1. **game:start**
   - Triggered when: Game begins
   - Data: { gameId, players, word }
   - Database: Creates new game record

2. **game:move**
   - Triggered when: Player makes a move
   - Data: { gameId, playerId, word }
   - Database: Updates game state

3. **game:end**
   - Triggered when: Game concludes
   - Data: { gameId, winnerId }
   - Database: Updates game record with winner

### Matchmaking Socket Events
1. **matchmaking:queue**
   - Triggered when: Player enters queue
   - Data: { userId, preferences }
   - Storage: Maintains in-memory queue

2. **matchmaking:match**
   - Triggered when: Match is found
   - Data: { players, gameId }
   - Database: Creates new game record

### Challenge Socket Events
1. **challenge:send**
   - Triggered when: Player sends challenge
   - Data: { challengerId, receiverId }
   - Database: Creates challenge record

2. **challenge:accept**
   - Triggered when: Challenge accepted
   - Data: { challengeId }
   - Database: Updates challenge status and creates game

## Database Architecture

### Tables

1. **User**
   ```prisma
   model User {
     id        String   @id @default(uuid())
     email     String   @unique
     clerkId   String   @unique
     wins      Int      @default(0)
     games     Game[]   // Relation to games
     friends   User[]   @relation("UserFriends")
   }
   ```

2. **Game**
   ```prisma
   model Game {
     id        String   @id @default(uuid())
     word      String
     winnerId  String?
     createdAt DateTime @default(now())
     players   User[]   // Many-to-many relation
     moves     Move[]   // One-to-many relation
   }
   ```

3. **Move**
   ```prisma
   model Move {
     id        String   @id @default(uuid())
     gameId    String
     playerId  String
     word      String
     timestamp DateTime @default(now())
     game      Game     @relation(fields: [gameId], references: [id])
   }
   ```

## System Integration

### Game Flow
1. **Player Matchmaking**
   ```mermaid
   sequenceDiagram
   Player->>Frontend: Enter matchmaking
   Frontend->>Backend: matchmaking:queue
   Backend->>Database: Check player status
   Backend->>Frontend: matchmaking:match
   Frontend->>Game: Initialize game
   ```

2. **Game Progress**
   ```mermaid
   sequenceDiagram
   Player->>Frontend: Make move
   Frontend->>Backend: game:move
   Backend->>Database: Record move
   Backend->>Frontend: Update all players
   ```

3. **Game Completion**
   ```mermaid
   sequenceDiagram
   Backend->>Database: Record winner
   Backend->>Frontend: game:end
   Frontend->>Database: Update statistics
   ```

### Data Flow
1. **Real-time Updates**
   - Socket.IO handles all real-time communications
   - Events are emitted to specific rooms based on gameId
   - Database updates happen after socket events

2. **State Management**
   - Frontend maintains local game state
   - Backend is source of truth
   - Periodic synchronization ensures consistency

3. **Error Handling**
   - Socket reconnection handles network issues
   - Database transactions ensure data integrity
   - Error events propagate to frontend for user feedback

### Performance Considerations
1. **Socket Optimization**
   - WebSocket preferred over polling
   - Room-based broadcasting reduces message load
   - Reconnection logic handles network issues

2. **Database Efficiency**
   - Indexed queries for frequent operations
   - Relation-based queries minimize round trips
   - Prisma provides type safety and query optimization

3. **Frontend Performance**
   - Local state updates for immediate feedback
   - Debounced socket events reduce server load
   - Optimistic updates with server validation 