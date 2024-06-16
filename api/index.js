import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";

import http from "http";
import cors from "cors";
import {Server} from "socket.io";

dotenv.config();

mongoose.connect(process.env.MONGO).then(()=> {
    console.log("mongodb is connected");
}).catch((error) => {
    console.log(error);
})

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const users = [{}];

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("connected to socket io");

    socket.on('joined', ({user}) => {
        users[user._id] = socket.id;
        console.log(`chat is now connected to ${user.username} and ${socket.id}`);
        socket.join(user._id);
    });
    
    socket.on('message', ({data}) => {
        // console.log("data: ", data);
        const reciverId = users[data.reciver];
        // console.log("message socketId: ", reciverId);
        if(reciverId){
            io.to(reciverId).emit('sendMessage', {textMsg: data})
        }
        const senderId = users[data.sender];
        if (senderId) {
            io.to(senderId).emit('sendMessage', { textMsg: data });
        }
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