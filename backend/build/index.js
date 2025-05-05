"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_1 = require("./socket");
const game_1 = __importDefault(require("./routes/game"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Attach socket.io to the HTTP server
socket_1.io.attach(httpServer);
app.use(express_1.default.json());
app.use('/api/game', game_1.default);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
