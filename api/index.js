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
import { sockets } from "./socket/socket.js";

import path from "path";

dotenv.config();

mongoose.connect(process.env.MONGO).then(() => {
    console.log("mongodb is connected");
}).catch((error) => {
    console.log(error);
});

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
});


io.on("connection", sockets)

server.listen(3000, () => {
    console.log("Server is running at port 3000");
})


app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode
    });
});