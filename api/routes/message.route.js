import express from "express";
import { sendMessage, showMessage, getUserChatRoom, deleteMessage } from "../controllers/message.controller.js";
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router();

router.post("/send/:id", verifyToken, sendMessage);
router.get("/showmessage/:id", verifyToken, showMessage);
router.get("/getChat/:id", verifyToken, getUserChatRoom);
router.delete("/delete/:id", verifyToken, deleteMessage);

export default router;