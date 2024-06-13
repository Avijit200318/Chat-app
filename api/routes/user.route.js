import express from "express";
import { allUsers, userData } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/allusers", verifyToken, allUsers);
router.post("/showuser/:id", userData);

export default router;