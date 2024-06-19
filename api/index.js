import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";

import http, { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

dotenv.config();

mongoose.connect(process.env.MONGO).then(() => {
    console.log("mongodb is connected");
}).catch((error) => {
    console.log(error);
})

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const users = [{}];

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
});


io.on("connection", (socket) => {
    console.log("connected to socket io");

    socket.on('join-room', ({roomId}) => {
        socket.join(roomId);
        console.log("joining room: ", roomId);
    })

    socket.on('leave-room', ({roomId}) => {
        socket.leave(roomId);
        console.log("leave room: ", roomId);
    });

    socket.on('send-message', ({message, roomId}) => {
        let skt = socket.broadcast;
        skt = roomId ? skt.to(roomId) : skt;
        console.log(roomId);
        skt.emit('message-from-server', {message});
    })

    socket.on('typing-started', ({roomId}) => {
        let skt = socket.broadcast;
        skt = roomId ? skt.to(roomId) : skt;
        skt.emit('typing-started-from-server')
    })

    socket.on('typing-stoped', ({roomId}) => {
        let skt = socket.broadcast;
        skt = roomId ? skt.to(roomId) : skt;
        skt.emit('typing-stoped-from-server');
    })

    socket.on('disconnect', () => {
        console.log("user left ");
    });
})

server.listen(3000, () => {
    console.log("Server is running at port 3000");
})


app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode
    });
});