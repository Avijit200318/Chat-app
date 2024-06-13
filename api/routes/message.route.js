import express from "express";
import { sendMessage, showMessage } from "../controllers/message.controller.js";
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router();

router.post("/send/:id", verifyToken, sendMessage);
router.get("/showmessage/:id", verifyToken, showMessage);

export default router;