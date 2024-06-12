import express from "express";
import { allUsers } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/allusers", verifyToken, allUsers);

export default router;