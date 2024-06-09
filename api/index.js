import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(process.env.MONGO).then(()=> {
    console.log("mongodb is connected");
}).catch((error) => {
    console.log(error);
})

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.listen(3000, () => {
    console.log("Server is running at port 3000");
})