import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { initializeSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

initializeSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running at Port: ${PORT}`);
});