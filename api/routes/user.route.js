import express from "express";
import { allUsers, userData, searchUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/allusers", verifyToken, allUsers);
router.post("/showuser/:id", userData);
router.post("/search", verifyToken, searchUser);
export default router;