import "dotenv/config";
import {createServer} from "http";
import {Server} from "socket.io";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    },
});

io.on("connection", (socket)=>{
    console.log("Socket Connected:",socket.id);

    socket.on("disconnected", ()=>{
        console.log("Socket disconnected",socket.id);
    });
});

httpServer.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`)
})