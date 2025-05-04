import express from 'express';
import { createServer } from 'http';
import { io } from './socket';
import gameRoutes from './routes/game';

const app = express();
const httpServer = createServer(app);

// Attach socket.io to the HTTP server
io.attach(httpServer);

app.use(express.json());
app.use('/api/game', gameRoutes);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 