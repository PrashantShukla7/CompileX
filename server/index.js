```javascript
require('dotenv').config();
const express = require("express");
const { createServer } = require("http");
const { Server, Socket } = require("socket.io");
const codeRouter = require("./routes/code.js");
const authRouter = require("./routes/auth.js");
const mongoose = require("mongoose");
const cors = require("cors");
const ACTIONS = require("./Actions.js");

const app = express();
const httpServer = createServer(app);

// Enable CORS with specific configuration
const corsOptions = {
    credentials: true,
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection function
const connectMongo = async (): Promise<void> => {
    try {
        await mongoose.connect("mongodb://localhost:27017/CodeSnippets");
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error); // Log the error for debugging
        process.exit(1); // Exit the process if the connection fails
    }
};

connectMongo();

// Initialize Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
    },
});

// User-to-socket mapping
const userSocketMap: { [socketId: string]: string } = {};

// Function to get all connected clients in a room
const getAllConnectedClients = (roomId: string): { socketId: string; username: string }[] => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
        return [];
    }

    const socketIds = Array.from(room);
    return socketIds.map((socketId) => ({
        socketId,
        username: userSocketMap[socketId],
    }));
};

// Socket.IO event listeners
io.on("connection", (socket: Socket) => {
    console.log(`User connected with id: ${socket.id}`);

    // Handle 'JOIN' event
    socket.on(ACTIONS.JOIN, ({ roomId, username }: { roomId: string; username: string }) => {
        // Remove any previous socket associations for this username
        Object.keys(userSocketMap).forEach(socketId => {
            if (userSocketMap[socketId] === username) {
                delete userSocketMap[socketId];
            }
        });

        userSocketMap[socket.id] = username; // Map the username to the socket ID
        socket.join(roomId); // Join the Socket.IO room

        const clients = getAllConnectedClients(roomId);

        // Notify all clients in the room about the new user
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    // Handle 'disconnecting' event
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });

    // Handle 'CODE_CHANGE' event
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code, language }: { roomId: string; code: string; language: string }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code, language });
    });
});

// Define API routes
app.use("/api/snippet", codeRouter);
app.use("/api/auth", authRouter);

// Define a simple route for testing
app.get("/", (req: any, res: any) => {
    res.send("Hello from Code Collaboration Server!");
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```